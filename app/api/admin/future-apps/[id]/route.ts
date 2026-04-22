import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getFutureAppById, runFutureAppEvaluation } from "@/lib/future-apps-agent";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const app = await getFutureAppById(id);
  if (!app) return NextResponse.json({ error: "Future app not found" }, { status: 404 });
  return NextResponse.json({ app });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const contentType = request.headers.get("content-type") ?? "";

  let action = "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    action = String(body.action ?? "").trim();
  } else {
    const formData = await request.formData().catch(() => null);
    action = String(formData?.get("action") ?? "").trim();
  }

  if (action !== "run_evaluation") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  try {
    const app = await runFutureAppEvaluation(id);

    if (!contentType.includes("application/json")) {
      redirect(`/admin/future-apps/${app.slug}`);
    }

    return NextResponse.json({ app });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to run future app evaluation" }, { status: 400 });
  }
}
