import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { buildDailyRecommendations, getNextFiveAmMountain } from "@/lib/recommendation-generator";
import { upsertRecommendations } from "@/lib/recommendations";

export const DAILY_RECOMMENDATIONS_SCHEDULE_ID = "00000000-0000-4000-8000-000000000501";
export const DAILY_RECOMMENDATIONS_CRON = "0 5 * * *";
export const DAILY_RECOMMENDATIONS_TIMEZONE = "America/Denver";

function isFiveAmMountain(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DAILY_RECOMMENDATIONS_TIMEZONE,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  return parts.find((part) => part.type === "hour")?.value === "05";
}

async function ensureSchedule(status: "completed" | "failed" | "pending", now: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("admin_schedules").upsert({
    id: DAILY_RECOMMENDATIONS_SCHEDULE_ID,
    owner_user_id: "b0ef78e8-d78f-43d7-b354-89d425be29f8",
    project: "RaT Studios",
    agent_name: "bub-recommendations-agent",
    task_title: "Daily recommendations update",
    cron_expression: DAILY_RECOMMENDATIONS_CRON,
    timezone: DAILY_RECOMMENDATIONS_TIMEZONE,
    environment: "prod",
    enabled: true,
    owner_label: "Richard",
    task_payload: {
      route: "/api/cron/daily-recommendations",
      purpose: "Generate the daily recommendations queue before the workday starts.",
      cadence: "Every day at 5:00am Mountain",
    },
    last_run_at: status === "pending" ? null : now,
    next_run_at: getNextFiveAmMountain(new Date(now)),
    last_status: status,
    updated_at: now,
  }, { onConflict: "id" });

  if (error) throw new Error(error.message);
}

export async function getDailyRecommendationsSchedule() {
  const now = new Date().toISOString();
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_schedules")
    .select("*")
    .eq("id", DAILY_RECOMMENDATIONS_SCHEDULE_ID)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return data;

  await ensureSchedule("pending", now);
  const { data: created, error: createdError } = await supabase
    .from("admin_schedules")
    .select("*")
    .eq("id", DAILY_RECOMMENDATIONS_SCHEDULE_ID)
    .single();
  if (createdError) throw new Error(createdError.message);
  return created;
}

export async function runDailyRecommendationsUpdate(options: { force?: boolean; date?: Date } = {}) {
  const runDate = options.date ?? new Date();
  if (!options.force && !isFiveAmMountain(runDate)) {
    return {
      skipped: true,
      reason: "Not 5:00am in America/Denver.",
      inserted: 0,
      recommendations: [],
    };
  }

  const now = runDate.toISOString();
  try {
    const recommendations = buildDailyRecommendations(runDate);
    const result = await upsertRecommendations(recommendations);
    await ensureSchedule("completed", now);

    return {
      skipped: false,
      inserted: result.count,
      recommendations,
      scheduleId: DAILY_RECOMMENDATIONS_SCHEDULE_ID,
      nextRunAt: getNextFiveAmMountain(runDate),
    };
  } catch (error) {
    await ensureSchedule("failed", now).catch(() => undefined);
    throw error;
  }
}
