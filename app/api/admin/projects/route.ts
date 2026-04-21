import { NextResponse } from "next/server";
import { getOpsRuns } from "@/lib/ops-admin";

export async function GET() {
  const data = await getOpsRuns();
  const projects = Object.values(
    data.runs.reduce<Record<string, {
      id: string;
      name: string;
      total_runs: number;
      active_runs: number;
      failures_today: number;
      total_cost: number | null;
    }>>((acc, run) => {
      const key = run.project_id;
      if (!acc[key]) {
        acc[key] = {
          id: run.project_id,
          name: run.project,
          total_runs: 0,
          active_runs: 0,
          failures_today: 0,
          total_cost: 0,
        };
      }
      acc[key].total_runs += 1;
      if (["running", "retrying", "queued"].includes(run.status)) acc[key].active_runs += 1;
      if (run.status === "failed") acc[key].failures_today += 1;
      if (acc[key].total_cost != null) {
        acc[key].total_cost = run.estimated_cost_usd == null ? null : acc[key].total_cost + run.estimated_cost_usd;
      }
      return acc;
    }, {})
  );

  return NextResponse.json({ projects, generatedAt: data.generatedAt });
}
