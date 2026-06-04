import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type KeepaliveStatus = "healthy" | "stale" | "failing" | "unknown";

export interface SupabaseKeepaliveTarget {
  id: string;
  appName: string;
  slug: string;
  projectRef: string;
  supabaseUrl: string;
  healthUrl: string;
  schedule: string;
}

export interface SupabaseKeepaliveRow extends SupabaseKeepaliveTarget {
  status: KeepaliveStatus;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastLatencyMs: number | null;
  consecutiveFailures: number;
  response: unknown;
  error: string | null;
  updatedAt: string | null;
}

const DEFAULT_TARGETS: SupabaseKeepaliveTarget[] = [
  {
    id: "stitchlogic",
    appName: "StitchLogic",
    slug: "stitchlogic",
    projectRef: "daprwnaehmwzdauojmsh",
    supabaseUrl: "https://daprwnaehmwzdauojmsh.supabase.co",
    healthUrl: "https://www.stitchlogic.app/api/health/supabase",
    schedule: "Daily at 06:15 Mountain",
  },
  {
    id: "agalmanac",
    appName: "AgAlmanac",
    slug: "agalmanac",
    projectRef: "qysmyzxikbaslrjkhiyx",
    supabaseUrl: "https://qysmyzxikbaslrjkhiyx.supabase.co",
    healthUrl: "https://agalmanac.app/api/health/supabase",
    schedule: "Daily at 06:15 Mountain",
  },
  {
    id: "mowpro",
    appName: "MowPro",
    slug: "mowpro",
    projectRef: "nlpzynitzmrbtwfgjvlm",
    supabaseUrl: "https://nlpzynitzmrbtwfgjvlm.supabase.co",
    healthUrl: "https://mowpro.app/api/health/supabase",
    schedule: "Daily at 06:15 Mountain",
  },
  {
    id: "medtracker",
    appName: "MedTracker",
    slug: "medtracker",
    projectRef: "czyeqrrptufqlcbxnzxj",
    supabaseUrl: "https://czyeqrrptufqlcbxnzxj.supabase.co",
    healthUrl: "pending://hosted-health-endpoint-needed",
    schedule: "Not scheduled until a hosted health endpoint exists",
  },
];

function normalizeTarget(value: Partial<SupabaseKeepaliveTarget>): SupabaseKeepaliveTarget | null {
  if (!value.id || !value.appName || !value.slug || !value.projectRef || !value.supabaseUrl || !value.healthUrl) return null;
  return {
    id: value.id,
    appName: value.appName,
    slug: value.slug,
    projectRef: value.projectRef,
    supabaseUrl: value.supabaseUrl,
    healthUrl: value.healthUrl,
    schedule: value.schedule ?? "Daily at 06:15 Mountain",
  };
}

export function getSupabaseKeepaliveTargets(): SupabaseKeepaliveTarget[] {
  const raw = process.env.SUPABASE_KEEPALIVE_TARGETS;
  if (!raw) return DEFAULT_TARGETS;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TARGETS;
    const targets = parsed.map(normalizeTarget).filter((target): target is SupabaseKeepaliveTarget => Boolean(target));
    return targets.length ? targets : DEFAULT_TARGETS;
  } catch {
    return DEFAULT_TARGETS;
  }
}

function statusFromLastSuccess(lastSuccessAt: string | null, consecutiveFailures: number): KeepaliveStatus {
  if (consecutiveFailures > 0) return "failing";
  if (!lastSuccessAt) return "unknown";
  const ageMs = Date.now() - new Date(lastSuccessAt).getTime();
  if (Number.isNaN(ageMs)) return "unknown";
  return ageMs > 1000 * 60 * 60 * 24 * 3 ? "stale" : "healthy";
}

export async function getSupabaseKeepaliveRows(): Promise<SupabaseKeepaliveRow[]> {
  const targets = getSupabaseKeepaliveTargets();

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_supabase_keepalive_checks")
      .select("*")
      .order("app_name", { ascending: true });

    if (error) throw error;

    const byId = new Map((data ?? []).map((row) => [String(row.id), row]));
    return targets.map((target) => {
      const row = byId.get(target.id);
      const consecutiveFailures = Number(row?.consecutive_failures ?? 0);
      const lastSuccessAt = row?.last_success_at ?? null;
      return {
        ...target,
        appName: row?.app_name ?? target.appName,
        slug: row?.slug ?? target.slug,
        projectRef: row?.project_ref ?? target.projectRef,
        supabaseUrl: row?.supabase_url ?? target.supabaseUrl,
        healthUrl: row?.health_url ?? target.healthUrl,
        schedule: row?.schedule ?? target.schedule,
        status: statusFromLastSuccess(lastSuccessAt, consecutiveFailures),
        lastCheckedAt: row?.last_checked_at ?? null,
        lastSuccessAt,
        lastFailureAt: row?.last_failure_at ?? null,
        lastLatencyMs: row?.last_latency_ms ?? null,
        consecutiveFailures,
        response: row?.response ?? null,
        error: row?.error ?? null,
        updatedAt: row?.updated_at ?? null,
      };
    });
  } catch {
    return targets.map((target) => ({
      ...target,
      status: "unknown",
      lastCheckedAt: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastLatencyMs: null,
      consecutiveFailures: 0,
      response: null,
      error: "Admin keepalive table is not available yet",
      updatedAt: null,
    }));
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function runSupabaseKeepaliveChecks() {
  const supabase = createSupabaseAdmin();
  const secret = process.env.SUPABASE_KEEPALIVE_SECRET;
  const targets = getSupabaseKeepaliveTargets();

  const results = await Promise.all(targets.map(async (target) => {
    const startedAt = Date.now();
    const checkedAt = new Date().toISOString();
    const headers: Record<string, string> = { "user-agent": "ratstudios-supabase-keepalive/1.0" };
    if (secret) headers["x-healthcheck-secret"] = secret;

    try {
      if (!target.healthUrl.startsWith("http://") && !target.healthUrl.startsWith("https://")) {
        await supabase.from("admin_supabase_keepalive_checks").upsert({
          id: target.id,
          app_name: target.appName,
          slug: target.slug,
          project_ref: target.projectRef,
          supabase_url: target.supabaseUrl,
          health_url: target.healthUrl,
          schedule: target.schedule,
          status: "unknown",
          last_checked_at: checkedAt,
          response: null,
          error: "No hosted health endpoint configured yet",
          updated_at: checkedAt,
        }, { onConflict: "id" });

        return { id: target.id, ok: true, status: 0, latencyMs: 0, skipped: true };
      }

      const response = await fetchWithTimeout(target.healthUrl, { method: "POST", headers }, 10000);
      const latencyMs = Date.now() - startedAt;
      const body = await response.json().catch(() => null);
      const ok = response.ok && body?.ok !== false;

      const existing = await supabase
        .from("admin_supabase_keepalive_checks")
        .select("consecutive_failures")
        .eq("id", target.id)
        .maybeSingle();

      const previousFailures = Number(existing.data?.consecutive_failures ?? 0);
      const patch = {
        id: target.id,
        app_name: target.appName,
        slug: target.slug,
        project_ref: target.projectRef,
        supabase_url: target.supabaseUrl,
        health_url: target.healthUrl,
        schedule: target.schedule,
        status: ok ? "healthy" : "failing",
        last_checked_at: checkedAt,
        last_success_at: ok ? checkedAt : undefined,
        last_failure_at: ok ? undefined : checkedAt,
        last_latency_ms: latencyMs,
        consecutive_failures: ok ? 0 : previousFailures + 1,
        response: body ?? { status: response.status },
        error: ok ? null : `HTTP ${response.status}`,
        updated_at: checkedAt,
      };

      const { error } = await supabase
        .from("admin_supabase_keepalive_checks")
        .upsert(patch, { onConflict: "id" });

      if (error) throw error;

      return { id: target.id, ok, status: response.status, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - startedAt;
      const existing = await supabase
        .from("admin_supabase_keepalive_checks")
        .select("consecutive_failures")
        .eq("id", target.id)
        .maybeSingle();
      const previousFailures = Number(existing.data?.consecutive_failures ?? 0);
      const message = error instanceof Error ? error.message : "Unknown keepalive error";

      await supabase.from("admin_supabase_keepalive_checks").upsert({
        id: target.id,
        app_name: target.appName,
        slug: target.slug,
        project_ref: target.projectRef,
        supabase_url: target.supabaseUrl,
        health_url: target.healthUrl,
        schedule: target.schedule,
        status: "failing",
        last_checked_at: checkedAt,
        last_failure_at: checkedAt,
        last_latency_ms: latencyMs,
        consecutive_failures: previousFailures + 1,
        response: null,
        error: message,
        updated_at: checkedAt,
      }, { onConflict: "id" });

      return { id: target.id, ok: false, status: 0, latencyMs, error: message };
    }
  }));

  return {
    ok: results.every((result) => result.ok),
    checkedAt: new Date().toISOString(),
    results,
  };
}
