import Link from "next/link";
import { redirect } from "next/navigation";
import { getIdeasAgentSummary, listIdeas } from "@/lib/ideas-agent";

export const revalidate = 0;

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function dispositionLabel(disposition: string) {
  return disposition.replaceAll("_", " ");
}

function dispositionClasses(disposition: string) {
  if (disposition === "active") return "bg-emerald-100 text-emerald-800";
  if (disposition === "promoted") return "bg-sky-100 text-sky-800";
  if (disposition === "archived") return "bg-neutral-200 text-neutral-700";
  return "bg-neutral-100 text-neutral-700";
}

export default async function IdeasPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string | string[] | undefined; industry?: string | string[] | undefined; disposition?: string | string[] | undefined; workflow?: string | string[] | undefined; recommendation?: string | string[] | undefined; confidence?: string | string[] | undefined; sort?: string | string[] | undefined }> | { view?: string | string[] | undefined; industry?: string | string[] | undefined; disposition?: string | string[] | undefined; workflow?: string | string[] | undefined; recommendation?: string | string[] | undefined; confidence?: string | string[] | undefined; sort?: string | string[] | undefined };
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const viewValue = Array.isArray(resolvedSearchParams.view) ? resolvedSearchParams.view[0] : resolvedSearchParams.view;
  const industryValue = Array.isArray(resolvedSearchParams.industry) ? resolvedSearchParams.industry[0] : resolvedSearchParams.industry;
  const dispositionValue = Array.isArray(resolvedSearchParams.disposition) ? resolvedSearchParams.disposition[0] : resolvedSearchParams.disposition;
  const workflowValue = Array.isArray(resolvedSearchParams.workflow) ? resolvedSearchParams.workflow[0] : resolvedSearchParams.workflow;
  const recommendationValue = Array.isArray(resolvedSearchParams.recommendation) ? resolvedSearchParams.recommendation[0] : resolvedSearchParams.recommendation;
  const confidenceValue = Array.isArray(resolvedSearchParams.confidence) ? resolvedSearchParams.confidence[0] : resolvedSearchParams.confidence;
  const sortValue = Array.isArray(resolvedSearchParams.sort) ? resolvedSearchParams.sort[0] : resolvedSearchParams.sort;
  const view = viewValue === "archived" ? "archived" : "active";
  const summary = getIdeasAgentSummary();
  const allIdeas = listIdeas();

  if (view === "active" && dispositionValue === "archived") {
    redirect("/admin/ideas?view=archived");
  }

  if (view === "archived" && dispositionValue && dispositionValue !== "archived") {
    redirect("/admin/ideas?view=archived");
  }
  const industryOptions = Array.from(new Set(allIdeas.map((idea) => idea.industry))).sort((a, b) => a.localeCompare(b));
  const dispositionOptions = Array.from(new Set(allIdeas.map((idea) => idea.disposition)));
  const workflowOptions = Array.from(new Set(allIdeas.map((idea) => idea.workflowState))).sort((a, b) => a.localeCompare(b));
  const recommendationOptions = Array.from(new Set(allIdeas.map((idea) => idea.recommendation))).sort((a, b) => a.localeCompare(b));
  const confidenceOptions = Array.from(new Set(allIdeas.map((idea) => idea.confidence))).sort((a, b) => a.localeCompare(b));
  const ideas = allIdeas
    .filter((idea) => (view === "archived" ? idea.disposition === "archived" : idea.disposition !== "archived"))
    .filter((idea) => (industryValue ? idea.industry === industryValue : true))
    .filter((idea) => (dispositionValue ? idea.disposition === dispositionValue : true))
    .filter((idea) => (workflowValue ? idea.workflowState === workflowValue : true))
    .filter((idea) => (recommendationValue ? idea.recommendation === recommendationValue : true))
    .filter((idea) => (confidenceValue ? idea.confidence === confidenceValue : true))
    .sort((a, b) => {
      if (sortValue === "score") return b.scorecard.weightedTotal - a.scorecard.weightedTotal || a.ideaName.localeCompare(b.ideaName);
      if (sortValue === "score_asc") return a.scorecard.weightedTotal - b.scorecard.weightedTotal || a.ideaName.localeCompare(b.ideaName);
      if (sortValue === "name") return a.ideaName.localeCompare(b.ideaName);
      if (sortValue === "updated") return (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0);
      if (sortValue === "industry") return a.industry.localeCompare(b.industry) || b.scorecard.weightedTotal - a.scorecard.weightedTotal;
      if (a.disposition !== b.disposition) {
        const dispositionRank = { active: 0, promoted: 1, archived: 2 };
        return dispositionRank[a.disposition] - dispositionRank[b.disposition];
      }
      if (a.industry !== b.industry) return a.industry.localeCompare(b.industry);
      if (b.scorecard.weightedTotal !== a.scorecard.weightedTotal) return b.scorecard.weightedTotal - a.scorecard.weightedTotal;
      return a.ideaName.localeCompare(b.ideaName);
    });

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>{view === "archived" ? "Archived Ideas" : "Opportunity Research Queue"}</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>{view === "archived" ? "Past ideas kept for memory, reference, and pattern spotting." : "New concepts under active scoring, pressure testing, and founder review."}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {view === "active" ? <Link href="/admin/ideas/new" className="btn-gradient px-6 py-3 text-sm">New Idea</Link> : null}
              {view === "archived" ? <Link href="/admin/ideas" className="btn-gradient px-6 py-3 text-sm">Active Ideas</Link> : null}
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/future-apps" className="btn-gradient px-6 py-3 text-sm">Future Apps</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/admin/ideas" className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Active ideas</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.active}</p></Link>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Promoted</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.promoted}</p></div>
          <Link href="/admin/ideas?view=archived&disposition=archived" className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Archived</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.archived}</p></Link>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Scored</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{summary.scored}</p></div>
        </div>

        <form action="/admin/ideas" method="GET" className="mt-8 rounded-[28px] border border-black/5 bg-white p-4 shadow-sm">
          <input type="hidden" name="view" value={view} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-neutral-700">Filter ideas</span>
            <select name="industry" defaultValue={industryValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All industries</option>
              {industryOptions.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
            </select>
            <select name="disposition" defaultValue={dispositionValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">{view === "archived" ? "Archived only" : "All dispositions"}</option>
              {dispositionOptions
                .filter((disposition) => (view === "archived" ? disposition === "archived" : disposition !== "archived"))
                .map((disposition) => <option key={disposition} value={disposition}>{dispositionLabel(disposition)}</option>)}
            </select>
            <select name="workflow" defaultValue={workflowValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All workflow states</option>
              {workflowOptions.map((workflow) => <option key={workflow} value={workflow}>{statusLabel(workflow)}</option>)}
            </select>
            <select name="recommendation" defaultValue={recommendationValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All recommendations</option>
              {recommendationOptions.map((recommendation) => <option key={recommendation} value={recommendation}>{statusLabel(recommendation)}</option>)}
            </select>
            <select name="confidence" defaultValue={confidenceValue ?? ""} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="">All confidence levels</option>
              {confidenceOptions.map((confidence) => <option key={confidence} value={confidence}>{confidence}</option>)}
            </select>
            <select name="sort" defaultValue={sortValue ?? "portfolio"} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700">
              <option value="portfolio">Portfolio order</option>
              <option value="score">Highest score</option>
              <option value="score_asc">Lowest score</option>
              <option value="updated">Recently updated</option>
              <option value="industry">Industry</option>
              <option value="name">Name</option>
            </select>
            <button formAction="/admin/ideas" className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">Apply</button>
            {(industryValue || dispositionValue || workflowValue || recommendationValue || confidenceValue || (sortValue && sortValue !== "portfolio")) ? <Link href={view === "archived" ? "/admin/ideas?view=archived&disposition=archived" : "/admin/ideas"} className="text-sm text-neutral-500 underline underline-offset-2">Clear</Link> : null}
          </div>
        </form>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {ideas.length === 0 ? <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm text-sm text-neutral-600">{view === "archived" ? "No archived ideas yet." : "No active ideas yet."}</div> : null}
          {ideas.map((idea) => (
            <Link key={idea.id} href={`/admin/ideas/${idea.slug}`} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">{idea.industry}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{idea.ideaName}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${dispositionClasses(idea.disposition)}`}>{dispositionLabel(idea.disposition)}</span>
                    <span>{statusLabel(idea.workflowState)}</span>
                    <span>• {idea.productType}</span>
                    <span>• {idea.recommendation.replaceAll("_", " ")}</span>
                    <span>• {idea.confidence} confidence</span>
                  </div>
                </div>
                <span className="rounded-full bg-[#fcfaf7] px-3 py-1 text-xs font-semibold text-neutral-700">score {idea.scorecard.weightedTotal}</span>
              </div>
              <p className="mt-4 text-sm text-neutral-600">{idea.oneSentenceConcept}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Best wedge</p><p className="mt-2 text-sm text-neutral-800">{idea.bestWedge}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next validation step</p><p className="mt-2 text-sm text-neutral-800">{idea.nextValidationSteps[0] ?? "No next step recorded"}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Memo summary</p><p className="mt-2 text-sm text-neutral-800">{idea.memoSummary}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Evidence</p><p className="mt-2 text-sm text-neutral-800">{idea.evidenceSources.length} source{idea.evidenceSources.length === 1 ? "" : "s"} • {idea.researchInputs.length} input{idea.researchInputs.length === 1 ? "" : "s"}</p></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
