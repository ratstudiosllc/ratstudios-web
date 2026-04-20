import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  DollarSign,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { getOpsRuns, type MetricAvailability, type OpsMetricCard } from "@/lib/ops-admin";

export const revalidate = 0;

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getFreshnessMeta(dateString?: string | null) {
  if (!dateString) return { label: "Not live", tone: "bg-neutral-100 text-neutral-700" };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { label: "Unknown freshness", tone: "bg-neutral-100 text-neutral-700" };
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes <= 15) return { label: "Live", tone: "bg-emerald-100 text-emerald-800" };
  if (diffMinutes <= 60) return { label: `${diffMinutes}m old`, tone: "bg-amber-100 text-amber-800" };
  return { label: `${Math.floor(diffMinutes / 60)}h old`, tone: "bg-red-100 text-red-800" };
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

function KpiCard({ metric }: { metric: OpsMetricCard }) {
  const freshness = getFreshnessMeta(metric.updatedAt);
  const availability = getAvailabilityMeta(metric.availability);
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{metric.label}</p>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", availability.tone)}>{availability.label}</span>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", getSourceMeta(metric.source).tone)}>{getSourceMeta(metric.source).label}</span>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", freshness.tone)}>{freshness.label}</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{metric.formattedValue}</p>
          <p className="mt-1 text-sm text-neutral-500">{metric.note}</p>
          <p className="mt-3 text-xs text-neutral-400">{metric.updatedAt ? `Updated ${formatMountain(metric.updatedAt)}` : metric.definition}</p>
        </div>
        <div className="rounded-2xl bg-black/[0.04] p-3 text-neutral-700">{iconForMetric(metric.key)}</div>
      </div>
    </div>
  );
}

export default async function AgentKpisPage() {
  const data = await getOpsRuns();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <AdminPageHeader title="Agent performance and operating pressure" active="agent-kpis" />

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Metric honesty</p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-950">This page now separates durable history from runtime fallback</h2>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">
            KPI cards prefer persisted run history first, then fall back to the current OpenClaw runtime snapshot only when durable history is absent. Each card shows both data quality and source.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-800">History-backed = persisted in admin_issue_runs</span>
            <span className="rounded-full bg-violet-100 px-3 py-1.5 text-violet-800">Runtime snapshot = current visible OpenClaw state</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800">Live = directly observed in chosen source</span>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">Inferred = heuristic inside that source</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-700">Not wired = intentionally withheld</span>
          </div>
        </section>

        <section className="mt-6 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Current sourcing</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", getSourceMeta(data.sourceSummary.metrics).tone)}>
              KPI source: {getSourceMeta(data.sourceSummary.metrics).label}
            </span>
            <span className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", getSourceMeta(data.sourceSummary.runsFeed).tone)}>
              Run feed: {getSourceMeta(data.sourceSummary.runsFeed).label}
            </span>
          </div>
          <div className="mt-4 space-y-2 text-sm text-neutral-600">
            {data.sourceSummary.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.metricCards.map((metric) => (
            <KpiCard key={metric.key} metric={metric} />
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Live operations</p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Recent agent runs</h2>
                <p className="mt-2 text-sm text-neutral-500">This feed follows the same sourcing choice as the KPI cards, with runtime heartbeat context still shown separately.</p>
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
                    {run.estimated_cost_usd == null ? (
                      <span className="rounded-full bg-neutral-200 px-2.5 py-1 font-semibold text-neutral-600">cost unavailable</span>
                    ) : null}
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Definitions</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">What each KPI actually means</h2>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                {data.metricCards.map((metric) => (
                  <div key={metric.key} className="rounded-2xl bg-[#fcfaf7] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-neutral-900">{metric.label}</p>
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", getAvailabilityMeta(metric.availability).tone)}>
                        {getAvailabilityMeta(metric.availability).label}
                      </span>
                    </div>
                    <p className="mt-2">{metric.definition}</p>
                    <p className="mt-2 text-neutral-500">{metric.note}</p>
                  </div>
                ))}
              </div>
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
                  <span>Median completion time</span>
                  <span className="font-semibold text-neutral-950">{formatDuration(data.kpis.medianDurationMs)}</span>
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
