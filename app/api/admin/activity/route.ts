import { NextResponse } from "next/server";
import { demoAgentRuns } from "@/lib/agent-data";

export async function GET() {
  return NextResponse.json({
    ok: true,
    runs: demoAgentRuns,
    note: "Demo data only. Next step: connect to Hermes run events/cron history.",
  });
}
