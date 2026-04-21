import type { IssueTrackerResponse, TrackedIssue } from "@/lib/issues-tracker";
import type { OpsRunsResponse } from "@/lib/ops-admin";

export type AgentRole = "orchestrator" | "bugs" | "execution" | "qa" | "marketing";

export interface AgentQueueItem {
  issueId: string;
  issueNumber: number;
  title: string;
  project: string;
  priority: string;
  status: string;
  ownerAgent: AgentRole | "unassigned";
  nextAgent: AgentRole | "done" | "unassigned";
  lastUpdate: string;
  nextStep: string;
  currentState: string;
  blocked: boolean;
}

export interface AgentLaneSummary {
  role: AgentRole;
  label: string;
  doingNow: AgentQueueItem[];
  recentlyDone: AgentQueueItem[];
  needsToComplete: AgentQueueItem[];
  blocked: AgentQueueItem[];
}

export interface AgentWorkflowSnapshot {
  lanes: AgentLaneSummary[];
  queued: AgentQueueItem[];
  blocked: AgentQueueItem[];
  completedRecently: AgentQueueItem[];
  qaReady: AgentQueueItem[];
  needsVerification: AgentQueueItem[];
  updatedAt: string | null;
  kpis: {
    activeAgentOwned: number;
    queued: number;
    blocked: number;
    qaReady: number;
    needsVerification: number;
    completedRecently: number;
  };
}

const roleLabels: Record<AgentRole, string> = {
  orchestrator: "Orchestrator",
  bugs: "Bugs & Issues Manager",
  execution: "Execution",
  qa: "QA / Verification",
  marketing: "Marketing / Growth",
};

function normalizeOwner(issue: TrackedIssue): AgentRole | "unassigned" {
  const owner = (issue.ownerAgent ?? "").toLowerCase();
  if (owner === "orchestrator" || owner === "bugs" || owner === "execution" || owner === "qa" || owner === "marketing") return owner;
  if (issue.status === "Ready for QA") return "qa";
  if (issue.status === "In Progress") return "execution";
  const text = `${issue.title} ${issue.summary ?? ""} ${issue.currentState ?? ""} ${issue.nextStep ?? ""}`.toLowerCase();
  if (text.includes("marketing") || text.includes("growth") || text.includes("seo") || text.includes("landing page") || text.includes("content") || text.includes("outreach") || text.includes("partnership") || text.includes("webinar") || text.includes("conversion")) {
    return "marketing";
  }
  if (issue.status === "Triaged" || issue.status === "New" || issue.status === "Unresolved") return "bugs";
  if (issue.status === "Blocked") return "execution";
  return "unassigned";
}

function nextAgentForIssue(issue: TrackedIssue): AgentRole | "done" | "unassigned" {
  const owner = normalizeOwner(issue);
  if (issue.status === "Resolved") return "done";
  if (issue.status === "Ready for QA" || issue.status === "Needs Verification") return owner === "marketing" ? "marketing" : "qa";
  if (issue.status === "In Progress") return owner;
  if (issue.status === "Blocked") return owner;
  if (issue.status === "Triaged" || issue.status === "New" || issue.status === "Unresolved") return owner === "marketing" ? "marketing" : "bugs";
  return "unassigned";
}

function getLastUpdate(issue: TrackedIssue) {
  return issue.updatedAt ?? issue.identified ?? "unknown";
}

function mapIssue(issue: TrackedIssue): AgentQueueItem {
  const ownerAgent = normalizeOwner(issue);
  return {
    issueId: issue.id,
    issueNumber: issue.number,
    title: issue.title,
    project: issue.project,
    priority: issue.priority,
    status: issue.status,
    ownerAgent,
    nextAgent: nextAgentForIssue(issue),
    lastUpdate: getLastUpdate(issue),
    nextStep: issue.nextStep ?? "No next step recorded",
    currentState: issue.currentState ?? issue.summary ?? "No current state recorded",
    blocked: issue.status === "Blocked",
  };
}

function sortByPriorityAndNumber(items: AgentQueueItem[]) {
  const priorityRank: Record<string, number> = { P1: 0, P2: 1, P3: 2 };
  return [...items].sort((a, b) => {
    const priorityDiff = (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
    if (priorityDiff !== 0) return priorityDiff;
    return a.issueNumber - b.issueNumber;
  });
}

export function buildAgentWorkflowSnapshot(
  tracker: IssueTrackerResponse | null,
  _ops: OpsRunsResponse | null,
): AgentWorkflowSnapshot {
  const allItems = sortByPriorityAndNumber((tracker?.issues ?? []).map(mapIssue));

  const queued = allItems.filter((item) => item.status === "New" || item.status === "Triaged" || item.status === "Unresolved");
  const blocked = allItems.filter((item) => item.blocked);
  const qaReady = allItems.filter((item) => item.status === "Ready for QA");
  const needsVerification = allItems.filter((item) => item.status === "Needs Verification");
  const completedRecently = allItems.filter((item) => item.status === "Resolved").slice(0, 8);

  const lanes: AgentLaneSummary[] = (["orchestrator", "bugs", "execution", "qa", "marketing"] as AgentRole[]).map((role) => {
    const owned = allItems.filter((item) => item.ownerAgent === role || item.nextAgent === role);

    return {
      role,
      label: roleLabels[role],
      doingNow: owned.filter((item) => item.ownerAgent === role && item.status !== "Resolved").slice(0, 6),
      recentlyDone: completedRecently.filter((item) => {
        if (role === "qa") return item.nextAgent === "done" || item.ownerAgent === "qa";
        if (role === "execution") return item.currentState.toLowerCase().includes("fix") || item.currentState.toLowerCase().includes("deploy");
        if (role === "bugs") return ["Resolved", "Triaged", "New"].includes(item.status);
        return true;
      }).slice(0, 4),
      needsToComplete: owned.filter((item) => item.nextAgent === role && item.status !== "Resolved").slice(0, 6),
      blocked: owned.filter((item) => item.blocked).slice(0, 4),
    };
  });

  const updatedAt = allItems
    .map((item) => item.lastUpdate)
    .filter((value) => value && value !== "unknown")
    .sort()
    .at(-1) ?? null;

  return {
    lanes,
    queued,
    blocked,
    completedRecently,
    qaReady,
    needsVerification,
    updatedAt,
    kpis: {
      activeAgentOwned: allItems.filter((item) => item.status !== "Resolved").length,
      queued: queued.length,
      blocked: blocked.length,
      qaReady: qaReady.length,
      needsVerification: needsVerification.length,
      completedRecently: completedRecently.length,
    },
  };
}
