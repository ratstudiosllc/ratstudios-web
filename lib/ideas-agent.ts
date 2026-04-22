import { createSupabaseAdmin } from "@/lib/supabase-admin";
import {
  archiveOpportunityIdea,
  createOpportunityIdea,
  getIdeasSummary,
  getOpportunityIdeaById,
  getOpportunityIdeaBySlug,
  listOpportunityIdeas,
  updateOpportunityIdea,
} from "@/lib/admin-opportunities";

export type IdeaWorkflowState =
  | "new_idea"
  | "screening"
  | "deep_research"
  | "scored"
  | "approved_for_validation"
  | "validation_in_progress"
  | "parked"
  | "rejected";

export type IdeaRecommendation =
  | "pursue_now"
  | "pursue_with_niche_focus"
  | "revisit_later"
  | "do_not_pursue";

export type IdeaConfidence = "low" | "medium" | "high";
export type IdeaDisposition = "active" | "archived" | "promoted";

export interface IdeaScorecard {
  problemSeverity: number;
  willingnessToPay: number;
  marketSize: number;
  marketGrowth: number;
  competitiveIntensity: number;
  opportunityGap: number;
  distributionFeasibility: number;
  productFeasibility: number;
  defensibilityPotential: number;
  revenuePotential: number;
  speedToFirstRevenue: number;
  strategicFit: number;
  weightedTotal: number;
}

export interface IdeaMemoSection {
  title: string;
  body: string;
}

export const DEFAULT_IDEA_REPORT_SECTIONS = [
  "Executive summary",
  "Market shape",
  "Workflow pain",
  "Current software weaknesses",
  "How we improve it",
  "Revenue opportunities",
  "Pricing structure and ARR scenarios",
  "Recommendation",
] as const;

export interface IdeaEvidenceSource {
  id: string;
  title: string;
  url?: string;
  sourceType: "market_report" | "competitor" | "interview" | "internal_note" | "article" | "dataset" | "other";
  publisher?: string;
  publishedAt?: string;
  accessedAt?: string;
  summary: string;
  notes?: string;
  quote?: string;
}

export interface ResearchInput {
  id: string;
  createdAt: string;
  inputType: "manual_note" | "url_capture" | "transcript_excerpt" | "dataset_extract" | "other";
  title: string;
  content: string;
  sourceUrl?: string;
  status: "queued" | "reviewed" | "discarded";
}

export interface OpportunityIdeaRecord {
  id: string;
  slug: string;
  ideaName: string;
  isFavorite?: boolean;
  industry: string;
  oneSentenceConcept: string;
  problemSolved: string;
  targetUser: string;
  productType: string;
  buyer?: string;
  businessModelGuess?: string;
  geography?: string;
  whyNow?: string;
  workflowState: IdeaWorkflowState;
  recommendation: IdeaRecommendation;
  confidence: IdeaConfidence;
  bestWedge: string;
  strongestReasonToBuild: string;
  strongestReasonNotToBuild: string;
  biggestRisk: string;
  nextValidationSteps: string[];
  memoSummary: string;
  memoSections: IdeaMemoSection[];
  evidenceSources: IdeaEvidenceSource[];
  researchInputs: ResearchInput[];
  scorecard: IdeaScorecard;
  disposition: IdeaDisposition;
  promotedAppSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdeasStoreData {
  ideas: OpportunityIdeaRecord[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "idea";
}

function nowIso() {
  return new Date().toISOString();
}

function makeSourceId(ideaSlug: string, title: string, index: number) {
  return `${ideaSlug}-source-${slugify(title)}-${index + 1}`;
}

function makeInputId(ideaSlug: string, title: string, index: number) {
  return `${ideaSlug}-input-${slugify(title)}-${index + 1}`;
}

export async function listIdeas() {
  return listOpportunityIdeas();
}

export async function getIdeaBySlug(slug: string) {
  return getOpportunityIdeaBySlug(slug);
}

export async function getIdeaById(id: string) {
  return getOpportunityIdeaById(id);
}

export async function createIdea(input: {
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
  return createOpportunityIdea(input);
}

export async function updateIdea(
  id: string,
  updates: Omit<Partial<OpportunityIdeaRecord>, "scorecard"> & {
    memoSections?: IdeaMemoSection[];
    nextValidationSteps?: string[];
    evidenceSources?: IdeaEvidenceSource[];
    researchInputs?: ResearchInput[];
    scorecard?: Partial<Omit<IdeaScorecard, "weightedTotal">>;
  },
) {
  return updateOpportunityIdea(id, updates);
}

export async function archiveIdea(id: string) {
  return archiveOpportunityIdea(id);
}

export async function promoteIdea(id: string) {
  return updateOpportunityIdea(id, { disposition: "promoted", workflowState: "approved_for_validation" });
}

export async function setIdeaFavorite(id: string, isFavorite: boolean) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("admin_idea_favorites")
    .upsert({ idea_id: id, is_favorite: isFavorite }, { onConflict: "idea_id" });

  if (error) {
    throw new Error(error.message || "Failed to persist favorite");
  }

  return { id, isFavorite };
}

export async function toggleIdeaFavorite(id: string) {
  const idea = await getIdeaById(id);
  if (!idea) return null;
  return setIdeaFavorite(id, !idea.isFavorite);
}

export async function addIdeaEvidenceSource(id: string, input: Omit<IdeaEvidenceSource, "id">) {
  const idea = await getIdeaById(id);
  if (!idea) return null;
  return updateIdea(id, {
    evidenceSources: [
      ...idea.evidenceSources,
      {
        ...input,
        id: makeSourceId(idea.slug, input.title, idea.evidenceSources.length),
      },
    ],
  });
}

export async function addIdeaResearchInput(id: string, input: Omit<ResearchInput, "id" | "createdAt">) {
  const idea = await getIdeaById(id);
  if (!idea) return null;
  return updateIdea(id, {
    researchInputs: [
      ...idea.researchInputs,
      {
        ...input,
        id: makeInputId(idea.slug, input.title, idea.researchInputs.length),
        createdAt: nowIso(),
      },
    ],
  });
}

export async function getIdeasAgentSummarySync() {
  return getIdeasSummary();
}

export async function getIdeasAgentSummary() {
  return getIdeasSummary();
}
