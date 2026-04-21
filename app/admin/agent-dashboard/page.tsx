import { execFile } from "node:child_process";
import { promisify } from "node:util";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertCircle,
  Clock3,
  DollarSign,
  PlayCircle,
  ShieldAlert,
} from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const revalidate = 0;

const execFileAsync = promisify(execFile);

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type OpenClawSession = {
  key?: string;
  updatedAt?: number;
  ageMs?: number;
  abortedLastRun?: boolean;
  totalTokens?: number | null;
};

type OpenClawSessionsResponse = {
  sessions?: OpenClawSession[];
};

type OpenClawStatusResponse = {
  tasks?: {
    active?: number;
    queued?: number;
    running?: number;
  };
};

type MetricCard = {
  key: "runsToday" | "activeRuns" | "failedRuns" | "estimatedCost" | "modelAuthHealth";
  label: string;
  value: string;
  note: string;
  availabilityTone: string;
  availabilityLabel: string;
  sourceTone: string;
  sourceLabel: string;
  updatedAt: string | null;
};

async function runOpenClawJson(args: string[]) {
  const { stdout } = await execFileAsync("openclaw", [...args, "--json"], {
    cwd: process.cwd(),
    timeout: 15000,
    maxBuffer: 1024 * 1024 * 8,
  });
  return JSON.parse(stdout);
}

function classifySession(session: OpenClawSession) {
  if (session.abortedLastRun) return "failed";
  const ageMs = session.ageMs ?? (typeof session.updatedAt === "number" ? Date.now() - session.updatedAt : null);
  if (ageMs != null && ageMs < 10 * 60 * 1000) return "running";
  return "completed";
}

function isSameLocalDay(date: Date, other: Date) {
  return date.getFullYear() === other.getFullYear()
    && date.getMonth() === other.getMonth()
    && date.getDate() === other.getDate();
}

function formatMountain(dateString?: string | null) {
  if (!dateString) return "unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "unknown";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
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

function iconForMetric(key: MetricCard["key"]) {
  switch (key) {
    case "runsToday":
      return <Activity className="h-5 w-5" />;
    case "activeRuns":
      return <PlayCircle className="h-5 w-5" />;
    case "failedRuns":
      return <AlertCircle className="h-5 w-5" />;
    case "estimatedCost":
      return <DollarSign className="h-5 w-5" />;
    case "modelAuthHealth":
      return <ShieldAlert className="h-5 w-5" />;
  }
}

function MetricCardView({ metric }: { metric: MetricCard }) {
  const freshness = getFreshnessMeta(metric.updatedAt);
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{metric.label}</p>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", metric.availabilityTone)}>{metric.availabilityLabel}</span>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", metric.sourceTone)}>{metric.sourceLabel}</span>
            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", freshness.tone)}>{freshness.label}</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{metric.value}</p>
          <p className="mt-1 text-sm text-neutral-500">{metric.note}</p>
          <p className="mt-3 text-xs text-neutral-400">Updated {formatMountain(metric.updatedAt)}</p>
        </div>
        <div className="rounded-2xl bg-black/[0.04] p-3 text-neutral-700">{iconForMetric(metric.key)}</div>
      </div>
    </div>
  );
}

async function getAdminSnapshot(): Promise<{ generatedAt: string; metricCards: MetricCard[]; notes: string[] }> {
  const generatedAt = new Date().toISOString();
  try {
    const [sessionsJson, statusJson] = await Promise.all([
      runOpenClawJson(["sessions", "--all-agents"]),
      runOpenClawJson(["status"]),
    ]);

    const sessions = ((sessionsJson as OpenClawSessionsResponse).sessions ?? []).filter((session) => !(session.key ?? "").includes(":run:"));
    const status = statusJson as OpenClawStatusResponse;
    const today = new Date();
    const sessionsToday = sessions.filter((session) => typeof session.updatedAt === "number" && isSameLocalDay(new Date(session.updatedAt), today));
    const activeRuns = status.tasks?.active ?? status.tasks?.running ?? sessions.filter((session) => classifySession(session) === "running").length;
    const failedRuns = sessionsToday.filter((session) => classifySession(session) === "failed").length;
    const costSessions = sessionsToday.filter((session) => typeof session.totalTokens === "number" && session.totalTokens > 0);
    const estimatedCost = costSessions.length
      ? `$${(costSessions.reduce((sum, session) => sum + ((session.totalTokens ?? 0) / 1000000) * 5, 0)).toFixed(2)}`
      : "Unavailable";

    return {
      generatedAt,
      metricCards: [
        { key: "runsToday", label: "Runs today", value: String(sessionsToday.length), note: `${Math.max(0, sessionsToday.length - failedRuns)} completed, ${failedRuns} failed today.`, availabilityTone: "bg-emerald-100 text-emerald-800", availabilityLabel: "Live", sourceTone: "bg-violet-100 text-violet-800", sourceLabel: "Runtime snapshot", updatedAt: generatedAt },
        { key: "activeRuns", label: "Active runs", value: String(activeRuns), note: `${status.tasks?.queued ?? 0} queued right now.`, availabilityTone: "bg-emerald-100 text-emerald-800", availabilityLabel: "Live", sourceTone: "bg-violet-100 text-violet-800", sourceLabel: "Runtime snapshot", updatedAt: generatedAt },
        { key: "failedRuns", label: "Failed runs", value: String(failedRuns), note: failedRuns ? `${failedRuns} task${failedRuns === 1 ? "" : "s"} failed today.` : "No failed tasks detected today.", availabilityTone: "bg-emerald-100 text-emerald-800", availabilityLabel: "Live", sourceTone: "bg-violet-100 text-violet-800", sourceLabel: "Runtime snapshot", updatedAt: generatedAt },
        { key: "estimatedCost", label: "Estimated cost", value: estimatedCost, note: estimatedCost === "Unavailable" ? "Only shown when visible sessions include token totals." : "Derived from visible session token totals when present.", availabilityTone: estimatedCost === "Unavailable" ? "bg-neutral-100 text-neutral-700" : "bg-amber-100 text-amber-800", availabilityLabel: estimatedCost === "Unavailable" ? "Not wired" : "Inferred", sourceTone: "bg-violet-100 text-violet-800", sourceLabel: "Runtime snapshot", updatedAt: generatedAt },
        { key: "modelAuthHealth", label: "Model auth health", value: "Unavailable", note: "No trustworthy auth-health summary is exposed to this app yet.", availabilityTone: "bg-neutral-100 text-neutral-700", availabilityLabel: "Not wired", sourceTone: "bg-neutral-100 text-neutral-700", sourceLabel: "Unavailable", updatedAt: generatedAt },
      ],
      notes: [
        `${activeRuns} active runs and ${status.tasks?.queued ?? 0} queued in the current OpenClaw snapshot.`,
        failedRuns ? `${failedRuns} runs show a failure signal today.` : "No failed runs are currently visible today.",
        estimatedCost === "Unavailable" ? "Visible sessions did not expose enough token data for an honest cost estimate." : "Cost is estimated from visible session token totals, so treat it as directional rather than billing-grade.",
      ],
    };
  } catch (error) {
    return {
      generatedAt,
      metricCards: [
        { key: "runsToday", label: "Runs today", value: "Unavailable", note: "OpenClaw runtime could not be read from this deployment target.", availabilityTone: "bg-neutral-100 text-neutral-700", availabilityLabel: "Not wired", sourceTone: "bg-neutral-100 text-neutral-700", sourceLabel: "Unavailable", updatedAt: generatedAt },
        { key: "activeRuns", label: "Active runs", value: "Unavailable", note: "This environment cannot currently read local OpenClaw state.", availabilityTone: "bg-neutral-100 text-neutral-700", availabilityLabel: "Not wired", sourceTone: "bg-neutral-100 text-neutral-700", sourceLabel: "Unavailable", updatedAt: generatedAt },
        { key: "failedRuns", label: "Failed runs", value: "Unavailable", note: "No runtime snapshot was available.", availabilityTone: "bg-neutral-100 text-neutral-700", availabilityLabel: "Not wired", sourceTone: "bg-neutral-100 text-neutral-700", sourceLabel: "Unavailable", updatedAt: generatedAt },
        { key: "estimatedCost", label: "Estimated cost", value: "Unavailable", note: "Cost stays hidden when runtime metrics are unavailable.", availabilityTone: "bg-neutral-100 text-neutral-700", availabilityLabel: "Not wired", sourceTone: "bg-neutral-100 text-neutral-700", sourceLabel: "Unavailable", updatedAt: generatedAt },
        { key: "modelAuthHealth", label: "Model auth health", value: "Unavailable", note: "No trustworthy auth-health summary is exposed to this app yet.", availabilityTone: "bg-neutral-100 text-neutral-700", availabilityLabel: "Not wired", sourceTone: "bg-neutral-100 text-neutral-700", sourceLabel: "Unavailable", updatedAt: generatedAt },
      ],
      notes: [
        error instanceof Error ? error.message : "OpenClaw runtime read failed.",
        "This page is server-side only and will not fake values when the source is unavailable.",
      ],
    };
  }
}

export default async function AgentDashboardPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/auth/login?redirect=%2Fadmin%2Fagent-dashboard");
  }

  const data = await getAdminSnapshot();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">OpenClaw admin feed</p>
              <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Agent operations dashboard</h1>
              <p className="mt-3 max-w-3xl text-sm text-neutral-600">Real, read-only KPI cards sourced from server-side OpenClaw state. If a metric is not honestly sourceable here, it stays out or says unavailable plainly.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin" className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-[#fcfaf7]">Back to admin</Link>
              <Link href="/auth/logout" className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-[#fcfaf7]">Log out</Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {data.metricCards.map((metric) => <MetricCardView key={metric.key} metric={metric} />)}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-orange-500" />
              <h2 className="text-2xl font-semibold text-neutral-950">What these cards are actually using</h2>
            </div>
            <div className="mt-5 space-y-3 text-sm text-neutral-600">
              <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="font-semibold text-neutral-900">Task sessions</p><p className="mt-1">Read server-side from OpenClaw session and status commands, not mocked browser data.</p></div>
              <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="font-semibold text-neutral-900">Estimated cost</p><p className="mt-1">Only shown when visible sessions expose token totals. Otherwise it stays unavailable on purpose.</p></div>
              <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="font-semibold text-neutral-900">Model auth health</p><p className="mt-1">Still omitted as a real metric until this app has a trustworthy server-side source.</p></div>
            </div>
          </div>

          <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-orange-500" />
              <h2 className="text-2xl font-semibold text-neutral-950">Operational notes</h2>
            </div>
            <div className="mt-5 space-y-3 text-sm text-neutral-600">
              {data.notes.map((note) => <div key={note} className="rounded-2xl bg-[#fcfaf7] p-4">{note}</div>)}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
