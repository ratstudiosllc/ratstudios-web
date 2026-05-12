import { NextResponse } from "next/server";
import { runDailyRecommendationsUpdate } from "@/lib/daily-recommendations";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1" || url.searchParams.get("force") === "true";
  const dateParam = url.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const result = await runDailyRecommendationsUpdate({ force, date });
    return NextResponse.json({ ok: true, ...result, generatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown daily recommendations error",
    }, { status: 500 });
  }
}
