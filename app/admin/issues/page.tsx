import Link from "next/link";
import { revalidatePath } from "next/cache";

export const revalidate = 120;
import { getIssueTracker } from "@/lib/issues-tracker";
import { IssueActionButtons } from "@/components/admin/IssueActionButtons";
import { IssuePrioritySelect } from "@/components/admin/IssuePrioritySelect";

function priorityClasses(priority: string) {
  if (priority === "P1") return "bg-red-100 text-red-800 border-red-200";
  if (priority === "P2") return "bg-amber-100 text-amber-800 border-amber-200";
  if (priority === "P3") return "bg-sky-100 text-sky-800 border-sky-200";
  return "bg-neutral-100 text-neutral-700 border-neutral-200";
}

async function runAutomation() {
  "use server";

  const response = await fetch("http://localhost:3000/api/admin/issues/automation", {
    method: "POST",
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    throw new Error("Could not run issue automation");
  }

  revalidatePath("/admin/issues");
  revalidatePath("/admin");
}

export default async function AdminIssuesPage({
  searchParams,
}: {
  searchParams?: Promise<{ priority?: string | string[] | undefined; status?: string | string[] | undefined; project?: string | string[] | undefined }> | { priority?: string | string[] | undefined; status?: string | string[] | undefined; project?: string | string[] | undefined };
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const priorityValue = Array.isArray(resolvedSearchParams.priority) ? resolvedSearchParams.priority[0] : resolvedSearchParams.priority;
  const statusValue = Array.isArray(resolvedSearchParams.status) ? resolvedSearchParams.status[0] : resolvedSearchParams.status;
  const projectValue = Array.isArray(resolvedSearchParams.project) ? resolvedSearchParams.project[0] : resolvedSearchParams.project;
  let tracker = null;
  let trackerError: string | null = null;
  try {
    tracker = await getIssueTracker();
  } catch (error) {
    trackerError = error instanceof Error ? error.message : "Unknown issue tracker error";
  }
  const projectOptions = tracker ? Array.from(new Set(tracker.issues.map((issue) => issue.project))).sort((a, b) => a.localeCompare(b)) : [];
  const issues = tracker ? tracker.issues.filter((issue) => {
    if (priorityValue && issue.priority !== priorityValue) return false;
    if (statusValue && issue.status !== statusValue) return false;
    if (projectValue && issue.project !== projectValue) return false;
    return true;
  }) : [];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>Tracked Issues</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Production problems, ownership, and what is blocked right now.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/current-apps" className="btn-gradient px-6 py-3 text-sm">Current Apps</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-neutral-800">Automation</p>
                <p className="text-xs text-neutral-500">Claim queued issues, start agent work, and move finished fixes toward verification.</p>
              </div>
              <form action={runAutomation}>
                <button className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">Run automation now</button>
              </form>
            </div>
            <form action="/api/admin/issues" method="GET" className="">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-neutral-700">Filter issues</span>
              <select
                name="priority"
                defaultValue={priorityValue ?? ""}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700"
              >
                <option value="">All priorities</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
              <select
                name="status"
                defaultValue={statusValue ?? ""}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700"
              >
                <option value="">All statuses</option>
                <option value="New">New</option>
                <option value="Triaged">Triaged</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Ready for QA">Ready for QA</option>
                <option value="Needs Verification">Needs Verification</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
                name="project"
                defaultValue={projectValue ?? ""}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700"
              >
                <option value="">All apps</option>
                {projectOptions.map((project) => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
              <button formAction="/admin/issues" className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">Apply</button>
              {(priorityValue || statusValue || projectValue) ? <Link href="/admin/issues" className="text-sm text-neutral-500 underline underline-offset-2">Clear</Link> : null}
            </div>
            </form>
          </div>
          {!tracker ? (
            <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              <p>The issue tracker could not be loaded right now.</p>
              {trackerError ? <p className="mt-2 font-mono text-xs text-red-800">{trackerError}</p> : null}
            </div>
          ) : null}

          {tracker && issues.length === 0 ? (
            <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm text-sm text-neutral-600">
              No issues matched this filter.
            </div>
          ) : null}

          {issues.map((issue) => (
            <div key={issue.id} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 font-semibold text-neutral-700">{issue.project}</span>
                  <span className={`rounded-full border px-2.5 py-1 font-semibold ${priorityClasses(issue.priority)}`}>{issue.priority}</span>
                  <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 font-semibold text-neutral-700">{issue.status}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <IssuePrioritySelect issueId={issue.id} priority={issue.priority} />
                  <IssueActionButtons
                    issueId={issue.id}
                    status={issue.status}
                    ownerAgent={issue.ownerAgent}
                    committed={issue.committed}
                    pushed={issue.pushed}
                    deployed={issue.deployed}
                  />
                </div>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-neutral-950">#{issue.number} {issue.title}</h2>
              {issue.summary ? <p className="mt-2 text-sm text-neutral-600">{issue.summary}</p> : null}
              {issue.currentState ? <p className="mt-2 text-sm text-neutral-500">State: {issue.currentState}</p> : null}
              {issue.nextStep ? <p className="mt-2 text-sm text-neutral-500">Next: {issue.nextStep}</p> : null}
              <p className="mt-2 text-xs text-neutral-400">Committed {issue.committed} • Pushed {issue.pushed} • Deployed {issue.deployed}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
