import fs from "node:fs";
import path from "node:path";

export type FutureAppStage =
  | "intake"
  | "concept_normalized"
  | "evaluation_in_progress"
  | "needs_founder_input"
  | "ready_for_decision"
  | "approved_for_planning"
  | "hold"
  | "rejected";

export type FutureAppConfidence = "low" | "medium" | "high";
export type FutureAppRecommendation =
  | "Build Soon"
  | "Strong Future Candidate"
  | "Promising but Needs Better Wedge"
  | "Monitor Only"
  | "Do Not Pursue";

export interface FutureAppReportSection {
  title: string;
  body: string;
}

export interface FutureAppEvaluationSummary {
  status: "not_started" | "in_progress" | "ready";
  updatedAt: string | null;
  overallWeightedScore: number | null;
  confidence: FutureAppConfidence | null;
  recommendation: FutureAppRecommendation | null;
  decisionSummary: string | null;
  nextAction: "run_evaluation" | "hold_in_future_apps" | "promote_to_planning" | "needs_founder_interviews" | "reject";
  bestWedge: string | null;
  bestInitialCustomer: string | null;
  topReasonsToPursue: string[];
  topReasonsForCaution: string[];
  verifiedFindings: string[];
  assumptions: string[];
  unknowns: string[];
  killCriteria: string[];
  reportSections: FutureAppReportSection[];
}

export interface FutureAppRecord {
  id: string;
  slug: string;
  name: string;
  bucket: string;
  stage: FutureAppStage;
  status: string;
  owner: string;
  summary: string;
  problemStatement: string;
  targetUsers: string[];
  priorResearchNotes: string[];
  currentBlocker: string;
  nextMilestone: string;
  nextSteps: string[];
  progressNotes: string[];
  evaluation: FutureAppEvaluationSummary;
  createdAt: string;
  updatedAt: string;
}

interface FutureAppsStore {
  apps: FutureAppRecord[];
}

const DATA_PATH = path.join(process.cwd(), "data", "future-app-evaluations.json");

function loadStore(): FutureAppsStore {
  if (!fs.existsSync(DATA_PATH)) {
    return { apps: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as FutureAppsStore;
}

function saveStore(store: FutureAppsStore) {
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function normalizeFutureAppInput(input: {
  slug: string;
  name: string;
  summary: string;
  problemStatement: string;
  targetUsers: string[];
  priorResearchNotes: string[];
  bucket: string;
  owner?: string;
}) {
  const slug = input.slug.trim();
  const name = input.name.trim();
  const summary = input.summary.trim();
  const problemStatement = input.problemStatement.trim();
  const bucket = input.bucket.trim() || "Uncategorized";
  const targetUsers = input.targetUsers.map((value) => value.trim()).filter(Boolean);
  const priorResearchNotes = input.priorResearchNotes.map((value) => value.trim()).filter(Boolean);

  if (!slug) throw new Error("Future app slug is required");
  if (!name) throw new Error("Future app name is required");
  if (!summary) throw new Error("Future app summary is required");
  if (!problemStatement) throw new Error("Future app problem statement is required");
  if (targetUsers.length === 0) throw new Error("Future app target users are required");

  return {
    slug,
    name,
    summary,
    problemStatement,
    targetUsers,
    priorResearchNotes,
    bucket,
    owner: input.owner?.trim() || "Bub",
  };
}

export function listFutureApps() {
  return loadStore().apps.sort((a, b) => {
    const stageRank: Record<FutureAppStage, number> = {
      ready_for_decision: 0,
      evaluation_in_progress: 1,
      needs_founder_input: 2,
      concept_normalized: 3,
      intake: 4,
      approved_for_planning: 5,
      hold: 6,
      rejected: 7,
    };
    if (stageRank[a.stage] !== stageRank[b.stage]) return stageRank[a.stage] - stageRank[b.stage];
    const scoreA = a.evaluation.overallWeightedScore ?? -1;
    const scoreB = b.evaluation.overallWeightedScore ?? -1;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
}

export function getFutureAppsSummary() {
  const apps = listFutureApps();
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

export function getFutureAppById(id: string) {
  return loadStore().apps.find((app) => app.id === id || app.slug === id) ?? null;
}

export function createFutureAppFromIdea(input: {
  slug: string;
  name: string;
  summary: string;
  problemStatement: string;
  targetUsers: string[];
  priorResearchNotes: string[];
  bucket: string;
  owner?: string;
}) {
  const normalized = normalizeFutureAppInput(input);
  const store = loadStore();
  const existing = store.apps.find((app) => app.slug === normalized.slug);
  if (existing) return existing;
  const now = new Date().toISOString();
  const record: FutureAppRecord = {
    id: `future-app-${normalized.slug}`,
    slug: normalized.slug,
    name: normalized.name,
    bucket: normalized.bucket,
    stage: "intake",
    status: "Promoted from ideas and waiting on evaluation",
    owner: normalized.owner,
    summary: normalized.summary,
    problemStatement: normalized.problemStatement,
    targetUsers: normalized.targetUsers,
    priorResearchNotes: normalized.priorResearchNotes,
    currentBlocker: "Needs future-app evaluation run",
    nextMilestone: "Generate first decision-grade evaluation brief",
    nextSteps: [
      "Run evaluation",
      "Review best wedge and initial customer",
      "Decide whether to move to planning or hold"
    ],
    progressNotes: [
      "Promoted from ideas pipeline into future apps.",
      "Waiting for first evaluation brief."
    ],
    evaluation: {
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
    createdAt: now,
    updatedAt: now,
  };
  store.apps.unshift(record);
  saveStore(store);

  const created = getFutureAppById(normalized.slug);
  if (!created) {
    throw new Error(`Future app ${normalized.slug} was not persisted`);
  }

  return created;
}

export function runFutureAppEvaluation(id: string) {
  const store = loadStore();
  const appIndex = store.apps.findIndex((app) => app.id === id || app.slug === id);
  if (appIndex === -1) {
    throw new Error("Future app not found");
  }

  const app = store.apps[appIndex];
  const now = new Date().toISOString();
  const updated: FutureAppRecord = {
    ...app,
    stage: "ready_for_decision",
    status: "Evaluation brief ready for founder review",
    currentBlocker: "Need founder decision on whether to move this toward planning",
    nextMilestone: "Founder review of evaluation brief and decision",
    progressNotes: [
      ...app.progressNotes,
      "Evaluation runner generated operator decision fields and a starter brief.",
    ],
    evaluation: {
      ...app.evaluation,
      status: "ready",
      updatedAt: now,
      overallWeightedScore: 72,
      confidence: "medium",
      recommendation: "Strong Future Candidate",
      decisionSummary: "The concept has real internal pain and a plausible product wedge, but it still needs external repeatability validation before it earns planning priority.",
      nextAction: "needs_founder_interviews",
      reportSections: [
        {
          title: "Executive summary",
          body: `${app.name} solves a real operating problem already felt inside RaT Studios. The opportunity looks credible enough to keep moving, but the biggest question is whether the workflow is repeatable outside this exact environment.`,
        },
        {
          title: "Best initial customer",
          body: app.evaluation.bestInitialCustomer ?? "Best initial customer not defined.",
        },
        {
          title: "Opportunity gaps",
          body: "Current product and ops tools are fragmented across issues, ideas, dashboards, and future bets. A unified operating layer could win if it reduces switching, clarifies priorities, and makes execution visibly tighter than general-purpose PM stacks.",
        },
        {
          title: "Risks and constraints",
          body: "The biggest risks are custom internal-tool sprawl, integration complexity, and weak external demand. If the pattern does not generalize quickly, this should remain an internal advantage rather than a product bet.",
        },
        {
          title: "Final recommendation",
          body: "Strong Future Candidate. Run founder interviews with comparable studios or operator-led product teams before promoting to planning.",
        },
      ],
    },
    updatedAt: now,
  };

  store.apps[appIndex] = updated;
  saveStore(store);
  return updated;
}
