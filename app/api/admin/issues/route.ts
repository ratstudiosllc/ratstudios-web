import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  buildIssueTrackerResponse,
  getIssueTracker,
  normalizeIssueRow,
} from "@/lib/issues-tracker";

const allowedStatuses = new Set([
  "New",
  "Triaged",
  "In Progress",
  "Blocked",
  "Ready for QA",
  "Needs Verification",
  "Resolved",
  "Deferred",
  "Unresolved",
]);

const allowedPriorities = new Set(["P1", "P2", "P3"]);
const yesNo = new Set(["Yes", "No"]);
const ownerAgents = new Set(["orchestrator", "bugs", "execution", "qa", "marketing", "unassigned"]);

function normalizeString(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

function coerceYesNo(value: unknown) {
  const text = normalizeString(value);
  if (!text) return undefined;
  if (text.toLowerCase() === "yes") return "Yes";
  if (text.toLowerCase() === "no") return "No";
  return undefined;
}

function getResolvedAtPatch(status: string) {
  return status === "Resolved" ? new Date().toISOString() : null;
}

async function getTrackedIssueById(issueId: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_issues")
    .select("id, number, project, priority, title, status, identified, committed, pushed, deployed, owner_agent, commits, summary, current_state, next_step, updated_at")
    .eq("id", issueId)
    .single();

  if (error) throw new Error(error.message);
  return normalizeIssueRow(data as Record<string, unknown>);
}

export async function GET() {
  const data = await getIssueTracker();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createSupabaseAdmin();

  const issueId = normalizeString(body.issueId);
  if (!issueId) {
    return NextResponse.json({ error: "issueId is required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  const priority = normalizeString(body.priority);
  if (priority) {
    if (!allowedPriorities.has(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    patch.priority = priority;
  }

  const status = normalizeString(body.status);
  if (status) {
    if (!allowedStatuses.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = status;
    patch.resolved_at = getResolvedAtPatch(status);
  }

  const ownerAgent = normalizeString(body.ownerAgent);
  if (ownerAgent) {
    const normalizedOwner = ownerAgent.toLowerCase();
    if (!ownerAgents.has(normalizedOwner)) {
      return NextResponse.json({ error: "Invalid ownerAgent" }, { status: 400 });
    }
    patch.owner_agent = normalizedOwner === "unassigned" ? null : normalizedOwner;
  }

  const summary = normalizeString(body.summary);
  if (body.summary !== undefined) patch.summary = summary ?? null;

  const currentState = normalizeString(body.currentState);
  if (body.currentState !== undefined) patch.current_state = currentState ?? null;

  const nextStep = normalizeString(body.nextStep);
  if (body.nextStep !== undefined) patch.next_step = nextStep ?? null;

  const commits = normalizeString(body.commits);
  if (body.commits !== undefined) patch.commits = commits ?? "";

  const committed = coerceYesNo(body.committed);
  if (body.committed !== undefined) {
    if (!committed || !yesNo.has(committed)) {
      return NextResponse.json({ error: "Invalid committed value" }, { status: 400 });
    }
    patch.committed = committed;
  }

  const pushed = coerceYesNo(body.pushed);
  if (body.pushed !== undefined) {
    if (!pushed || !yesNo.has(pushed)) {
      return NextResponse.json({ error: "Invalid pushed value" }, { status: 400 });
    }
    patch.pushed = pushed;
  }

  const deployed = coerceYesNo(body.deployed);
  if (body.deployed !== undefined) {
    if (!deployed || !yesNo.has(deployed)) {
      return NextResponse.json({ error: "Invalid deployed value" }, { status: 400 });
    }
    patch.deployed = deployed;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid changes provided" }, { status: 400 });
  }

  const statusValue = String(patch.status ?? "");
  const committedValue = String(patch.committed ?? body.committed ?? "");
  const pushedValue = String(patch.pushed ?? body.pushed ?? "");
  const deployedValue = String(patch.deployed ?? body.deployed ?? "");
  if (
    statusValue === "Resolved" &&
    (committedValue !== "Yes" || pushedValue !== "Yes" || deployedValue !== "Yes")
  ) {
    return NextResponse.json(
      {
        error: "Resolved issues must have committed, pushed, and deployed all set to Yes",
      },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("admin_issues")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", issueId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const issue = await getTrackedIssueById(issueId);
  const tracker = await getIssueTracker();

  return NextResponse.json({
    ...tracker,
    updatedIssue: issue,
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const supabase = createSupabaseAdmin();

  const title = normalizeString(body.title);
  const project = normalizeString(body.project);
  const summary = normalizeString(body.summary);
  const currentState = normalizeString(body.currentState);
  const nextStep = normalizeString(body.nextStep);
  const priority = normalizeString(body.priority) ?? "P2";
  const ownerAgent = (normalizeString(body.ownerAgent) ?? "bugs").toLowerCase();
  const identified = normalizeString(body.identified) ?? new Date().toISOString().slice(0, 10);

  if (!title || !project || !summary || !currentState || !nextStep) {
    return NextResponse.json({ error: "title, project, summary, currentState, and nextStep are required" }, { status: 400 });
  }

  if (!allowedPriorities.has(priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  if (!ownerAgents.has(ownerAgent)) {
    return NextResponse.json({ error: "Invalid ownerAgent" }, { status: 400 });
  }

  const { data: maxRow, error: maxError } = await supabase
    .from("admin_issues")
    .select("number")
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    return NextResponse.json({ error: maxError.message }, { status: 500 });
  }

  const nextNumber = Number(maxRow?.number ?? 0) + 1;
  const row = {
    number: nextNumber,
    project,
    priority,
    title,
    status: "New",
    identified,
    committed: "No",
    pushed: "No",
    deployed: "No",
    owner_agent: ownerAgent === "unassigned" ? null : ownerAgent,
    commits: "",
    summary,
    current_state: currentState,
    next_step: nextStep,
    updated_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("admin_issues").insert(row);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const tracker = await getIssueTracker();
  const createdIssue = tracker.issues.find((issue) => issue.number === nextNumber) ?? null;

  return NextResponse.json({
    ...tracker,
    createdIssue,
  });
}
