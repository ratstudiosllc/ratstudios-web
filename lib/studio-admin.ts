import type { IssueTrackerResponse, TrackedIssue } from "@/lib/issues-tracker";
import type { OpsRunsResponse } from "@/lib/ops-admin";
import { getIdeasAgentSummarySync } from "@/lib/ideas-agent";

export type AppLifecycle = "current" | "future";
export type AppStage = "Live" | "Active development" | "Validating" | "Idea" | "Building" | "Paused";

export interface AppSectionSeed {
  summary: string;
  highlights: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface StudioApp {
  slug: string;
  name: string;
  type: string;
  lifecycle: AppLifecycle;
  stage: AppStage;
  status: string;
  owner: string;
  href: string;
  summary: string;
  currentFocus: string;
  nextMilestone: string;
  users: AppSectionSeed;
  marketing: AppSectionSeed;
  revenue: AppSectionSeed;
  roadmap: AppSectionSeed;
  issues: {
    summary: string;
    ctaHref?: string;
    ctaLabel?: string;
  };
  healthNotes: string[];
  pipeline?: {
    category: string;
    blocker: string;
    stageSummary?: string;
    nextSteps?: string[];
    progressNotes?: string[];
  };
}

export interface StudioKpi {
  label: string;
  value: string;
  helper: string;
}

function sameMountainDay(value: string | undefined, target: Date) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const targetParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(target);

  const getKey = (items: Intl.DateTimeFormatPart[]) => `${items.find((p) => p.type === "year")?.value}-${items.find((p) => p.type === "month")?.value}-${items.find((p) => p.type === "day")?.value}`;
  return getKey(parts) == getKey(targetParts);
}

function buildTodayIssueFixKpi(tracker: IssueTrackerResponse | null): StudioKpi {
  const today = new Date();
  const issues = tracker?.issues ?? [];
  const identifiedToday = issues.filter((issue) => sameMountainDay(issue.identified, today)).length;
  const fixedToday = issues.filter((issue) => {
    return sameMountainDay(issue.updatedAt, today)
      && issue.status == "Resolved"
      && issue.committed == "Yes"
      && issue.pushed == "Yes"
      && issue.deployed == "Yes";
  }).length;

  return {
    label: "Issues fixed today",
    value: `${identifiedToday}/${fixedToday}`,
    helper: `${identifiedToday} identified, ${fixedToday} fixed, deployed, and verified`,
  };
}

export interface AppIssueMetrics {
  total: number;
  open: number;
  resolved: number;
  blocked: number;
  p1Open: number;
  readyForQa: number;
  inProgress: number;
  latestIssue: TrackedIssue | null;
}

export const studioApps: StudioApp[] = [
  {
    slug: "stitchlogic",
    name: "StitchLogic",
    type: "iOS app",
    lifecycle: "current",
    stage: "Active development",
    status: "Healthy build pace",
    owner: "Topher",
    href: "/admin/apps/stitchlogic",
    summary: "Quilting software with active product work, TestFlight iteration, and conversion improvements in flight.",
    currentFocus: "Ship cleaner onboarding and tighten Pro conversion.",
    nextMilestone: "Next TestFlight push with conversion improvements.",
    users: {
      summary: "Growing TestFlight base with early user feedback loops.",
      highlights: [
        "Track active testers and onboarding friction",
        "Capture qualitative quilting workflow feedback",
        "Turn support and TestFlight notes into retention fixes",
      ],
    },
    marketing: {
      summary: "Acquisition motion is still forming and should live beside the product dashboard.",
      highlights: [
        "App Store positioning and conversion experiments",
        "Quilting creator partnerships and content",
        "Retention nudges after first-project completion",
      ],
    },
    revenue: {
      summary: "Subscription path exists conceptually but needs clearer operating visibility.",
      highlights: [
        "Monitor free-to-Pro funnel assumptions",
        "Keep pricing and paywall experiments visible",
        "Separate revenue planning from bug triage",
      ],
    },
    roadmap: {
      summary: "Focus on onboarding, conversion, and product quality before broader scaling.",
      highlights: [
        "Improve onboarding clarity",
        "Reduce friction in core quilting workflows",
        "Prepare stronger Pro value communication",
      ],
    },
    issues: {
      summary: "Track app bugs, release blockers, and TestFlight work without losing the broader business view.",
      ctaHref: "/admin",
      ctaLabel: "Open issue workflow",
    },
    healthNotes: [
      "Good development momentum",
      "Needs stronger acquisition loop",
      "Conversion clarity remains a key lever",
    ],
  },
  {
    slug: "agalmanac",
    name: "AgAlmanac",
    type: "Web app",
    lifecycle: "current",
    stage: "Active development",
    status: "High build urgency",
    owner: "Topher",
    href: "/admin/apps/agalmanac",
    summary: "Operational agriculture tooling with early validation and a need for tighter workflow proof.",
    currentFocus: "Tighten operator workflow and get more producers in the loop.",
    nextMilestone: "Operational field workflow and alerts worth showing live.",
    users: {
      summary: "Early operator validation is the core user signal right now.",
      highlights: [
        "Track who is validating workflows",
        "Surface support and field feedback themes",
        "Measure whether core tasks feel faster and clearer",
      ],
    },
    marketing: {
      summary: "Go-to-market motion is likely content plus direct outreach, not broad paid growth.",
      highlights: [
        "Farm and operations content cadence",
        "Direct validation outreach to producers and operators",
        "Landing page and SEO improvements for ag workflows",
      ],
    },
    revenue: {
      summary: "B2B workflow monetization is still taking shape and needs explicit tracking.",
      highlights: [
        "Clarify target customer and pricing motion",
        "Track operational value delivered in pilots",
        "Keep future paid workflow assumptions visible",
      ],
    },
    roadmap: {
      summary: "The next wins are operational credibility and enough workflow depth to demo confidently.",
      highlights: [
        "Strengthen field workflow coverage",
        "Add useful alerts and operator visibility",
        "Turn early validation into repeatable product direction",
      ],
    },
    issues: {
      summary: "Track product gaps, field tools, weather, alerts, and admin issues without making the app dashboard feel like a bug list.",
      ctaHref: "/admin",
      ctaLabel: "Open issue workflow",
    },
    healthNotes: [
      "Strong urgency, still proving workflow depth",
      "Needs more producers in the loop",
      "Marketing and validation should stay visible",
    ],
  },
  {
    slug: "storagehq",
    name: "StorageHQ",
    type: "Web app",
    lifecycle: "current",
    stage: "Active development",
    status: "Production deployed",
    owner: "Topher",
    href: "/admin/apps/storagehq",
    summary: "Storage facility management SaaS for units, customers, leases, payments, maintenance records, and tenant portal workflows.",
    currentFocus: "Stabilize production on the renamed StorageHQ stack and finish Supabase schema reconciliation once Docker is available.",
    nextMilestone: "Complete Docker-backed Supabase db pull and verify the repo schema matches production.",
    users: {
      summary: "Early product users are storage operators and tenants moving through the admin and tenant portal flows.",
      highlights: [
        "Track operator flow through dashboard, units, customers, leases, and payments",
        "Keep tenant portal login and account access visible",
        "Watch for setup friction around Supabase auth and production env vars",
      ],
    },
    marketing: {
      summary: "Positioning should stay practical: storage operators need cleaner operations, fewer spreadsheet gaps, and a simple tenant portal.",
      highlights: [
        "Public URL: https://storagehq.vercel.app",
        "Lead with unit availability, leases, payments, and maintenance tracking",
        "Rename cleanup should keep old StorageSheds links from breaking while StorageHQ becomes the brand",
      ],
    },
    revenue: {
      summary: "Revenue model is likely SaaS subscription by facility or operator, with billing not yet fully instrumented.",
      highlights: [
        "Track future Stripe setup separately from core app readiness",
        "Clarify plan tiers around facility size and tenant portal usage",
        "Do not treat seeded/demo data as revenue signal",
      ],
    },
    roadmap: {
      summary: "Near-term roadmap is production hardening, schema hygiene, and then operator-facing workflow depth.",
      highlights: [
        "Finish Supabase db pull after Docker is installed",
        "Keep Vercel production on main",
        "Validate dashboard, unit, customer, lease, payment, and tenant portal paths after each deploy",
      ],
    },
    issues: {
      summary: "Track StorageHQ production deploy, Supabase schema reconciliation, route behavior, auth, and tenant portal issues here.",
      ctaHref: "/admin/issues",
      ctaLabel: "Open issues",
    },
    healthNotes: [
      "Production is deployed from main",
      "GitHub/Vercel renamed from StorageSheds to StorageHQ",
      "Supabase db pull is still Docker-blocked",
    ],
  },
  {
    slug: "mowpro",
    name: "MowPro",
    type: "Web app",
    lifecycle: "current",
    stage: "Active development",
    status: "Production deployed",
    owner: "Topher",
    href: "/admin/apps/mowpro",
    summary: "Lawn care operations SaaS for customers, jobs, invoices, service requests, expenses, settings, and customer portal workflows.",
    currentFocus: "Keep the production app stable and finish Supabase schema reconciliation once Docker is available.",
    nextMilestone: "Complete Docker-backed Supabase db pull for the linked MowPro project.",
    users: {
      summary: "Primary users are lawn care providers managing jobs and customers, plus customers using the portal.",
      highlights: [
        "Track provider flow through customers, jobs, invoices, requests, and settings",
        "Watch customer portal request submission and invoice viewing",
        "Validate Supabase auth role routing between provider and customer experiences",
      ],
    },
    marketing: {
      summary: "Marketing should emphasize a lightweight operating system for solo and small lawn care providers.",
      highlights: [
        "Public URL: https://mowpro.vercel.app",
        "Lead with jobs, invoices, recurring customer service, and request intake",
        "Differentiate from generic invoicing tools by owning the lawn-care workflow",
      ],
    },
    revenue: {
      summary: "Likely subscription SaaS for providers, with pricing still needing packaging around customer/job volume.",
      highlights: [
        "Model simple monthly pricing for solo operators first",
        "Track invoice volume and recurring-job usage as future value signals",
        "Keep billing setup separate from current production hygiene work",
      ],
    },
    roadmap: {
      summary: "Near-term roadmap is schema hygiene, route verification, and deeper lawn care workflow polish.",
      highlights: [
        "Finish Supabase db pull after Docker is installed",
        "Keep production deploying from main",
        "Verify login, dashboard, customers, jobs, invoices, requests, and portal flows after changes",
      ],
    },
    issues: {
      summary: "Track MowPro Supabase reconciliation, provider dashboard behavior, customer portal issues, and billing workflow gaps here.",
      ctaHref: "/admin/issues",
      ctaLabel: "Open issues",
    },
    healthNotes: [
      "Production is deployed from main",
      "Supabase project is linked and migration history repaired",
      "Final db pull is still Docker-blocked",
    ],
  },
  {
    slug: "expired-fda",
    name: "Expired FDA",
    type: "Web app",
    lifecycle: "current",
    stage: "Active development",
    status: "Production deployed",
    owner: "Topher",
    href: "/admin/apps/expired-fda",
    summary: "Hospital inventory management app for expiration monitoring, FDA recall matching, receiving workflows, reports, and RFID inventory operations.",
    currentFocus: "Keep the production app stable while turning the fetched Supabase migration history into the source of truth.",
    nextMilestone: "Use the fetched migration history as the baseline and continue hardening inventory, recalls, reports, and RFID flows.",
    users: {
      summary: "Primary users are hospital inventory and materials teams responsible for expiring items, recalls, and location visibility.",
      highlights: [
        "Track inventory, expiring items, recall matches, receiving, reports, and RFID usage",
        "Keep login and protected-route behavior visible",
        "Use item master and recall matching as core workflow proof points",
      ],
    },
    marketing: {
      summary: "Positioning should focus on reducing expired inventory risk and speeding recall response for healthcare teams.",
      highlights: [
        "Public URL: https://expired-fda-cyan.vercel.app",
        "Lead with expiration visibility, FDA recall matching, and operational reporting",
        "RFID workflows can become a stronger enterprise differentiator once validated",
      ],
    },
    revenue: {
      summary: "Potential B2B healthcare SaaS with value tied to waste reduction, recall response speed, and compliance visibility.",
      highlights: [
        "Package around facilities, departments, inventory volume, or recall monitoring",
        "Quantify avoided expired inventory and recall labor savings",
        "Keep production/data readiness separate from sales claims until validated",
      ],
    },
    roadmap: {
      summary: "Near-term roadmap is production hardening, migration-source cleanup, and proving healthcare inventory workflows end to end.",
      highlights: [
        "Maintain fetched Supabase migrations in repo",
        "Verify inventory, expiring, recalls, reports, receiving, and RFID routes after deploys",
        "Clean up audit/lint warnings deliberately instead of broad forced dependency fixes",
      ],
    },
    issues: {
      summary: "Track Expired FDA production deploys, Supabase migration history, protected routes, inventory workflows, recalls, reports, and RFID issues here.",
      ctaHref: "/admin/issues",
      ctaLabel: "Open issues",
    },
    healthNotes: [
      "Production is deployed from main",
      "Supabase migration history was fetched into the repo",
      "Protected routes and login have been smoke-tested",
    ],
  },
  {
    slug: "internal-studio-ops-layer",
    name: "Internal studio ops layer",
    type: "Operations",
    lifecycle: "future",
    stage: "Building",
    status: "Admin structure in progress",
    owner: "Bub",
    href: "/admin/apps/internal-studio-ops-layer",
    summary: "Internal operating system for RaT Studios across product health, issues, growth, users, revenue, and roadmap visibility.",
    currentFocus: "Stand up per-app dashboards with clearer metrics and workflow visibility.",
    nextMilestone: "Connect richer source feeds for marketing, users, and revenue.",
    users: {
      summary: "Primary users are the internal studio operators making portfolio and execution decisions.",
      highlights: [
        "Unify studio and app views",
        "Make issues discoverable without dominating the interface",
        "Keep operating context lightweight and actionable",
      ],
    },
    marketing: {
      summary: "Even the internal ops layer should expose marketing state by app, not bury it.",
      highlights: [
        "Visibility into campaign status by app",
        "Cross-app opportunity spotting",
        "Shared studio growth checklist patterns",
      ],
    },
    revenue: {
      summary: "Revenue visibility will remain placeholder-driven until live sources are connected.",
      highlights: [
        "Show where revenue reporting should live",
        "Keep assumptions explicit and static for now",
        "Avoid fake live finance data",
      ],
    },
    roadmap: {
      summary: "This is the operating model layer the studio asked for: page one at the studio level, then app lanes beneath it.",
      highlights: [
        "Studio dashboard first",
        "Reusable app dashboards second",
        "Wire richer operational sources later",
      ],
    },
    issues: {
      summary: "Issue workflow already exists and should remain accessible while the dashboard architecture improves.",
      ctaHref: "/admin",
      ctaLabel: "Back to studio issue summary",
    },
    healthNotes: [
      "Needs better source feeds for marketing, users, and revenue",
      "Structural foundation is the priority right now",
    ],
    pipeline: {
      category: "Operations",
      blocker: "Need better source feeds for marketing/users/revenue",
      stageSummary: "Building internal operating layer",
      nextSteps: [
        "Wire better source feeds into the dashboard",
        "Replace placeholders with cleaner operational data",
        "Turn QA verification into a real gate"
      ],
      progressNotes: [
        "Admin structure is live, but still maturing into a true operating system",
        "This work is active and should be tracked like a pipeline, not just a concept"
      ],
    },
  },
];

export function getCurrentApps() {
  return studioApps.filter((app) => app.lifecycle === "current");
}

export function getFutureApps() {
  return studioApps.filter((app) => app.lifecycle === "future");
}

export function getStudioApp(slug: string) {
  return studioApps.find((app) => app.slug === slug);
}

export function groupIssuesByProject(issues: TrackedIssue[]) {
  const groups = new Map<string, TrackedIssue[]>();
  for (const issue of issues) {
    const current = groups.get(issue.project) ?? [];
    current.push(issue);
    groups.set(issue.project, current);
  }
  return groups;
}

export function getAppIssueProjectNames(app: StudioApp) {
  if (app.slug === "stitchlogic") return ["StitchLogic"];
  if (app.slug === "agalmanac") return ["AgAlmanac"];
  if (app.slug === "storagehq") return ["StorageHQ", "StorageSheds"];
  if (app.slug === "mowpro") return ["MowPro"];
  if (app.slug === "expired-fda") return ["Expired FDA", "RaT Health"];
  if (app.slug === "internal-studio-ops-layer") return ["RaT Studios"];
  return [];
}

export function getAppIssues(app: StudioApp, tracker: IssueTrackerResponse | null | undefined) {
  const projectNames = getAppIssueProjectNames(app);
  if (!tracker || projectNames.length === 0) return [];
  return tracker.issues.filter((issue) => projectNames.includes(issue.project));
}

export function getAppIssueMetrics(app: StudioApp, tracker: IssueTrackerResponse | null | undefined): AppIssueMetrics {
  const issues = getAppIssues(app, tracker);
  const sortedIssues = [...issues].sort((a, b) => {
    const aUpdated = Date.parse(a.updatedAt ?? a.identified ?? "") || 0;
    const bUpdated = Date.parse(b.updatedAt ?? b.identified ?? "") || 0;
    if (aUpdated !== bUpdated) return bUpdated - aUpdated;
    return b.number - a.number;
  });

  return {
    total: issues.length,
    open: issues.filter((issue) => issue.status !== "Resolved").length,
    resolved: issues.filter((issue) => issue.status === "Resolved").length,
    blocked: issues.filter((issue) => issue.status === "Blocked").length,
    p1Open: issues.filter((issue) => issue.priority === "P1" && issue.status !== "Resolved").length,
    readyForQa: issues.filter((issue) => issue.status === "Ready for QA").length,
    inProgress: issues.filter((issue) => issue.status === "In Progress").length,
    latestIssue: sortedIssues[0] ?? null,
  };
}

export async function buildStudioKpis(ops: OpsRunsResponse | null, tracker: IssueTrackerResponse | null): Promise<StudioKpi[]> {
  const currentApps = getCurrentApps();
  const futureApps = getFutureApps();
  const ideasSummary = await getIdeasAgentSummarySync();
  const unresolvedIssues = tracker?.counts.unresolved ?? 0;
  const p1Issues = tracker?.issues.filter((issue) => issue.priority === "P1" && issue.status !== "Resolved").length ?? 0;
  const activeRuns = ops?.runs.filter((run) => ["running", "queued", "retrying"].includes(run.status)).length ?? 0;

  return [
    {
      label: "Current apps",
      value: String(currentApps.length),
      helper: "Products in market or active development",
    },
    {
      label: "Ideas",
      value: String(ideasSummary.active),
      helper: "Research-stage concepts and scored opportunities",
    },
    {
      label: "Future apps",
      value: String(futureApps.length),
      helper: "Approved concepts and validation bets",
    },
    {
      label: "Open issues",
      value: String(unresolvedIssues),
      helper: "Across tracked current products",
    },
    {
      label: "Critical issues",
      value: String(p1Issues),
      helper: "P1 issues still unresolved",
    },
    buildTodayIssueFixKpi(tracker),
  ];
}

export function buildHealthAttentionItems(ops: OpsRunsResponse | null, tracker: IssueTrackerResponse | null) {
  const p1Issues = tracker?.issues.filter((issue) => issue.priority === "P1" && issue.status !== "Resolved").length ?? 0;
  const activeRuns = ops?.runs.filter((run) => ["running", "queued", "retrying"].includes(run.status)).length ?? 0;
  const blockedIssues = tracker?.issues.filter((issue) => issue.status === "Blocked").length ?? 0;
  const qaReadyIssues = tracker?.issues.filter((issue) => issue.status === "Ready for QA").length ?? 0;

  return [
    p1Issues > 0 ? `${p1Issues} critical issue${p1Issues === 1 ? " needs" : "s need"} attention` : "No critical issues open right now",
    blockedIssues > 0 ? `${blockedIssues} blocked issue${blockedIssues === 1 ? " is" : "s are"} waiting on intervention` : "No blocked issues right now",
    qaReadyIssues > 0 ? `${qaReadyIssues} issue${qaReadyIssues === 1 ? " is" : "s are"} ready for QA` : "Nothing is waiting on QA right now",
    activeRuns > 0 ? `${activeRuns} active run${activeRuns === 1 ? " is" : "s are"} in motion` : "No active runs right now",
    tracker?.lastUpdated ? `Issue tracker updated ${tracker.lastUpdated}` : "Issue tracker timestamp unknown",
  ];
}
