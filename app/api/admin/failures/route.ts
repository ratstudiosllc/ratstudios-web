import { NextResponse } from "next/server";
import { getOpsRuns } from "@/lib/ops-admin";

export async function GET() {
  const data = await getOpsRuns();
  const failures = data.runs.filter((run) => run.status === "failed");
  return NextResponse.json({
    failures,
    alerts: data.alerts.filter((alert) => alert.status === "open"),
    generatedAt: data.generatedAt,
  });
}
