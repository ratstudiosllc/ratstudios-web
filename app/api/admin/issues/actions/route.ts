import { NextResponse } from "next/server";
import { applyIssueAction, type IssueAction } from "@/lib/issue-automation";
import { getIssueTracker } from "@/lib/issues-tracker";

function normalizeAction(value: unknown): IssueAction | null {
  const text = String(value ?? "").trim();
  if (text === "claim" || text === "start" || text === "block" || text === "ready_for_verification" || text === "resolve") {
    return text;
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json();
  const issueId = String(body.issueId ?? "").trim();
  const action = normalizeAction(body.action);

  if (!issueId) {
    return NextResponse.json({ error: "issueId is required" }, { status: 400 });
  }

  if (!action) {
    return NextResponse.json({ error: "Valid action is required" }, { status: 400 });
  }

  const tracker = await getIssueTracker();
  const issue = tracker.issues.find((item) => item.id === issueId);

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  try {
    await applyIssueAction(issue, action);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not apply issue action" },
      { status: 400 },
    );
  }

  const updatedTracker = await getIssueTracker();
  return NextResponse.json(updatedTracker);
}
