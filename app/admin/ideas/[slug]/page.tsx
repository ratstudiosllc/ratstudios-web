import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveIdeaAction, promoteIdeaAction } from "./actions";

function safeText(value: unknown, fallback = "Not set") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function getIdeaBySlugFromFile(slug: string) {
  const storePath = path.join(process.cwd(), "data", "ideas-store.json");
  try {
    const raw = fs.readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw) as { ideas?: Array<Record<string, unknown>> };
    const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
    return ideas.find((idea) => String(idea.slug ?? "") === slug) ?? null;
  } catch {
    return null;
  }
}

export default async function IdeaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = getIdeaBySlugFromFile(slug);
  if (!idea) notFound();

  const memoSections = Array.isArray(idea.memoSections) ? idea.memoSections : [];
  const nextSteps = Array.isArray(idea.nextValidationSteps) ? idea.nextValidationSteps : [];
  const evidenceSources = Array.isArray(idea.evidenceSources) ? idea.evidenceSources : [];
  const researchInputs = Array.isArray(idea.researchInputs) ? idea.researchInputs : [];
  const scorecard = typeof idea.scorecard === "object" && idea.scorecard ? idea.scorecard as Record<string, unknown> : {};

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">In-depth opportunity report</p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950">{safeText(idea.ideaName, "Untitled idea")}</h1>
              <p className="mt-3 max-w-4xl text-sm text-neutral-600">{safeText(idea.oneSentenceConcept)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <form action={promoteIdeaAction}>
                <input type="hidden" name="id" value={safeText(idea.id, "")} />
                <input type="hidden" name="slug" value={safeText(idea.slug, "")} />
                <button className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
                  Move to Future Apps
                </button>
              </form>
              <form action={archiveIdeaAction}>
                <input type="hidden" name="id" value={safeText(idea.id, "")} />
                <input type="hidden" name="slug" value={safeText(idea.slug, "")} />
                <button className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
                  Archive idea
                </button>
              </form>
              <Link href="/admin/ideas" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
                Back to ideas
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Disposition</p><p className="mt-2 text-sm text-neutral-800">{safeText(typeof idea.disposition === "string" ? idea.disposition.replaceAll("_", " ") : idea.disposition)}</p></div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Workflow status</p><p className="mt-2 text-sm text-neutral-800">{safeText(typeof idea.workflowState === "string" ? idea.workflowState.replaceAll("_", " ") : idea.workflowState)}</p></div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Recommendation</p><p className="mt-2 text-sm text-neutral-800">{safeText(typeof idea.recommendation === "string" ? idea.recommendation.replaceAll("_", " ") : idea.recommendation)}</p></div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Confidence</p><p className="mt-2 text-sm text-neutral-800">{safeText(idea.confidence)}</p></div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-950">Executive report</h2>
              <p className="mt-4 text-base leading-7 text-neutral-700">{safeText(idea.memoSummary)}</p>
            </div>

            <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-950">Report sections</h2>
              <div className="mt-6 space-y-5">
                {memoSections.map((section, index) => (
                  <div key={`${safeText(section.title, `section-${index}`)}-${index}`} className="rounded-2xl bg-[#fcfaf7] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">{safeText(section.title, `Section ${index + 1}`)}</p>
                    <p className="mt-3 text-sm leading-7 text-neutral-700">{safeText(section.body)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-950">Evidence sources</h2>
              <div className="mt-6 space-y-4">
                {evidenceSources.length ? evidenceSources.map((source, index) => (
                  <div key={`${safeText(source.id, 'source')}-${index}`} className="rounded-2xl bg-[#fcfaf7] p-5">
                    <p className="text-sm font-semibold text-neutral-900">{safeText(source.title, `Source ${index + 1}`)}</p>
                    <p className="mt-2 text-sm text-neutral-600">{safeText(source.publisher, "Unknown source")}</p>
                    <p className="mt-3 text-sm leading-7 text-neutral-700">{safeText(source.summary)}</p>
                    {typeof source.notes === "string" && source.notes ? <p className="mt-3 text-xs text-neutral-500">{source.notes}</p> : null}
                  </div>
                )) : <div className="rounded-2xl bg-[#fcfaf7] p-5 text-sm text-neutral-600">No evidence sources recorded yet.</div>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-950">Decision frame</h2>
              <div className="mt-5 space-y-4 text-sm text-neutral-700">
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Best wedge</p><p className="mt-2">{safeText(idea.bestWedge)}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Strongest reason to build</p><p className="mt-2">{safeText(idea.strongestReasonToBuild)}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Strongest reason not to build</p><p className="mt-2">{safeText(idea.strongestReasonNotToBuild)}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Biggest risk</p><p className="mt-2">{safeText(idea.biggestRisk)}</p></div>
              </div>
            </div>

            <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-950">Scorecard</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {Object.entries(scorecard).map(([key, value]) => (
                  <div key={key} className="rounded-2xl bg-[#fcfaf7] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="mt-2 text-xl font-semibold text-neutral-950">{safeText(value, '0')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-950">Next validation steps</h2>
              <ul className="mt-5 space-y-3 text-sm text-neutral-700">
                {nextSteps.length ? nextSteps.map((step, index) => <li key={`${String(step)}-${index}`}>• {String(step)}</li>) : <li>No next steps recorded.</li>}
              </ul>
            </div>

            <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-neutral-950">Research inputs</h2>
              <div className="mt-5 space-y-4">
                {researchInputs.length ? researchInputs.map((input, index) => (
                  <div key={`${safeText(input.id, 'input')}-${index}`} className="rounded-2xl bg-[#fcfaf7] p-4">
                    <p className="text-sm font-semibold text-neutral-900">{safeText(input.title, `Input ${index + 1}`)}</p>
                    <p className="mt-2 text-sm leading-7 text-neutral-700">{safeText(input.content)}</p>
                  </div>
                )) : <div className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-600">No research inputs recorded yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
