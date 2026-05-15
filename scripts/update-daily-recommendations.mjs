#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['\"]|['\"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env.vercel");
loadEnvFile(".env.vercel.production");

const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
const dateValue = dateArg ? dateArg.slice("--date=".length) : null;
const runDate = dateValue ? new Date(`${dateValue}T12:00:00.000Z`) : new Date();

if (Number.isNaN(runDate.getTime())) {
  console.error(`Invalid --date value: ${dateValue}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const now = runDate.toISOString();
const dateSlug = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Denver",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(runDate);
const mountainWeekday = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Denver",
  weekday: "long",
}).format(runDate);

function recommendation({ idSuffix, title, app_product, category, severity, priority, effort, impact, rationale, risk_if_ignored, evidence_links, approval_notes, implementation_notes, status = "recommended" }) {
  return {
    id: `rec-${dateSlug}-${idSuffix}`,
    slug: `${dateSlug}-${idSuffix}`,
    title,
    app_product,
    category,
    severity,
    priority,
    effort,
    impact,
    rationale,
    risk_if_ignored,
    evidence_links,
    status,
    approval_notes,
    implementation_notes,
    action_history: [],
    created_at: now,
    updated_at: now,
  };
}

const recommendations = [
  recommendation({
    idSuffix: "recommendations-five-am-cadence",
    title: "Run the recommendations update every morning at 5:00am Mountain",
    app_product: "RaT Ops Admin",
    category: "ops",
    severity: "medium",
    priority: "P1",
    effort: "small",
    impact: "high",
    rationale: "The recommendations queue is only useful if it refreshes before the workday starts, while Richard and Topher still have the full day to approve, reject, or assign items.",
    risk_if_ignored: "Recommendations arrive too late, decisions slip into tomorrow, and the queue becomes a passive archive instead of an operating rhythm.",
    evidence_links: [{ label: "Recommendations queue", href: "/admin/recommendations" }, { label: "Schedules endpoint", href: "/api/admin/schedules" }],
    approval_notes: "Requested by Richard on 2026-05-12. Approved for scheduling implementation immediately.",
    implementation_notes: "Implemented as a daily cron target plus durable schedule metadata. Keep monitoring last_run_at and next_run_at so this does not become invisible automation.",
    status: "implemented",
  }),
  recommendation({
    idSuffix: "schedule-run-status-card",
    title: "Show last-run and next-run status directly on the Recommendations page",
    app_product: "RaT Ops Admin",
    category: "UI/UX",
    severity: "medium",
    priority: "P2",
    effort: "small",
    impact: "high",
    rationale: "Operators should not have to ask whether the daily recommendation job ran. The queue itself should show the cadence, last result, and next scheduled update.",
    risk_if_ignored: "A broken daily job can go unnoticed until someone manually checks stale recommendations.",
    evidence_links: [{ label: "Recommendations queue", href: "/admin/recommendations" }, { label: "Schedules API", href: "/api/admin/schedules" }],
    approval_notes: `Recommended by the ${dateSlug} daily recommendations update.`,
    implementation_notes: "Do not implement until approved. Add a compact schedule status card above the queue summary using /api/admin/schedules data.",
  }),
  recommendation({
    idSuffix: "recommendations-dedupe-policy",
    title: "Add duplicate suppression so daily recommendations do not spam repeat items",
    app_product: "RaT Ops Admin",
    category: "reliability",
    severity: "medium",
    priority: "P2",
    effort: "small",
    impact: "high",
    rationale: "A daily queue needs memory. Recommending the same unresolved item every morning will train everyone to ignore the page.",
    risk_if_ignored: "The recommendation queue fills with repeated cards, burying genuinely new risks and reducing trust in the system.",
    evidence_links: [{ label: "Recommendations queue", href: "/admin/recommendations" }],
    approval_notes: `Recommended by the ${dateSlug} daily recommendations update.`,
    implementation_notes: "Do not implement until approved. Add fingerprinting by app/category/title root cause and update existing open recommendations instead of inserting duplicates.",
  }),
  recommendation({
    idSuffix: "agalmanac-check-db-cleanup",
    title: "Clean up AgAlmanac check-db so it stops reporting false missing tables",
    app_product: "AgAlmanac",
    category: "reliability",
    severity: "medium",
    priority: "P1",
    effort: "small",
    impact: "high",
    rationale: "The Supabase verification pass showed the database is healthy, but AgAlmanac's check-db script still expects stale table names that the app no longer uses.",
    risk_if_ignored: "False migration failures waste operator time and make real database warnings easier to dismiss.",
    evidence_links: [{ label: "AgAlmanac", href: "https://agalmanac.app" }, { label: "Recommendations queue", href: "/admin/recommendations" }],
    approval_notes: `Recommended after the ${dateSlug} Supabase verification pass.`,
    implementation_notes: "Do not implement until approved. Update scripts/check-db.mjs to verify rainfall_logs plus expected columns and notification preference columns instead of nonexistent rainfall_events/notification_prefs tables.",
  }),
  recommendation({
    idSuffix: "daily-approval-window",
    title: "Create a morning approval habit for P1 recommendations",
    app_product: "RaT Studios",
    category: "ops",
    severity: "low",
    priority: "P3",
    effort: "small",
    impact: "medium",
    rationale: "The 5:00am update only creates value if P1 items are reviewed early enough for agents to act during the same day.",
    risk_if_ignored: "The system generates useful recommendations, but approvals still happen too late to affect daily execution.",
    evidence_links: [{ label: "Recommendations queue", href: "/admin/recommendations?priority=P1&status=recommended" }, { label: "Issues queue", href: "/admin/issues" }],
    approval_notes: `Recommended by the ${dateSlug} daily recommendations update.`,
    implementation_notes: "Do not implement until approved. Consider a simple 8:00am operator review checklist or notification once the daily job has run.",
  }),
];

if (mountainWeekday === "Friday") {
  recommendations.push(recommendation({
    idSuffix: "portfolio-security-audit",
    title: "Run the Friday portfolio security/dependency audit",
    app_product: "RaT Studios",
    category: "security",
    severity: "medium",
    priority: "P2",
    effort: "small",
    impact: "high",
    rationale: "RaT Studios now has multiple active products and admin surfaces, so a lightweight weekly audit should catch dependency, auth, secret, and permission drift before it becomes an incident.",
    risk_if_ignored: "Dependency vulnerabilities, stale auth/RLS assumptions, leaked secrets, or overbroad permissions can sit unnoticed across the portfolio until they become production incidents.",
    evidence_links: [{ label: "Dependabot security updates", href: "https://docs.github.com/en/code-security/dependabot" }, { label: "OWASP ASVS", href: "https://owasp.org/www-project-application-security-verification-standard/" }],
    approval_notes: "Approved recommendation rec-2026-05-11-portfolio-security-audit-cadence; queued by approval workflow.",
    implementation_notes: "Friday security section: run npm audit/dependency review for each active app, note auth/RLS/permission drift, check secret exposure risk, and list the top portfolio security risks by app.",
  }));
}

const unresolvedRecommendationStatuses = ["recommended", "approved", "deferred"];

function normalizeFingerprintPart(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function recommendationFingerprint(recommendation) {
  return [recommendation.app_product, recommendation.category, recommendation.title, recommendation.rationale]
    .map((part) => normalizeFingerprintPart(part))
    .join(":");
}

function newestRecommendation(current, candidate) {
  if (!current) return candidate;
  const currentUpdated = Date.parse(current.updated_at ?? current.created_at ?? "");
  const candidateUpdated = Date.parse(candidate.updated_at ?? candidate.created_at ?? "");
  return candidateUpdated > currentUpdated ? candidate : current;
}

function mergeDuplicateRecommendation(existing, incoming) {
  return {
    ...incoming,
    id: existing.id,
    slug: existing.slug,
    status: existing.status,
    approval_notes: existing.approval_notes ?? incoming.approval_notes,
    decision_by: existing.decision_by ?? null,
    decision_at: existing.decision_at ?? null,
    decision_notes: existing.decision_notes ?? null,
    converted_issue_id: existing.converted_issue_id ?? null,
    action_history: Array.isArray(existing.action_history) ? existing.action_history : [],
    created_at: existing.created_at ?? incoming.created_at,
    updated_at: incoming.updated_at,
  };
}

async function suppressDuplicateRecommendations(incomingRecommendations) {
  const { data, error } = await supabase
    .from("admin_recommendations")
    .select("*")
    .in("status", unresolvedRecommendationStatuses);

  if (error) throw new Error(error.message);

  const existingByFingerprint = new Map();
  for (const recommendation of data ?? []) {
    const fingerprint = recommendationFingerprint(recommendation);
    existingByFingerprint.set(fingerprint, newestRecommendation(existingByFingerprint.get(fingerprint), recommendation));
  }

  const pendingByFingerprint = new Map();
  return incomingRecommendations.map((recommendation) => {
    const fingerprint = recommendationFingerprint(recommendation);
    const duplicate = pendingByFingerprint.get(fingerprint) ?? existingByFingerprint.get(fingerprint);
    const merged = duplicate ? mergeDuplicateRecommendation(duplicate, recommendation) : recommendation;
    pendingByFingerprint.set(fingerprint, merged);
    return merged;
  });
}

let dedupedRecommendations;
try {
  dedupedRecommendations = await suppressDuplicateRecommendations(recommendations);
} catch (dedupeError) {
  console.error(dedupeError.message);
  process.exit(1);
}

const { error } = await supabase.from("admin_recommendations").upsert(dedupedRecommendations, { onConflict: "id" });
if (error) {
  console.error(error.message);
  process.exit(1);
}

const { error: scheduleError } = await supabase.from("admin_schedules").upsert({
  id: "00000000-0000-4000-8000-000000000501",
  owner_user_id: "b0ef78e8-d78f-43d7-b354-89d425be29f8",
  project: "RaT Studios",
  agent_name: "bub-recommendations-agent",
  task_title: "Daily recommendations update",
  cron_expression: "0 5 * * *",
  timezone: "America/Denver",
  environment: "prod",
  enabled: true,
  owner_label: "Richard",
  task_payload: { route: "/api/cron/daily-recommendations", cadence: "Every day at 5:00am Mountain" },
  last_run_at: now,
  next_run_at: new Date(runDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  last_status: "completed",
  updated_at: now,
}, { onConflict: "id" });
if (scheduleError) {
  console.error(scheduleError.message);
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, date: dateSlug, upserted: dedupedRecommendations.length }, null, 2));
