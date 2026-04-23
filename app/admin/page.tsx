import Link from "next/link";

export const revalidate = 0;
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  DollarSign,
  LayoutDashboard,
  Layers3,
  Megaphone,
  Sparkles,
  Wrench,
  Building2,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  ListTodo,
} from "lucide-react";
import type { IssueTrackerResponse } from "@/lib/issues-tracker";
import { getOpsRuns, type MetricAvailability, type OpsMetricCard } from "@/lib/ops-admin";
import {
  buildHealthAttentionItems,
  buildStudioKpis,
  getAppIssueMetrics,
  getCurrentApps,
  getFutureApps,
  type StudioApp,
} from "@/lib/studio-admin";
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

function getAvailabilityMeta(availability: MetricAvailability) {
  if (availability === "live") return { label: "Live", tone: "bg-emerald-100 text-emerald-800" };
  if (availability === "inferred") return { label: "Inferred", tone: "bg-amber-100 text-amber-800" };
  return { label: "Not wired", tone: "bg-neutral-100 text-neutral-700" };
}

function getSourceMeta(source: "durable" | "runtime" | "unavailable") {
  if (source === "durable") return { label: "History-backed", tone: "bg-sky-100 text-sky-800" };
  if (source === "runtime") return { label: "Runtime snapshot", tone: "bg-violet-100 text-violet-800" };
  return { label: "Unavailable", tone: "bg-neutral-100 text-neutral-700" };
}

function formatDuration(ms: number | null) {
  if (!ms) return "0m";
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function iconForMetric(key: OpsMetricCard["key"]) {
  switch (key) {
    case "runsToday":
      return <Activity className="h-5 w-5" />;
    case "activeRuns":
      return <PlayCircle className="h-5 w-5" />;
    case "successRate":
      return <CheckCircle2 className="h-5 w-5" />;
    case "failedRuns":
      return <AlertCircle className="h-5 w-5" />;
    case "stuckRuns":
      return <PauseCircle className="h-5 w-5" />;
    case "humanApprovalsPending":
      return <ShieldAlert className="h-5 w-5" />;
    case "avgCompletionTime":
      return <Clock3 className="h-5 w-5" />;
    case "costToday":
      return <DollarSign className="h-5 w-5" />;
  }
}

function OpsKpiCard({ metric }: { metric: OpsMetricCard }) {
  const freshness = getFreshnessMeta(metric.updatedAt);
  const availability = getAvailabilityMeta(metric.availability);
  const source = getSourceMeta(metric.source);
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{metric.label}</p>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", availability.tone)}>{availability.label}</span>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", source.tone)}>{source.label}</span>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", freshness.tone)}>{freshness.label}</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{metric.formattedValue}</p>
          <p className="mt-1 text-sm text-neutral-500">{metric.note}</p>
          <p className="mt-3 text-xs text-neutral-400">{metric.updatedAt ? `Updated ${formatMountainNow(metric.updatedAt)}` : metric.definition}</p>
        </div>
        <div className="rounded-2xl bg-black/[0.04] p-3 text-neutral-700">{iconForMetric(metric.key)}</div>
      </div>
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
    getOpsRuns().catch(() => null),
    import("@/lib/issues-tracker").then((m) => m.getIssueTracker().catch(() => null)).catch(() => null),
  ]);

  const currentApps = getCurrentApps();
  const futureApps = getFutureApps();
  const studioKpis = await buildStudioKpis(ops, issues);
  const healthAttention = buildHealthAttentionItems(ops, issues);
  const ideasSummary = await getIdeasAgentSummary();
  const qaSmoke = readLatestSmokeResult();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="rounded-[32px] border border-black/5 bg-white px-6 py-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">RaT Studios Admin</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">
              <LayoutDashboard className="h-4 w-4 text-orange-500" />
              Dashboard
            </Link>
            <Link href="/admin/current-apps" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">
              <Layers3 className="h-4 w-4 text-orange-500" />
              Current Apps
            </Link>
            <Link href="/admin/ideas" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Ideas
            </Link>
            <Link href="/admin/future-apps" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">
              <Megaphone className="h-4 w-4 text-orange-500" />
              Future Apps
            </Link>
            <Link href="/admin/issues" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">
              <Wrench className="h-4 w-4 text-orange-500" />
              Issues
            </Link>
            <Link href="/admin/org-chart" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">
              <Building2 className="h-4 w-4 text-orange-500" />
              Org Chart
            </Link>
            <Link href="/admin/agent-kpis" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">
              <Activity className="h-4 w-4 text-orange-500" />
              Agent KPIs
            </Link>
          </div>
        </div>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">OpenClaw admin feed</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Agent operations dashboard</h2>
              <p className="mt-2 max-w-3xl text-sm text-neutral-600">Real, read-only KPI cards sourced from local OpenClaw task state. If a metric is not honestly sourceable here, it stays out.</p>
            </div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-600">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Freshness</p>
              <p className="mt-2 font-medium text-neutral-900">Generated {formatMountainNow(ops?.generatedAt ?? null)}</p>
              <p className="mt-1">From local server-side OpenClaw state.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {(ops?.metricCards ?? []).filter((metric) => ["runsToday", "activeRuns", "failedRuns", "costToday"].includes(metric.key)).map((metric) => (
              <OpsKpiCard key={metric.key} metric={metric} />
            ))}
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Model auth health</p>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-700">Not wired</span>
                  </div>
                  <p className="mt-2 text-3xl font-semibold text-neutral-950">Unavailable</p>
                  <p className="mt-1 text-sm text-amber-900">No server-side auth-health summary is exposed in this app yet.</p>
                  <p className="mt-3 text-xs text-amber-800">That omission is intentional until the source is real.</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-3 text-amber-800"><ShieldAlert className="h-5 w-5" /></div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
              <h3 className="text-lg font-semibold text-neutral-950">What these cards are actually using</h3>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <div className="rounded-2xl bg-white p-4"><p className="font-semibold text-neutral-900">Task runs</p><p className="mt-1">Read from server-side OpenClaw session and run state, not mocked browser numbers.</p></div>
                <div className="rounded-2xl bg-white p-4"><p className="font-semibold text-neutral-900">Cost</p><p className="mt-1">Only shown when run-level cost estimates are actually present. Otherwise it stays unavailable.</p></div>
                <div className="rounded-2xl bg-white p-4"><p className="font-semibold text-neutral-900">Freshness</p><p className="mt-1">Stamped from the server-side snapshot generation time, not client refresh time.</p></div>
                <div className="rounded-2xl bg-white p-4"><p className="font-semibold text-neutral-900">What is still thin</p><p className="mt-1">Model auth health is intentionally withheld here until this app exposes a trustworthy source.</p></div>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
              <h3 className="text-lg font-semibold text-neutral-950">Operational notes</h3>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                {(ops?.sourceSummary.notes ?? []).slice(0, 4).map((note) => (
                  <div key={note} className="rounded-2xl bg-white p-4">{note}</div>
                ))}
                <div className="rounded-2xl bg-white p-4">Queue depth: {ops?.kpis.queueDepth ?? 0}</div>
                <div className="rounded-2xl bg-white p-4">Retries today: {ops?.kpis.retriesToday ?? 0}</div>
                <div className="rounded-2xl bg-white p-4">Median completion time: {formatDuration(ops?.kpis.medianDurationMs ?? null)}</div>
              </div>
            </div>
          </div>
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
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Issue tracker</p><p className="mt-2 text-sm text-neutral-800">Tracker-backed product issues</p><p className="mt-2 text-xs text-neutral-500">Updated {formatMountainNow(issues?.lastUpdatedRaw ?? null)}</p></div>
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
