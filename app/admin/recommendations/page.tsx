import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RecommendationActionPanel } from "@/components/admin/RecommendationActionPanel";
import { getDailyRecommendationsSchedule } from "@/lib/daily-recommendations";
import {
  getRecommendationFilterOptions,
  getRecommendationsSummary,
  listRecommendations,
  type AdminRecommendation,
} from "@/lib/recommendations";

export const revalidate = 0;

type RecommendationSearchParams = {
  app?: string | string[];
  category?: string | string[];
  priority?: string | string[];
  status?: string | string[];
  impact?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function label(value: string) {
  return value.replaceAll("-", " ");
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);
}

function optionalDate(value: unknown) {
  return typeof value === "string" && value.length ? formatDate(value) : "Not recorded yet";
}

function mountainDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function getScheduleStatus() {
  try {
    return { schedule: await getDailyRecommendationsSchedule(), error: null as string | null };
  } catch (error) {
    return {
      schedule: null,
      error: error instanceof Error ? error.message : "Schedule status is unavailable",
    };
  }
}

function statusClasses(status: AdminRecommendation["status"]) {
  const styles: Record<AdminRecommendation["status"], string> = {
    recommended: "bg-amber-100 text-amber-800",
    approved: "bg-sky-100 text-sky-800",
    rejected: "bg-red-100 text-red-800",
    deferred: "bg-neutral-200 text-neutral-700",
    implemented: "bg-emerald-100 text-emerald-800",
  };
  return styles[status];
}

function priorityClasses(priority: AdminRecommendation["priority"]) {
  const styles: Record<AdminRecommendation["priority"], string> = {
    P1: "border-red-200 bg-red-50 text-red-800",
    P2: "border-amber-200 bg-amber-50 text-amber-800",
    P3: "border-neutral-200 bg-neutral-50 text-neutral-700",
    P4: "border-neutral-200 bg-white text-neutral-600",
  };
  return styles[priority];
}

function SummaryCard({ label, value, helper, href }: { label: string; value: number; helper: string; href: string }) {
  return (
    <Link href={href} className="group rounded-[28px] border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-300">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{helper}</p>
      <p className="mt-3 text-xs font-semibold text-orange-500 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">View list →</p>
    </Link>
  );
}

function ScheduleStatusCard({ schedule, error }: { schedule: Record<string, unknown> | null; error: string | null }) {
  const status = typeof schedule?.last_status === "string" ? schedule.last_status : "pending";
  const enabled = schedule?.enabled === true;

  return (
    <section className="mt-8 rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">Daily recommendation schedule</p>
          <h2 className="mt-2 text-xl font-semibold text-neutral-950">5:00am Mountain update</h2>
          <p className="mt-1 text-sm text-neutral-500">Shows whether the daily queue refresh is healthy before operators review new cards.</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", error ? "bg-red-100 text-red-800" : enabled ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-700")}>
          {error ? "Unavailable" : enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Last status</p>
          <p className="mt-2 text-sm font-semibold text-neutral-900">{label(status)}</p>
        </div>
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Last run</p>
          <p className="mt-2 text-sm font-semibold text-neutral-900">{optionalDate(schedule?.last_run_at)}</p>
        </div>
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next run</p>
          <p className="mt-2 text-sm font-semibold text-neutral-900">{optionalDate(schedule?.next_run_at)}</p>
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-red-700">Schedule check failed: {error}</p> : null}
    </section>
  );
}

function MorningApprovalCue({ schedule, p1RecommendedCount }: { schedule: Record<string, unknown> | null; p1RecommendedCount: number }) {
  const lastStatus = typeof schedule?.last_status === "string" ? schedule.last_status : null;
  const lastRunAt = typeof schedule?.last_run_at === "string" ? schedule.last_run_at : null;
  const ranToday = Boolean(lastRunAt && mountainDateKey(lastRunAt) === mountainDateKey(new Date()));
  const readyForReview = lastStatus === "completed" && ranToday;

  return (
    <section className={cn("mt-4 rounded-[28px] border p-5 shadow-sm", readyForReview ? "border-orange-200 bg-orange-50" : "border-black/5 bg-white")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">8:00am operator review</p>
          <h2 className="mt-2 text-xl font-semibold text-neutral-950">Morning P1 approval checklist</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {readyForReview
              ? `Daily recommendations ran today. Review ${p1RecommendedCount} recommended P1 ${p1RecommendedCount === 1 ? "item" : "items"} before agents start execution work.`
              : "Waiting for today’s 5:00am recommendation job before prompting the operator review."}
          </p>
        </div>
        <Link href="/admin/recommendations?priority=P1&status=recommended" className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          Review P1 queue
        </Link>
      </div>
      <ol className="mt-4 grid gap-2 text-sm text-neutral-700 md:grid-cols-3">
        <li className="rounded-2xl bg-white/70 p-3">1. Open recommended P1 cards.</li>
        <li className="rounded-2xl bg-white/70 p-3">2. Approve, defer, or reject each urgent item.</li>
        <li className="rounded-2xl bg-white/70 p-3">3. Confirm approved work appears in Issues.</li>
      </ol>
      {lastRunAt ? <p className="mt-3 text-xs text-neutral-500">Last daily job: {formatDate(lastRunAt)}</p> : null}
    </section>
  );
}

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams?: Promise<RecommendationSearchParams> | RecommendationSearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const appValue = firstParam(resolvedSearchParams.app);
  const categoryValue = firstParam(resolvedSearchParams.category);
  const priorityValue = firstParam(resolvedSearchParams.priority);
  const statusValue = firstParam(resolvedSearchParams.status);
  const impactValue = firstParam(resolvedSearchParams.impact);

  const [{ schedule, error: scheduleError }, allRecommendations] = await Promise.all([
    getScheduleStatus(),
    listRecommendations(),
  ]);
  const summary = getRecommendationsSummary(allRecommendations);
  const options = getRecommendationFilterOptions(allRecommendations);
  const p1RecommendedCount = allRecommendations.filter((item) => item.priority === "P1" && item.status === "recommended").length;
  const recommendations = allRecommendations
    .filter((item) => (appValue ? item.appProduct === appValue : true))
    .filter((item) => (categoryValue ? item.category === categoryValue : true))
    .filter((item) => (priorityValue ? item.priority === priorityValue : true))
    .filter((item) => (statusValue ? item.status === statusValue : true))
    .filter((item) => (impactValue ? item.impact === impactValue : true));

  const hasFilters = Boolean(appValue || categoryValue || priorityValue || statusValue || impactValue);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <AdminPageHeader title="Recommendations" active="recommendations" />

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Approval queue</p>
          <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Recommendations / Approval Queue</h1>
        </section>

        <ScheduleStatusCard schedule={schedule} error={scheduleError} />
        <MorningApprovalCue schedule={schedule} p1RecommendedCount={p1RecommendedCount} />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="Total" value={summary.total} helper="All captured recommendations" href="/admin/recommendations" />
          <SummaryCard label="Recommended" value={summary.recommended} helper="Awaiting operator decision" href="/admin/recommendations?status=recommended" />
          <SummaryCard label="Approved" value={summary.approved} helper="Queued as tracked issues" href="/admin/recommendations?status=approved" />
          <SummaryCard label="Implemented" value={summary.implemented} helper="Done and retained for audit" href="/admin/recommendations?status=implemented" />
          <SummaryCard label="High impact" value={summary.highImpact} helper="High expected business or ops value" href="/admin/recommendations?impact=high" />
        </div>

        <form action="/admin/recommendations" method="GET" className="mt-8 rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-neutral-700">Filter queue</span>
            <select name="app" defaultValue={appValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All apps/products</option>
              {options.appProducts.map((app) => <option key={app} value={app}>{app}</option>)}
            </select>
            <select name="category" defaultValue={categoryValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All categories</option>
              {options.categories.map((category) => <option key={category} value={category}>{label(category)}</option>)}
            </select>
            <select name="priority" defaultValue={priorityValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All priorities</option>
              {options.priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
            <select name="status" defaultValue={statusValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All statuses</option>
              {options.statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
            </select>
            <select name="impact" defaultValue={impactValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All impact levels</option>
              {options.impacts.map((impact) => <option key={impact} value={impact}>{label(impact)}</option>)}
            </select>
            <button className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">Apply</button>
            {hasFilters ? <Link href="/admin/recommendations" className="text-sm text-neutral-500 underline underline-offset-2">Clear</Link> : null}
          </div>
        </form>

        <div className="mt-8 grid gap-5">
          {recommendations.length === 0 ? (
            <div className="rounded-[28px] border border-black/5 bg-white p-6 text-sm text-neutral-600 shadow-sm">No recommendations match these filters.</div>
          ) : null}
          {recommendations.map((item) => (
            <article key={item.id} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">{item.appProduct} • {label(item.category)}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{item.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusClasses(item.status))}>{label(item.status)}</span>
                    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", priorityClasses(item.priority))}>{item.priority}</span>
                    <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 text-xs font-semibold text-neutral-700">{item.severity} severity</span>
                    <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 text-xs font-semibold text-neutral-700">{item.effort} effort</span>
                    <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 text-xs font-semibold text-neutral-700">{item.impact} impact</span>
                  </div>
                </div>
                <div className="text-right text-xs text-neutral-500">
                  <p>Created {formatDate(item.createdAt)}</p>
                  <p className="mt-1">Updated {formatDate(item.updatedAt)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Rationale</p>
                  <p className="mt-2 text-sm text-neutral-800">{item.rationale}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Risk if ignored</p>
                  <p className="mt-2 text-sm text-neutral-800">{item.riskIfIgnored}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Approval notes</p>
                  <p className="mt-2 text-sm text-neutral-800">{item.approvalNotes || "No approval notes recorded yet."}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Implementation notes</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-neutral-800">{item.implementationNotes || "No implementation notes recorded yet."}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Decision audit</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-neutral-800">{item.decisionNotes || "No decision notes recorded yet."}</p>
                  {item.decisionAt ? <p className="mt-2 text-xs text-neutral-500">Decision at {formatDate(item.decisionAt)}{item.decisionBy ? ` by ${item.decisionBy}` : ""}</p> : null}
                  {item.convertedIssueId ? <p className="mt-1 text-xs font-medium text-neutral-700">Converted action item: {item.convertedIssueId}</p> : null}
                </div>
              </div>

              <RecommendationActionPanel recommendation={item} />

              {item.evidenceLinks.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.evidenceLinks.map((link) => (
                    <Link key={`${item.id}-${link.href}`} href={link.href} className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-[#fcfaf7]">
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
