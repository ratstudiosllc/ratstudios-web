import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type RecommendationCategory = "self-improvement" | "architecture" | "UI/UX" | "security" | "ops" | "growth" | "product" | "reliability" | "other";
export type RecommendationSeverity = "low" | "medium" | "high" | "critical";
export type RecommendationPriority = "P1" | "P2" | "P3" | "P4";
export type RecommendationEffort = "small" | "medium" | "large";
export type RecommendationImpact = "low" | "medium" | "high";
export type RecommendationStatus = "recommended" | "approved" | "rejected" | "deferred" | "implemented";
export type RecommendationAction = "approve" | "reject" | "defer" | "mark_implemented" | "convert_to_issue";

export interface RecommendationEvidenceLink {
  label: string;
  href: string;
}

export interface RecommendationActionHistoryEntry {
  action: RecommendationAction;
  status: RecommendationStatus;
  by?: string;
  at: string;
  notes?: string;
  convertedIssueId?: string;
}

export interface AdminRecommendation {
  id: string;
  slug: string;
  title: string;
  appProduct: string;
  category: RecommendationCategory;
  severity: RecommendationSeverity;
  priority: RecommendationPriority;
  effort: RecommendationEffort;
  impact: RecommendationImpact;
  rationale: string;
  riskIfIgnored: string;
  evidenceLinks: RecommendationEvidenceLink[];
  status: RecommendationStatus;
  approvalNotes?: string;
  implementationNotes?: string;
  decisionBy?: string;
  decisionAt?: string;
  decisionNotes?: string;
  convertedIssueId?: string;
  actionHistory?: RecommendationActionHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

interface RecommendationsStoreData {
  recommendations: AdminRecommendation[];
}

interface RecommendationActionInput {
  recommendationId: string;
  action: RecommendationAction;
  decisionBy?: string;
  notes?: string;
}

type DbRecommendationRow = Record<string, unknown>;

const storePath = path.join(process.cwd(), "data", "recommendations-store.json");
const validActions = new Set<RecommendationAction>(["approve", "reject", "defer", "mark_implemented", "convert_to_issue"]);
const statusByAction: Record<RecommendationAction, RecommendationStatus> = {
  approve: "approved",
  reject: "rejected",
  defer: "deferred",
  mark_implemented: "implemented",
  convert_to_issue: "approved",
};

function readRecommendationsStore(): RecommendationsStoreData {
  const raw = readFileSync(storePath, "utf8");
  return JSON.parse(raw) as RecommendationsStoreData;
}

function writeRecommendationsStore(data: RecommendationsStoreData) {
  writeFileSync(storePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function shouldUseLocalWriteFallback() {
  return process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production";
}

function normalizeText(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

function issuePriorityForRecommendation(priority: RecommendationPriority) {
  if (priority === "P1") return "P1";
  if (priority === "P2") return "P2";
  return "P3";
}

function buildLocalActionId(recommendation: AdminRecommendation) {
  return `local-action-${recommendation.id}`;
}

function fileRecommendationById(recommendationId: string) {
  return readRecommendationsStore().recommendations.find((item) => item.id === recommendationId) ?? null;
}

function normalizeEvidenceLinks(value: unknown): RecommendationEvidenceLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const label = normalizeText(record.label);
      const href = normalizeText(record.href);
      return label && href ? { label, href } : null;
    })
    .filter((item): item is RecommendationEvidenceLink => Boolean(item));
}

function normalizeActionHistory(value: unknown): RecommendationActionHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: RecommendationActionHistoryEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const action = normalizeRecommendationAction(record.action);
    const status = normalizeText(record.status) as RecommendationStatus | undefined;
    const at = normalizeText(record.at);
    if (!action || !status || !at) continue;
    entries.push({
      action,
      status,
      by: normalizeText(record.by),
      at,
      notes: normalizeText(record.notes),
      convertedIssueId: normalizeText(record.convertedIssueId ?? record.converted_issue_id),
    });
  }
  return entries;
}

function recommendationFromRow(row: DbRecommendationRow): AdminRecommendation {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? row.id ?? ""),
    title: String(row.title ?? "Untitled recommendation"),
    appProduct: String(row.app_product ?? "RaT Studios"),
    category: String(row.category ?? "other") as RecommendationCategory,
    severity: String(row.severity ?? "medium") as RecommendationSeverity,
    priority: String(row.priority ?? "P3") as RecommendationPriority,
    effort: String(row.effort ?? "medium") as RecommendationEffort,
    impact: String(row.impact ?? "medium") as RecommendationImpact,
    rationale: String(row.rationale ?? ""),
    riskIfIgnored: String(row.risk_if_ignored ?? ""),
    evidenceLinks: normalizeEvidenceLinks(row.evidence_links),
    status: String(row.status ?? "recommended") as RecommendationStatus,
    approvalNotes: normalizeText(row.approval_notes),
    implementationNotes: normalizeText(row.implementation_notes),
    decisionBy: normalizeText(row.decision_by),
    decisionAt: normalizeText(row.decision_at),
    decisionNotes: normalizeText(row.decision_notes),
    convertedIssueId: normalizeText(row.converted_issue_id),
    actionHistory: normalizeActionHistory(row.action_history),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
  };
}

function rowFromRecommendation(recommendation: AdminRecommendation) {
  return {
    id: recommendation.id,
    slug: recommendation.slug,
    title: recommendation.title,
    app_product: recommendation.appProduct,
    category: recommendation.category,
    severity: recommendation.severity,
    priority: recommendation.priority,
    effort: recommendation.effort,
    impact: recommendation.impact,
    rationale: recommendation.rationale,
    risk_if_ignored: recommendation.riskIfIgnored,
    evidence_links: recommendation.evidenceLinks,
    status: recommendation.status,
    approval_notes: recommendation.approvalNotes ?? null,
    implementation_notes: recommendation.implementationNotes ?? null,
    decision_by: recommendation.decisionBy ?? null,
    decision_at: recommendation.decisionAt ?? null,
    decision_notes: recommendation.decisionNotes ?? null,
    converted_issue_id: recommendation.convertedIssueId ?? null,
    action_history: recommendation.actionHistory ?? [],
    created_at: recommendation.createdAt,
    updated_at: recommendation.updatedAt,
  };
}

function createRecommendationsSupabase() {
  try {
    return createSupabaseAdmin();
  } catch {
    return null;
  }
}

async function tryListSupabaseRecommendations() {
  const supabase = createRecommendationsSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("admin_recommendations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return null;
  return (data ?? []).map((row) => recommendationFromRow(row as DbRecommendationRow));
}

async function tryGetSupabaseRecommendation(recommendationId: string) {
  const supabase = createRecommendationsSupabase();
  if (!supabase) return { supabase: null, recommendation: null, available: false };

  const { data, error } = await supabase
    .from("admin_recommendations")
    .select("*")
    .eq("id", recommendationId)
    .maybeSingle();

  if (error) return { supabase: null, recommendation: null, available: false };
  return { supabase, recommendation: data ? recommendationFromRow(data as DbRecommendationRow) : null, available: true };
}

export async function persistSupabaseRecommendation(recommendation: AdminRecommendation) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("admin_recommendations")
    .upsert(rowFromRecommendation(recommendation), { onConflict: "id" });

  if (error) throw new Error(error.message);
}

export async function upsertRecommendations(recommendations: AdminRecommendation[]) {
  if (recommendations.length === 0) return { count: 0 };
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("admin_recommendations")
    .upsert(recommendations.map(rowFromRecommendation), { onConflict: "id" });

  if (error) throw new Error(error.message);
  return { count: recommendations.length };
}

async function insertSupabaseDecision(recommendation: AdminRecommendation, entry: RecommendationActionHistoryEntry) {
  try {
    const supabase = createSupabaseAdmin();
    await supabase.from("admin_recommendation_decisions").insert({
      recommendation_id: recommendation.id,
      action: entry.action,
      status: entry.status,
      decided_by: entry.by ?? null,
      notes: entry.notes ?? null,
      converted_issue_id: entry.convertedIssueId ?? null,
      created_at: entry.at,
    });
  } catch {
    // The decisions table is an audit enhancement; action_history on admin_recommendations is the durable fallback.
  }
}

async function createIssueFromRecommendation(recommendation: AdminRecommendation, notes?: string) {
  const fallbackId = buildLocalActionId(recommendation);

  try {
    const supabase = createSupabaseAdmin();
    const { data: maxRow, error: maxError } = await supabase
      .from("admin_issues")
      .select("number")
      .order("number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxError) throw new Error(maxError.message);

    const nextNumber = Number(maxRow?.number ?? 0) + 1;
    const now = new Date().toISOString();
    const row = {
      number: nextNumber,
      project: recommendation.appProduct,
      priority: issuePriorityForRecommendation(recommendation.priority),
      title: recommendation.title,
      status: "New",
      identified: now.slice(0, 10),
      committed: "No",
      pushed: "No",
      deployed: "No",
      owner_agent: "execution",
      commits: "",
      summary: recommendation.rationale,
      current_state: `Approved recommendation ${recommendation.id}; agent implementation requested by operator.`,
      next_step: notes || recommendation.implementationNotes || "Agent execution requested. Implement the smallest safe change, then commit/push and mark Needs Verification.",
      updated_at: now,
    };

    const { data: insertedIssue, error: insertError } = await supabase
      .from("admin_issues")
      .insert(row)
      .select("id, number")
      .single();
    if (insertError) throw new Error(insertError.message);

    const createdNumber = Number(insertedIssue?.number ?? nextNumber);
    const createdId = insertedIssue?.id ? String(insertedIssue.id) : `admin-issues-${createdNumber}`;
    return {
      issueId: createdId,
      note: `Queued implementation as Supabase admin issue #${createdNumber}.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown issue creation error";
    return {
      issueId: fallbackId,
      note: `Could not create Supabase issue automatically (${message}). Recorded deterministic local action id ${fallbackId}; create/triage a real issue manually if needed.`,
    };
  }
}

export function normalizeRecommendationAction(value: unknown): RecommendationAction | null {
  const action = normalizeText(value) as RecommendationAction | undefined;
  if (!action || !validActions.has(action)) return null;
  return action;
}

export async function listRecommendations() {
  const supabaseRecommendations = await tryListSupabaseRecommendations();
  if (supabaseRecommendations) {
    const localRecommendations = readRecommendationsStore().recommendations;
    const seen = new Set(supabaseRecommendations.map((item) => item.id));
    return [
      ...supabaseRecommendations,
      ...localRecommendations.filter((item) => !seen.has(item.id)),
    ].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }

  return readRecommendationsStore().recommendations.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

async function applyRecommendationActionLocally(input: RecommendationActionInput) {
  const recommendationId = normalizeText(input.recommendationId);
  if (!recommendationId) {
    throw new Error("recommendationId is required");
  }

  const store = readRecommendationsStore();
  const index = store.recommendations.findIndex((item) => item.id === recommendationId);
  if (index === -1) {
    throw new Error("Recommendation not found");
  }

  const updated = await buildUpdatedRecommendation(store.recommendations[index], input);
  store.recommendations[index] = updated;
  writeRecommendationsStore(store);
  return updated;
}

async function buildUpdatedRecommendation(current: AdminRecommendation, input: RecommendationActionInput) {
  const now = new Date().toISOString();
  const decisionBy = normalizeText(input.decisionBy) ?? "operator";
  const notes = normalizeText(input.notes);
  const nextStatus = statusByAction[input.action];
  let convertedIssueId = current.convertedIssueId;
  const implementationNotes = current.implementationNotes;

  let conversionNote: string | undefined;
  if ((input.action === "approve" || input.action === "convert_to_issue") && !convertedIssueId) {
    const created = await createIssueFromRecommendation(current, notes);
    convertedIssueId = created.issueId;
    conversionNote = created.note;
  } else if (input.action === "approve" && convertedIssueId) {
    conversionNote = `Implementation was already queued as ${convertedIssueId}.`;
  }

  const decisionNotes = [notes, conversionNote].filter(Boolean).join(notes && conversionNote ? "\n" : "") || current.decisionNotes;
  const actionHistory: RecommendationActionHistoryEntry[] = [
    ...(current.actionHistory ?? []),
    {
      action: input.action,
      status: nextStatus,
      by: decisionBy,
      at: now,
      notes: decisionNotes,
      convertedIssueId,
    },
  ];

  return {
    ...current,
    status: nextStatus,
    decisionBy,
    decisionAt: now,
    decisionNotes,
    convertedIssueId,
    actionHistory,
    implementationNotes: conversionNote ? [implementationNotes, conversionNote].filter(Boolean).join("\n") : implementationNotes,
    updatedAt: now,
  } satisfies AdminRecommendation;
}

export async function applyRecommendationAction(input: RecommendationActionInput) {
  const recommendationId = normalizeText(input.recommendationId);
  if (!recommendationId) {
    throw new Error("recommendationId is required");
  }
  if (!validActions.has(input.action)) {
    throw new Error("Invalid recommendation action");
  }

  const { recommendation: storedRecommendation, available } = await tryGetSupabaseRecommendation(recommendationId);
  const current = storedRecommendation ?? fileRecommendationById(recommendationId);

  if (!current) {
    throw new Error("Recommendation not found");
  }

  if (available) {
    const updated = await buildUpdatedRecommendation(current, input);
    await persistSupabaseRecommendation(updated);
    const lastEntry = updated.actionHistory?.[updated.actionHistory.length - 1];
    if (lastEntry) await insertSupabaseDecision(updated, lastEntry);
    return updated;
  }

  if (shouldUseLocalWriteFallback()) {
    return applyRecommendationActionLocally(input);
  }

  throw new Error("Supabase admin_recommendations is unavailable. Apply supabase_admin_recommendations.sql before using production recommendation actions.");
}

export function getRecommendationsSummary(recommendations: AdminRecommendation[]) {
  return {
    total: recommendations.length,
    recommended: recommendations.filter((item) => item.status === "recommended").length,
    approved: recommendations.filter((item) => item.status === "approved").length,
    deferred: recommendations.filter((item) => item.status === "deferred").length,
    implemented: recommendations.filter((item) => item.status === "implemented").length,
    highImpact: recommendations.filter((item) => item.impact === "high").length,
  };
}

export function getRecommendationFilterOptions(recommendations: AdminRecommendation[]) {
  return {
    appProducts: Array.from(new Set(recommendations.map((item) => item.appProduct))).sort((a, b) => a.localeCompare(b)),
    categories: Array.from(new Set(recommendations.map((item) => item.category))).sort((a, b) => a.localeCompare(b)),
    priorities: Array.from(new Set(recommendations.map((item) => item.priority))).sort((a, b) => a.localeCompare(b)),
    statuses: Array.from(new Set(recommendations.map((item) => item.status))).sort((a, b) => a.localeCompare(b)),
  };
}
