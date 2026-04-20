import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { applyIssueAction } from "@/lib/issue-automation";
import { getIssueTracker, type TrackedIssue } from "@/lib/issues-tracker";

const execFileAsync = promisify(execFile);

const ALLOWED_PROJECTS = new Set(["AgAlmanac", "RaT Studios", "StitchLogic"]);

function chooseAgentPrompt(issue: TrackedIssue) {
  const text = `${issue.project} ${issue.title} ${issue.summary ?? ""} ${issue.currentState ?? ""} ${issue.nextStep ?? ""}`.toLowerCase();
  if (text.includes("marketing") || text.includes("seo") || text.includes("content") || text.includes("growth")) {
    return {
      ownerAgent: "marketing",
      agentLabel: "marketing-worker",
      task: `Work this tracked issue for ${issue.project}.\n\nIssue #${issue.number}: ${issue.title}\nSummary: ${issue.summary ?? "No summary recorded."}\nCurrent state: ${issue.currentState ?? "No current state recorded."}\nNext step: ${issue.nextStep ?? "No next step recorded."}\n\nYour job: do the actual work if possible, update docs/files in the right repo, and stop only if blocked. When done, summarize what changed, commit hashes if any, whether pushed, and whether this should move to Needs Verification.`
    };
  }

  return {
    ownerAgent: "execution",
    agentLabel: "execution-worker",
    task: `Work this tracked issue for ${issue.project}.\n\nIssue #${issue.number}: ${issue.title}\nSummary: ${issue.summary ?? "No summary recorded."}\nCurrent state: ${issue.currentState ?? "No current state recorded."}\nNext step: ${issue.nextStep ?? "No next step recorded."}\n\nYour job: inspect the canonical repo, implement the fix if real work remains, commit the smallest safe changes if needed, push if safe, and report exactly whether the issue is ready for Needs Verification, Blocked, or still In Progress. Do not claim deploys or verification you did not do.`
  };
}

function repoForProject(project: string) {
  if (project === "AgAlmanac") return "/Users/topher/.openclaw/workspace/agalmanac";
  if (project === "RaT Studios") return "/Users/topher/workspaces/personal/ratstudios-web";
  if (project === "StitchLogic") return "/Users/topher/Documents/GitHub/stitchlogic-ios";
  return "/Users/topher/workspaces/personal/ratstudios-web";
}

async function spawnWorker(issue: TrackedIssue) {
  const selection = chooseAgentPrompt(issue);
  const cwd = repoForProject(issue.project);

  const payload = {
    task: selection.task,
    label: `${selection.agentLabel}-issue-${issue.number}`,
    runtime: "subagent",
    cwd,
    mode: "run",
    cleanup: "delete",
    timeoutSeconds: 180,
    runTimeoutSeconds: 180,
    lightContext: true,
  };

  const { stdout } = await execFileAsync("openclaw", ["tool", "sessions_spawn", JSON.stringify(payload)], {
    cwd: "/Users/topher/workspaces/personal/ratstudios-web",
    maxBuffer: 1024 * 1024 * 4,
  });

  return { raw: stdout, ownerAgent: selection.ownerAgent };
}

async function persistRunStart(issue: TrackedIssue, ownerAgent: string, raw: string) {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  await supabase.from("admin_issues").update({
    owner_agent: ownerAgent,
    status: "In Progress",
    current_state: "Agent spawned and actively working this issue.",
    next_step: "Wait for worker result, then move to Needs Verification or Blocked.",
    updated_at: now,
  }).eq("id", issue.id);

  let runId: string | null = null;
  try {
    const parsed = JSON.parse(raw) as { sessionId?: string; id?: string };
    runId = parsed.sessionId ?? parsed.id ?? null;
  } catch {
    runId = null;
  }

  await supabase.from("admin_issue_runs").insert({
    issue_id: issue.id,
    issue_number: issue.number,
    project: issue.project,
    owner_agent: ownerAgent,
    run_id: runId,
    task_title: issue.title,
    source: "issue-runner",
    status: "running",
    raw_spawn_result: raw,
    started_at: now,
    created_at: now,
    updated_at: now,
  });
}

export async function runIssueQueueOnce() {
  const tracker = await getIssueTracker();
  const candidates = tracker.issues.filter((issue) => ALLOWED_PROJECTS.has(issue.project) && ["New", "Triaged", "Unresolved"].includes(issue.status));
  const started: Array<{ number: number; title: string; project: string }> = [];
  const skipped: Array<{ number: number; reason: string }> = [];

  for (const issue of candidates) {
    try {
      await applyIssueAction(issue, "claim");
      const refreshed = (await getIssueTracker()).issues.find((item) => item.id === issue.id);
      if (!refreshed) {
        skipped.push({ number: issue.number, reason: "Issue disappeared during refresh." });
        continue;
      }
      const spawned = await spawnWorker(refreshed);
      await persistRunStart(refreshed, spawned.ownerAgent, spawned.raw);
      started.push({ number: refreshed.number, title: refreshed.title, project: refreshed.project });
    } catch (error) {
      const supabase = createSupabaseAdmin();
      await supabase.from("admin_issues").update({
        status: "Blocked",
        current_state: `Automation failed to start worker: ${error instanceof Error ? error.message : "unknown error"}`,
        next_step: "Investigate automation failure, then restart issue execution.",
        updated_at: new Date().toISOString(),
      }).eq("id", issue.id);
      skipped.push({ number: issue.number, reason: error instanceof Error ? error.message : "unknown error" });
    }
  }

  return { started, skipped, totalCandidates: candidates.length };
}
