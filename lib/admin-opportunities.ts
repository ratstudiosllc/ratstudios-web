import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  IdeaConfidence,
  IdeaDisposition,
  IdeaEvidenceSource,
  IdeaMemoSection,
  IdeaRecommendation,
  IdeaScorecard,
  IdeaWorkflowState,
  OpportunityIdeaRecord,
  ResearchInput,
} from "@/lib/ideas-agent";
import type {
  FutureAppConfidence,
  FutureAppEvaluationSummary,
  FutureAppRecord,
  FutureAppRecommendation,
  FutureAppReportSection,
  FutureAppStage,
} from "@/lib/future-apps-agent";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "idea";
}

function nowIso() {
  return new Date().toISOString();
}

function computeWeightedTotal(scorecard: Omit<IdeaScorecard, "weightedTotal"> | IdeaScorecard) {
  const values = [
    scorecard.problemSeverity,
    scorecard.willingnessToPay,
    scorecard.marketSize,
    scorecard.marketGrowth,
    scorecard.competitiveIntensity,
    scorecard.opportunityGap,
    scorecard.distributionFeasibility,
    scorecard.productFeasibility,
    scorecard.defensibilityPotential,
    scorecard.revenuePotential,
    scorecard.speedToFirstRevenue,
    scorecard.strategicFit,
  ];
  return Math.round((values.reduce((sum, value) => sum + value, 0) / (values.length * 10)) * 100);
}

function inferIndustry(idea: Pick<OpportunityIdeaRecord, "slug" | "ideaName" | "targetUser" | "productType" | "oneSentenceConcept">) {
  const text = `${idea.slug} ${idea.ideaName} ${idea.targetUser} ${idea.productType} ${idea.oneSentenceConcept}`.toLowerCase();
  if (text.includes("hospital") || text.includes("clinical") || text.includes("behavioral health") || text.includes("mental health") || text.includes("community care") || text.includes("home health") || text.includes("hospice") || text.includes("home care") || text.includes("nemt") || text.includes("medical transportation") || text.includes("non-emergency medical transportation") || text.includes("dental") || text.includes("optometry") || text.includes("eye care") || text.includes("vision") || text.includes("medtech") || text.includes("specimen") || text.includes("dialy")) return "Healthcare";
  if (text.includes("construction") || text.includes("punch list") || text.includes("closeout") || text.includes("glazing") || text.includes("paving")) return "Construction";
  if (text.includes("property maintenance") || text.includes("multifamily") || text.includes("facilities") || text.includes("self-storage") || text.includes("storage facility") || text.includes("storage operator")) return "Facilities";
  if (text.includes("rail") || text.includes("fleet") || text.includes("shuttle") || text.includes("transport") || text.includes("yard")) return "Transportation";
  if (text.includes("utility") || text.includes("meter") || text.includes("water")) return "Utilities";
  if (text.includes("marina") || text.includes("mooring") || text.includes("dock")) return "Maritime";
  if (text.includes("brewery") || text.includes("beverage") || text.includes("keg")) return "Food & Beverage";
  if (text.includes("event") || text.includes("venue")) return "Events";
  if (text.includes("shooting") || text.includes("club") || text.includes("sports")) return "Recreation";
  if (text.includes("agriculture") || text.includes("farm") || text.includes("crop") || text.includes("ranch")) return "Agriculture";
  if (text.includes("industrial") || text.includes("valve") || text.includes("plant")) return "Industrial";
  if (text.includes("field service") || text.includes("hvac") || text.includes("plumbing") || text.includes("electrical") || text.includes("specialty trade") || text.includes("route") || text.includes("service") || text.includes("crew") || text.includes("waste") || text.includes("recycling") || text.includes("portable sanitation") || text.includes("septic")) return "Field Services";
  return "Other";
}

function normalizeIdeaRecord(row: Record<string, unknown>): OpportunityIdeaRecord {
  const scorecard = (row.scorecard_json as IdeaScorecard | null) ?? {
    problemSeverity: 0,
    willingnessToPay: 0,
    marketSize: 0,
    marketGrowth: 0,
    competitiveIntensity: 0,
    opportunityGap: 0,
    distributionFeasibility: 0,
    productFeasibility: 0,
    defensibilityPotential: 0,
    revenuePotential: 0,
    speedToFirstRevenue: 0,
    strategicFit: 0,
    weightedTotal: 0,
  };

  const normalizedScorecard: IdeaScorecard = {
    ...scorecard,
    weightedTotal: computeWeightedTotal(scorecard),
  };

  return {
    id: String(row.id),
    slug: String(row.slug),
    ideaName: String(row.idea_name),
    isFavorite: Boolean(row.is_favorite ?? false),
    industry: String(row.industry || inferIndustry({
      slug: String(row.slug),
      ideaName: String(row.idea_name),
      targetUser: String(row.target_user ?? ""),
      productType: String(row.product_type ?? ""),
      oneSentenceConcept: String(row.one_sentence_concept ?? ""),
    })),
    oneSentenceConcept: String(row.one_sentence_concept ?? ""),
    problemSolved: String(row.problem_solved ?? ""),
    targetUser: String(row.target_user ?? ""),
    productType: String(row.product_type ?? ""),
    buyer: row.buyer ? String(row.buyer) : undefined,
    businessModelGuess: row.business_model_guess ? String(row.business_model_guess) : undefined,
    geography: row.geography ? String(row.geography) : undefined,
    whyNow: row.why_now ? String(row.why_now) : undefined,
    workflowState: String(row.workflow_state) as IdeaWorkflowState,
    recommendation: String(row.recommendation) as IdeaRecommendation,
    confidence: String(row.confidence) as IdeaConfidence,
    bestWedge: String(row.best_wedge ?? ""),
    strongestReasonToBuild: String(row.strongest_reason_to_build ?? ""),
    strongestReasonNotToBuild: String(row.strongest_reason_not_to_build ?? ""),
    biggestRisk: String(row.biggest_risk ?? ""),
    nextValidationSteps: Array.isArray(row.next_validation_steps) ? row.next_validation_steps.map(String) : [],
    memoSummary: String(row.memo_summary ?? ""),
    memoSections: Array.isArray(row.memo_sections) ? row.memo_sections as IdeaMemoSection[] : [],
    evidenceSources: Array.isArray(row.evidence_sources) ? row.evidence_sources as IdeaEvidenceSource[] : [],
    researchInputs: Array.isArray(row.research_inputs) ? row.research_inputs as ResearchInput[] : [],
    scorecard: normalizedScorecard,
    disposition: String(row.disposition) as IdeaDisposition,
    promotedAppSlug: row.promoted_app_slug ? String(row.promoted_app_slug) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function normalizeFutureAppRecord(row: Record<string, unknown>): FutureAppRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    bucket: String(row.bucket ?? "Uncategorized"),
    stage: String(row.stage) as FutureAppStage,
    status: String(row.status ?? ""),
    owner: String(row.owner ?? "Bub"),
    summary: String(row.summary ?? ""),
    problemStatement: String(row.problem_statement ?? ""),
    targetUsers: Array.isArray(row.target_users) ? row.target_users.map(String) : [],
    priorResearchNotes: Array.isArray(row.prior_research_notes) ? row.prior_research_notes.map(String) : [],
    currentBlocker: String(row.current_blocker ?? ""),
    nextMilestone: String(row.next_milestone ?? ""),
    nextSteps: Array.isArray(row.next_steps) ? row.next_steps.map(String) : [],
    progressNotes: Array.isArray(row.progress_notes) ? row.progress_notes.map(String) : [],
    evaluation: (row.evaluation_json as FutureAppEvaluationSummary | null) ?? {
      status: "not_started",
      updatedAt: null,
      overallWeightedScore: null,
      confidence: null,
      recommendation: null,
      decisionSummary: null,
      nextAction: "run_evaluation",
      bestWedge: null,
      bestInitialCustomer: null,
      topReasonsToPursue: [],
      topReasonsForCaution: [],
      verifiedFindings: [],
      assumptions: [],
      unknowns: [],
      killCriteria: [],
      reportSections: [],
    },
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listOpportunityIdeas() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_opportunity_ideas")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeIdeaRecord(row as Record<string, unknown>));
}

export async function getOpportunityIdeaById(idOrSlug: string) {
  const ideas = await listOpportunityIdeas();
  return ideas.find((idea) => idea.id === idOrSlug || idea.slug === idOrSlug) ?? null;
}

export async function getOpportunityIdeaBySlug(slug: string) {
  return getOpportunityIdeaById(slug);
}

export async function createOpportunityIdea(input: {
  ideaName: string;
  oneSentenceConcept: string;
  problemSolved: string;
  targetUser: string;
  productType: string;
  buyer?: string;
  businessModelGuess?: string;
  geography?: string;
  whyNow?: string;
}) {
  const supabase = createSupabaseAdmin();
  const timestamp = nowIso();
  const slug = slugify(input.ideaName);
  const industry = inferIndustry({
    slug,
    ideaName: input.ideaName,
    targetUser: input.targetUser,
    productType: input.productType,
    oneSentenceConcept: input.oneSentenceConcept,
  });

  const row = {
    slug,
    idea_name: input.ideaName,
    industry,
    one_sentence_concept: input.oneSentenceConcept,
    problem_solved: input.problemSolved,
    target_user: input.targetUser,
    product_type: input.productType,
    buyer: input.buyer ?? null,
    business_model_guess: input.businessModelGuess ?? null,
    geography: input.geography ?? null,
    why_now: input.whyNow ?? null,
    workflow_state: "new_idea",
    recommendation: "revisit_later",
    confidence: "low",
    best_wedge: "Best wedge not defined yet.",
    strongest_reason_to_build: "Research has not been completed yet.",
    strongest_reason_not_to_build: "Research has not been completed yet.",
    biggest_risk: "Unknown until opportunity research is completed.",
    next_validation_steps: ["Run screening pass", "Map competitors", "Score the opportunity"],
    memo_summary: "New idea intake created. Opportunity research has not been completed yet.",
    memo_sections: [
      { title: "Executive summary", body: "New idea intake created. Opportunity research has not been completed yet." },
      { title: "Market shape", body: "Market framing has not been written yet. Define the category, segment, and why this market is worth looking at now." },
      { title: "Workflow pain", body: input.problemSolved },
      { title: "Current software weaknesses", body: "Current software weaknesses have not been documented yet. Capture incumbent complaints, workflow friction, UX failures, and missing capabilities." },
      { title: "How we improve it", body: "Best wedge not defined yet." },
      { title: "Revenue opportunities", body: input.businessModelGuess || "Revenue model has not been outlined yet. Define pricing logic, expansion revenue, and serviceable revenue slice." },
      { title: "Pricing structure and ARR scenarios", body: "Pricing and ARR scenarios have not been modeled yet. Add draft tiers, customer levels, and ARR outcomes." },
      { title: "Recommendation", body: "Research has not been completed yet. Research has not been completed yet." },
    ],
    evidence_sources: [],
    research_inputs: [],
    scorecard_json: {
      problemSeverity: 0,
      willingnessToPay: 0,
      marketSize: 0,
      marketGrowth: 0,
      competitiveIntensity: 0,
      opportunityGap: 0,
      distributionFeasibility: 0,
      productFeasibility: 0,
      defensibilityPotential: 0,
      revenuePotential: 0,
      speedToFirstRevenue: 0,
      strategicFit: 0,
      weightedTotal: 0,
    },
    disposition: "active",
    created_at: timestamp,
    updated_at: timestamp,
  };

  const { data, error } = await supabase
    .from("admin_opportunity_ideas")
    .insert(row)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return normalizeIdeaRecord(data as Record<string, unknown>);
}

export async function updateOpportunityIdea(
  id: string,
  updates: Partial<Omit<OpportunityIdeaRecord, "id" | "createdAt" | "updatedAt" | "scorecard">> & {
    scorecard?: Partial<Omit<IdeaScorecard, "weightedTotal">>;
  },
) {
  const supabase = createSupabaseAdmin();
  const current = await getOpportunityIdeaById(id);
  if (!current) return null;

  const nextScorecard = updates.scorecard
    ? { ...current.scorecard, ...updates.scorecard }
    : current.scorecard;

  const patch = {
    slug: updates.slug ?? current.slug,
    idea_name: updates.ideaName ?? current.ideaName,
    industry: updates.industry ?? current.industry,
    one_sentence_concept: updates.oneSentenceConcept ?? current.oneSentenceConcept,
    problem_solved: updates.problemSolved ?? current.problemSolved,
    target_user: updates.targetUser ?? current.targetUser,
    product_type: updates.productType ?? current.productType,
    buyer: updates.buyer ?? current.buyer ?? null,
    business_model_guess: updates.businessModelGuess ?? current.businessModelGuess ?? null,
    geography: updates.geography ?? current.geography ?? null,
    why_now: updates.whyNow ?? current.whyNow ?? null,
    workflow_state: updates.workflowState ?? current.workflowState,
    recommendation: updates.recommendation ?? current.recommendation,
    confidence: updates.confidence ?? current.confidence,
    best_wedge: updates.bestWedge ?? current.bestWedge,
    strongest_reason_to_build: updates.strongestReasonToBuild ?? current.strongestReasonToBuild,
    strongest_reason_not_to_build: updates.strongestReasonNotToBuild ?? current.strongestReasonNotToBuild,
    biggest_risk: updates.biggestRisk ?? current.biggestRisk,
    next_validation_steps: updates.nextValidationSteps ?? current.nextValidationSteps,
    memo_summary: updates.memoSummary ?? current.memoSummary,
    memo_sections: updates.memoSections ?? current.memoSections,
    evidence_sources: updates.evidenceSources ?? current.evidenceSources,
    research_inputs: updates.researchInputs ?? current.researchInputs,
    scorecard_json: { ...nextScorecard, weightedTotal: computeWeightedTotal(nextScorecard) },
    disposition: updates.disposition ?? current.disposition,
    promoted_app_slug: updates.promotedAppSlug ?? current.promotedAppSlug ?? null,
    updated_at: nowIso(),
  };

  const { data, error } = await supabase
    .from("admin_opportunity_ideas")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return normalizeIdeaRecord(data as Record<string, unknown>);
}

export async function archiveOpportunityIdea(id: string) {
  return updateOpportunityIdea(id, { disposition: "archived", workflowState: "rejected" });
}

export async function promoteOpportunityIdea(id: string) {
  const supabase = createSupabaseAdmin();
  const current = await getOpportunityIdeaById(id);
  if (!current) throw new Error("Idea not found");

  let futureApp = await getFutureAppById(current.slug);
  if (!futureApp) {
    const { data, error } = await supabase
      .from("admin_future_apps")
      .insert({
        slug: current.slug,
        name: current.ideaName,
        bucket: current.industry,
        stage: "intake",
        status: "Promoted from ideas and waiting on evaluation",
        owner: "Bub",
        summary: current.memoSummary,
        problem_statement: current.problemSolved,
        target_users: [current.targetUser],
        prior_research_notes: [
          current.oneSentenceConcept,
          current.bestWedge,
          current.strongestReasonToBuild,
          current.strongestReasonNotToBuild,
        ].filter(Boolean),
        current_blocker: "Needs future-app evaluation run",
        next_milestone: "Generate first decision-grade evaluation brief",
        next_steps: [
          "Run evaluation",
          "Review best wedge and initial customer",
          "Decide whether to move to planning or hold",
        ],
        progress_notes: [
          "Promoted from ideas pipeline into future apps.",
          "Waiting for first evaluation brief.",
        ],
        evaluation_json: {
          status: "not_started",
          updatedAt: null,
          overallWeightedScore: null,
          confidence: null,
          recommendation: null,
          decisionSummary: null,
          nextAction: "run_evaluation",
          bestWedge: null,
          bestInitialCustomer: null,
          topReasonsToPursue: [],
          topReasonsForCaution: [],
          verifiedFindings: [],
          assumptions: [],
          unknowns: [],
          killCriteria: [],
          reportSections: [],
        },
        created_at: nowIso(),
        updated_at: nowIso(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    futureApp = normalizeFutureAppRecord(data as Record<string, unknown>);
  }

  const updatedIdea = await updateOpportunityIdea(id, {
    disposition: "promoted",
    workflowState: "approved_for_validation",
    promotedAppSlug: futureApp.slug,
  });

  return {
    idea: updatedIdea,
    futureApp,
  };
}

export async function promoteFutureAppToCurrent(idOrSlug: string) {
  const supabase = createSupabaseAdmin();
  const current = await getFutureAppById(idOrSlug);
  if (!current) throw new Error("Future app not found");

  const now = nowIso();
  const progressNote = "Moved from future app pipeline into current app portfolio.";
  const progressNotes = current.progressNotes.includes(progressNote)
    ? current.progressNotes
    : [...current.progressNotes, progressNote];

  const { data, error } = await supabase
    .from("admin_future_apps")
    .update({
      stage: "approved_for_planning",
      status: "Current app portfolio",
      current_blocker: "Needs current-app execution plan and operating metrics",
      next_milestone: "Define current-app build plan, owner, metrics, and issue lane",
      progress_notes: progressNotes,
      updated_at: now,
    })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeFutureAppRecord(data as Record<string, unknown>);
}

export async function listFutureApps() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_future_apps")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => normalizeFutureAppRecord(row as Record<string, unknown>));
}

export async function getFutureAppById(idOrSlug: string) {
  const apps = await listFutureApps();
  return apps.find((app) => app.id === idOrSlug || app.slug === idOrSlug) ?? null;
}

export async function runFutureAppEvaluation(idOrSlug: string) {
  const supabase = createSupabaseAdmin();
  const current = await getFutureAppById(idOrSlug);
  if (!current) throw new Error("Future app not found");

  const now = nowIso();
  const evaluation: FutureAppEvaluationSummary = {
    ...current.evaluation,
    status: "ready",
    updatedAt: now,
    overallWeightedScore: 72,
    confidence: "medium" as FutureAppConfidence,
    recommendation: "Strong Future Candidate" as FutureAppRecommendation,
    decisionSummary: `The concept has real internal pain and a plausible product wedge, but it still needs external repeatability validation before it earns planning priority.`,
    nextAction: "needs_founder_interviews",
    reportSections: [
      {
        title: "Executive summary",
        body: `${current.name} solves a real operating problem already felt inside RaT Studios. The opportunity looks credible enough to keep moving, but the biggest question is whether the workflow is repeatable outside this exact environment.`,
      },
    ] as FutureAppReportSection[],
  };

  const patch = {
    stage: "ready_for_decision",
    status: "Evaluation brief ready for founder review",
    current_blocker: "Need founder decision on whether to move this toward planning",
    next_milestone: "Founder review of evaluation brief and decision",
    progress_notes: [
      ...current.progressNotes,
      "Evaluation runner generated operator decision fields and a starter brief.",
    ],
    evaluation_json: evaluation,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("admin_future_apps")
    .update(patch)
    .eq("id", current.id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return normalizeFutureAppRecord(data as Record<string, unknown>);
}

export async function getIdeasSummary() {
  const ideas = await listOpportunityIdeas();
  const active = ideas.filter((idea) => idea.disposition === "active");
  const latestUpdatedAt = ideas.reduce<string | null>((latest, idea) => {
    if (!latest || idea.updatedAt > latest) return idea.updatedAt;
    return latest;
  }, null);

  const topIdeas = [...ideas]
    .filter((idea) => idea.disposition !== "archived")
    .sort((a, b) => b.scorecard.weightedTotal - a.scorecard.weightedTotal || a.ideaName.localeCompare(b.ideaName))
    .slice(0, 3);

  return {
    total: ideas.length,
    active: active.length,
    archived: ideas.filter((idea) => idea.disposition === "archived").length,
    promoted: ideas.filter((idea) => idea.disposition === "promoted").length,
    screening: ideas.filter((idea) => idea.workflowState === "screening").length,
    deepResearch: ideas.filter((idea) => idea.workflowState === "deep_research").length,
    scored: ideas.filter((idea) => idea.workflowState === "scored").length,
    approvedForValidation: ideas.filter((idea) => idea.workflowState === "approved_for_validation").length,
    validationInProgress: ideas.filter((idea) => idea.workflowState === "validation_in_progress").length,
    latestUpdatedAt,
    topIdeas,
  };
}

export async function getFutureAppsSummary() {
  const apps = await listFutureApps();
  return {
    total: apps.length,
    evaluating: apps.filter((app) => app.stage === "evaluation_in_progress").length,
    readyForDecision: apps.filter((app) => app.stage === "ready_for_decision").length,
    approvedForPlanning: apps.filter((app) => app.stage === "approved_for_planning").length,
    needsFounderInput: apps.filter((app) => app.stage === "needs_founder_input").length,
    latestUpdatedAt: apps.reduce<string | null>((latest, app) => {
      if (!latest || app.updatedAt > latest) return app.updatedAt;
      return latest;
    }, null),
  };
}
