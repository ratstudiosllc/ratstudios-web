import { NextResponse } from "next/server";
import { getFutureAppById, runFutureAppEvaluation } from "@/lib/future-apps-agent";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const app = getFutureAppById(id);
  if (!app) return NextResponse.json({ error: "Future app not found" }, { status: 404 });
  return NextResponse.json({ app });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "").trim();

  if (action !== "run_evaluation") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  try {
    const app = runFutureAppEvaluation(id);
    return NextResponse.json({ app });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to run future app evaluation" }, { status: 400 });
  }
}
