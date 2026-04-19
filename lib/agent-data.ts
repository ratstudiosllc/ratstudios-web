export type AgentRun = {
  id: string;
  project: string;
  agent: string;
  task: string;
  status: "queued" | "running" | "completed" | "failed";
  updatedAt: string;
  owner: string;
};

export const demoAgentRuns: AgentRun[] = [
  {
    id: "run_001",
    project: "StitchLogic",
    agent: "release-agent",
    task: "Prepare TestFlight build notes + changelog",
    status: "running",
    updatedAt: "2026-04-13T22:05:00Z",
    owner: "Topher",
  },
  {
    id: "run_002",
    project: "AgAlmanac",
    agent: "growth-agent",
    task: "Analyze onboarding drop-off + recommendations",
    status: "queued",
    updatedAt: "2026-04-13T21:57:00Z",
    owner: "Richard",
  },
  {
    id: "run_003",
    project: "RaT Studios",
    agent: "ops-agent",
    task: "Consolidate weekly agent execution summary",
    status: "completed",
    updatedAt: "2026-04-13T21:40:00Z",
    owner: "Topher",
  },
  {
    id: "run_004",
    project: "DoseKeeper",
    agent: "qa-agent",
    task: "Regression pass on medication reminders",
    status: "failed",
    updatedAt: "2026-04-13T21:32:00Z",
    owner: "Richard",
  },
];
