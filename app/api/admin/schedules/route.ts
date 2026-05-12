import { NextResponse } from "next/server";
import { getDailyRecommendationsSchedule } from "@/lib/daily-recommendations";

export async function GET() {
  try {
    return NextResponse.json({
      schedules: [await getDailyRecommendationsSchedule()],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown schedules error",
      schedules: [],
      generatedAt: new Date().toISOString(),
    }, { status: 500 });
  }
}
