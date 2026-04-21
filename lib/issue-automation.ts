import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { TrackedIssue } from "@/lib/issues-tracker";

export type IssueAction = "claim" | "start" | "block" | "ready_for_verification" | "resolve";

function normalizeOwner(issue: TrackedIssue) {
  const owner = (issue.ownerAgent ?? "").toLowerCase();
  if (["orchestrator", "bugs", "execution", "qa", "marketing"].includes(owner)) return owner;
  const text = `${issue.project} ${issue.title} ${issue.summary ?? ""} ${issue.currentState ?? ""} ${issue.nextStep ?? ""}`.toLowerCase();
  if (text.includes("marketing") || text.includes("seo") || text.includes("content") || text.includes("growth")) return "marketing";
  return "execution";
}

function nowIso() {
  return new Date().toISOString();
}

export function buildActionPatch(issue: TrackedIssue, action: IssueAction) {
  const owner = normalizeOwner(issue);

  if (action === "claim") {
    return {
      owner_agent: owner,
      status: issue.status === "New" ? "Triaged" : issue.status,
      current_state: issue.currentState || "Claimed by automation workflow.",
      next_step: issue.nextStep || "Begin execution on the fix.",
      updated_at: nowIso(),
    };
  }

  if (action === "start") {
    return {
      owner_agent: owner,
      status: "In Progress",
      current_state: "Agent is actively working this issue.",
      next_step: "Complete the fix, commit/push changes, then move to Needs Verification.",
      updated_at: nowIso(),
    };
  }

  if (action === "block") {
    return {
      owner_agent: owner,
      status: "Blocked",
      current_state: issue.currentState || "Blocked pending dependency, deploy, or decision.",
      next_step: issue.nextStep || "Unblock dependency before execution can continue.",
      updated_at: nowIso(),
    };
  }

  if (action === "ready_for_verification") {
    return {
      owner_agent: owner === "marketing" ? "marketing" : "qa",
      status: "Needs Verification",
      current_state: "Fix exists and is ready for Richard/Topher verification.",
      next_step: "Verify the live or target-environment behavior, then mark Resolved if good.",
      updated_at: nowIso(),
    };
  }

  if (action === "resolve") {
    if (issue.committed !== "Yes" || issue.pushed !== "Yes" || issue.deployed !== "Yes") {
      throw new Error("Resolved issues must have committed, pushed, and deployed all set to Yes");
    }
    return {
      status: "Resolved",
      resolved_at: nowIso(),
      updated_at: nowIso(),
      next_step: "No further action.",
    };
  }

  throw new Error("Unsupported issue action");
}

export async function applyIssueAction(issue: TrackedIssue, action: IssueAction) {
  const supabase = createSupabaseAdmin();
  const patch = buildActionPatch(issue, action);

  const { error } = await supabase
    .from("admin_issues")
    .update(patch)
    .eq("id", issue.id);

  if (error) throw new Error(error.message);
}

export function shouldAutoQueue(issue: TrackedIssue) {
  return ["New", "Triaged", "Unresolved"].includes(issue.status);
}

export function canAutoMoveToVerification(issue: TrackedIssue) {
  return issue.status === "In Progress" && issue.committed === "Yes" && issue.pushed === "Yes";
}
