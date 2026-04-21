import { NextResponse } from "next/server";
import { getOpsRuns } from "@/lib/ops-admin";

export async function GET() {
  const data = await getOpsRuns();
  const agents = Object.values(
    data.runs.reduce<Record<string, {
      id: string;
      agent_name: string;
      display_name: string;
      environment: string;
      current_version: string;
      active_runs: number;
      failure_rate_7d: number;
      median_duration_7d: number;
      avg_cost_7d: number | null;
      owner: string;
      status: string;
      queue_depth: number;
    }>>((acc, run) => {
      const key = run.agent_id;
      if (!acc[key]) {
        acc[key] = {
          id: run.agent_id,
          agent_name: run.agent_name,
          display_name: run.agent_name,
          environment: run.environment,
          current_version: run.agent_version,
          active_runs: 0,
          failure_rate_7d: 0,
          median_duration_7d: run.duration_ms,
          avg_cost_7d: run.estimated_cost_usd,
          owner: run.owner,
          status: "healthy",
          queue_depth: 0,
        };
      }
      if (["running", "retrying", "queued"].includes(run.status)) acc[key].active_runs += 1;
      if (run.status === "failed") acc[key].status = "degraded";
      return acc;
    }, {})
  );

  return NextResponse.json({ agents, generatedAt: data.generatedAt });
}
