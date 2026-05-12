#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";

const execFileAsync = promisify(execFile);

const repoRoot = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const allowedProjectRepos = new Map([
  ["AgAlmanac", "/Users/topher/.openclaw/workspace/agalmanac"],
  ["RaT Studios", "/Users/topher/workspaces/personal/ratstudios-web"],
  ["StitchLogic", "/Users/topher/Documents/GitHub/stitchlogic-ios"],
]);

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['\"]|['\"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(`${repoRoot}/.env.local`);
loadEnvFile(`${repoRoot}/.env.vercel`);
loadEnvFile(`${repoRoot}/.env.vercel.production`);

const args = new Set(process.argv.slice(2));
const limit = Math.max(1, Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? "1"));
const dispatcherId = process.env.OPENCLAW_DISPATCHER_ID || `ratstudios-local-dispatcher-${process.pid}`;
const dryRun = args.has("--dry-run");

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
}

const supabase = createSupabaseAdmin();

function nowIso() {
  return new Date().toISOString();
}

function parseRunId(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed.sessionId || parsed.id || parsed.key || null;
  } catch {
    return null;
  }
}

function chooseAgent(issue) {
  const text = `${issue.project} ${issue.title} ${issue.summary || ""} ${issue.current_state || ""} ${issue.next_step || ""}`.toLowerCase();
  if (text.includes("marketing") || text.includes("seo") || text.includes("content") || text.includes("growth")) {
    return { ownerAgent: "marketing", label: "marketing-worker" };
  }
  return { ownerAgent: "execution", label: "execution-worker" };
}

function buildTask(issue) {
  return `Work this tracked issue for ${issue.project}.\n\nIssue #${issue.number}: ${issue.title}\nSummary: ${issue.summary || "No summary recorded."}\nCurrent state: ${issue.current_state || "No current state recorded."}\nNext step: ${issue.next_step || "No next step recorded."}\n\nYour job: inspect the canonical repo, implement the fix if real work remains, commit the smallest safe changes if needed, push if safe, and report exactly whether the issue is ready for Needs Verification, Blocked, or still In Progress. Do not claim deploys or verification you did not do.`;
}

async function claimNextQueuedRun() {
  const { data: queued, error: selectError } = await supabase
    .from("admin_issue_runs")
    .select("id, issue_id, issue_number, project, owner_agent, task_title, status, created_at")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (selectError) throw new Error(selectError.message);
  if (!queued) return null;

  const now = nowIso();
  const { data: claimed, error: claimError } = await supabase
    .from("admin_issue_runs")
    .update({ status: "running", claimed_by: dispatcherId, claimed_at: now, started_at: now, updated_at: now })
    .eq("id", queued.id)
    .eq("status", "queued")
    .select("id, issue_id, issue_number, project, owner_agent, task_title, status, created_at, started_at")
    .maybeSingle();
  if (claimError) throw new Error(claimError.message);
  return claimed;
}

async function markRun(id, patch) {
  const { error } = await supabase.from("admin_issue_runs").update({ ...patch, updated_at: nowIso() }).eq("id", id);
  if (error) throw new Error(error.message);
}

async function getIssue(issueId) {
  const { data, error } = await supabase
    .from("admin_issues")
    .select("id, number, project, priority, title, status, committed, pushed, deployed, owner_agent, commits, summary, current_state, next_step, updated_at")
    .eq("id", issueId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function spawnWorker(issue) {
  const cwd = allowedProjectRepos.get(issue.project);
  if (!cwd) throw new Error(`Project is not allowlisted for dispatcher: ${issue.project}`);

  const agent = chooseAgent(issue);
  const sessionId = `issue-run-${issue.number}-${Date.now()}`;
  const { stdout, stderr } = await execFileAsync("openclaw", [
    "agent",
    "--agent", "ratstudios",
    "--session-id", sessionId,
    "--message", buildTask(issue),
    "--json",
    "--timeout", "1800",
  ], {
    cwd,
    maxBuffer: 1024 * 1024 * 12,
  });
  const raw = [stdout, stderr].filter(Boolean).join("\n");
  return { raw, sessionId: parseRunId(stdout) || sessionId, ownerAgent: agent.ownerAgent, cwd };
}

const started = [];
const failed = [];

for (let i = 0; i < limit; i += 1) {
  const run = await claimNextQueuedRun();
  if (!run) break;

  const startedAt = Date.parse(run.started_at || nowIso());
  try {
    const issue = await getIssue(run.issue_id);
    if (!issue) throw new Error(`Issue not found: ${run.issue_id}`);
    if (dryRun) {
      started.push({ runId: run.id, issueNumber: run.issue_number, sessionId: null, project: issue.project, dryRun: true });
      await markRun(run.id, { status: "queued", claimed_by: null, claimed_at: null, started_at: null });
      continue;
    }

    const spawned = await spawnWorker(issue);
    await supabase.from("admin_issues").update({
      owner_agent: spawned.ownerAgent,
      status: "In Progress",
      current_state: "Agent spawned and actively working this issue.",
      next_step: "Wait for worker result, then move to Needs Verification or Blocked.",
      updated_at: nowIso(),
    }).eq("id", issue.id);
    await markRun(run.id, {
      status: "completed",
      owner_agent: spawned.ownerAgent,
      run_id: spawned.sessionId,
      cwd: spawned.cwd,
      raw_spawn_result: spawned.raw,
      completed_at: nowIso(),
      duration_ms: Math.max(0, Date.now() - startedAt),
    });
    started.push({ runId: run.id, issueNumber: run.issue_number, sessionId: spawned.sessionId, project: issue.project });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await markRun(run.id, {
      status: "failed",
      completed_at: nowIso(),
      duration_ms: Math.max(0, Date.now() - startedAt),
      failure_category: "dispatch_start_failed",
      failure_message: message,
    });
    failed.push({ runId: run.id, issueNumber: run.issue_number, reason: message });
  }
}

console.log(JSON.stringify({ ok: true, started, failed }, null, 2));
