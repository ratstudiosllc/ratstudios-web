import {
  getFutureAppsSummary as getFutureAppsSummaryFromDb,
  getFutureAppById as getFutureAppByIdFromDb,
  listFutureApps as listFutureAppsFromDb,
  runFutureAppEvaluation as runFutureAppEvaluationInDb,
} from "@/lib/admin-opportunities";

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

export async function listFutureApps() {
  return listFutureAppsFromDb();
}

export async function getFutureAppsSummary() {
  return getFutureAppsSummaryFromDb();
}

export async function getFutureAppById(id: string) {
  return getFutureAppByIdFromDb(id);
}

export async function createFutureAppFromIdea(input: {
  slug: string;
  name: string;
  summary: string;
  problemStatement: string;
  targetUsers: string[];
  priorResearchNotes: string[];
  bucket: string;
  owner?: string;
}) {
  const existing = await getFutureAppByIdFromDb(input.slug);
  if (existing) return existing;
  throw new Error("Use promoteOpportunityIdea to create future apps");
}

export async function runFutureAppEvaluation(id: string) {
  return runFutureAppEvaluationInDb(id);
}
