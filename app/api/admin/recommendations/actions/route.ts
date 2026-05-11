import { NextResponse } from "next/server";
import {
  applyRecommendationAction,
  listRecommendations,
  normalizeRecommendationAction,
} from "@/lib/recommendations";

function normalizeString(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const recommendationId = normalizeString(body.recommendationId);
  if (!recommendationId) {
    return NextResponse.json({ error: "recommendationId is required" }, { status: 400 });
  }

  const action = normalizeRecommendationAction(body.action);
  if (!action) {
    return NextResponse.json({ error: "Invalid recommendation action" }, { status: 400 });
  }

  try {
    const updatedRecommendation = await applyRecommendationAction({
      recommendationId,
      action,
      decisionBy: normalizeString(body.decisionBy),
      notes: normalizeString(body.notes),
    });

    return NextResponse.json({
      recommendations: listRecommendations(),
      updatedRecommendation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown recommendation action error";
    const status = message === "Recommendation not found" ? 404 : message.includes("required") || message.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
