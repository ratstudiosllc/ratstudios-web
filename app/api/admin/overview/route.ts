import { NextResponse } from "next/server";
import { getOpsRuns } from "@/lib/ops-admin";

export async function GET() {
  const data = await getOpsRuns();
  return NextResponse.json({
    kpis: data.kpis,
    alerts: data.alerts,
    activeRuns: data.runs.filter((run) =>
      ["running", "retrying", "queued"].includes(run.status)
    ),
    generatedAt: data.generatedAt,
  });
}
