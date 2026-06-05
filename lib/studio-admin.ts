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

export interface AppPlatformWorkstream {
  id: string;
  title: string;
  summary: string;
  status: string;
  owner: string;
  currentFocus: string;
  nextMilestone: string;
  checklist: LaunchChecklistSection[];
}

export interface SupabaseAccountAccess {
  accountName: string;
  email: string;
  role: string;
  status: string;
  note?: string;
}

export interface AppOperations {
  vercelWebLink: string;
  vercelProjectName?: string;
  supabaseProjectRef?: string;
  supabaseUrl?: string;
  supabaseOrgName?: string;
  supabaseAccounts: SupabaseAccountAccess[];
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
  operations?: AppOperations;
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
  platformWorkstreams?: AppPlatformWorkstream[];
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
    operations: {
      vercelWebLink: "https://www.stitchlogic.app",
      vercelProjectName: "stitchlogic-web",
      supabaseProjectRef: "daprwnaehmwzdauojmsh",
      supabaseUrl: "https://daprwnaehmwzdauojmsh.supabase.co",
      supabaseOrgName: "RAT Software",
      supabaseAccounts: [
        { accountName: "RAT Software", email: "admin@ratsoftware.net", role: "Owner/admin", status: "Confirmed from Supabase screenshot", note: "CLI token can see StitchLogic in this org." },
        { accountName: "Richard access", email: "rca81@yahoo.com", role: "Access unknown", status: "Needs confirmation", note: "Richard's known Apple/TestFlight email; verify Supabase membership before relying on it." },
      ],
    },
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
    operations: {
      vercelWebLink: "https://agalmanac.app",
      vercelProjectName: "agalmanac",
      supabaseProjectRef: "qysmyzxikbaslrjkhiyx",
      supabaseUrl: "https://qysmyzxikbaslrjkhiyx.supabase.co",
      supabaseOrgName: "RAT Software",
      supabaseAccounts: [
        { accountName: "RAT Software", email: "admin@ratsoftware.net", role: "Owner/admin", status: "Confirmed from Supabase screenshot", note: "CLI token can see AgAlmanac in this org." },
        { accountName: "Richard access", email: "Needs confirmation", role: "Access unknown", status: "Needs confirmation" },
      ],
    },
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
    operations: {
      vercelWebLink: "https://storagehq.vercel.app",
      vercelProjectName: "storagehq",
      supabaseProjectRef: "vijvlyxkhrkmohhojhww",
      supabaseUrl: "https://vijvlyxkhrkmohhojhww.supabase.co",
      supabaseOrgName: "RaT_Test #3",
      supabaseAccounts: [
        { accountName: "RaT_Test #3", email: "rca81@yahoo.com", role: "Owner", status: "Confirmed from Supabase screenshot", note: "Free/Nano Supabase account shown on StorageHQ project screen." },
        { accountName: "Topher access", email: "Needs confirmation", role: "Access unknown", status: "Needs confirmation" },
      ],
    },
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
    operations: {
      vercelWebLink: "https://mowpro.app",
      vercelProjectName: "mowpro",
      supabaseProjectRef: "nlpzynitzmrbtwfgjvlm",
      supabaseUrl: "https://nlpzynitzmrbtwfgjvlm.supabase.co",
      supabaseOrgName: "RaT_Test #2",
      supabaseAccounts: [
        { accountName: "RaT_Test #2", email: "richardashcraftwork@gmail.com", role: "Owner", status: "Confirmed from Supabase screenshot", note: "Profile label rca1981; Free/Nano Supabase account shown with MowPro." },
        { accountName: "Topher access", email: "Needs confirmation", role: "Access unknown", status: "Needs confirmation" },
      ],
    },
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
    platformWorkstreams: [
      {
        id: "web-app",
        title: "Web app",
        summary: "The hosted Next.js/Supabase product remains the source of truth for shared MowPro workflows, data, auth, and launch polish.",
        status: "Production deployed",
        owner: "Topher / Bub",
        currentFocus: "Keep launch QA, customer/provider auth, billing posture, and mobile web cleanup moving without mixing it with native iOS shell work.",
        nextMilestone: "Complete manual provider/customer QA and mobile card-layout cleanup on the highest-traffic data views.",
        checklist: [
          {
            title: "Shared product and web launch",
            summary: "Tasks that affect both browser users and the Apple app because the iOS shell loads the hosted product.",
            items: [
              { id: "web-provider-customer-qa", label: "Finish provider/customer auth and workflow QA", status: "in_progress", priority: "Required", owner: "Bub", note: "Covers signup/login/logout, forgot/reset password, customer invite callback, portal, invoice PDF, estimates, reports, and mobile smoke." },
              { id: "web-mobile-card-layouts", label: "Replace priority mobile tables with card views", status: "not_started", priority: "Required", owner: "Bub", note: "Jobs, customers, invoices, estimates, and expenses need iPhone-friendly cards before App Store screenshots and review." },
              { id: "web-monitoring-backups", label: "Confirm production monitoring and Supabase backup posture", status: "in_progress", priority: "Recommended", owner: "Topher", note: "Vercel Analytics is enabled; uptime monitoring, error tracking, and Supabase PITR/backup confirmation still need final verification." },
            ],
          },
        ],
      },
      {
        id: "apple-app",
        title: "Apple app",
        summary: "The Capacitor iOS version should be treated as a native field-work app with real iPhone capabilities, not just a web wrapper.",
        status: "Native shell scaffolded",
        owner: "Bub",
        currentFocus: "Native iOS shell, deep-link foundation, invoice share bridge, photo upload foundation, push token registration, and mobile card cleanup are implemented locally. Production is held until Supabase migration access is available.",
        nextMilestone: "Apply the native-app Supabase migration, fix local Xcode/CoreSimulator tooling, archive the app, and run TestFlight QA on a real iPhone.",
        checklist: [
          {
            title: "Capacitor shell",
            summary: "Create the iOS project and native wrapper foundation.",
            items: [
              { id: "ios-capacitor-shell", label: "Add Capacitor dependencies, config, and iOS project", status: "done", priority: "Required", owner: "Bub", note: "Capacitor 8 iOS shell exists with bundle ID ai.ratstudios.mowpro and hosted server URL https://mowpro.app." },
              { id: "ios-build-smoke", label: "Run local web build and iOS sync smoke", status: "blocked", priority: "Required", owner: "Bub", note: "Web/admin builds pass and Capacitor sync passes. Local xcodebuild validation is blocked by CoreSimulator/Xcode component mismatch on the Mac." },
            ],
          },
          {
            title: "Native App Store value",
            summary: "Native features that make MowPro an iPhone field-service app instead of a repackaged website.",
            items: [
              { id: "ios-deep-links", label: "Add universal links and app deep-link routing", status: "done", priority: "Required", owner: "Bub", note: "Added mowpro:// URL scheme, Associated Domains entitlement, app URL listener, and apple-app-site-association route. Production still needs real APPLE_TEAM_ID." },
              { id: "ios-pdf-share", label: "Add native invoice/estimate PDF share bridge", status: "in_progress", priority: "Required", owner: "Bub", note: "Invoice PDF sharing now uses native iOS share sheet. Estimate sharing remains open because the web app does not yet have an estimate PDF generator." },
              { id: "ios-camera-photos", label: "Add camera/photo upload workflow", status: "in_progress", priority: "Required", owner: "Bub", note: "Added local migration, Camera plugin workflow, and upload buttons on job edit and expense records. Production needs Supabase migration access before deploy." },
              { id: "ios-push-reminders", label: "Add push notification foundation", status: "in_progress", priority: "Required", owner: "Bub", note: "Added Push Notifications plugin, permission/register UI, and provider_push_tokens persistence. Production needs Supabase migration access and scheduled APNs sending pipeline." },
            ],
          },
          {
            title: "App Store submission",
            summary: "Review-facing materials and QA needed after native features exist.",
            items: [
              { id: "ios-review-notes", label: "Write App Review notes around native field-work features", status: "done", priority: "Required", owner: "Bub", note: "AppStore metadata, privacy reference, icon brief, review notes, and submission checklist are drafted in the MowPro repo." },
              { id: "ios-testflight-qa", label: "Run TestFlight QA on real iPhone", status: "not_started", priority: "Required", owner: "Topher / Richard", note: "Verify auth, deep links, permissions, PDF sharing, photo upload, notifications, keyboard behavior, and weak-signal field workflow." },
            ],
          },
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
    operations: {
      vercelWebLink: "https://expired-fda-cyan.vercel.app",
      vercelProjectName: "expired-fda",
      supabaseProjectRef: "czyeqrrptufqlcbxnzxj",
      supabaseUrl: "https://czyeqrrptufqlcbxnzxj.supabase.co",
      supabaseOrgName: "RaT_Test #2",
      supabaseAccounts: [
        { accountName: "RaT_Test #2", email: "richardashcraftwork@gmail.com", role: "Owner", status: "Confirmed from Supabase screenshot", note: "Profile label rca1981; Supabase project is named RaT Health." },
        { accountName: "Topher access", email: "Needs confirmation", role: "Access unknown", status: "Needs confirmation" },
      ],
    },
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
          { id: "mvp-boundary", label: "Define MVP scope for first build pass", status: "done", priority: "Required", owner: "Richard / Topher", note: "Decision: MVP starts with Upload -> Intake -> Mapping Review -> Batch Health Profile -> Safe Normalization -> Cleanup Findings -> Human Review -> Export. Duplicate detection and AccessGUDID enrichment can follow after the foundation is stable." },
          { id: "success-criteria", label: "Define pilot success criteria and demo story", status: "done", priority: "Required", owner: "Richard", note: "Decision: pilot demo must show what was uploaded, how bad the item master is, what to fix first, the cleanup packet outputs, and the guardrails MedTrack will not bypass silently." },
        ],
      },
      {
        title: "Supabase data foundation",
        summary: "Create the durable database and storage backbone before agent logic runs.",
        items: [
          { id: "storage-original-files", label: "Store original item master uploads in Supabase Storage", status: "done", priority: "Required", owner: "Topher", note: "Complete: production Supabase has the private item-master-imports bucket plus import batch/file ledger tables. MedTrack archives original files with checksum, organization, uploader, filename, size, MIME type, and storage path before importing parsed rows." },
          { id: "import-batch-ledger", label: "Create import batch and raw row tables", status: "done", priority: "Required", owner: "Topher", note: "Complete: production Supabase has item_master_import_batches, item_master_import_files, and item_master_raw_rows. Uploads now store row-level raw values/raw objects under the import batch before writing operational item_master rows." },
          { id: "staged-canonical-tables", label: "Create staged canonical item master tables", status: "done", priority: "Required", owner: "Topher", note: "Complete: production Supabase has item_master_column_mappings and item_master_staged_rows for mapping hospital headers into MedTrack's staged canonical shape before cleanup decisions." },
          { id: "agent-audit-tables", label: "Create agent run, evidence, findings, review, and export tables", status: "done", priority: "Required", owner: "Topher", note: "Complete: production Supabase has agent runs/events, cleanup findings, agent evidence, review decisions, export batches, and export rows for governed recommendations and cleanup packets." },
          { id: "rls-tenancy", label: "Apply organization-scoped RLS and access rules", status: "done", priority: "Required", owner: "Topher", note: "Complete: production Supabase now uses organization-member policies for import batches, files, raw rows, column mappings, staged rows, agent runs/events, findings, evidence, review decisions, exports, and item-master import storage paths." },
        ],
      },
      {
        title: "Import and profiling workflow",
        summary: "Build the user-visible upload path and first deterministic cleanup outputs.",
        items: [
          { id: "server-parser", label: "Move item master parsing to the backend", status: "done", priority: "Required", owner: "Topher", note: "Complete: MedTrack now archives the original upload, parses workbook sheets/header rows on the server, stores immutable raw rows, creates suggested mappings, stages canonical rows, and returns preview/warnings to the upload UI." },
          { id: "mapping-review-ui", label: "Build field mapping review screen", status: "done", priority: "Required", owner: "Topher", note: "Complete: upload review now shows proposed source column, confidence, sample values, required/optional status, and an explicit Approve Mapping gate before import actions unlock." },
          { id: "batch-profile", label: "Generate batch health profile", status: "done", priority: "Required", owner: "Bub", note: "Complete: MedTrack now generates a deterministic Profiling Agent run for each parsed batch, calculating raw/staged rows, unique and duplicate item numbers, missing manufacturer/catalog/GTIN/UNSPSC, implant identifier gaps, cost outliers, top issues, and a readiness score." },
          { id: "normalization-pass", label: "Implement safe normalization pass", status: "done", priority: "Required", owner: "Bub", note: "Complete: MedTrack now runs a deterministic Normalization Agent after profiling, creates safe normalized match keys for item/vendor/manufacturer/catalog/GTIN/UOM values, preserves raw/display values, and creates capped low-risk findings for high-confidence safe fixes." },
        ],
      },
      {
        title: "Agent orchestration and LLM layer",
        summary: "Connect MedTrack events to controlled workers so agents run from app actions, not from a separate chatbot.",
        items: [
          { id: "workflow-trigger", label: "Trigger cleanup workflow from Start Cleanup in MedTrack", status: "done", priority: "Required", owner: "Topher", note: "Complete: MedTrack now separates file intake from cleanup execution. Upload/import stages the batch, then the Start Cleanup action runs Profiling and Normalization agent stages, writes audit events, updates batch status, and creates safe findings." },
          { id: "worker-service", label: "Create worker/job service for agent stages", status: "done", priority: "Required", owner: "Topher", note: "Complete: production Supabase now has item_master_agent_jobs, cleanup batch statuses, and MedTrack Start Cleanup creates a durable job before running Profiling and Normalization stages with queued/running/completed/failed tracking." },
          { id: "model-provider", label: "Add model-provider abstraction for hosted or local LLMs", status: "done", priority: "Recommended", owner: "Bub", note: "Complete: MedTrack now has a provider-swappable model layer with disabled-by-default MVP posture, redaction helper, and placeholders for OpenAI, Azure OpenAI, Bedrock, and local/on-prem adapters." },
          { id: "confidence-gates", label: "Implement confidence thresholds and review gates", status: "done", priority: "Required", owner: "Bub", note: "Complete: confidence gate policy now classifies cleanup actions as auto-safe, review-required, or blocked. Safe normalization findings carry review gate metadata into suggested values." },
        ],
      },
      {
        title: "Review, export, and validation",
        summary: "Turn findings into human-approved action packets hospitals can trust.",
        items: [
          { id: "cleanup-queues", label: "Build cleanup queue views with status and severity", status: "done", priority: "Required", owner: "Topher", note: "Complete: Item Master Cleanup report now reads live Supabase findings for the latest batch, summarizes queue counts by status/severity, and filters findings by severity, status, and text." },
          { id: "review-decisions", label: "Add approve, reject, edit, snooze, and keep-separate decisions", status: "done", priority: "Required", owner: "Topher", note: "Complete: reviewers can approve, reject, snooze, or keep-separate findings from the cleanup report; decisions write item_master_review_decisions with user, values, evidence snapshot, and status updates." },
          { id: "export-package", label: "Generate MedTrack Item Master Cleanup Packet", status: "done", priority: "Required", owner: "Bub", note: "Complete: approved findings can generate a cleanup packet with Cleanup Findings CSV, Missing Identifier Report, and Before/After Health Summary, backed by export batch and export row audit tables." },
          { id: "sample-data-validation", label: "Validate against known Bingham-style item master issues", status: "done", priority: "Required", owner: "Richard / Bub", note: "Complete: added sample validation guide covering the Bingham-style baseline checks for rows, duplicates, manufacturer/catalog gaps, GTIN/UDI readiness, implant risk, and UNSPSC/category weakness." },
          { id: "security-review", label: "Document data handling, PHI assumptions, and hospital security posture", status: "done", priority: "Recommended", owner: "Richard / Topher", note: "Complete: added security posture doc covering sensitive item master handling, PHI assumptions, LLM policy, human approval gates, blocked actions, and deployment notes." },
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
