import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    schedules: [
      {
        id: "sched_rat_1",
        project: "RaT Studios",
        agent_name: "ops-agent",
        task_title: "Weekly agent execution summary",
        cron_expression: "0 7 * * 1",
        timezone: "America/Denver",
        environment: "prod",
        enabled: true,
        last_run_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        next_run_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
        last_status: "completed",
        owner: "Richard",
      },
    ],
    generatedAt: new Date().toISOString(),
  });
}
