import type { IssueTrackerResponse, TrackedIssue } from "@/lib/issues-tracker";
import type { OpsRunsResponse } from "@/lib/ops-admin";
import { getIdeasAgentSummary } from "@/lib/ideas-agent";

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
    const verifiedToday = sameMountainDay(issue.updatedAt, today);
    return verifiedToday && issue.status === "Resolved" && issue.committed === "Yes" && issue.pushed === "Yes" && issue.deployed === "Yes";
  }).length;

  return {
    label: "Issues fixed today",
    value: `${fixedToday}/${identifiedToday}`,
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

export function buildStudioKpis(ops: OpsRunsResponse | null, tracker: IssueTrackerResponse | null): StudioKpi[] {
  const currentApps = getCurrentApps();
  const futureApps = getFutureApps();
  const ideasSummary = getIdeasAgentSummary();
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
