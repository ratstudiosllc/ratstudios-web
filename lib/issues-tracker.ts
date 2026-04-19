import { createSupabaseAdmin } from "@/lib/supabase-admin";

export interface TrackedIssue {
  id: string;
  number: number;
  project: string;
  priority: "P1" | "P2" | "P3" | string;
  title: string;
  status: "Resolved" | "Unresolved" | "New" | "Triaged" | "In Progress" | "Blocked" | "Ready for QA" | "Needs Verification" | "Deferred" | string;
  identified?: string;
  committed: string;
  pushed: string;
  deployed: string;
  verified?: string;
  ownerAgent?: string;
  commits: string;
  summary?: string;
  currentState?: string;
  nextStep?: string;
  updatedAt?: string;
}

export interface IssueTrackerResponse {
  trackerPath: string;
  lastUpdated: string | null;
  counts: {
    total: number;
    unresolved: number;
    resolved: number;
    deployedYes: number;
    p1: number;
    p2: number;
    p3: number;
  };
  issues: TrackedIssue[];
}

export function formatMountainTimestamp(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).formatToParts(date);

  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")} ${pick("hour")}:${pick("minute")} ${pick("timeZoneName")}`;
}

export function buildIssueTrackerResponse(issues: TrackedIssue[], lastUpdated: string | null): IssueTrackerResponse {
  return {
    trackerPath: "supabase.admin_issues",
    lastUpdated: formatMountainTimestamp(lastUpdated),
    counts: {
      total: issues.length,
      unresolved: issues.filter((issue) => issue.status !== "Resolved").length,
      resolved: issues.filter((issue) => issue.status === "Resolved").length,
      deployedYes: issues.filter((issue) => issue.deployed === "Yes").length,
      p1: issues.filter((issue) => issue.priority === "P1").length,
      p2: issues.filter((issue) => issue.priority === "P2").length,
      p3: issues.filter((issue) => issue.priority === "P3").length,
    },
    issues,
  };
}

export function normalizeIssueRow(row: Record<string, unknown>): TrackedIssue {
  return {
    id: String(row.id ?? ""),
    number: Number(row.number ?? 0),
    project: String(row.project ?? "Unknown"),
    priority: String(row.priority ?? "P3"),
    title: String(row.title ?? "Untitled issue"),
    status: String(row.status ?? "New"),
    identified: row.identified ? String(row.identified) : undefined,
    committed: String(row.committed ?? "No"),
    pushed: String(row.pushed ?? "No"),
    deployed: String(row.deployed ?? "No"),
    verified: row.verified ? String(row.verified) : undefined,
    ownerAgent: row.owner_agent ? String(row.owner_agent) : undefined,
    commits: String(row.commits ?? ""),
    summary: row.summary ? String(row.summary) : undefined,
    currentState: row.current_state ? String(row.current_state) : undefined,
    nextStep: row.next_step ? String(row.next_step) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function getIssueTracker(): Promise<IssueTrackerResponse> {
  let supabase;
  try {
    supabase = createSupabaseAdmin();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase client error";
    throw new Error(`Issue tracker init failed: ${message}`);
  }

  const { data, error } = await supabase
    .from("admin_issues")
    .select("id, number, project, priority, title, status, identified, committed, pushed, deployed, owner_agent, commits, summary, current_state, next_step, updated_at")
    .order("number", { ascending: true });

  if (error) {
    throw new Error(`Issue tracker query failed: ${error.message}`);
  }

  const issues: TrackedIssue[] = (data ?? []).map((row) => normalizeIssueRow(row));

  const lastUpdated = (data ?? []).reduce<string | null>((latest, row) => {
    if (!row.updated_at) return latest;
    if (!latest || row.updated_at > latest) return row.updated_at;
    return latest;
  }, null);

  return buildIssueTrackerResponse(issues, lastUpdated);
}
