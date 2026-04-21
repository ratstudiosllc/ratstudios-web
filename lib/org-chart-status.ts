import type { AgentWorkflowSnapshot, AgentRole } from "@/lib/agent-workflow";
import type { OpsRunsResponse } from "@/lib/ops-admin";

export interface OrgRoleStatus {
  slug: string;
  state: "active" | "idle" | "blocked" | "leadership";
  label: string;
  detail: string;
  issueHref?: string;
  runHref?: string;
}

const slugToRole: Record<string, AgentRole> = {
  bub: "orchestrator",
  "bugs-issues-manager": "bugs",
  "execution-agent": "execution",
  "qa-verification-agent": "qa",
  "mark-growth-agent": "marketing",
};

export function getOrgRoleStatus(slug: string, workflow: AgentWorkflowSnapshot | null, ops: OpsRunsResponse | null): OrgRoleStatus {
  if (slug === "richard-ashcraft" || slug === "topher") {
    return {
      slug,
      state: "leadership",
      label: "Leadership",
      detail: "Strategic ownership and final verification",
      issueHref: "/admin/issues?status=Needs%20Verification",
    };
  }

  const role = slugToRole[slug];
  if (!role || !workflow) {
    return {
      slug,
      state: "idle",
      label: "Reference role",
      detail: "No live workflow mapping yet",
    };
  }

  const lane = workflow.lanes.find((item) => item.role === role);
  const activeCount = lane?.doingNow.length ?? 0;
  const blockedCount = lane?.blocked.length ?? 0;
  const readyCount = lane?.needsToComplete.length ?? 0;
  const runningOps = ops?.runs.filter((run) => run.status === "running").length ?? 0;

  if (blockedCount > 0) {
    return {
      slug,
      state: "blocked",
      label: `${blockedCount} blocked`,
      detail: "Needs an unblock or decision",
      issueHref: "/admin/issues?status=Blocked",
      runHref: "/admin/agent-runs",
    };
  }

  if (activeCount > 0 || runningOps > 0) {
    return {
      slug,
      state: "active",
      label: `${activeCount} active`,
      detail: readyCount > 0 ? `${readyCount} queued behind it` : "Currently working live issues",
      issueHref: "/admin/issues?status=In%20Progress",
      runHref: "/admin/agent-runs",
    };
  }

  return {
    slug,
    state: "idle",
    label: readyCount > 0 ? `${readyCount} queued` : "Idle",
    detail: readyCount > 0 ? "Work is waiting in this lane" : "No active work right now",
    issueHref: readyCount > 0 ? "/admin/issues" : undefined,
    runHref: "/admin/agent-runs",
  };
}

export function getStatusClasses(state: OrgRoleStatus["state"]) {
  if (state === "active") return "bg-emerald-100 text-emerald-800";
  if (state === "blocked") return "bg-red-100 text-red-800";
  if (state === "leadership") return "bg-amber-100 text-amber-800";
  return "bg-neutral-100 text-neutral-700";
}
