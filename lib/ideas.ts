export type IdeaStatus =
  | "new_idea"
  | "screening"
  | "deep_research"
  | "scored"
  | "approved_for_validation"
  | "validation_in_progress"
  | "parked"
  | "rejected";

export interface StudioIdea {
  slug: string;
  name: string;
  concept: string;
  targetUser: string;
  category: string;
  status: IdeaStatus;
  weightedScore: number;
  recommendation: "pursue_now" | "pursue_with_niche_focus" | "revisit_later" | "do_not_pursue";
  confidence: "low" | "medium" | "high";
  bestWedge: string;
  strongestReasonToBuild: string;
  strongestReasonNotToBuild: string;
  biggestRisk: string;
  nextValidationStep: string;
  lastUpdated: string;
  sourceMemoHref?: string;
  disposition: "active" | "archived" | "promoted";
}

export const studioIdeas: StudioIdea[] = [
  {
    slug: "fieldops-copilot",
    name: "FieldOps Copilot",
    concept: "AI-assisted workflow app for small field service operators to manage scheduling, job notes, invoicing, and customer communication.",
    targetUser: "Small plumbing, HVAC, and electrical companies with 2-25 employees",
    category: "Vertical SaaS",
    status: "screening",
    weightedScore: 78,
    recommendation: "pursue_with_niche_focus",
    confidence: "medium",
    bestWedge: "Owner-operator workflow simplicity for small crews that hate stitched-together tools.",
    strongestReasonToBuild: "The workflow pain is real and recurring, with buyers who already spend money trying to patch the problem together.",
    strongestReasonNotToBuild: "Distribution could get expensive fast if the niche is too broad and undifferentiated.",
    biggestRisk: "Crowded service-business software category with lots of generic competitors.",
    nextValidationStep: "Interview 10 owner-operators in one niche trade before scoping MVP.",
    lastUpdated: "2026-04-18 08:40 MDT",
    sourceMemoHref: "/admin/ideas/fieldops-copilot",
    disposition: "active",
  },
  {
    slug: "family-eye-care-growth-ops",
    name: "Family Eye Care growth ops",
    concept: "Operator dashboard for local lead visibility, service-line performance, and SEO-informed growth execution.",
    targetUser: "Clinic owners and practice marketing operators",
    category: "Healthcare marketing ops",
    status: "approved_for_validation",
    weightedScore: 74,
    recommendation: "pursue_with_niche_focus",
    confidence: "medium",
    bestWedge: "A narrow practice-growth visibility layer tailored to local eye-care service lines instead of generic agency reporting.",
    strongestReasonToBuild: "Direct stakeholder access and concrete local marketing pain make validation realistically achievable.",
    strongestReasonNotToBuild: "Could collapse into a service dashboard instead of a scalable software product.",
    biggestRisk: "May be too custom and stakeholder-specific to become a repeatable studio product.",
    nextValidationStep: "Lock exact KPIs, lead flow, and reporting cadence with stakeholders.",
    lastUpdated: "2026-04-18 08:40 MDT",
    sourceMemoHref: "/admin/apps/family-eye-care-growth-tools",
    disposition: "promoted",
  },
  {
    slug: "creator-offer-optimizer",
    name: "Creator offer optimizer",
    concept: "Tooling to help small creators test positioning, offers, and funnels without enterprise-grade analytics overhead.",
    targetUser: "Solo creators and tiny creator businesses",
    category: "Creator tooling",
    status: "rejected",
    weightedScore: 49,
    recommendation: "do_not_pursue",
    confidence: "medium",
    bestWedge: "Simple monetization clarity for creators who hate analytics dashboards.",
    strongestReasonToBuild: "The messaging pain is real for some creators.",
    strongestReasonNotToBuild: "Weak willingness to pay plus brutally noisy distribution makes it a bad use of time.",
    biggestRisk: "Commodity market with low differentiation and high churn.",
    nextValidationStep: "Archive unless a much sharper niche wedge appears.",
    lastUpdated: "2026-04-18 08:40 MDT",
    sourceMemoHref: "/admin/ideas/creator-offer-optimizer",
    disposition: "archived",
  },
];

export function getActiveIdeas() {
  return studioIdeas.filter((idea) => idea.disposition === "active");
}

export function getArchivedIdeas() {
  return studioIdeas.filter((idea) => idea.disposition === "archived");
}

export function getPromotedIdeas() {
  return studioIdeas.filter((idea) => idea.disposition === "promoted");
}

export function getIdeasSummary() {
  const active = getActiveIdeas();
  const archived = getArchivedIdeas();
  const promoted = getPromotedIdeas();

  return {
    totalActive: active.length,
    screening: active.filter((idea) => idea.status === "screening").length,
    deepResearch: active.filter((idea) => idea.status === "deep_research").length,
    scored: active.filter((idea) => idea.status === "scored").length,
    approvedForValidation: active.filter((idea) => idea.status === "approved_for_validation").length,
    validationInProgress: active.filter((idea) => idea.status === "validation_in_progress").length,
    archived: archived.length,
    promoted: promoted.length,
    topIdeas: active.slice(0, 3),
  };
}
