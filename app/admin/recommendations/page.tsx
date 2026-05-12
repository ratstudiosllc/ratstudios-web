import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RecommendationActionPanel } from "@/components/admin/RecommendationActionPanel";
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

function formatDigestDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function digestKey(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function groupRecommendationsByDigest(recommendations: AdminRecommendation[]) {
  const groups = new Map<string, AdminRecommendation[]>();
  for (const item of recommendations) {
    const key = digestKey(item.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    label: formatDigestDate(items[0]?.createdAt ?? key),
    items,
    linkedActionItems: items.filter((item) => Boolean(item.convertedIssueId)).length,
    p1Recommended: items.filter((item) => item.priority === "P1" && item.status === "recommended").length,
  }));
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

  const allRecommendations = await listRecommendations();
  const summary = getRecommendationsSummary(allRecommendations);
  const options = getRecommendationFilterOptions(allRecommendations);
  const recommendations = allRecommendations
    .filter((item) => (appValue ? item.appProduct === appValue : true))
    .filter((item) => (categoryValue ? item.category === categoryValue : true))
    .filter((item) => (priorityValue ? item.priority === priorityValue : true))
    .filter((item) => (statusValue ? item.status === statusValue : true))
    .filter((item) => (impactValue ? item.impact === impactValue : true));

  const hasFilters = Boolean(appValue || categoryValue || priorityValue || statusValue || impactValue);
  const p1RecommendedCount = allRecommendations.filter((item) => item.priority === "P1" && item.status === "recommended").length;
  const digestGroups = groupRecommendationsByDigest(recommendations);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <AdminPageHeader title="Recommendations" active="recommendations" />

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Approval queue</p>
          <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Recommendations / Approval Queue</h1>
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Morning approval habit</p>
            <p className="mt-1">After the 5:00am Mountain daily run, check P1 recommendations before the day’s agent work starts.</p>
            <Link href="/admin/recommendations?priority=P1&status=recommended" className="mt-3 inline-flex rounded-xl bg-white px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-100">
              Review {p1RecommendedCount} P1 recommended item{p1RecommendedCount === 1 ? "" : "s"} →
            </Link>
          </div>
        </section>

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
          {digestGroups.map((group) => (
            <section key={group.key} className="grid gap-4 rounded-[32px] border border-black/5 bg-white/60 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">RaT Improvement Brief</p>
                  <h2 className="mt-1 text-xl font-semibold text-neutral-950">{group.label}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-700">
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">{group.items.length} recommendation{group.items.length === 1 ? "" : "s"}</span>
                  <Link href="/admin/issues" className="rounded-full bg-white px-3 py-1 shadow-sm hover:bg-[#fcfaf7]">{group.linkedActionItems} linked action item{group.linkedActionItems === 1 ? "" : "s"}</Link>
                  {group.p1Recommended ? <Link href="/admin/recommendations?priority=P1&status=recommended" className="rounded-full bg-red-50 px-3 py-1 text-red-800 shadow-sm hover:bg-red-100">{group.p1Recommended} P1 needs approval</Link> : null}
                </div>
              </div>
              {group.items.map((item) => (
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
                  {item.convertedIssueId ? <p className="mt-1 text-xs font-medium text-neutral-700">Converted action item: <Link href="/admin/issues" className="underline underline-offset-2 hover:text-neutral-950">{item.convertedIssueId}</Link></p> : null}
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
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
