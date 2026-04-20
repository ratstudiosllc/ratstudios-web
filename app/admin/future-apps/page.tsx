import Link from "next/link";

export const revalidate = 300;
import { getFutureAppsSummary, listFutureApps } from "@/lib/future-apps-agent";

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

export default function FutureAppsPage() {
  const apps = listFutureApps();
  const summary = getFutureAppsSummary();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">Future App Pipeline</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/ideas" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Ideas</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Total future apps</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.total}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Evaluating</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.evaluating}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ready for decision</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.readyForDecision}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Needs founder input</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.needsFounderInput}</p></div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {apps.map((app) => (
            <div key={app.slug} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]">
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
              </div>

              <p className="mt-4 text-sm text-neutral-600">{app.summary}</p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Problem statement</p><p className="mt-2 text-sm text-neutral-800">{app.problemStatement}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Current blocker</p><p className="mt-2 text-sm text-neutral-800">{app.currentBlocker}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4 md:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next milestone</p><p className="mt-2 text-sm text-neutral-800">{app.nextMilestone}</p></div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <form action={`/api/admin/future-apps/${app.id}`} method="POST">
                  <button
                    formAction={`/api/admin/future-apps/${app.id}`}
                    formMethod="post"
                    className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    Run evaluation
                  </button>
                </form>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next steps</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    {app.nextSteps.map((step) => <li key={step}>• {step}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Operator decision block</p>
                  <div className="mt-3 space-y-2 text-sm text-neutral-700">
                    <p>Next action: {app.evaluation.nextAction.replaceAll("_", " ")}</p>
                    <p>Recommendation: {app.evaluation.recommendation ?? "Not scored yet"}</p>
                    <p>Confidence: {app.evaluation.confidence ?? "Unknown"}</p>
                    <p>Best wedge: {app.evaluation.bestWedge ?? "Not defined yet"}</p>
                    <p>Best initial customer: {app.evaluation.bestInitialCustomer ?? "Not defined yet"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Reasons to pursue</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    {app.evaluation.topReasonsToPursue.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Reasons for caution</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    {app.evaluation.topReasonsForCaution.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Verified findings</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    {app.evaluation.verifiedFindings.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Assumptions and unknowns</p>
                  <div className="mt-3 space-y-3 text-sm text-neutral-700">
                    <div>
                      <p className="font-medium text-neutral-900">Assumptions</p>
                      <ul className="mt-2 space-y-2">{app.evaluation.assumptions.map((item) => <li key={item}>• {item}</li>)}</ul>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Unknowns</p>
                      <ul className="mt-2 space-y-2">{app.evaluation.unknowns.map((item) => <li key={item}>• {item}</li>)}</ul>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Kill criteria</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    {app.evaluation.killCriteria.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#fcfaf7] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Progress notes</p>
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  {app.progressNotes.map((note) => <li key={note}>• {note}</li>)}
                </ul>
              </div>

              {app.evaluation.reportSections.length ? (
                <div className="mt-5 rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Evaluation brief</p>
                  <div className="mt-4 space-y-4">
                    {app.evaluation.reportSections.map((section) => (
                      <div key={section.title}>
                        <h3 className="text-sm font-semibold text-neutral-950">{section.title}</h3>
                        <p className="mt-1 text-sm text-neutral-700">{section.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
