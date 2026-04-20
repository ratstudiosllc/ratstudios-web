import Link from "next/link";

export const revalidate = 0;
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  Layers3,
  Megaphone,
  Sparkles,
  Users,
  Wrench,
  Workflow,
  PlayCircle,
  PauseCircle,
  ListTodo,
  Building2,
} from "lucide-react";
import type { IssueTrackerResponse } from "@/lib/issues-tracker";
import type { OpsRunsResponse } from "@/lib/ops-admin";
import {
  buildHealthAttentionItems,
  buildStudioKpis,
  getAppIssueMetrics,
  getCurrentApps,
  getFutureApps,
  type StudioApp,
} from "@/lib/studio-admin";
import { buildAgentWorkflowSnapshot } from "@/lib/agent-workflow";
import { getIdeasAgentSummary } from "@/lib/ideas-agent";
import { readLatestSmokeResult } from "@/lib/qa-smoke";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getFreshnessMeta(dateString?: string | null) {
  if (!dateString) return { label: "Unknown freshness", tone: "bg-neutral-100 text-neutral-700", stale: true };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { label: "Unknown freshness", tone: "bg-neutral-100 text-neutral-700", stale: true };
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes <= 15) return { label: "Live", tone: "bg-emerald-100 text-emerald-800", stale: false };
  if (diffMinutes <= 60) return { label: `${diffMinutes}m old`, tone: "bg-amber-100 text-amber-800", stale: false };
  const hours = Math.floor(diffMinutes / 60);
  return { label: `${hours}h old`, tone: "bg-red-100 text-red-800", stale: true };
}

function KpiCard({
  label,
  value,
  helper,
  icon,
  href,
  updatedAt,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  href?: string;
  updatedAt?: string | null;
}) {
  const freshness = getFreshnessMeta(updatedAt);
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", freshness.tone)}>{freshness.label}</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
          <p className="mt-1 text-sm text-neutral-500">{helper}</p>
          <p className="mt-3 text-xs text-neutral-400">Updated {formatMountainNow(updatedAt ?? null)}</p>
        </div>
        <div className="rounded-2xl bg-black/[0.04] p-3 text-neutral-700">{icon}</div>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-3xl border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]">
        {content}
      </Link>
    );
  }

  return <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">{content}</div>;
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-neutral-500">{body}</p>
    </div>
  );
}

function IssuePriorityPill({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    P1: "bg-red-100 text-red-800 border-red-200",
    P2: "bg-amber-100 text-amber-800 border-amber-200",
    P3: "bg-neutral-100 text-neutral-700 border-black/10",
  };

  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", styles[priority] ?? styles.P3)}>
      {priority}
    </span>
  );
}

function IssueStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Resolved: "bg-emerald-100 text-emerald-800",
    Blocked: "bg-red-100 text-red-800",
    "Ready for QA": "bg-sky-100 text-sky-800",
    "Needs Verification": "bg-fuchsia-100 text-fuchsia-800",
    "In Progress": "bg-violet-100 text-violet-800",
    Triaged: "bg-amber-100 text-amber-800",
    New: "bg-neutral-100 text-neutral-700",
  };

  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", styles[status] ?? "bg-neutral-100 text-neutral-700")}>{status}</span>;
}

function CurrentAppCard({ app, issues }: { app: StudioApp; issues: IssueTrackerResponse | null }) {
  const metrics = getAppIssueMetrics(app, issues);
  const latestUpdate = metrics.latestIssue?.updatedAt ?? metrics.latestIssue?.identified ?? null;

  return (
    <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">{app.type}</p>
          <h3 className="mt-2 text-xl font-semibold text-neutral-950">{app.name}</h3>
          <p className="mt-2 text-sm text-neutral-600">{app.stage} • {app.status}</p>
        </div>
        <Link href={app.href} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
          Open app
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-4 text-sm text-neutral-600">{app.summary}</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Current focus</p>
          <p className="mt-2 text-sm text-neutral-800">{app.currentFocus}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next milestone</p>
          <p className="mt-2 text-sm text-neutral-800">{app.nextMilestone}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Open issues</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950">{metrics.open}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">P1 open</p>
          <p className="mt-2 text-2xl font-semibold text-red-700">{metrics.p1Open}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Blocked</p>
          <p className="mt-2 text-2xl font-semibold text-red-700">{metrics.blocked}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ready for QA</p>
          <p className="mt-2 text-2xl font-semibold text-sky-700">{metrics.readyForQa}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-neutral-600">
        {metrics.latestIssue ? (
          <>
            <p className="font-medium text-neutral-900">Latest tracked issue: #{metrics.latestIssue.number} {metrics.latestIssue.title}</p>
            <p className="mt-1">Updated: {formatMountainNow(latestUpdate)}</p>
          </>
        ) : (
          <p>No tracked issues yet for this app.</p>
        )}
      </div>
    </div>
  );
}

function FutureAppCard({ app }: { app: StudioApp }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{app.pipeline?.category ?? app.type}</p>
          <h3 className="mt-2 text-xl font-semibold text-neutral-950">{app.name}</h3>
          <p className="mt-2 text-sm text-neutral-600">{app.stage} • {app.status}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm">{app.owner}</span>
      </div>

      <p className="mt-4 text-sm text-neutral-600">{app.summary}</p>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next milestone</p>
          <p className="mt-2 text-sm text-neutral-800">{app.nextMilestone}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Current blocker</p>
          <p className="mt-2 text-sm text-neutral-800">{app.pipeline?.blocker ?? "No blocker recorded"}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link href={app.href} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
          Open concept page
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function AgentItemCard({
  item,
}: {
  item: {
    issueNumber: number;
    title: string;
    project: string;
    priority: string;
    status: string;
    nextStep: string;
  };
}) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <IssuePriorityPill priority={item.priority} />
        <IssueStatusPill status={item.status} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{item.project}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-neutral-900">#{item.issueNumber} {item.title}</p>
      <p className="mt-1 text-sm text-neutral-500">Next: {item.nextStep}</p>
    </div>
  );
}

function formatMountainNow(dateString?: string | null) {
  if (!dateString) return "unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

export default async function AdminPage() {
  const [ops, issues] = await Promise.all([
    import("@/lib/ops-admin").then((m) => m.getOpsRuns().catch(() => null)).catch(() => null),
    import("@/lib/issues-tracker").then((m) => m.getIssueTracker().catch(() => null)).catch(() => null),
  ]);

  const currentApps = getCurrentApps();
  const futureApps = getFutureApps();
  const studioKpis = buildStudioKpis(ops, issues);
  const healthAttention = buildHealthAttentionItems(ops, issues);
  const agentWorkflow = buildAgentWorkflowSnapshot(issues, ops);
  const ideasSummary = getIdeasAgentSummary();
  const qaSmoke = readLatestSmokeResult();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="flex flex-col gap-4 rounded-[32px] border border-black/5 bg-white px-6 py-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Studio dashboard
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-neutral-950">RaT Studios admin</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Studio overview first, then clean app lanes underneath. Current apps, future pipeline, issue visibility, and operating placeholders all live in one coherent structure.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/marketing" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
              Marketing
            </Link>
            <Link href="/" className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              Back to site
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard label={studioKpis[0].label} value={studioKpis[0].value} helper={studioKpis[0].helper} icon={<Layers3 className="h-5 w-5" />} href="/admin/current-apps" updatedAt={ops?.generatedAt ?? null} />
          <KpiCard label={studioKpis[1].label} value={studioKpis[1].value} helper={studioKpis[1].helper} icon={<Sparkles className="h-5 w-5" />} href="/admin/ideas" updatedAt={ideasSummary.latestUpdatedAt ?? null} />
          <KpiCard label={studioKpis[2].label} value={studioKpis[2].value} helper={studioKpis[2].helper} icon={<Megaphone className="h-5 w-5" />} href="/admin/future-apps" updatedAt={ops?.generatedAt ?? null} />
          <KpiCard label={studioKpis[3].label} value={studioKpis[3].value} helper={studioKpis[3].helper} icon={<Wrench className="h-5 w-5" />} href="/admin/issues" updatedAt={issues?.lastUpdated ?? null} />
          <KpiCard label={studioKpis[4].label} value={studioKpis[4].value} helper={studioKpis[4].helper} icon={<AlertCircle className="h-5 w-5" />} href="/admin/issues?priority=P1" updatedAt={issues?.lastUpdated ?? null} />
          <KpiCard label="Org chart" value="Studio" helper="Leadership, Bub, and agent roles" icon={<Building2 className="h-5 w-5" />} href="/admin/org-chart" updatedAt={issues?.lastUpdated ?? null} />
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Data freshness</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">What is live, cached, or stale</h2>
              <p className="mt-2 text-sm text-neutral-500">This dashboard currently mixes file-backed and generated sources. If a block is stale, it should say so plainly.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ideas store</p><p className="mt-2 text-sm text-neutral-800">File-backed ideas data</p><p className="mt-2 text-xs text-neutral-500">Updated {formatMountainNow(ideasSummary.latestUpdatedAt ?? null)}</p></div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Issue tracker</p><p className="mt-2 text-sm text-neutral-800">Tracker-backed product issues</p><p className="mt-2 text-xs text-neutral-500">Updated {formatMountainNow(issues?.lastUpdated ?? null)}</p></div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ops runs</p><p className="mt-2 text-sm text-neutral-800">Generated ops snapshot</p><p className="mt-2 text-xs text-neutral-500">Updated {formatMountainNow(ops?.generatedAt ?? null)}</p></div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Smoke checks</p><p className="mt-2 text-sm text-neutral-800">Route verification results</p><p className="mt-2 text-xs text-neutral-500">Updated {formatMountainNow(qaSmoke?.generatedAt ?? null)}</p></div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Release verification</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Critical route smoke checks</h2>
              <p className="mt-2 text-sm text-neutral-500">This stays because it is operationally useful. The filler overview and quick-link blocks are gone.</p>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", qaSmoke?.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800")}>
              {qaSmoke ? (qaSmoke.ok ? "Smoke checks passing" : "Smoke checks failing") : "No smoke run yet"}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(qaSmoke?.routes ?? []).map((route) => (
              <div key={route.path} className="rounded-2xl bg-[#fcfaf7] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-900">{route.label}</p>
                  <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", route.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800")}>
                    {route.ok ? "pass" : "fail"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">{route.path}</p>
                <p className="mt-2 text-xs text-neutral-500">status {route.status || "error"} • {route.durationMs}ms</p>
                {route.missingTexts.length ? <p className="mt-2 text-xs text-red-600">Missing: {route.missingTexts.join(", ")}</p> : null}
                {route.error ? <p className="mt-2 text-xs text-red-600">{route.error}</p> : null}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-neutral-500">Last smoke run: {formatMountainNow(qaSmoke?.generatedAt ?? null)}</p>
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Agent operations"
            title="What the agents are doing, finished, and still owe"
            body="This is the visible operating layer. You should be able to see current work, blocked work, recent completions, and what each agent still needs to complete."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard label="Agent-owned work" value={String(agentWorkflow.kpis.activeAgentOwned)} helper="Open items still in the workflow" icon={<Workflow className="h-5 w-5" />} updatedAt={agentWorkflow.updatedAt} />
            <KpiCard label="Queued / triage" value={String(agentWorkflow.kpis.queued)} helper="Waiting on orchestrator or bugs" icon={<ListTodo className="h-5 w-5" />} updatedAt={agentWorkflow.updatedAt} />
            <KpiCard label="Ready for QA" value={String(agentWorkflow.kpis.qaReady)} helper="Execution work waiting for QA handoff" icon={<PlayCircle className="h-5 w-5" />} updatedAt={agentWorkflow.updatedAt} />
            <KpiCard label="Needs verification" value={String(agentWorkflow.kpis.needsVerification)} helper="Waiting on Richard or Topher signoff" icon={<CheckCircle2 className="h-5 w-5" />} href="/admin/issues?status=Needs%20Verification" updatedAt={agentWorkflow.updatedAt} />
            <KpiCard label="Blocked" value={String(agentWorkflow.kpis.blocked)} helper="Needs intervention before progress" icon={<PauseCircle className="h-5 w-5" />} updatedAt={agentWorkflow.updatedAt} />
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
            {agentWorkflow.lanes.map((lane) => (
              <div key={lane.role} className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
                <h3 className="text-lg font-semibold text-neutral-950">{lane.label}</h3>
                <p className="mt-1 text-sm text-neutral-500">Visible handoffs, owned work, and completion state.</p>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Doing now</p>
                    <div className="mt-3 space-y-3">
                      {lane.role === "bugs"
                        ? <div className="rounded-2xl bg-white p-4 text-sm text-neutral-600">{lane.doingNow.length ? `${lane.doingNow.length} active issue item${lane.doingNow.length === 1 ? "" : "s"} in bugs workflow.` : "Nothing active right now."}</div>
                        : lane.doingNow.length ? lane.doingNow.map((item) => <AgentItemCard key={`${lane.role}-doing-${item.issueId}`} item={item} />) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-sm text-neutral-500">Nothing active right now.</div>}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Needs to complete</p>
                    <div className="mt-3 space-y-3">
                      {lane.role === "bugs"
                        ? <div className="rounded-2xl bg-white p-4 text-sm text-neutral-600">{lane.needsToComplete.length ? `${lane.needsToComplete.length} queued bug triage item${lane.needsToComplete.length === 1 ? "" : "s"}. Use the Issues page for the full list.` : "No queued obligations."}</div>
                        : lane.needsToComplete.length ? lane.needsToComplete.map((item) => <AgentItemCard key={`${lane.role}-todo-${item.issueId}`} item={item} />) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-sm text-neutral-500">No queued obligations.</div>}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Blocked</p>
                    <div className="mt-3 space-y-3">
                      {lane.role === "bugs"
                        ? <div className="rounded-2xl bg-white p-4 text-sm text-neutral-600">{lane.blocked.length ? `${lane.blocked.length} blocked bug item${lane.blocked.length === 1 ? "" : "s"}. Full issue detail lives on the Issues page.` : "No blocked items."}</div>
                        : lane.blocked.length ? lane.blocked.map((item) => <AgentItemCard key={`${lane.role}-blocked-${item.issueId}`} item={item} />) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-sm text-neutral-500">No blocked items.</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
              <h3 className="text-lg font-semibold text-neutral-950">Recently completed</h3>
              <div className="mt-4 space-y-3">
                {agentWorkflow.completedRecently.length ? agentWorkflow.completedRecently.map((item) => (
                  <AgentItemCard key={`done-${item.issueId}`} item={item} />
                )) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-sm text-neutral-500">No recent completions visible yet.</div>}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
              <h3 className="text-lg font-semibold text-neutral-950">Waiting on QA</h3>
              <div className="mt-4 space-y-3">
                {agentWorkflow.qaReady.length ? agentWorkflow.qaReady.map((item) => (
                  <AgentItemCard key={`qa-${item.issueId}`} item={item} />
                )) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-sm text-neutral-500">Nothing is waiting on QA right now.</div>}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
              <h3 className="text-lg font-semibold text-neutral-950">Needs verification</h3>
              <div className="mt-4 space-y-3">
                {agentWorkflow.needsVerification.length ? agentWorkflow.needsVerification.map((item) => (
                  <AgentItemCard key={`verify-${item.issueId}`} item={item} />
                )) : <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-sm text-neutral-500">Nothing is waiting on Richard or Topher verification right now.</div>}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Ideas operations"
            title="What the opportunity research agent is doing"
            body="Research-stage ideas belong here first. Good ones get promoted into the future apps pipeline. Weak ones get archived instead of polluting the portfolio."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Active ideas" value={String(ideasSummary.active)} helper="Ideas currently under research or review" icon={<Sparkles className="h-5 w-5" />} href="/admin/ideas" updatedAt={ideasSummary.latestUpdatedAt ?? null} />
            <KpiCard label="Screening" value={String(ideasSummary.screening)} helper="Early opportunity triage" icon={<ListTodo className="h-5 w-5" />} href="/admin/ideas" updatedAt={ideasSummary.latestUpdatedAt ?? null} />
            <KpiCard label="Promoted" value={String(ideasSummary.promoted)} helper="Moved into future apps pipeline" icon={<Megaphone className="h-5 w-5" />} href="/admin/future-apps" updatedAt={ideasSummary.latestUpdatedAt ?? null} />
            <KpiCard label="Archived" value={String(ideasSummary.archived)} helper="Weak ideas parked instead of cluttering the pipeline" icon={<PauseCircle className="h-5 w-5" />} href="/admin/ideas" updatedAt={ideasSummary.latestUpdatedAt ?? null} />
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
              <h3 className="text-lg font-semibold text-neutral-950">Ideas / Opportunity Research agent</h3>
              <p className="mt-1 text-sm text-neutral-500">Visible idea-state flow from research to promotion or archive.</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Deep research</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{ideasSummary.deepResearch}</p></div>
                <div className="rounded-2xl bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Scored</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{ideasSummary.scored}</p></div>
                <div className="rounded-2xl bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Approved for validation</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{ideasSummary.approvedForValidation}</p></div>
                <div className="rounded-2xl bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Validation in progress</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{ideasSummary.validationInProgress}</p></div>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
              <h3 className="text-lg font-semibold text-neutral-950">Best current ideas</h3>
              <div className="mt-4 space-y-3">
                {ideasSummary.topIdeas.map((idea) => (
                  <div key={idea.id} className="rounded-2xl bg-white p-4">
                    <p className="text-sm font-medium text-neutral-900">{idea.ideaName}</p>
                    <p className="mt-1 text-sm text-neutral-600">{idea.bestWedge}</p>
                    <p className="mt-2 text-xs text-neutral-500">{idea.workflowState.replaceAll("_", " ")} • score {idea.scorecard.weightedTotal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Current apps"
            title="Products in market or active development"
            body="These are the app lanes the studio is actively operating today. Each one should have its own dashboard rather than sharing a single mixed view."
          />

          <div className="mt-6 flex flex-wrap gap-3">
            {currentApps.map((app) => (
              <Link
                key={app.slug}
                href={app.href}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
              >
                {app.name}
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {currentApps.map((app) => (
              <CurrentAppCard key={app.slug} app={app} issues={issues} />
            ))}
          </div>
          {issues && issues.counts.total === 0 ? (
            <p className="mt-4 text-sm text-red-600">App issue tiles are empty because the real issue tracker returned zero records.</p>
          ) : null}
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <SectionHeader
            eyebrow="Future apps pipeline"
            title="Ideas and bets already in the operating model"
            body="Future apps are included now so the studio dashboard reflects the whole portfolio, not only what is already shipping."
          />

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {futureApps.map((app) => (
              <FutureAppCard key={app.slug} app={app} />
            ))}
          </div>
        </section>


      </div>
    </div>
  );
}
