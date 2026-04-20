import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  DollarSign,
  Layers3,
  Megaphone,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getOpsRuns } from "@/lib/ops-admin";

export const revalidate = 0;

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getFreshnessMeta(dateString?: string | null) {
  if (!dateString) return { label: "Unknown freshness", tone: "bg-neutral-100 text-neutral-700" };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { label: "Unknown freshness", tone: "bg-neutral-100 text-neutral-700" };
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes <= 15) return { label: "Live", tone: "bg-emerald-100 text-emerald-800" };
  if (diffMinutes <= 60) return { label: `${diffMinutes}m old`, tone: "bg-amber-100 text-amber-800" };
  return { label: `${Math.floor(diffMinutes / 60)}h old`, tone: "bg-red-100 text-red-800" };
}

function formatMountain(dateString?: string | null) {
  if (!dateString) return "timestamp unavailable";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "timestamp unavailable";
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

function formatDuration(ms: number) {
  if (!ms) return "0m";
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function KpiCard({
  label,
  value,
  helper,
  icon,
  updatedAt,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  updatedAt?: string | null;
}) {
  const freshness = getFreshnessMeta(updatedAt);
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", freshness.tone)}>{freshness.label}</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
          <p className="mt-1 text-sm text-neutral-500">{helper}</p>
          <p className="mt-3 text-xs text-neutral-400">Updated {formatMountain(updatedAt)}</p>
        </div>
        <div className="rounded-2xl bg-black/[0.04] p-3 text-neutral-700">{icon}</div>
      </div>
    </div>
  );
}

export default async function AgentKpisPage() {
  const data = await getOpsRuns();
  const generatedAt = data.generatedAt;
  const todayRuns = data.runs.filter((run) => new Date(run.created_at).toDateString() === new Date().toDateString());
  const stuckRuns = data.runs.filter((run) => run.status === "running" && run.duration_ms >= 30 * 60 * 1000);
  const failedRuns = data.runs.filter((run) => run.status === "failed");
  const approvalsPending = 0;

  const kpis = [
    {
      label: "Runs today",
      value: String(data.kpis.runsToday),
      helper: "Runs created today across tracked agent sessions",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      label: "Active runs",
      value: String(data.kpis.activeRuns),
      helper: "Runs currently in progress right now",
      icon: <PlayCircle className="h-5 w-5" />,
    },
    {
      label: "Success rate",
      value: `${data.kpis.successRate}%`,
      helper: "Completed runs divided by runs created today",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      label: "Failed runs",
      value: String(failedRuns.length),
      helper: "Tracked sessions currently marked failed",
      icon: <AlertCircle className="h-5 w-5" />,
    },
    {
      label: "Stuck runs",
      value: String(stuckRuns.length),
      helper: "Running longer than 30 minutes without clearing",
      icon: <PauseCircle className="h-5 w-5" />,
    },
    {
      label: "Human approvals pending",
      value: String(approvalsPending),
      helper: "Approval queue is not wired yet, so this is honest zero for now",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      label: "Avg completion time",
      value: formatDuration(data.kpis.avgDurationMs),
      helper: "Average duration of completed runs created today",
      icon: <Clock3 className="h-5 w-5" />,
    },
    {
      label: "Cost today",
      value: `$${data.kpis.totalCostToday.toFixed(2)}`,
      helper: "Estimated run cost from token usage today",
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">Agent KPI Dashboard</p>
            <h1 className="mt-3 text-4xl font-bold text-neutral-950">Agent performance and operating pressure</h1>
            <p className="mt-4 max-w-3xl text-lg text-neutral-600">This page keeps the first pass focused on real operational signal, not made-up scorecards. It shows what agents are doing today, what is failing, what is stuck, and what it costs.</p>
            <div className="mt-8 flex flex-wrap gap-3">
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
              <Link href="/admin/agent-kpis" className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-neutral-900 transition hover:border-orange-300 hover:bg-orange-100">
                <Activity className="h-4 w-4 text-orange-500" />
                Agent KPIs
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} helper={kpi.helper} icon={kpi.icon} updatedAt={generatedAt} />
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Live operations</p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Recent runs</h2>
                <p className="mt-2 text-sm text-neutral-500">The fastest way to tell whether the system is healthy is still the recent run list.</p>
              </div>
              <Link href="/admin/agent-runs" className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-[#fcfaf7] px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-white">
                Open full run feed
                <Wrench className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {data.runs.slice(0, 8).map((run) => (
                <div key={run.id} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-neutral-700">{run.project}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-neutral-700">{run.agent_name}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-neutral-700">{run.status}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-neutral-950">{run.task_title}</h3>
                  <div className="mt-2 grid gap-2 text-sm text-neutral-600 md:grid-cols-3">
                    <p>Owner: {run.owner}</p>
                    <p>Duration: {formatDuration(run.duration_ms)}</p>
                    <p>Updated: {formatMountain(run.updated_at)}</p>
                  </div>
                  {run.failure_message ? <p className="mt-2 text-sm text-red-700">Failure: {run.failure_message}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Operator notes</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Read this before trusting the page</h2>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                <li>Success rate, average duration, runs today, and cost today are all coming from the current OpenClaw session snapshot.</li>
                <li>Stuck runs are currently inferred as runs still marked running after 30 minutes.</li>
                <li>Human approvals pending is intentionally not faked. It stays zero until a real approval queue exists.</li>
                <li>Cost today is an estimate derived from token counts, not invoice-grade billing.</li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Quick stats</p>
              <div className="mt-4 space-y-3 text-sm text-neutral-700">
                <div className="flex items-center justify-between rounded-2xl bg-[#fcfaf7] px-4 py-3">
                  <span>Queue depth</span>
                  <span className="font-semibold text-neutral-950">{data.kpis.queueDepth}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#fcfaf7] px-4 py-3">
                  <span>Retries today</span>
                  <span className="font-semibold text-neutral-950">{data.kpis.retriesToday}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#fcfaf7] px-4 py-3">
                  <span>Total tokens today</span>
                  <span className="font-semibold text-neutral-950">{data.kpis.totalTokensToday.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#fcfaf7] px-4 py-3">
                  <span>Runs visible in feed</span>
                  <span className="font-semibold text-neutral-950">{data.runs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
