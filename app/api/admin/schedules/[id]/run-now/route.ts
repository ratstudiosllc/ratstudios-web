import { NextResponse } from "next/server";
import {
  DAILY_RECOMMENDATIONS_SCHEDULE_ID,
  runDailyRecommendationsUpdate,
} from "@/lib/daily-recommendations";
import { getRunNowPayload } from "@/lib/ops-admin";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (id === DAILY_RECOMMENDATIONS_SCHEDULE_ID) {
    try {
      const result = await runDailyRecommendationsUpdate({ force: true });
      return NextResponse.json({ ok: true, ...result });
    } catch (error) {
      return NextResponse.json({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown daily recommendations error",
      }, { status: 500 });
    }
  }

  return NextResponse.json(getRunNowPayload(id));
}
