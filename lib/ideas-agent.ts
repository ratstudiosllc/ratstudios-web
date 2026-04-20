import fs from "node:fs";
import path from "node:path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const IDEAS_STORE_PATH = path.join(DATA_DIR, "ideas-store.json");

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

function buildDefaultMemoSections(idea: Pick<OpportunityIdeaRecord, "oneSentenceConcept" | "problemSolved" | "targetUser" | "bestWedge" | "businessModelGuess" | "strongestReasonToBuild" | "strongestReasonNotToBuild" | "memoSummary">): IdeaMemoSection[] {
  return [
    {
      title: "Executive summary",
      body: idea.memoSummary || idea.oneSentenceConcept || "Opportunity research has not been completed yet.",
    },
    {
      title: "Market shape",
      body: "Market framing has not been written yet. Define the category, segment, and why this market is worth looking at now.",
    },
    {
      title: "Workflow pain",
      body: idea.problemSolved || "Workflow pain has not been documented yet.",
    },
    {
      title: "Current software weaknesses",
      body: "Current software weaknesses have not been documented yet. Capture incumbent complaints, workflow friction, UX failures, and missing capabilities.",
    },
    {
      title: "How we improve it",
      body: idea.bestWedge || "Improvement wedge has not been defined yet.",
    },
    {
      title: "Revenue opportunities",
      body: idea.businessModelGuess || "Revenue model has not been outlined yet. Define pricing logic, expansion revenue, and serviceable revenue slice.",
    },
    {
      title: "Pricing structure and ARR scenarios",
      body: "Pricing and ARR scenarios have not been modeled yet. Add draft tiers, customer levels, and ARR outcomes.",
    },
    {
      title: "Recommendation",
      body: `${idea.strongestReasonToBuild || "Reason to build not yet documented."} ${idea.strongestReasonNotToBuild || "Reason not to build not yet documented."}`.trim(),
    },
  ];
}

function ensureDefaultReportStructure(memoSections: IdeaMemoSection[], fallbackIdea: Pick<OpportunityIdeaRecord, "oneSentenceConcept" | "problemSolved" | "targetUser" | "bestWedge" | "businessModelGuess" | "strongestReasonToBuild" | "strongestReasonNotToBuild" | "memoSummary">) {
  const byTitle = new Map(memoSections.map((section) => [section.title, section]));
  const defaults = buildDefaultMemoSections(fallbackIdea);
  return DEFAULT_IDEA_REPORT_SECTIONS.map((title) => byTitle.get(title) ?? defaults.find((section) => section.title === title)!).concat(
    memoSections.filter((section) => !DEFAULT_IDEA_REPORT_SECTIONS.includes(section.title as (typeof DEFAULT_IDEA_REPORT_SECTIONS)[number])),
  );
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

function normalizeIdea(idea: OpportunityIdeaRecord): OpportunityIdeaRecord {
  const scorecard = {
    ...idea.scorecard,
    weightedTotal: computeWeightedTotal(idea.scorecard),
  };

  return {
    ...idea,
    isFavorite: idea.isFavorite ?? false,
    industry: idea.industry || inferIndustry(idea),
    evidenceSources: idea.evidenceSources ?? [],
    researchInputs: idea.researchInputs ?? [],
    nextValidationSteps: idea.nextValidationSteps ?? [],
    memoSections: ensureDefaultReportStructure(idea.memoSections ?? [], idea),
    scorecard,
  };
}

const seededIdeas = [
  {
    id: "idea-self-storage-management-software",
    slug: "self-storage-management-software",
    ideaName: "Self-storage management software",
    industry: "Self storage",
    oneSentenceConcept: "Operations and revenue workflow software for independent self-storage operators who need modern automation without enterprise bloat.",
    problemSolved: "Independent self-storage owners juggle outdated property-management tools, fragmented add-ons, weak reporting, and manual tenant workflows that leak revenue and time.",
    targetUser: "Independent and small multi-site self-storage operators, especially owners with 1 to 20 facilities that are too sophisticated for spreadsheets but underserved by enterprise-heavy platforms.",
    productType: "Vertical SaaS",
    buyer: "Owner-operator, regional ops lead, or revenue manager",
    businessModelGuess: "Per-location SaaS subscription plus add-on pricing for payments, messaging, and website/leads features",
    geography: "United States first",
    whyNow: "The category is large, still fragmented across many operators, and operators increasingly expect better automation, online leasing, and occupancy/revenue visibility while legacy suites remain clunky.",
    workflowState: "scored",
    recommendation: "pursue_with_niche_focus",
    confidence: "medium",
    bestWedge: "Start with independent operators who want cleaner leasing, tenant communication, delinquency workflows, and revenue visibility without paying for bloated enterprise suites.",
    strongestReasonToBuild: "There is meaningful recurring operational pain in a real software-buying market, with room for a more operator-friendly product focused on independent facilities.",
    strongestReasonNotToBuild: "Established incumbents already own core workflows, so winning requires a sharply better niche wedge and disciplined distribution rather than a generic clone.",
    biggestRisk: "The product can sprawl into a full property-management platform too early, creating a heavy implementation burden before wedge-level differentiation is proven.",
    nextValidationSteps: [
      "Interview 8 to 12 independent operators about leasing, delinquency, payments, and reporting pain",
      "Map incumbent complaints and migration barriers across SiteLink, storEDGE, Easy Storage, and related tools",
      "Prototype one narrow workflow wedge, likely delinquency plus tenant communication or revenue/occupancy reporting"
    ],
    memoSummary: "This looks like a legitimate vertical SaaS opportunity, but only if the product enters through a focused operator pain point instead of trying to replace the whole storage stack on day one.",
    memoSections: [
      {
        title: "Executive summary",
        body: "Self-storage software is attractive because the market is large enough to matter, operator workflows are revenue-critical, and many smaller operators still feel poorly served by legacy systems. The opportunity is real, but a full-suite attack would be expensive and slow. The right v1 is a narrower operating wedge for independent facilities."
      },
      {
        title: "Market shape",
        body: "The category benefits from a big installed base of facilities and continued operator demand for online leasing, payments, automation, and occupancy optimization. It is not an empty market, but it remains fragmented because many properties are independently owned or run in small regional groups rather than controlled by a single winner."
      },
      {
        title: "Pain and competitive read",
        body: "Incumbents appear entrenched in core workflows, yet operators frequently describe them as clunky, dated, hard to customize, or overloaded with features that do not improve day-to-day execution. That creates room for a product that feels cleaner and more operationally focused, especially for smaller operators that do not want enterprise implementation baggage."
      },
      {
        title: "Recommendation",
        body: "Score this as worth pursuing with niche focus. Do not attempt a broad platform replacement first. Validate a high-friction operational wedge, prove distribution inside the independent operator segment, then expand into adjacent modules only if retention and willingness to switch are strong."
      }
    ],
    evidenceSources: [
      {
        id: "self-storage-management-software-source-ibisworld-1",
        title: "Self-Storage and Miniwarehouse Rental in the US",
        sourceType: "market_report",
        publisher: "IBISWorld",
        summary: "Used as directional support that self-storage is a large, established US category with meaningful ongoing operator spend and software relevance.",
        notes: "Treat as high-level market framing rather than exact TAM sizing inside the app unless purchased and fully reviewed.",
        accessedAt: nowIso(),
      },
      {
        id: "self-storage-management-software-source-sitelink-2",
        title: "SiteLink self-storage software",
        sourceType: "competitor",
        publisher: "SiteLink",
        url: "https://www.sitelink.com/",
        summary: "Reference incumbent platform covering core management, billing, reporting, and facility workflows.",
        notes: "Represents the kind of established but often legacy-feeling system the new wedge would need to outperform for a niche segment.",
        accessedAt: nowIso(),
      },
      {
        id: "self-storage-management-software-source-storedge-3",
        title: "storEDGE platform overview",
        sourceType: "competitor",
        publisher: "storEDGE",
        url: "https://www.storedge.com/",
        summary: "Reference incumbent with website, lead, rental, and operations tooling, indicating the market has meaningful software budgets but also bundled complexity.",
        accessedAt: nowIso(),
      }
    ],
    researchInputs: [
      {
        id: "self-storage-management-software-input-discussion-1",
        createdAt: nowIso(),
        inputType: "manual_note",
        title: "Initial opportunity discussion",
        content: "Discussion notes captured: market seems sizable, operators appear fragmented, there is growth pressure around automation and digital leasing, and legacy competitors create pain through bloated or dated workflows. Recommendation was to treat this as promising only with a focused wedge for independents.",
        status: "reviewed",
      }
    ],
    scorecard: {
      problemSeverity: 8,
      willingnessToPay: 8,
      marketSize: 8,
      marketGrowth: 6,
      competitiveIntensity: 4,
      opportunityGap: 7,
      distributionFeasibility: 5,
      productFeasibility: 6,
      defensibilityPotential: 5,
      revenuePotential: 8,
      speedToFirstRevenue: 5,
      strategicFit: 7,
      weightedTotal: 0,
    },
    disposition: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "idea-fieldops-copilot",
    slug: "fieldops-copilot",
    ideaName: "FieldOps Copilot",
    industry: "Other",
    oneSentenceConcept: "AI-assisted workflow app for small field service operators to manage scheduling, job notes, invoicing, and customer communication.",
    problemSolved: "Small service businesses juggle too many disconnected tools and manual coordination steps.",
    targetUser: "Small plumbing, HVAC, and electrical companies with 2-25 employees",
    productType: "Vertical SaaS",
    buyer: "Owner/operator",
    businessModelGuess: "Monthly subscription",
    geography: "United States",
    whyNow: "Operators increasingly expect mobile-first workflows and lighter-weight tools than bloated incumbents provide.",
    workflowState: "screening",
    recommendation: "pursue_with_niche_focus",
    confidence: "medium",
    bestWedge: "Mobile-first workflow clarity for small owner-operated field teams that hate stitched-together tools.",
    strongestReasonToBuild: "The pain is recurring, operational, and attached to buyers already spending money to patch the problem together.",
    strongestReasonNotToBuild: "This can easily become a crowded generic service software play if the niche wedge is not sharp enough.",
    biggestRisk: "Distribution could get expensive if the ICP stays too broad.",
    nextValidationSteps: ["Interview 10 owner-operators in one trade", "Compare mobile usage pain against incumbent tools", "Test a narrow launch wedge"],
    memoSummary: "Promising but only if RaT Studios narrows the wedge and proves cheaper distribution than broader field-service software categories.",
    memoSections: [
      { title: "Executive summary", body: "There is real workflow pain here, but a broad field-service category can eat small teams alive on CAC." },
      { title: "Go-to-market feasibility", body: "A niche trade wedge is likely mandatory. Generic SMB service acquisition is too expensive." },
    ],
    evidenceSources: [],
    researchInputs: [],
    scorecard: {
      problemSeverity: 8,
      willingnessToPay: 7,
      marketSize: 8,
      marketGrowth: 6,
      competitiveIntensity: 4,
      opportunityGap: 7,
      distributionFeasibility: 5,
      productFeasibility: 7,
      defensibilityPotential: 5,
      revenuePotential: 7,
      speedToFirstRevenue: 7,
      strategicFit: 7,
      weightedTotal: 0,
    },
    disposition: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "idea-family-eye-care-growth-ops",
    slug: "family-eye-care-growth-ops",
    ideaName: "Family Eye Care growth ops",
    industry: "Eye care",
    oneSentenceConcept: "Operator dashboard for local lead visibility, service-line performance, and SEO-informed growth execution.",
    problemSolved: "Clinic operators need clearer visibility into local lead generation and service-line demand without messy agency reporting.",
    targetUser: "Clinic owners and practice marketing operators",
    productType: "Healthcare marketing ops",
    workflowState: "approved_for_validation",
    recommendation: "pursue_with_niche_focus",
    confidence: "medium",
    bestWedge: "A narrow practice-growth visibility layer tailored to local eye-care service lines instead of generic agency reporting.",
    strongestReasonToBuild: "Direct stakeholder access creates a realistic path to validation.",
    strongestReasonNotToBuild: "Could collapse into custom service work instead of a repeatable product.",
    biggestRisk: "Weak repeatability across clinics if the workflow is too custom.",
    nextValidationSteps: ["Lock exact KPIs with stakeholders", "Define repeatable reporting use cases", "Stress-test productization potential"],
    memoSummary: "Worth validating because access is strong, but this should not be mistaken for a scalable product before repeatability is proven.",
    memoSections: [
      { title: "Strategic fit", body: "Strong access advantage makes this a legitimate validation candidate even if long-term product scale is uncertain." },
    ],
    evidenceSources: [],
    researchInputs: [],
    scorecard: {
      problemSeverity: 7,
      willingnessToPay: 6,
      marketSize: 5,
      marketGrowth: 5,
      competitiveIntensity: 5,
      opportunityGap: 6,
      distributionFeasibility: 8,
      productFeasibility: 7,
      defensibilityPotential: 4,
      revenuePotential: 5,
      speedToFirstRevenue: 8,
      strategicFit: 8,
      weightedTotal: 0,
    },
    disposition: "promoted",
    promotedAppSlug: "family-eye-care-growth-tools",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
] satisfies OpportunityIdeaRecord[];

const defaultIdeas: OpportunityIdeaRecord[] = seededIdeas.map((idea) => normalizeIdea(idea));

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function writeStore(data: IdeasStoreData) {
  ensureDataDir();
  fs.writeFileSync(IDEAS_STORE_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function loadStore(): IdeasStoreData {
  ensureDataDir();

  if (!fs.existsSync(IDEAS_STORE_PATH)) {
    const initial = { ideas: defaultIdeas };
    writeStore(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(IDEAS_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<IdeasStoreData>;
    const ideas = Array.isArray(parsed.ideas) ? parsed.ideas.map((idea) => normalizeIdea(idea as OpportunityIdeaRecord)) : defaultIdeas;
    return { ideas };
  } catch {
    return { ideas: defaultIdeas };
  }
}

let storeCache: IdeasStoreData | null = null;

function getStore() {
  if (!storeCache) {
    storeCache = loadStore();
  }
  return storeCache;
}

function saveIdeas(ideas: OpportunityIdeaRecord[]) {
  storeCache = { ideas: ideas.map(normalizeIdea) };
  writeStore(storeCache);
  return storeCache;
}

function updateIdeaRecord(id: string, updater: (idea: OpportunityIdeaRecord) => OpportunityIdeaRecord) {
  const store = getStore();
  const index = store.ideas.findIndex((idea) => idea.id === id);
  if (index === -1) return null;
  const updated = normalizeIdea({ ...updater(store.ideas[index]), updatedAt: nowIso() });
  const nextIdeas = [...store.ideas];
  nextIdeas[index] = updated;
  saveIdeas(nextIdeas);
  return updated;
}

export function listIdeas() {
  return [...getStore().ideas].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getIdeaBySlug(slug: string) {
  return listIdeas().find((idea) => idea.slug === slug) ?? null;
}

export function getIdeaById(id: string) {
  return getStore().ideas.find((idea) => idea.id === id) ?? null;
}

export function createIdea(input: {
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
  const timestamp = nowIso();
  const slugBase = slugify(input.ideaName);
  const slug = getIdeaBySlug(slugBase) ? `${slugBase}-${Date.now()}` : slugBase;
  const id = `idea-${slug}-${Date.now()}`;

  const record: OpportunityIdeaRecord = normalizeIdea({
    id,
    slug,
    ideaName: input.ideaName,
    industry: inferIndustry({
      slug,
      ideaName: input.ideaName,
      targetUser: input.targetUser,
      productType: input.productType,
      oneSentenceConcept: input.oneSentenceConcept,
    }),
    oneSentenceConcept: input.oneSentenceConcept,
    problemSolved: input.problemSolved,
    targetUser: input.targetUser,
    productType: input.productType,
    buyer: input.buyer,
    businessModelGuess: input.businessModelGuess,
    geography: input.geography,
    whyNow: input.whyNow,
    workflowState: "new_idea",
    recommendation: "revisit_later",
    confidence: "low",
    bestWedge: "Not scored yet",
    strongestReasonToBuild: "Research has not been completed yet.",
    strongestReasonNotToBuild: "Research has not been completed yet.",
    biggestRisk: "Unknown until opportunity research is completed.",
    nextValidationSteps: ["Run screening pass", "Map competitors", "Score the opportunity"],
    memoSummary: "New idea intake created. Opportunity research has not been completed yet.",
    memoSections: buildDefaultMemoSections({
      oneSentenceConcept: input.oneSentenceConcept,
      problemSolved: input.problemSolved,
      targetUser: input.targetUser,
      bestWedge: "Best wedge not defined yet.",
      businessModelGuess: input.businessModelGuess,
      strongestReasonToBuild: "Research has not been completed yet.",
      strongestReasonNotToBuild: "Research has not been completed yet.",
      memoSummary: "New idea intake created. Opportunity research has not been completed yet.",
    }),
    evidenceSources: [],
    researchInputs: [],
    scorecard: {
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
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  saveIdeas([record, ...getStore().ideas]);
  return record;
}

export function updateIdea(
  id: string,
  updates: Omit<Partial<OpportunityIdeaRecord>, "scorecard"> & {
    memoSections?: IdeaMemoSection[];
    nextValidationSteps?: string[];
    evidenceSources?: IdeaEvidenceSource[];
    researchInputs?: ResearchInput[];
    scorecard?: Partial<Omit<IdeaScorecard, "weightedTotal">>;
  },
) {
  return updateIdeaRecord(id, (idea) => ({
    ...idea,
    ...updates,
    scorecard: {
      ...idea.scorecard,
      ...updates.scorecard,
    },
    memoSections: updates.memoSections ?? idea.memoSections,
    nextValidationSteps: updates.nextValidationSteps ?? idea.nextValidationSteps,
    evidenceSources: updates.evidenceSources ?? idea.evidenceSources,
    researchInputs: updates.researchInputs ?? idea.researchInputs,
  }));
}

export function archiveIdea(id: string) {
  return updateIdeaRecord(id, (idea) => ({ ...idea, disposition: "archived", workflowState: "rejected" }));
}

export function promoteIdea(id: string) {
  return updateIdeaRecord(id, (idea) => ({ ...idea, disposition: "promoted", workflowState: "approved_for_validation" }));
}

export function setIdeaFavorite(id: string, isFavorite: boolean) {
  return updateIdeaRecord(id, (idea) => ({ ...idea, isFavorite }));
}

export function toggleIdeaFavorite(id: string) {
  return updateIdeaRecord(id, (idea) => ({ ...idea, isFavorite: !idea.isFavorite }));
}

export function addIdeaEvidenceSource(id: string, input: Omit<IdeaEvidenceSource, "id">) {
  return updateIdeaRecord(id, (idea) => ({
    ...idea,
    evidenceSources: [
      ...idea.evidenceSources,
      {
        ...input,
        id: makeSourceId(idea.slug, input.title, idea.evidenceSources.length),
      },
    ],
  }));
}

export function addIdeaResearchInput(id: string, input: Omit<ResearchInput, "id" | "createdAt">) {
  return updateIdeaRecord(id, (idea) => ({
    ...idea,
    researchInputs: [
      ...idea.researchInputs,
      {
        ...input,
        id: makeInputId(idea.slug, input.title, idea.researchInputs.length),
        createdAt: nowIso(),
      },
    ],
  }));
}

export function getIdeasAgentSummary() {
  const ideas = listIdeas();
  const active = ideas.filter((idea) => idea.disposition === "active");
  const latestUpdatedAt = ideas
    .map((idea) => idea.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return {
    total: ideas.length,
    active: active.length,
    archived: ideas.filter((idea) => idea.disposition === "archived").length,
    promoted: ideas.filter((idea) => idea.disposition === "promoted").length,
    newIdeas: active.filter((idea) => idea.workflowState === "new_idea").length,
    screening: active.filter((idea) => idea.workflowState === "screening").length,
    deepResearch: active.filter((idea) => idea.workflowState === "deep_research").length,
    scored: active.filter((idea) => idea.workflowState === "scored").length,
    approvedForValidation: ideas.filter((idea) => idea.workflowState === "approved_for_validation").length,
    validationInProgress: ideas.filter((idea) => idea.workflowState === "validation_in_progress").length,
    latestUpdatedAt,
    topIdeas: active.slice(0, 3),
  };
}
