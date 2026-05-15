import type { AdminRecommendation } from "@/lib/recommendations";

const TIME_ZONE = "America/Denver";

function mountainDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
  };
}

export function getMountainDateSlug(date = new Date()) {
  const { year, month, day } = mountainDateParts(date);
  return `${year}-${month}-${day}`;
}

export function getNextFiveAmMountain(from = new Date()) {
  const partsFor = (date: Date) => new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const start = new Date(from.getTime() + 60_000);
  start.setUTCSeconds(0, 0);

  for (let minutes = 0; minutes <= 60 * 48; minutes += 1) {
    const candidate = new Date(start.getTime() + minutes * 60_000);
    const parts = partsFor(candidate);
    const hour = parts.find((part) => part.type === "hour")?.value;
    const minute = parts.find((part) => part.type === "minute")?.value;
    if (hour === "05" && minute === "00") return candidate.toISOString();
  }

  const fallback = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  fallback.setUTCMinutes(0, 0, 0);
  return fallback.toISOString();
}

function getMountainWeekday(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
  }).format(date);
}

function isFridayMountain(date = new Date()) {
  return getMountainWeekday(date) === "Friday";
}

function makeRecommendation(input: Omit<AdminRecommendation, "createdAt" | "updatedAt" | "status"> & { now: string; status?: AdminRecommendation["status"] }): AdminRecommendation {
  const { now, status = "recommended", ...recommendation } = input;
  return {
    ...recommendation,
    status,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildDailyRecommendations(date = new Date()): AdminRecommendation[] {
  const dateSlug = getMountainDateSlug(date);
  const now = date.toISOString();

  const recommendations = [
    makeRecommendation({
      now,
      id: `rec-${dateSlug}-recommendations-five-am-cadence`,
      slug: `${dateSlug}-recommendations-five-am-cadence`,
      title: "Run the recommendations update every morning at 5:00am Mountain",
      appProduct: "RaT Ops Admin",
      category: "ops",
      severity: "medium",
      priority: "P1",
      effort: "small",
      impact: "high",
      rationale: "The recommendations queue is only useful if it refreshes before the workday starts, while Richard and Topher still have the full day to approve, reject, or assign items.",
      riskIfIgnored: "Recommendations arrive too late, decisions slip into tomorrow, and the queue becomes a passive archive instead of an operating rhythm.",
      evidenceLinks: [
        { label: "Recommendations queue", href: "/admin/recommendations" },
        { label: "Schedules endpoint", href: "/api/admin/schedules" },
      ],
      approvalNotes: "Requested by Richard on 2026-05-12. Approved for scheduling implementation immediately.",
      implementationNotes: "Implemented as a daily cron target plus durable schedule metadata. Keep monitoring last_run_at and next_run_at so this does not become invisible automation.",
      status: "implemented",
    }),
    makeRecommendation({
      now,
      id: `rec-${dateSlug}-schedule-run-status-card`,
      slug: `${dateSlug}-schedule-run-status-card`,
      title: "Show last-run and next-run status directly on the Recommendations page",
      appProduct: "RaT Ops Admin",
      category: "UI/UX",
      severity: "medium",
      priority: "P2",
      effort: "small",
      impact: "high",
      rationale: "Operators should not have to ask whether the daily recommendation job ran. The queue itself should show the cadence, last result, and next scheduled update.",
      riskIfIgnored: "A broken daily job can go unnoticed until someone manually checks stale recommendations.",
      evidenceLinks: [
        { label: "Recommendations queue", href: "/admin/recommendations" },
        { label: "Schedules API", href: "/api/admin/schedules" },
      ],
      approvalNotes: "Recommended by the 2026-05-12 daily recommendations update.",
      implementationNotes: "Do not implement until approved. Add a compact schedule status card above the queue summary using /api/admin/schedules data.",
    }),
    makeRecommendation({
      now,
      id: `rec-${dateSlug}-recommendations-dedupe-policy`,
      slug: `${dateSlug}-recommendations-dedupe-policy`,
      title: "Add duplicate suppression so daily recommendations do not spam repeat items",
      appProduct: "RaT Ops Admin",
      category: "reliability",
      severity: "medium",
      priority: "P2",
      effort: "small",
      impact: "high",
      rationale: "A daily queue needs memory. Recommending the same unresolved item every morning will train everyone to ignore the page.",
      riskIfIgnored: "The recommendation queue fills with repeated cards, burying genuinely new risks and reducing trust in the system.",
      evidenceLinks: [
        { label: "Recommendations queue", href: "/admin/recommendations" },
      ],
      approvalNotes: "Recommended by the 2026-05-12 daily recommendations update.",
      implementationNotes: "Do not implement until approved. Add fingerprinting by app/category/title root cause and update existing open recommendations instead of inserting duplicates.",
    }),
    makeRecommendation({
      now,
      id: `rec-${dateSlug}-agalmanac-check-db-cleanup`,
      slug: `${dateSlug}-agalmanac-check-db-cleanup`,
      title: "Clean up AgAlmanac check-db so it stops reporting false missing tables",
      appProduct: "AgAlmanac",
      category: "reliability",
      severity: "medium",
      priority: "P1",
      effort: "small",
      impact: "high",
      rationale: "The Supabase verification pass showed the database is healthy, but AgAlmanac's check-db script still expects stale table names that the app no longer uses.",
      riskIfIgnored: "False migration failures waste operator time and make real database warnings easier to dismiss.",
      evidenceLinks: [
        { label: "AgAlmanac", href: "https://agalmanac.app" },
        { label: "Recommendations queue", href: "/admin/recommendations" },
      ],
      approvalNotes: "Recommended after the 2026-05-12 Supabase verification pass.",
      implementationNotes: "Do not implement until approved. Update scripts/check-db.mjs to verify rainfall_logs plus expected columns and notification preference columns instead of nonexistent rainfall_events/notification_prefs tables.",
    }),
    makeRecommendation({
      now,
      id: `rec-${dateSlug}-daily-approval-window`,
      slug: `${dateSlug}-daily-approval-window`,
      title: "Create a morning approval habit for P1 recommendations",
      appProduct: "RaT Studios",
      category: "ops",
      severity: "low",
      priority: "P3",
      effort: "small",
      impact: "medium",
      rationale: "The 5:00am update only creates value if P1 items are reviewed early enough for agents to act during the same day.",
      riskIfIgnored: "The system generates useful recommendations, but approvals still happen too late to affect daily execution.",
      evidenceLinks: [
        { label: "Recommendations queue", href: "/admin/recommendations?priority=P1&status=recommended" },
        { label: "Issues queue", href: "/admin/issues" },
      ],
      approvalNotes: "Recommended by the 2026-05-12 daily recommendations update.",
      implementationNotes: "Do not implement until approved. Consider a simple 8:00am operator review checklist or notification once the daily job has run.",
    }),
  ];

  if (isFridayMountain(date)) {
    recommendations.push(makeRecommendation({
      now,
      id: `rec-${dateSlug}-portfolio-security-audit`,
      slug: `${dateSlug}-portfolio-security-audit`,
      title: "Run the Friday portfolio security/dependency audit",
      appProduct: "RaT Studios",
      category: "security",
      severity: "medium",
      priority: "P2",
      effort: "small",
      impact: "high",
      rationale: "RaT Studios now has multiple active products and admin surfaces, so a lightweight weekly audit should catch dependency, auth, secret, and permission drift before it becomes an incident.",
      riskIfIgnored: "Dependency vulnerabilities, stale auth/RLS assumptions, leaked secrets, or overbroad permissions can sit unnoticed across the portfolio until they become production incidents.",
      evidenceLinks: [
        { label: "Dependabot security updates", href: "https://docs.github.com/en/code-security/dependabot" },
        { label: "OWASP ASVS", href: "https://owasp.org/www-project-application-security-verification-standard/" },
      ],
      approvalNotes: "Approved recommendation rec-2026-05-11-portfolio-security-audit-cadence; queued by approval workflow.",
      implementationNotes: "Friday security section: run npm audit/dependency review for each active app, note auth/RLS/permission drift, check secret exposure risk, and list the top portfolio security risks by app.",
    }));
  }

  return recommendations;
}
