import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCurrentApps,
  getStudioApp,
  getAppIssueMetrics,
  getAppIssues,
  type StudioApp,
  type LaunchChecklistItem,
} from "@/lib/studio-admin";
import { formatMountainTimestamp } from "@/lib/issues-tracker";
import { getIssueTracker } from "@/lib/issues-tracker";

function SectionCard({
  title,
  summary,
  highlights,
}: {
  title: string;
  summary: string;
  highlights: string[];
}) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-950">{title}</h3>
      <p className="mt-3 text-sm text-neutral-600">{summary}</p>
      <div className="mt-4 space-y-2 text-sm text-neutral-600">
        {highlights.map((item) => (
          <p key={item}>• {item}</p>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#fcfaf7] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{helper}</p>
    </div>
  );
}


const checklistStatusCopy: Record<LaunchChecklistItem["status"], { label: string; className: string }> = {
  done: { label: "Done", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  in_progress: { label: "In progress", className: "border-sky-200 bg-sky-50 text-sky-800" },
  blocked: { label: "Blocked", className: "border-red-200 bg-red-50 text-red-800" },
  not_started: { label: "Not started", className: "border-neutral-200 bg-neutral-50 text-neutral-600" },
};

const checklistPriorityClass: Record<LaunchChecklistItem["priority"], string> = {
  Required: "border-neutral-950 bg-neutral-950 text-white",
  Recommended: "border-orange-200 bg-orange-100 text-orange-800",
  Later: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

function LaunchChecklist({ product }: { product: StudioApp }) {
  if (!product.launchChecklist?.length) return null;

  const items = product.launchChecklist.flatMap((section) => section.items);
  const requiredOpen = items.filter((item) => item.priority === "Required" && item.status !== "done").length;
  const blocked = items.filter((item) => item.status === "blocked").length;
  const done = items.filter((item) => item.status === "done").length;

  return (
    <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Launch readiness</p>
          <h2 className="mt-2 text-xl font-semibold text-neutral-950">Launch checklist</h2>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">Items that must be closed before MowPro moves from controlled beta to public launch.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-72">
          <div className="rounded-2xl border border-black/5 bg-[#fcfaf7] p-3">
            <p className="font-semibold text-neutral-950">{items.length}</p>
            <p className="mt-1 text-neutral-500">Total</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
            <p className="font-semibold text-red-800">{requiredOpen}</p>
            <p className="mt-1 text-red-700">Required open</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
            <p className="font-semibold text-orange-800">{blocked}</p>
            <p className="mt-1 text-orange-700">Blocked</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {product.launchChecklist.map((section) => (
          <div key={section.title} className="rounded-[24px] border border-black/5 bg-[#fcfaf7] p-5">
            <h3 className="text-base font-semibold text-neutral-950">{section.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{section.summary}</p>
            <div className="mt-4 space-y-3">
              {section.items.map((item) => {
                const status = checklistStatusCopy[item.status];
                return (
                  <div key={item.id} className="rounded-2xl border border-black/5 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full border px-2.5 py-1 font-semibold ${status.className}`}>{status.label}</span>
                      <span className={`rounded-full border px-2.5 py-1 font-semibold ${checklistPriorityClass[item.priority]}`}>{item.priority}</span>
                      <span className="rounded-full border border-black/5 bg-[#fcfaf7] px-2.5 py-1 font-semibold text-neutral-600">{item.owner}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-neutral-950">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">{item.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-neutral-500">Progress: {done} done, {requiredOpen} required still open. Recommendation: controlled beta only until required items are complete.</p>
    </section>
  );
}

function IssueCard({ issue }: { issue: { number: number; title: string; status: string; priority: string; nextStep?: string } }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#fcfaf7] p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-neutral-700 shadow-sm">{issue.priority}</span>
        <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-neutral-700 shadow-sm">{issue.status}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-neutral-900">#{issue.number} {issue.title}</p>
      {issue.nextStep ? <p className="mt-1 text-sm text-neutral-500">Next: {issue.nextStep}</p> : null}
    </div>
  );
}

function renderAppSwitcher(currentApp: StudioApp) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {getCurrentApps().map((app) => (
        <Link
          key={app.slug}
          href={app.href}
          className={
            app.slug === currentApp.slug
              ? "rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
              : "rounded-full border border-black/10 bg-[#fcfaf7] px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-white"
          }
        >
          {app.name}
        </Link>
      ))}
    </div>
  );
}

export default async function ProductAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getStudioApp(slug);

  if (!product) notFound();

  const tracker = await getIssueTracker().catch(() => null);
  const issueMetrics = getAppIssueMetrics(product, tracker);
  const recentIssues = getAppIssues(product, tracker).slice(-5).reverse();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">App dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950">{product.name}</h1>
              <p className="mt-2 text-sm text-neutral-500">{product.type} • {product.stage}</p>
              <p className="mt-4 max-w-3xl text-sm text-neutral-600">{product.summary}</p>
            </div>
            <Link href="/admin" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
              Back to studio dashboard
            </Link>
          </div>

          {renderAppSwitcher(product)}

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Kpi label="Total issues" value={String(issueMetrics.total)} helper="Tracked for this app" />
            <Kpi label="Open" value={String(issueMetrics.open)} helper="Still unresolved" />
            <Kpi label="Blocked" value={String(issueMetrics.blocked)} helper="Waiting on intervention" />
            <Kpi label="Ready for QA" value={String(issueMetrics.readyForQa)} helper="Awaiting verification" />
            <Kpi label="P1 open" value={String(issueMetrics.p1Open)} helper="Critical issues still open" />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-950">Overview</h2>
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              <p>• Status: {product.status}</p>
              <p>• Owner: {product.owner}</p>
              <p>• Current focus: {product.currentFocus}</p>
              <p>• Next milestone: {product.nextMilestone}</p>
              {issueMetrics.latestIssue ? (
                <>
                  <p>• Latest tracked issue: #{issueMetrics.latestIssue.number} {issueMetrics.latestIssue.title}</p>
                  <p>• Latest issue update: {formatMountainTimestamp(issueMetrics.latestIssue.updatedAt ?? issueMetrics.latestIssue.identified ?? null) ?? "unknown MST"}</p>
                </>
              ) : <p>• No tracked issues yet for this app.</p>}
            </div>
          </section>

          <aside className="rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-neutral-950">Issue-driven signals</h2>
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              <p>• Resolved issues: {issueMetrics.resolved}</p>
              <p>• In progress: {issueMetrics.inProgress}</p>
              <p>• Ready for QA: {issueMetrics.readyForQa}</p>
              <p>• Blocked: {issueMetrics.blocked}</p>
              <p>• Total tracked issues: {issueMetrics.total}</p>
            </div>
          </aside>
        </div>

        <LaunchChecklist product={product} />

        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <SectionCard title="Issues" summary={product.issues.summary} highlights={[
            `${issueMetrics.open} open issues are currently tracked`,
            `${issueMetrics.p1Open} critical issues are still unresolved`,
            issueMetrics.latestIssue ? `Latest tracked issue is #${issueMetrics.latestIssue.number}` : "No issue activity recorded yet",
          ]} />
          <SectionCard title="Marketing" summary={product.marketing.summary} highlights={product.marketing.highlights} />
          <SectionCard title="Users" summary={product.users.summary} highlights={product.users.highlights} />
          <SectionCard title="Revenue" summary={product.revenue.summary} highlights={product.revenue.highlights} />
          <SectionCard title="Roadmap" summary={product.roadmap.summary} highlights={product.roadmap.highlights} />
          <SectionCard title="Health notes" summary="Current qualitative read on the app." highlights={product.healthNotes} />
        </div>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-950">Recent tracked issues</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentIssues.length ? recentIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={{
                  number: issue.number,
                  title: issue.title,
                  status: issue.status,
                  priority: issue.priority,
                  nextStep: issue.nextStep,
                }}
              />
            )) : <div className="rounded-2xl border border-dashed border-black/10 bg-[#fcfaf7] px-4 py-8 text-sm text-neutral-500">No issues yet for this app.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
