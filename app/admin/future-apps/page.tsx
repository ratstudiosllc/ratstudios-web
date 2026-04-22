import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getFutureAppsSummary, listFutureApps } from "@/lib/future-apps-agent";

export const revalidate = 300;

function stageClasses(stage: string) {
  if (stage === "ready_for_decision") return "bg-emerald-100 text-emerald-800";
  if (stage === "evaluation_in_progress") return "bg-violet-100 text-violet-800";
  if (stage === "needs_founder_input") return "bg-amber-100 text-amber-800";
  if (stage === "approved_for_planning") return "bg-sky-100 text-sky-800";
  if (stage === "hold" || stage === "rejected") return "bg-neutral-200 text-neutral-700";
  return "bg-neutral-100 text-neutral-700";
}

function stageLabel(stage: string) {
  return stage.replaceAll("_", " ");
}

export default async function FutureAppsPage() {
  const apps = await listFutureApps();
  const summary = await getFutureAppsSummary();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <AdminPageHeader title="Future App Pipeline" active="future-apps" />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Total future apps</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.total}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Evaluating</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.evaluating}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ready for decision</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.readyForDecision}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Needs founder input</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.needsFounderInput}</p></div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {apps.map((app) => (
            <Link
              key={app.slug}
              href={`/admin/future-apps/${app.slug}`}
              className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{app.bucket}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{app.name}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stageClasses(app.stage)}`}>{stageLabel(app.stage)}</span>
                    <span>{app.status}</span>
                    <span>• {app.owner}</span>
                  </div>
                </div>
                <span className="rounded-full border border-black/10 bg-[#fcfaf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-600">
                  Open details
                </span>
              </div>

              <p className="mt-4 text-sm text-neutral-600">{app.summary}</p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Current blocker</p>
                  <p className="mt-2 text-sm text-neutral-800">{app.currentBlocker}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next milestone</p>
                  <p className="mt-2 text-sm text-neutral-800">{app.nextMilestone}</p>
                </div>
              </div>

              {app.nextSteps[0] ? (
                <div className="mt-4 rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next step</p>
                  <p className="mt-2 text-sm text-neutral-800">{app.nextSteps[0]}</p>
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
