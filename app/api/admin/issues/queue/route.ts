import { NextResponse } from "next/server";
import { applyIssueAction, canAutoMoveToVerification, shouldAutoQueue } from "@/lib/issue-automation";
import { getIssueTracker } from "@/lib/issues-tracker";

export async function POST() {
  const tracker = await getIssueTracker();
  const changed: Array<{ issueId: string; number: number; from: string; to: string }> = [];

  for (const issue of tracker.issues) {
    if (shouldAutoQueue(issue)) {
      await applyIssueAction(issue, "claim");
      changed.push({ issueId: issue.id, number: issue.number, from: issue.status, to: issue.status === "New" ? "Triaged" : issue.status });
      const refreshed = (await getIssueTracker()).issues.find((item) => item.id === issue.id);
      if (refreshed && (refreshed.status === "Triaged" || refreshed.status === "Unresolved" || refreshed.status === "New")) {
        await applyIssueAction(refreshed, "start");
        changed.push({ issueId: refreshed.id, number: refreshed.number, from: refreshed.status, to: "In Progress" });
      }
      continue;
    }

    if (canAutoMoveToVerification(issue)) {
      await applyIssueAction(issue, "ready_for_verification");
      changed.push({ issueId: issue.id, number: issue.number, from: issue.status, to: "Needs Verification" });
    }
  }

  const updated = await getIssueTracker();
  return NextResponse.json({ changed, tracker: updated });
}
