import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-gate";
import {
  archiveIdea,
  getIdeaById,
  promoteIdea,
  setIdeaFavorite,
  updateIdea,
  type IdeaConfidence,
  type IdeaEvidenceSource,
  type IdeaMemoSection,
  type IdeaRecommendation,
  type IdeaWorkflowState,
  type ResearchInput,
} from "@/lib/ideas-agent";
import { createFutureAppFromIdea } from "@/lib/future-apps-agent";

function normalize(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

function parseJsonArray<T>(value: unknown, label: string) {
  if (typeof value !== "string") throw new Error(`${label} must be a JSON string`);
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error(`${label} must be a JSON array`);
  return parsed as T[];
}

function parseStringList(value: unknown) {
  if (typeof value !== "string") return undefined;
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseScore(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(10, Math.round(number)));
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idea = getIdeaById(id);
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  return NextResponse.json({ idea });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const idea = getIdeaById(id);
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const updated = updateIdea(id, {
      ideaName: normalize(body.ideaName) ?? idea.ideaName,
      oneSentenceConcept: normalize(body.oneSentenceConcept) ?? idea.oneSentenceConcept,
      problemSolved: normalize(body.problemSolved) ?? idea.problemSolved,
      targetUser: normalize(body.targetUser) ?? idea.targetUser,
      productType: normalize(body.productType) ?? idea.productType,
      buyer: normalize(body.buyer),
      businessModelGuess: normalize(body.businessModelGuess),
      geography: normalize(body.geography),
      whyNow: normalize(body.whyNow),
      workflowState: (normalize(body.workflowState) as IdeaWorkflowState | undefined) ?? idea.workflowState,
      recommendation: (normalize(body.recommendation) as IdeaRecommendation | undefined) ?? idea.recommendation,
      confidence: (normalize(body.confidence) as IdeaConfidence | undefined) ?? idea.confidence,
      bestWedge: normalize(body.bestWedge) ?? idea.bestWedge,
      isFavorite: typeof body.isFavorite === "boolean" ? body.isFavorite : idea.isFavorite,
      strongestReasonToBuild: normalize(body.strongestReasonToBuild) ?? idea.strongestReasonToBuild,
      strongestReasonNotToBuild: normalize(body.strongestReasonNotToBuild) ?? idea.strongestReasonNotToBuild,
      biggestRisk: normalize(body.biggestRisk) ?? idea.biggestRisk,
      memoSummary: normalize(body.memoSummary) ?? idea.memoSummary,
      nextValidationSteps: parseStringList(body.nextValidationSteps) ?? idea.nextValidationSteps,
      memoSections: body.memoSections ? parseJsonArray<IdeaMemoSection>(body.memoSections, "memoSections") : idea.memoSections,
      evidenceSources: body.evidenceSources ? parseJsonArray<IdeaEvidenceSource>(body.evidenceSources, "evidenceSources") : idea.evidenceSources,
      researchInputs: body.researchInputs ? parseJsonArray<ResearchInput>(body.researchInputs, "researchInputs") : idea.researchInputs,
      scorecard: body.scorecard && typeof body.scorecard === "object"
        ? {
            problemSeverity: parseScore(body.scorecard.problemSeverity),
            willingnessToPay: parseScore(body.scorecard.willingnessToPay),
            marketSize: parseScore(body.scorecard.marketSize),
            marketGrowth: parseScore(body.scorecard.marketGrowth),
            competitiveIntensity: parseScore(body.scorecard.competitiveIntensity),
            opportunityGap: parseScore(body.scorecard.opportunityGap),
            distributionFeasibility: parseScore(body.scorecard.distributionFeasibility),
            productFeasibility: parseScore(body.scorecard.productFeasibility),
            defensibilityPotential: parseScore(body.scorecard.defensibilityPotential),
            revenuePotential: parseScore(body.scorecard.revenuePotential),
            speedToFirstRevenue: parseScore(body.scorecard.speedToFirstRevenue),
            strategicFit: parseScore(body.scorecard.strategicFit),
          }
        : undefined,
    });

    return NextResponse.json({ idea: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update idea" }, { status: 400 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idea = getIdeaById(id);
  if (!idea) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

  const contentType = request.headers.get("content-type") ?? "";
  let action = "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    action = String(body.action ?? "").trim();
  } else {
    const formData = await request.formData().catch(() => null);
    action = String(formData?.get("action") ?? "").trim();
  }

  if (action === "archive") {
    return NextResponse.json({ idea: archiveIdea(id) });
  }

  if (action === "favorite") {
    return NextResponse.json({ idea: setIdeaFavorite(id, true) });
  }

  if (action === "unfavorite") {
    return NextResponse.json({ idea: setIdeaFavorite(id, false) });
  }

  if (action === "promote") {
    const promoted = promoteIdea(id);
    if (!promoted) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }
    createFutureAppFromIdea({
      slug: promoted.slug,
      name: promoted.ideaName,
      summary: promoted.memoSummary,
      problemStatement: promoted.problemSolved,
      targetUsers: [promoted.targetUser],
      priorResearchNotes: [
        promoted.oneSentenceConcept,
        promoted.bestWedge,
        promoted.strongestReasonToBuild,
        promoted.strongestReasonNotToBuild,
      ].filter(Boolean),
      bucket: promoted.industry,
      owner: "Bub",
    });
    return NextResponse.json({ idea: promoted });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
