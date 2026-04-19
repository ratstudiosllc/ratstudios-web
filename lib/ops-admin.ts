import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type RunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "canceled"
  | "retrying";

export type AlertStatus = "open" | "resolved";
export type UserRole = "Admin" | "Operator" | "Viewer" | "ProjectOwner";
export type TriggerType = "schedule" | "manual" | "api" | "webhook";
export type Priority = "low" | "normal" | "high" | "urgent";

export interface OpsCurrentStep {
  step_index: number;
  title: string;
  status: RunStatus | "pending";
}

export interface OpsRun {
  id: string;
  project: string;
  project_id: string;
  environment: string;
  agent_name: string;
  agent_id: string;
  agent_version: string;
  task_title: string;
  owner: string;
  owner_user_id: string;
  trigger_type: TriggerType;
  status: RunStatus;
  priority: Priority;
  created_at: string;
  started_at: string | null;
  updated_at: string;
  duration_ms: number;
  retry_count: number;
  tokens_input: number;
  tokens_output: number;
  estimated_cost_usd: number;
  current_step: OpsCurrentStep | null;
  failure_category: string | null;
  failure_message: string | null;
  queue_position?: number;
}

export interface OpsRunStep {
  id: string;
  run_id: string;
  step_index: number;
  title: string;
  status: RunStatus | "pending";
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
}

export interface OpsRunLog {
  id: string;
  run_id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface OpsAlert {
  id: string;
  status: AlertStatus;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  created_at: string;
  resolved_at: string | null;
  run_id?: string;
  project_id?: string;
}

export interface WorkerHeartbeat {
  worker_id: string;
  project_id: string;
  status: "healthy" | "degraded" | "offline";
  queue_depth: number;
  active_run_id: string | null;
  active_step_title: string | null;
  last_heartbeat_at: string;
}

export interface OpsKpis {
  runsToday: number;
  successRate: number;
  failuresToday: number;
  avgDurationMs: number;
  medianDurationMs: number;
  activeRuns: number;
  queueDepth: number;
  retriesToday: number;
  totalCostToday: number;
  totalTokensToday: number;
}

export interface OpsFilters {
  search?: string;
  status?: RunStatus[];
  project?: string[];
  environment?: string[];
  trigger_type?: TriggerType[];
  owner?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: keyof OpsRun | "duration_ms" | "estimated_cost_usd";
  sortDir?: "asc" | "desc";
}

export interface OpsRunsResponse {
  kpis: OpsKpis;
  runs: OpsRun[];
  alerts: OpsAlert[];
  heartbeats: WorkerHeartbeat[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: {
    projects: string[];
    environments: string[];
    owners: string[];
    statuses: RunStatus[];
  };
  generatedAt: string;
  transport: {
    realtimePreferred: "sse" | "websocket";
    pollingFallbackSeconds: number;
    streamUrl: string;
  };
}

export interface OpsRunDetailResponse {
  run: OpsRun;
  steps: OpsRunStep[];
  logs: OpsRunLog[];
  alerts: OpsAlert[];
  artifacts: Array<{
    id: string;
    kind: string;
    title: string;
    url?: string;
    created_at: string;
  }>;
  heartbeat: WorkerHeartbeat | null;
  permissions: {
    role: UserRole;
    canRetry: boolean;
    canCancel: boolean;
    canAssign: boolean;
  };
}

type OpenClawSession = {
  key: string;
  updatedAt: number;
  ageMs?: number;
  sessionId?: string;
  systemSent?: boolean;
  abortedLastRun?: boolean;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  totalTokensFresh?: boolean;
  model?: string | null;
  modelProvider?: string | null;
  contextTokens?: number | null;
  agentId?: string | null;
  kind?: string | null;
};

type OpenClawSessionsResponse = {
  sessions?: OpenClawSession[];
};

type OpenClawStatusOverview = {
  Tasks?: string;
  Overview?: unknown;
};

type OpenClawStatusResponse = {
  overview?: OpenClawStatusOverview;
  tasks?: {
    active?: number;
    queued?: number;
    running?: number;
  };
};

type OpenClawHistoryMessage = {
  role?: string;
  text?: string;
  content?: string;
  createdAt?: number | string;
};

type OpenClawHistoryResponse = {
  messages?: OpenClawHistoryMessage[];
};

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

async function runOpenClawJson(args: string[]) {
  const { stdout } = await execFileAsync("openclaw", args, {
    cwd: "/Users/topher/workspaces/personal/ratstudios-web",
    maxBuffer: 1024 * 1024 * 8,
  });
  return JSON.parse(stdout);
}

function emptyOpsRunsResponse(): OpsRunsResponse {
  return {
    kpis: {
      runsToday: 0,
      successRate: 0,
      failuresToday: 0,
      avgDurationMs: 0,
      medianDurationMs: 0,
      activeRuns: 0,
      queueDepth: 0,
      retriesToday: 0,
      totalCostToday: 0,
      totalTokensToday: 0,
    },
    runs: [],
    alerts: [],
    heartbeats: [],
    pagination: {
      page: 1,
      pageSize: 25,
      total: 0,
      totalPages: 1,
    },
    filters: {
      projects: [],
      environments: [],
      owners: [],
      statuses: [],
    },
    generatedAt: new Date().toISOString(),
    transport: {
      realtimePreferred: "sse",
      pollingFallbackSeconds: 10,
      streamUrl: "/api/admin/stream",
    },
  };
}

function inferProject(session: OpenClawSession) {
  const key = session.key.toLowerCase();
  if (key.includes("ratstudios")) return { name: "RaT Studios", id: "proj_ratstudios" };
  if (key.includes("stitchlogic")) return { name: "StitchLogic", id: "proj_stitchlogic" };
  if (key.includes("agalmanac")) return { name: "AgAlmanac", id: "proj_agalmanac" };
  if (key.includes("taryn")) return { name: "Taryn", id: "proj_taryn" };
  return { name: session.agentId || "OpenClaw", id: `proj_${(session.agentId || "openclaw").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}` };
}

function inferStatus(session: OpenClawSession): RunStatus {
  if (session.abortedLastRun) return "failed";
  const ageMs = session.ageMs ?? Number.MAX_SAFE_INTEGER;
  if (ageMs < 5 * 60 * 1000) return "running";
  if (ageMs < 30 * 60 * 1000) return "completed";
  return "completed";
}

function inferTriggerType(session: OpenClawSession): TriggerType {
  const key = session.key.toLowerCase();
  if (key.includes(":cron:")) return "schedule";
  if (key.includes(":telegram:") || key.includes(":bluebubbles:") || key.includes(":imessage:")) return "manual";
  if (key.includes(":api:")) return "api";
  return "manual";
}

function inferPriority(status: RunStatus, triggerType: TriggerType): Priority {
  if (status === "failed") return "urgent";
  if (status === "running") return "high";
  if (triggerType === "schedule") return "normal";
  return "low";
}

function buildTaskTitle(session: OpenClawSession) {
  const bits = session.key.split(":");
  const tail = bits.slice(-2).join(" • ");
  return tail.replace(/_/g, " ");
}

function mapSessionToRun(session: OpenClawSession): OpsRun {
  const updated_at = new Date(session.updatedAt).toISOString();
  const ageMs = session.ageMs ?? 0;
  const createdAt = new Date(session.updatedAt - ageMs).toISOString();
  const status = inferStatus(session);
  const triggerType = inferTriggerType(session);
  const project = inferProject(session);
  const totalTokens = session.totalTokens ?? 0;
  const inputTokens = session.inputTokens ?? Math.round(totalTokens * 0.65);
  const outputTokens = session.outputTokens ?? Math.max(0, totalTokens - inputTokens);
  return {
    id: session.sessionId || session.key,
    project: project.name,
    project_id: project.id,
    environment: "prod",
    agent_name: session.agentId || "openclaw",
    agent_id: session.agentId || "openclaw",
    agent_version: session.model || "unknown",
    task_title: buildTaskTitle(session),
    owner: session.agentId || "OpenClaw",
    owner_user_id: session.agentId || "openclaw",
    trigger_type: triggerType,
    status,
    priority: inferPriority(status, triggerType),
    created_at: createdAt,
    started_at: status === "queued" ? null : createdAt,
    updated_at,
    duration_ms: status === "running" ? ageMs : Math.max(0, Math.min(ageMs, 30 * 60 * 1000)),
    retry_count: session.abortedLastRun ? 1 : 0,
    tokens_input: inputTokens,
    tokens_output: outputTokens,
    estimated_cost_usd: Number(((inputTokens + outputTokens) / 1_000_000 * 2.5).toFixed(2)),
    current_step: status === "running"
      ? { step_index: 1, title: "Active OpenClaw session", status: "running" }
      : null,
    failure_category: session.abortedLastRun ? "aborted" : null,
    failure_message: session.abortedLastRun ? "Session aborted during last run." : null,
    queue_position: status === "queued" ? 1 : 0,
  };
}

function applyFilters(runs: OpsRun[], filters: OpsFilters) {
  let result = [...runs];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (run) =>
        run.id.toLowerCase().includes(q) ||
        run.task_title.toLowerCase().includes(q) ||
        run.project.toLowerCase().includes(q) ||
        run.agent_name.toLowerCase().includes(q) ||
        run.owner.toLowerCase().includes(q)
    );
  }

  if (filters.status?.length) result = result.filter((run) => filters.status?.includes(run.status));
  if (filters.project?.length) result = result.filter((run) => filters.project?.includes(run.project));
  if (filters.environment?.length) result = result.filter((run) => filters.environment?.includes(run.environment));
  if (filters.trigger_type?.length) result = result.filter((run) => filters.trigger_type?.includes(run.trigger_type));
  if (filters.owner?.length) result = result.filter((run) => filters.owner?.includes(run.owner));

  const sortBy = filters.sortBy ?? "updated_at";
  const sortDir = filters.sortDir ?? "desc";

  result.sort((a, b) => {
    const aValue = a[sortBy as keyof OpsRun] ?? "";
    const bValue = b[sortBy as keyof OpsRun] ?? "";
    if (typeof aValue === "number" && typeof bValue === "number") return sortDir === "asc" ? aValue - bValue : bValue - aValue;
    return sortDir === "asc" ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
  });

  return result;
}

async function loadSessions(): Promise<OpenClawSession[]> {
  try {
    const json = (await runOpenClawJson(["sessions", "--all-agents", "--json"])) as OpenClawSessionsResponse;
    return (json.sessions ?? []).filter((session) => !session.key.includes(":run:"));
  } catch {
    return [];
  }
}

async function loadStatus(): Promise<OpenClawStatusResponse | null> {
  try {
    return (await runOpenClawJson(["status", "--json"])) as OpenClawStatusResponse;
  } catch {
    return null;
  }
}

export async function getOpsRuns(filters: OpsFilters = {}): Promise<OpsRunsResponse> {
  const [sessions, status] = await Promise.all([loadSessions(), loadStatus()]);
  const runs = sessions.map(mapSessionToRun);
  const filtered = applyFilters(runs, filters);
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, filters.pageSize ?? 25));
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const today = new Date();
  const isToday = (value: string) => new Date(value).toDateString() === today.toDateString();
  const todaysRuns = runs.filter((run) => isToday(run.created_at));
  const completedDurations = todaysRuns.filter((run) => run.status === "completed").map((run) => run.duration_ms);
  const queueDepth = status?.tasks?.queued ?? runs.filter((run) => run.status === "queued").length;
  const activeRuns = runs.filter((run) => ["running", "retrying"].includes(run.status)).length;
  const alerts: OpsAlert[] = runs.filter((run) => run.status === "failed").slice(0, 10).map((run) => ({
    id: `alert_${run.id}`,
    status: "open",
    severity: "critical",
    title: `${run.project} run failed`,
    description: run.failure_message || `${run.task_title} failed or was aborted.`,
    created_at: run.updated_at,
    resolved_at: null,
    run_id: run.id,
    project_id: run.project_id,
  }));
  const heartbeats: WorkerHeartbeat[] = [
    {
      worker_id: "openclaw-gateway",
      project_id: "proj_ratstudios",
      status: "healthy",
      queue_depth: queueDepth,
      active_run_id: runs.find((run) => run.status === "running")?.id ?? null,
      active_step_title: runs.find((run) => run.status === "running")?.current_step?.title ?? null,
      last_heartbeat_at: new Date().toISOString(),
    },
  ];

  return {
    kpis: {
      runsToday: todaysRuns.length,
      successRate: todaysRuns.length ? Number(((todaysRuns.filter((run) => run.status === "completed").length / todaysRuns.length) * 100).toFixed(1)) : 0,
      failuresToday: todaysRuns.filter((run) => run.status === "failed").length,
      avgDurationMs: completedDurations.length ? Math.round(completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length) : 0,
      medianDurationMs: median(completedDurations),
      activeRuns,
      queueDepth,
      retriesToday: todaysRuns.reduce((sum, run) => sum + run.retry_count, 0),
      totalCostToday: Number(todaysRuns.reduce((sum, run) => sum + run.estimated_cost_usd, 0).toFixed(2)),
      totalTokensToday: todaysRuns.reduce((sum, run) => sum + run.tokens_input + run.tokens_output, 0),
    },
    runs: paged,
    alerts,
    heartbeats,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    },
    filters: {
      projects: [...new Set(runs.map((run) => run.project))],
      environments: [...new Set(runs.map((run) => run.environment))],
      owners: [...new Set(runs.map((run) => run.owner))],
      statuses: [...new Set(runs.map((run) => run.status))],
    },
    generatedAt: new Date().toISOString(),
    transport: {
      realtimePreferred: "sse",
      pollingFallbackSeconds: 10,
      streamUrl: "/api/admin/stream",
    },
  };
}

export async function getOpsRunDetail(id: string): Promise<OpsRunDetailResponse | null> {
  const sessions = await loadSessions();
  const session = sessions.find((item) => (item.sessionId || item.key) === id);
  if (!session) return null;

  const run = mapSessionToRun(session);
  let history: OpenClawHistoryResponse | null = null;
  try {
    history = (await runOpenClawJson(["session", "history", run.id, "--json", "--limit", "20"])) as OpenClawHistoryResponse;
  } catch {
    history = null;
  }

  const logs: OpsRunLog[] = (history?.messages ?? []).slice(-20).map((message, index) => ({
    id: `${run.id}_log_${index}`,
    run_id: run.id,
    timestamp: typeof message.createdAt === "number" ? new Date(message.createdAt).toISOString() : typeof message.createdAt === "string" ? new Date(message.createdAt).toISOString() : run.updated_at,
    level: message.role === "assistant" ? "info" : "debug",
    message: (message.text || message.content || message.role || "message").slice(0, 400),
  }));

  return {
    run,
    steps: [
      {
        id: `${run.id}_step_1`,
        run_id: run.id,
        step_index: 1,
        title: run.status === "running" ? "Session active" : "Session complete",
        status: run.status,
        started_at: run.started_at,
        completed_at: run.status === "running" ? null : run.updated_at,
        duration_ms: run.duration_ms || null,
      },
    ],
    logs,
    alerts: run.status === "failed" ? [{
      id: `alert_${run.id}`,
      status: "open",
      severity: "critical",
      title: `${run.project} run failed`,
      description: run.failure_message || "OpenClaw session failed.",
      created_at: run.updated_at,
      resolved_at: null,
      run_id: run.id,
      project_id: run.project_id,
    }] : [],
    artifacts: [
      {
        id: `artifact_${run.id}`,
        kind: "session",
        title: "OpenClaw session record",
        created_at: run.updated_at,
      },
    ],
    heartbeat: {
      worker_id: "openclaw-gateway",
      project_id: run.project_id,
      status: "healthy",
      queue_depth: 0,
      active_run_id: run.status === "running" ? run.id : null,
      active_step_title: run.current_step?.title ?? null,
      last_heartbeat_at: new Date().toISOString(),
    },
    permissions: {
      role: "Admin",
      canRetry: false,
      canCancel: false,
      canAssign: false,
    },
  };
}

export function getRunNowPayload(scheduleId: string) {
  return {
    ok: false,
    scheduleId,
    message: "Run-now is not wired yet. Next step is TaskFlow/OpenClaw schedule execution.",
  };
}

export function createOpsEvent(event: string, data: Record<string, unknown>) {
  return `event: ${event}\ndata: ${JSON.stringify({ type: event, ...data, timestamp: new Date().toISOString() })}\n\n`;
}
