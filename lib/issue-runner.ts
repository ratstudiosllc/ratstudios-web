import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { applyIssueAction } from "@/lib/issue-automation";
import { getIssueTracker, type TrackedIssue } from "@/lib/issues-tracker";

const ALLOWED_PROJECT_REPOS = {
  AgAlmanac: "/Users/topher/.openclaw/workspace/agalmanac",
  "RaT Studios": "/Users/topher/workspaces/personal/ratstudios-web",
  StitchLogic: "/Users/topher/Documents/GitHub/stitchlogic-ios",
} as const;

const ALLOWED_PROJECTS = new Set<string>(Object.keys(ALLOWED_PROJECT_REPOS));
type AllowedProject = keyof typeof ALLOWED_PROJECT_REPOS;

function isAllowedProject(project: string): project is AllowedProject {
  return Object.prototype.hasOwnProperty.call(ALLOWED_PROJECT_REPOS, project);
}

function ownerAgentForIssue(issue: TrackedIssue) {
  const text = `${issue.project} ${issue.title} ${issue.summary ?? ""} ${issue.currentState ?? ""} ${issue.nextStep ?? ""}`.toLowerCase();
  if (text.includes("marketing") || text.includes("seo") || text.includes("content") || text.includes("growth")) return "marketing";
  return "execution";
}

function repoForProject(project: string) {
  if (!isAllowedProject(project)) throw new Error(`Project is not allowlisted for dispatcher: ${project}`);
  return ALLOWED_PROJECT_REPOS[project];
}

function nowIso() {
  return new Date().toISOString();
}


export async function enqueueIssueRun(issue: TrackedIssue, source = "issue-dispatcher") {
  if (!isAllowedProject(issue.project)) return { queued: false, reason: "Project is not allowlisted." };

  const supabase = createSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase
    .from("admin_issue_runs")
    .select("id, status")
    .eq("issue_id", issue.id)
    .in("status", ["queued", "running", "retrying"])
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing) return { queued: false, reason: `Active run already exists (${existing.status}).`, runId: String(existing.id) };

  const ownerAgent = ownerAgentForIssue(issue);
  const now = nowIso();
  const { data, error } = await supabase
    .from("admin_issue_runs")
    .insert({
      issue_id: issue.id,
      issue_number: issue.number,
      project: issue.project,
      owner_agent: ownerAgent,
      task_title: issue.title,
      source,
      status: "queued",
      cwd: repoForProject(issue.project),
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) return { queued: false, reason: "Active run already exists." };
    throw new Error(error.message);
  }

  return { queued: true, runId: String(data.id) };
}

export async function runIssueQueueOnce() {
  const tracker = await getIssueTracker();
  const candidates = tracker.issues.filter((issue) => ALLOWED_PROJECTS.has(issue.project) && ["New", "Triaged", "Unresolved"].includes(issue.status));
  const queued: Array<{ number: number; title: string; project: string; runId?: string }> = [];
  const skipped: Array<{ number: number; reason: string }> = [];

  for (const issue of candidates) {
    try {
      await applyIssueAction(issue, "claim");
      const refreshed = (await getIssueTracker()).issues.find((item) => item.id === issue.id);
      if (!refreshed) {
        skipped.push({ number: issue.number, reason: "Issue disappeared during refresh." });
        continue;
      }
      const result = await enqueueIssueRun(refreshed, "issue-runner");
      if (result.queued) queued.push({ number: refreshed.number, title: refreshed.title, project: refreshed.project, runId: result.runId });
      else skipped.push({ number: refreshed.number, reason: result.reason ?? "Not queued." });
    } catch (error) {
      const supabase = createSupabaseAdmin();
      await supabase.from("admin_issues").update({
        status: "Blocked",
        current_state: `Automation failed to queue worker: ${error instanceof Error ? error.message : "unknown error"}`,
        next_step: "Investigate automation failure, then restart issue execution.",
        updated_at: nowIso(),
      }).eq("id", issue.id);
      skipped.push({ number: issue.number, reason: error instanceof Error ? error.message : "unknown error" });
    }
  }

  return { queued, skipped, totalCandidates: candidates.length };
}
