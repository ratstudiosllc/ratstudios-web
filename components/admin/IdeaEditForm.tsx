"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { OpportunityIdeaRecord } from "@/lib/ideas-agent";

type IdeaFormState = {
  ideaName: string;
  oneSentenceConcept: string;
  problemSolved: string;
  targetUser: string;
  productType: string;
  buyer: string;
  businessModelGuess: string;
  geography: string;
  whyNow: string;
  workflowState: OpportunityIdeaRecord["workflowState"];
  recommendation: OpportunityIdeaRecord["recommendation"];
  confidence: OpportunityIdeaRecord["confidence"];
  bestWedge: string;
  strongestReasonToBuild: string;
  strongestReasonNotToBuild: string;
  biggestRisk: string;
  memoSummary: string;
  nextValidationStepsText: string;
  memoSectionsText: string;
  evidenceSourcesText: string;
  researchInputsText: string;
  problemSeverity: string;
  willingnessToPay: string;
  marketSize: string;
  marketGrowth: string;
  competitiveIntensity: string;
  opportunityGap: string;
  distributionFeasibility: string;
  productFeasibility: string;
  defensibilityPotential: string;
  revenuePotential: string;
  speedToFirstRevenue: string;
  strategicFit: string;
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function getInitialState(idea: OpportunityIdeaRecord): IdeaFormState {
  return {
    ideaName: idea.ideaName,
    oneSentenceConcept: idea.oneSentenceConcept,
    problemSolved: idea.problemSolved,
    targetUser: idea.targetUser,
    productType: idea.productType,
    buyer: idea.buyer ?? "",
    businessModelGuess: idea.businessModelGuess ?? "",
    geography: idea.geography ?? "",
    whyNow: idea.whyNow ?? "",
    workflowState: idea.workflowState,
    recommendation: idea.recommendation,
    confidence: idea.confidence,
    bestWedge: idea.bestWedge,
    strongestReasonToBuild: idea.strongestReasonToBuild,
    strongestReasonNotToBuild: idea.strongestReasonNotToBuild,
    biggestRisk: idea.biggestRisk,
    memoSummary: idea.memoSummary,
    nextValidationStepsText: idea.nextValidationSteps.join("\n"),
    memoSectionsText: prettyJson(idea.memoSections),
    evidenceSourcesText: prettyJson(idea.evidenceSources),
    researchInputsText: prettyJson(idea.researchInputs),
    problemSeverity: String(idea.scorecard.problemSeverity),
    willingnessToPay: String(idea.scorecard.willingnessToPay),
    marketSize: String(idea.scorecard.marketSize),
    marketGrowth: String(idea.scorecard.marketGrowth),
    competitiveIntensity: String(idea.scorecard.competitiveIntensity),
    opportunityGap: String(idea.scorecard.opportunityGap),
    distributionFeasibility: String(idea.scorecard.distributionFeasibility),
    productFeasibility: String(idea.scorecard.productFeasibility),
    defensibilityPotential: String(idea.scorecard.defensibilityPotential),
    revenuePotential: String(idea.scorecard.revenuePotential),
    speedToFirstRevenue: String(idea.scorecard.speedToFirstRevenue),
    strategicFit: String(idea.scorecard.strategicFit),
  };
}

export function IdeaEditForm({ idea }: { idea: OpportunityIdeaRecord }) {
  const router = useRouter();
  const [form, setForm] = useState<IdeaFormState>(() => getInitialState(idea));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const workflowOptions = useMemo(() => ["new_idea", "screening", "deep_research", "scored", "approved_for_validation", "validation_in_progress", "parked", "rejected"] as const, []);
  const recommendationOptions = useMemo(() => ["pursue_now", "pursue_with_niche_focus", "revisit_later", "do_not_pursue"] as const, []);
  const confidenceOptions = useMemo(() => ["low", "medium", "high"] as const, []);

  function updateField<Key extends keyof IdeaFormState>(key: Key, value: IdeaFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaName: form.ideaName,
          oneSentenceConcept: form.oneSentenceConcept,
          problemSolved: form.problemSolved,
          targetUser: form.targetUser,
          productType: form.productType,
          buyer: form.buyer,
          businessModelGuess: form.businessModelGuess,
          geography: form.geography,
          whyNow: form.whyNow,
          workflowState: form.workflowState,
          recommendation: form.recommendation,
          confidence: form.confidence,
          bestWedge: form.bestWedge,
          strongestReasonToBuild: form.strongestReasonToBuild,
          strongestReasonNotToBuild: form.strongestReasonNotToBuild,
          biggestRisk: form.biggestRisk,
          memoSummary: form.memoSummary,
          nextValidationSteps: form.nextValidationStepsText,
          memoSections: form.memoSectionsText,
          evidenceSources: form.evidenceSourcesText,
          researchInputs: form.researchInputsText,
          scorecard: {
            problemSeverity: form.problemSeverity,
            willingnessToPay: form.willingnessToPay,
            marketSize: form.marketSize,
            marketGrowth: form.marketGrowth,
            competitiveIntensity: form.competitiveIntensity,
            opportunityGap: form.opportunityGap,
            distributionFeasibility: form.distributionFeasibility,
            productFeasibility: form.productFeasibility,
            defensibilityPotential: form.defensibilityPotential,
            revenuePotential: form.revenuePotential,
            speedToFirstRevenue: form.speedToFirstRevenue,
            strategicFit: form.strategicFit,
          },
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        setError(json.error || "Failed to update idea");
        setSubmitting(false);
        return;
      }

      setSuccess("Idea updated.");
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Failed to update idea");
      setSubmitting(false);
    }
  }

  function textInput(label: string, key: keyof IdeaFormState, isTextArea = false) {
    return (
      <label className="block text-sm">
        <span className="font-medium text-neutral-900">{label}</span>
        {isTextArea ? (
          <textarea value={String(form[key])} onChange={(e) => updateField(key, e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3" />
        ) : (
          <input value={String(form[key])} onChange={(e) => updateField(key, e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" />
        )}
      </label>
    );
  }

  function scoreInput(label: string, key: keyof IdeaFormState) {
    return (
      <label className="block text-sm">
        <span className="font-medium text-neutral-900">{label}</span>
        <input type="number" min="0" max="10" value={String(form[key])} onChange={(e) => updateField(key, e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" />
      </label>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {textInput("Idea name", "ideaName")}
        {textInput("Product type", "productType")}
      </div>

      {textInput("One-sentence concept", "oneSentenceConcept", true)}
      {textInput("Problem solved", "problemSolved", true)}
      {textInput("Target user", "targetUser", true)}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {textInput("Buyer", "buyer")}
        {textInput("Business model guess", "businessModelGuess")}
        {textInput("Geography", "geography")}
        {textInput("Why now", "whyNow")}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Workflow state</span>
          <select value={form.workflowState} onChange={(e) => updateField("workflowState", e.target.value as IdeaFormState["workflowState"])} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3">
            {workflowOptions.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Recommendation</span>
          <select value={form.recommendation} onChange={(e) => updateField("recommendation", e.target.value as IdeaFormState["recommendation"])} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3">
            {recommendationOptions.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Confidence</span>
          <select value={form.confidence} onChange={(e) => updateField("confidence", e.target.value as IdeaFormState["confidence"])} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3">
            {confidenceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>

      {textInput("Best wedge", "bestWedge", true)}
      {textInput("Strongest reason to build", "strongestReasonToBuild", true)}
      {textInput("Strongest reason not to build", "strongestReasonNotToBuild", true)}
      {textInput("Biggest risk", "biggestRisk", true)}
      {textInput("Memo summary", "memoSummary", true)}

      <label className="block text-sm">
        <span className="font-medium text-neutral-900">Next validation steps (one per line)</span>
        <textarea value={form.nextValidationStepsText} onChange={(e) => updateField("nextValidationStepsText", e.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3" />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-neutral-900">Memo sections JSON</span>
        <textarea value={form.memoSectionsText} onChange={(e) => updateField("memoSectionsText", e.target.value)} className="mt-2 min-h-40 w-full rounded-2xl border border-black/10 px-4 py-3 font-mono text-xs" />
      </label>

      <div className="grid gap-5 xl:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Evidence sources JSON</span>
          <textarea value={form.evidenceSourcesText} onChange={(e) => updateField("evidenceSourcesText", e.target.value)} className="mt-2 min-h-40 w-full rounded-2xl border border-black/10 px-4 py-3 font-mono text-xs" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-neutral-900">Research inputs JSON</span>
          <textarea value={form.researchInputsText} onChange={(e) => updateField("researchInputsText", e.target.value)} className="mt-2 min-h-40 w-full rounded-2xl border border-black/10 px-4 py-3 font-mono text-xs" />
        </label>
      </div>

      <div className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
        <h3 className="text-lg font-semibold text-neutral-950">Scorecard</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scoreInput("Problem severity", "problemSeverity")}
          {scoreInput("Willingness to pay", "willingnessToPay")}
          {scoreInput("Market size", "marketSize")}
          {scoreInput("Market growth", "marketGrowth")}
          {scoreInput("Competitive intensity", "competitiveIntensity")}
          {scoreInput("Opportunity gap", "opportunityGap")}
          {scoreInput("Distribution feasibility", "distributionFeasibility")}
          {scoreInput("Product feasibility", "productFeasibility")}
          {scoreInput("Defensibility", "defensibilityPotential")}
          {scoreInput("Revenue potential", "revenuePotential")}
          {scoreInput("Speed to first revenue", "speedToFirstRevenue")}
          {scoreInput("Strategic fit", "strategicFit")}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <button disabled={submitting} className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60">
        {submitting ? "Saving…" : "Save idea updates"}
      </button>
    </form>
  );
}
