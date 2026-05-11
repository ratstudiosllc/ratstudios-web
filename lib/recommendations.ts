import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type RecommendationCategory = "self-improvement" | "architecture" | "UI/UX" | "security" | "ops" | "growth" | "product" | "other";
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
      owner_agent: "bugs",
      commits: "",
      summary: recommendation.rationale,
      current_state: `Converted from recommendation ${recommendation.id}. Status at conversion: ${recommendation.status}.`,
      next_step: notes || recommendation.implementationNotes || "Triage this approved recommendation and assign the smallest safe implementation step.",
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
      note: `Created Supabase admin issue #${createdNumber}.`,
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

export function listRecommendations() {
  return readRecommendationsStore().recommendations.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function applyRecommendationAction(input: RecommendationActionInput) {
  const recommendationId = normalizeText(input.recommendationId);
  if (!recommendationId) {
    throw new Error("recommendationId is required");
  }
  if (!validActions.has(input.action)) {
    throw new Error("Invalid recommendation action");
  }

  const store = readRecommendationsStore();
  const index = store.recommendations.findIndex((item) => item.id === recommendationId);
  if (index === -1) {
    throw new Error("Recommendation not found");
  }

  const current = store.recommendations[index];
  const now = new Date().toISOString();
  const decisionBy = normalizeText(input.decisionBy) ?? "operator";
  const notes = normalizeText(input.notes);
  const nextStatus = statusByAction[input.action];
  let convertedIssueId = current.convertedIssueId;
  const implementationNotes = current.implementationNotes;

  let conversionNote: string | undefined;
  if (input.action === "convert_to_issue") {
    const created = await createIssueFromRecommendation(current, notes);
    convertedIssueId = created.issueId;
    conversionNote = created.note;
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

  const updated: AdminRecommendation = {
    ...current,
    status: nextStatus,
    decisionBy,
    decisionAt: now,
    decisionNotes,
    convertedIssueId,
    actionHistory,
    implementationNotes: conversionNote ? [implementationNotes, conversionNote].filter(Boolean).join("\n") : implementationNotes,
    updatedAt: now,
  };

  store.recommendations[index] = updated;
  writeRecommendationsStore(store);
  return updated;
}

export function getRecommendationsSummary(recommendations = listRecommendations()) {
  return {
    total: recommendations.length,
    recommended: recommendations.filter((item) => item.status === "recommended").length,
    approved: recommendations.filter((item) => item.status === "approved").length,
    deferred: recommendations.filter((item) => item.status === "deferred").length,
    implemented: recommendations.filter((item) => item.status === "implemented").length,
    highImpact: recommendations.filter((item) => item.impact === "high").length,
  };
}

export function getRecommendationFilterOptions(recommendations = listRecommendations()) {
  return {
    appProducts: Array.from(new Set(recommendations.map((item) => item.appProduct))).sort((a, b) => a.localeCompare(b)),
    categories: Array.from(new Set(recommendations.map((item) => item.category))).sort((a, b) => a.localeCompare(b)),
    priorities: Array.from(new Set(recommendations.map((item) => item.priority))).sort((a, b) => a.localeCompare(b)),
    statuses: Array.from(new Set(recommendations.map((item) => item.status))).sort((a, b) => a.localeCompare(b)),
  };
}
