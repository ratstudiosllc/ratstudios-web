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

export type LaunchChecklistStatus = "done" | "in_progress" | "blocked" | "not_started";
export type LaunchChecklistPriority = "Required" | "Recommended" | "Later";

export interface LaunchChecklistItem {
  id: string;
  label: string;
  status: LaunchChecklistStatus;
  priority: LaunchChecklistPriority;
  owner: string;
  note: string;
}

export interface LaunchChecklistSection {
  title: string;
  summary: string;
  items: LaunchChecklistItem[];
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
  launchChecklist?: LaunchChecklistSection[];
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
    currentFocus: "Finish launch QA now that RLS hardening, auth URLs, legal pages, email templates, and mowpro.app DNS/HTTPS are in place.",
    nextMilestone: "Complete provider/customer auth QA and manual launch checklist before public beta traffic.",
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
        "Public URL: https://mowpro.app",
        "Launch positioning is controlled free beta until Stripe billing is wired",
        "Lead with jobs, invoices, recurring customer service, and request intake",
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
        "Run provider/customer auth QA on mowpro.app",
        "Keep production deploying from main",
        "Verify login, dashboard, customers, jobs, invoices, requests, and portal flows after launch-hardening changes",
      ],
    },
    issues: {
      summary: "Track MowPro Supabase reconciliation, provider dashboard behavior, customer portal issues, and billing workflow gaps here.",
      ctaHref: "/admin/issues",
      ctaLabel: "Open issues",
    },
    launchChecklist: [
      {
        title: "Production domain and deploy",
        summary: "Make mowpro.app the canonical production home before public traffic.",
        items: [
          { id: "domain-vercel", label: "Add mowpro.app to the Vercel MowPro project", status: "done", priority: "Required", owner: "Topher", note: "mowpro.app and www.mowpro.app are attached to the Vercel MowPro project." },
          { id: "domain-dns", label: "Configure DNS and verify HTTPS for mowpro.app", status: "done", priority: "Required", owner: "Topher", note: "Cloudflare authoritative DNS resolves apex/www to 76.76.21.21 and HTTPS returns 200 for both domains." },
          { id: "deploy-local-changes", label: "Review, commit, and deploy current local launch changes", status: "done", priority: "Required", owner: "Bub", note: "Launch hardening changes have been committed and pushed through main." },
        ],
      },
      {
        title: "Supabase, auth, and security",
        summary: "Fix the production data layer before letting real users in.",
        items: [
          { id: "schema-reconcile", label: "Reconcile live Supabase schema with app-required tables and columns", status: "done", priority: "Required", owner: "Topher", note: "Schema/app column checks passed during launch hardening; final Docker db pull remains optional documentation hygiene." },
          { id: "grants-rls", label: "Fix grants/RLS permissions on newer production tables", status: "done", priority: "Required", owner: "Topher", note: "RLS and grants were hardened in production with follow-up trigger execute revokes." },
          { id: "auth-redirects", label: "Update Supabase Auth Site URL and Redirect URLs for mowpro.app", status: "done", priority: "Required", owner: "Topher", note: "Supabase Auth Site URL and redirect allowlist now include mowpro.app, www, Vercel alias, and localhost." },
          { id: "role-isolation", label: "Run provider/customer cross-account isolation test", status: "not_started", priority: "Required", owner: "Bub", note: "Still needs real browser QA: provider/provider isolation and customer portal record isolation." },
        ],
      },
      {
        title: "Launch policy, billing, and support",
        summary: "Make the public promise match what the app can actually support.",
        items: [
          { id: "legal-pages", label: "Add Privacy Policy and Terms of Service", status: "done", priority: "Required", owner: "Bub", note: "Privacy, Terms, Billing/Cancellation, and footer/legal routes are live; attorney review still recommended before paid launch." },
          { id: "support-contact", label: "Add support/contact path and footer links", status: "done", priority: "Required", owner: "Bub", note: "Support/contact path and public support email are live." },
          { id: "billing-model", label: "Choose free beta vs paid Stripe launch", status: "done", priority: "Required", owner: "Richard", note: "Decision: launch as controlled free beta first; wire Stripe after plumbing is stable." },
          { id: "auth-emails", label: "Brand Supabase invite and password reset emails", status: "done", priority: "Recommended", owner: "Topher", note: "Supabase invite, confirmation, recovery, magic-link, and email-change templates are branded for MowPro and use {{ .ConfirmationURL }}." },
        ],
      },
      {
        title: "QA, SEO, and operations",
        summary: "Finish the boring launch guardrails: workflow QA, discoverability, monitoring, and backups.",
        items: [
          { id: "workflow-qa", label: "Complete end-to-end workflow QA", status: "in_progress", priority: "Required", owner: "Bub", note: "Still outstanding: provider signup/login/logout, forgot/reset password, customer invite callback, portal, invoice PDF, estimate conversion, reports, and mobile smoke." },
          { id: "seo-metadata", label: "Improve metadata, canonical URL, social preview, sitemap/robots, and app icons", status: "done", priority: "Recommended", owner: "Bub", note: "Metadata, canonical domain, robots, sitemap, manifest, and launch smoke checks are in place." },
          { id: "monitoring", label: "Confirm backups, uptime monitoring, and production error tracking", status: "in_progress", priority: "Recommended", owner: "Topher", note: "Vercel Web Analytics is enabled. Still outstanding: Supabase backup/PITR confirmation, uptime monitoring, and optional Sentry/error tracking." },
        ],
      },
    ],
    healthNotes: [
      "Production is deployed from main",
      "mowpro.app and www.mowpro.app resolve and return HTTPS 200",
      "Supabase RLS/grants, Auth URLs, branded Auth emails, legal pages, support page, and free-beta launch copy are complete",
      "Remaining launch work is manual auth/workflow QA, Supabase backups/PITR confirmation, uptime/error monitoring, and attorney review before paid launch",
    ],
  },
  {
    slug: "expired-fda",
    name: "MedTrack",
    type: "Healthcare SaaS",
    lifecycle: "current",
    stage: "Active development",
    status: "Production deployed",
    owner: "Topher",
    href: "/admin/apps/expired-fda",
    summary: "Hospital supply chain intelligence platform for item master cleanup, expiration monitoring, FDA recall matching, receiving workflows, reports, and RFID inventory operations.",
    currentFocus: "Define and build the governed Item Master import and cleanup workflow without turning AI into a black-box data editor.",
    nextMilestone: "Stand up the Supabase-backed import foundation: batch ledger, raw row storage, mapping review, and batch health profile.",
    users: {
      summary: "Primary users are hospital materials, supply chain, inventory, IT, and compliance teams responsible for item identity, recalls, expirations, and location visibility.",
      highlights: [
        "Track item master cleanup, inventory, expiring items, recall matches, receiving, reports, and RFID usage",
        "Keep login and protected-route behavior visible",
        "Use item master quality and recall matching as core workflow proof points",
      ],
    },
    marketing: {
      summary: "Positioning should focus on cleaning the item identity foundation that makes recalls, expirations, PARs, backorders, and preference card visibility trustworthy.",
      highlights: [
        "Public URL: https://expired-fda-cyan.vercel.app",
        "Lead with governed item master cleanup, FDA recall matching, expiration visibility, and operational reporting",
        "RFID workflows can become a stronger enterprise differentiator once validated",
      ],
    },
    revenue: {
      summary: "Potential B2B healthcare SaaS with value tied to item master readiness, waste reduction, recall response speed, and compliance visibility.",
      highlights: [
        "Package around facilities, departments, inventory volume, or recall monitoring",
        "Quantify item master cleanup labor, avoided expired inventory, and recall response savings",
        "Keep production/data readiness separate from sales claims until validated",
      ],
    },
    roadmap: {
      summary: "Near-term roadmap is governed item master import/cleanup first, then enrichment, duplicate review, risk queues, and export packets.",
      highlights: [
        "Preserve raw item master files and rows before any cleanup",
        "Separate deterministic cleanup from LLM-assisted recommendations",
        "Verify inventory, expiring, recalls, reports, receiving, item master, and RFID routes after deploys",
        "Clean up audit/lint warnings deliberately instead of broad forced dependency fixes",
      ],
    },
    issues: {
      summary: "Track MedTrack production deploys, Supabase migration history, item master cleanup, protected routes, inventory workflows, recalls, reports, and RFID issues here.",
      ctaHref: "/admin/issues",
      ctaLabel: "Open issues",
    },
    launchChecklist: [
      {
        title: "Planning and product boundaries",
        summary: "Lock the workflow shape before building so MedTrack sells governance, not AI magic.",
        items: [
          { id: "item-master-agent-spec", label: "Create Item Master agent import and cleanup process guide", status: "done", priority: "Required", owner: "Bub", note: "Initial governed workflow spec exists with intake, mapping, profiling, normalization, duplicate detection, enrichment, risk, review, and export stages." },
          { id: "agent-operating-model", label: "Confirm agents are staged workflow roles, not ten independent AI products", status: "done", priority: "Required", owner: "Richard", note: "Decision: one orchestrated MedTrack backend workflow with named agent stages, selective LLM use, and auditable outputs." },
          { id: "mvp-boundary", label: "Define MVP scope for first build pass", status: "in_progress", priority: "Required", owner: "Richard / Topher", note: "Recommended MVP: Upload -> Intake -> Mapping Review -> Profile -> Normalize -> Findings -> Human Review -> Export. Duplicate detection and AccessGUDID enrichment can follow after the foundation is stable." },
          { id: "success-criteria", label: "Define pilot success criteria and demo story", status: "not_started", priority: "Required", owner: "Richard", note: "Needed: what a hospital sees after upload, which health scores matter, which exports prove value, and what must be demo-ready for Bingham-style validation." },
        ],
      },
      {
        title: "Supabase data foundation",
        summary: "Create the durable database and storage backbone before agent logic runs.",
        items: [
          { id: "storage-original-files", label: "Store original item master uploads in Supabase Storage", status: "not_started", priority: "Required", owner: "Topher", note: "Files need checksum, uploader, organization, filename, uploaded timestamp, and import batch linkage." },
          { id: "import-batch-ledger", label: "Create import batch and raw row tables", status: "not_started", priority: "Required", owner: "Topher", note: "Add item_master_import_batches, item_master_import_files, and item_master_raw_rows so raw hospital data is preserved exactly as received." },
          { id: "staged-canonical-tables", label: "Create staged canonical item master tables", status: "not_started", priority: "Required", owner: "Topher", note: "Add staged rows and column mappings so weird hospital headers map into MedTrack fields before anything is treated as clean." },
          { id: "agent-audit-tables", label: "Create agent run, evidence, findings, review, and export tables", status: "not_started", priority: "Required", owner: "Topher", note: "Add item_master_agent_runs, cleanup_findings, agent_evidence, review_decisions, export_batches, and export_rows." },
          { id: "rls-tenancy", label: "Apply organization-scoped RLS and access rules", status: "not_started", priority: "Required", owner: "Topher", note: "Every import, raw row, finding, decision, and export must be organization-scoped before pilot use." },
        ],
      },
      {
        title: "Import and profiling workflow",
        summary: "Build the user-visible upload path and first deterministic cleanup outputs.",
        items: [
          { id: "server-parser", label: "Move item master parsing to the backend", status: "not_started", priority: "Required", owner: "Topher", note: "Server-side CSV/XLSX parsing should detect sheets, header rows, row counts, blank/footer rows, and structural warnings." },
          { id: "mapping-review-ui", label: "Build field mapping review screen", status: "not_started", priority: "Required", owner: "Topher", note: "Show MedTrack field, proposed source column, confidence, samples, required/optional status, and user approval/edit controls." },
          { id: "batch-profile", label: "Generate batch health profile", status: "not_started", priority: "Required", owner: "Bub", note: "Calculate total rows, unique item numbers, duplicate counts, missing manufacturer/catalog/GTIN, implant risk, extreme cost, and initial readiness scores." },
          { id: "normalization-pass", label: "Implement safe normalization pass", status: "not_started", priority: "Required", owner: "Bub", note: "Trim whitespace, normalize match keys, normalize UOM aliases, preserve raw/display values, and create low-risk findings only." },
        ],
      },
      {
        title: "Agent orchestration and LLM layer",
        summary: "Connect MedTrack events to controlled workers so agents run from app actions, not from a separate chatbot.",
        items: [
          { id: "workflow-trigger", label: "Trigger cleanup workflow from Start Cleanup in MedTrack", status: "not_started", priority: "Required", owner: "Topher", note: "MedTrack should create an import batch, enqueue the intake job, and advance stages based on completed jobs and review gates." },
          { id: "worker-service", label: "Create worker/job service for agent stages", status: "not_started", priority: "Required", owner: "Topher", note: "Jobs should include intake.import_batch, mapping.suggest_columns, profile.batch, normalize.rows, create_findings, and generate_export." },
          { id: "model-provider", label: "Add model-provider abstraction for hosted or local LLMs", status: "not_started", priority: "Recommended", owner: "Bub", note: "Start hosted enterprise LLM for MVP, keep provider-swappable for Azure OpenAI, Bedrock, OpenAI, or later local/on-prem models." },
          { id: "confidence-gates", label: "Implement confidence thresholds and review gates", status: "not_started", priority: "Required", owner: "Bub", note: "Auto-safe only for mechanical normalization; require review for fuzzy matches, manufacturer consolidation, duplicate merge, inactivation, charge codes, and implant-impacting changes." },
        ],
      },
      {
        title: "Review, export, and validation",
        summary: "Turn findings into human-approved action packets hospitals can trust.",
        items: [
          { id: "cleanup-queues", label: "Build cleanup queue views with status and severity", status: "not_started", priority: "Required", owner: "Topher", note: "Queues should include critical implant cleanup, duplicates, missing identifiers, GTIN/UDI enrichment, manufacturer/catalog cleanup, and high-confidence safe fixes." },
          { id: "review-decisions", label: "Add approve, reject, edit, snooze, and keep-separate decisions", status: "not_started", priority: "Required", owner: "Topher", note: "Every decision needs user, timestamp, original value, suggested value, final value, evidence snapshot, confidence, and reviewer note." },
          { id: "export-package", label: "Generate MEDITECH-ready cleanup export packages", status: "not_started", priority: "Required", owner: "Bub", note: "Export only approved findings: field update CSV, duplicate workbook, missing identifier report, before/after health report, and audit packet." },
          { id: "sample-data-validation", label: "Validate against known Bingham-style item master issues", status: "not_started", priority: "Required", owner: "Richard / Bub", note: "Use prior metrics as the first realism check: duplicates, missing manufacturer/catalog, near-empty GTIN/UDI, implant rows, and unused UNSPSC/HCPCS." },
          { id: "security-review", label: "Document data handling, PHI assumptions, and hospital security posture", status: "not_started", priority: "Recommended", owner: "Richard / Topher", note: "Assume item master data is sensitive even when not PHI. Document redaction, minimal LLM payloads, audit logs, and deployment options." },
        ],
      },
    ],
    healthNotes: [
      "Production is deployed from main",
      "Supabase migration history was fetched into the repo",
      "Protected routes and login have been smoke-tested",
      "Dashboard route remains /admin/apps/expired-fda for now, but the visible product name is MedTrack",
      "Item master agent cleanup process is now tracked as a deliberate execution checklist",
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
  if (app.slug === "expired-fda") return ["Expired FDA", "MedTrack", "RaT Health"];
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
