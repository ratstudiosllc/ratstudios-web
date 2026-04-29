import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getCurrentApps } from "@/lib/studio-admin";

export const dynamic = "force-dynamic";

type ChecklistStatus = "done" | "in_progress" | "blocked" | "not_started" | "not_applicable";
type ChecklistPriority = "Required" | "Recommended" | "Later";
type ChecklistOwner = "Richard" | "Topher" | "Bub" | "Agent";

type ChecklistItem = {
  label: string;
  status: ChecklistStatus;
  owner: ChecklistOwner;
  priority: ChecklistPriority;
  note: string;
  evidence?: string;
};

type ChecklistCategory = {
  title: string;
  intent: string;
  items: ChecklistItem[];
};

const statusCopy: Record<ChecklistStatus, { label: string; className: string }> = {
  done: { label: "Done", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  in_progress: { label: "In progress", className: "border-sky-200 bg-sky-50 text-sky-800" },
  blocked: { label: "Blocked", className: "border-red-200 bg-red-50 text-red-800" },
  not_started: { label: "Not started", className: "border-neutral-200 bg-neutral-50 text-neutral-600" },
  not_applicable: { label: "N/A", className: "border-zinc-200 bg-zinc-50 text-zinc-500" },
};

const priorityClass: Record<ChecklistPriority, string> = {
  Required: "bg-neutral-950 text-white",
  Recommended: "bg-orange-100 text-orange-800",
  Later: "bg-neutral-100 text-neutral-600",
};

const checklistTemplate: ChecklistCategory[] = [
  {
    title: "Identity & Brand",
    intent: "Make sure the product is named, explainable, and visually ready to be shown.",
    items: [
      { label: "Final app name selected", status: "done", owner: "Richard", priority: "Required", note: "No launch without a name we can stand behind." },
      { label: "Name checked for obvious conflicts", status: "in_progress", owner: "Bub", priority: "Required", note: "Quick trademark/search sanity check before buying assets." },
      { label: "Logo/icon created", status: "not_started", owner: "Agent", priority: "Recommended", note: "Needed for site, app stores, and social previews." },
      { label: "One-line positioning statement", status: "done", owner: "Bub", priority: "Required", note: "This app helps X do Y without Z." },
      { label: "Short and long app descriptions", status: "in_progress", owner: "Bub", priority: "Recommended", note: "Reusable for landing pages, listings, and sales notes." },
    ],
  },
  {
    title: "Domain & URLs",
    intent: "Confirm the app has a real public home and every callback URL points to it.",
    items: [
      { label: "Primary domain selected", status: "in_progress", owner: "Richard", priority: "Required", note: "Choose the public-facing canonical domain." },
      { label: "Domain registered", status: "not_started", owner: "Richard", priority: "Required", note: "Purchase and put under the right account." },
      { label: "Domain added to Vercel", status: "not_started", owner: "Topher", priority: "Required", note: "Attach to production project after registration." },
      { label: "DNS and HTTPS verified", status: "not_started", owner: "Topher", priority: "Required", note: "No marketing launch until HTTPS is clean." },
      { label: "Auth callback URLs updated", status: "not_started", owner: "Topher", priority: "Required", note: "Supabase/OAuth callbacks must match production domain." },
    ],
  },
  {
    title: "GitHub & Repo Hygiene",
    intent: "Keep the source of truth clean enough that production can be rebuilt safely.",
    items: [
      { label: "GitHub repo named correctly", status: "done", owner: "Topher", priority: "Required", note: "Repo name should match the app brand." },
      { label: "Default branch and production branch are main", status: "done", owner: "Topher", priority: "Required", note: "Prevents branch confusion during launch." },
      { label: "README and .env.example updated", status: "done", owner: "Bub", priority: "Recommended", note: "Enough setup context for future work." },
      { label: "Secrets excluded from repo", status: "done", owner: "Topher", priority: "Required", note: "Only templates belong in Git." },
      { label: "Supabase migrations/schema tracked", status: "in_progress", owner: "Topher", priority: "Required", note: "Some apps still need Docker-backed db pull." },
    ],
  },
  {
    title: "Vercel / Deployment",
    intent: "Production should deploy predictably from GitHub and be observable when it breaks.",
    items: [
      { label: "Vercel project named correctly", status: "done", owner: "Topher", priority: "Required", note: "Project should match app identity." },
      { label: "GitHub integration connected", status: "done", owner: "Topher", priority: "Required", note: "main push should trigger production." },
      { label: "Production env vars configured", status: "done", owner: "Topher", priority: "Required", note: "Supabase and server-only keys present." },
      { label: "Preview env vars configured", status: "done", owner: "Topher", priority: "Recommended", note: "Branch previews should behave like production." },
      { label: "Latest production logs checked", status: "done", owner: "Bub", priority: "Required", note: "No recent error logs before launch review." },
    ],
  },
  {
    title: "Supabase / Backend",
    intent: "Database, auth, policies, and migration history need to be launch-safe.",
    items: [
      { label: "Supabase project named correctly", status: "done", owner: "Richard", priority: "Required", note: "Project name should match business/app context." },
      { label: "Project ref recorded", status: "done", owner: "Bub", priority: "Required", note: "Needed for CLI link and operational notes." },
      { label: "Database tables verified", status: "done", owner: "Bub", priority: "Required", note: "Live tables checked through CLI inspection." },
      { label: "Migration history reconciled", status: "in_progress", owner: "Topher", priority: "Required", note: "Expired FDA is clean; others need final Docker-backed pull." },
      { label: "RLS and service-role usage reviewed", status: "not_started", owner: "Topher", priority: "Required", note: "Security gate before real customers." },
    ],
  },
  {
    title: "Authentication & Access",
    intent: "Users should be able to get in, get routed correctly, and stay out of places they do not belong.",
    items: [
      { label: "Login works", status: "done", owner: "Bub", priority: "Required", note: "Smoke-tested on production routes." },
      { label: "Signup or invite flow decided", status: "in_progress", owner: "Richard", priority: "Required", note: "Some apps may stay invite-only." },
      { label: "Logout and session expiry tested", status: "not_started", owner: "Agent", priority: "Recommended", note: "Avoid stuck sessions during demos." },
      { label: "Role-based routing verified", status: "in_progress", owner: "Topher", priority: "Required", note: "Especially important for admin/customer portals." },
      { label: "Test users created", status: "not_started", owner: "Richard", priority: "Recommended", note: "Use real demo/test accounts, not personal accounts forever." },
    ],
  },
  {
    title: "Payments & Monetization",
    intent: "If the app charges money, billing should be explicit instead of bolted on later in panic mode.",
    items: [
      { label: "Pricing model selected", status: "not_started", owner: "Richard", priority: "Required", note: "Facility/provider/account pricing must be decided." },
      { label: "Stripe products and prices created", status: "not_started", owner: "Topher", priority: "Required", note: "Only after business model is clear." },
      { label: "Checkout and customer portal tested", status: "not_started", owner: "Agent", priority: "Required", note: "Full paid path must be verified." },
      { label: "Webhook configured", status: "not_started", owner: "Topher", priority: "Required", note: "Subscription state depends on this." },
      { label: "Trial/coupon policy decided", status: "not_started", owner: "Richard", priority: "Later", note: "Useful but not always launch-blocking." },
    ],
  },
  {
    title: "Core Product QA",
    intent: "The main product promise should work on production, not just compile.",
    items: [
      { label: "Main dashboard loads", status: "done", owner: "Bub", priority: "Required", note: "Protected routes redirect if logged out." },
      { label: "Primary create/edit/delete flows tested", status: "not_started", owner: "Agent", priority: "Required", note: "App-specific workflow QA still needed." },
      { label: "Mobile layout checked", status: "not_started", owner: "Agent", priority: "Recommended", note: "Do not assume desktop admin equals usable product." },
      { label: "Error and empty states checked", status: "not_started", owner: "Agent", priority: "Recommended", note: "Demos die fast on blank/error pages." },
      { label: "Smoke test checklist completed", status: "in_progress", owner: "Bub", priority: "Required", note: "Route-level checks exist; deeper flows still need app-specific QA." },
    ],
  },
  {
    title: "Legal & Compliance",
    intent: "Cover the boring-but-real launch risks before public traffic arrives.",
    items: [
      { label: "Privacy policy exists", status: "not_started", owner: "Richard", priority: "Required", note: "Required before marketing traffic." },
      { label: "Terms of service exists", status: "not_started", owner: "Richard", priority: "Required", note: "Especially for paid SaaS." },
      { label: "Support/contact email listed", status: "not_started", owner: "Richard", priority: "Required", note: "Users need a clear path to reach us." },
      { label: "Data deletion process defined", status: "not_started", owner: "Topher", priority: "Recommended", note: "Needed as apps mature." },
      { label: "Regulated-risk language reviewed", status: "not_started", owner: "Richard", priority: "Required", note: "Healthcare/ag/finance claims need care." },
    ],
  },
  {
    title: "Marketing & Launch",
    intent: "Public launch needs a landing page, tracking, and a message sharper than 'we built a thing.'",
    items: [
      { label: "Landing page live", status: "not_started", owner: "Topher", priority: "Required", note: "Public page should explain who it is for." },
      { label: "SEO title/meta and OG image set", status: "not_started", owner: "Agent", priority: "Recommended", note: "Share cards and search snippets matter." },
      { label: "Analytics installed", status: "not_started", owner: "Topher", priority: "Recommended", note: "Need baseline launch traffic data." },
      { label: "Initial launch copy drafted", status: "not_started", owner: "Bub", priority: "Required", note: "Email/social/site copy can share the same core positioning." },
      { label: "Target customer defined", status: "in_progress", owner: "Richard", priority: "Required", note: "No GTM until the buyer/user is explicit." },
    ],
  },
  {
    title: "Support & Operations",
    intent: "The app needs an owner, a support path, and a way to handle bugs after launch.",
    items: [
      { label: "App owner assigned", status: "done", owner: "Richard", priority: "Required", note: "Every app needs a human accountable for readiness." },
      { label: "Bug reporting path defined", status: "in_progress", owner: "Bub", priority: "Required", note: "Admin issue tracker is the intended operating queue." },
      { label: "Known issues recorded", status: "in_progress", owner: "Bub", priority: "Required", note: "Known acceptable risk should be explicit." },
      { label: "Support FAQ started", status: "not_started", owner: "Agent", priority: "Later", note: "Useful after first testers hit repeated questions." },
      { label: "Monitoring/log review process defined", status: "in_progress", owner: "Topher", priority: "Recommended", note: "Vercel/Supabase logs need a regular owner." },
    ],
  },
  {
    title: "Launch Decision",
    intent: "Force a real go/no-go decision instead of drifting into launch by accident.",
    items: [
      { label: "MVP scope locked", status: "not_started", owner: "Richard", priority: "Required", note: "Decide what is in and what waits." },
      { label: "Blockers cleared", status: "blocked", owner: "Topher", priority: "Required", note: "Docker-backed schema reconciliation is one shared blocker." },
      { label: "Known acceptable issues documented", status: "not_started", owner: "Bub", priority: "Required", note: "This prevents fake perfection from slowing launch." },
      { label: "Richard approval", status: "not_started", owner: "Richard", priority: "Required", note: "Business go/no-go." },
      { label: "Topher approval", status: "not_started", owner: "Topher", priority: "Required", note: "Technical go/no-go." },
    ],
  },
];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getAppAdjustment(appSlug: string, item: ChecklistItem): ChecklistStatus {
  if (appSlug === "expired-fda" && item.label === "Migration history reconciled") return "done";
  if (appSlug === "storagehq" && item.label === "Primary domain selected") return "done";
  if (appSlug === "storagehq" && item.label === "Domain registered") return "done";
  if (appSlug === "storagehq" && item.label === "Domain added to Vercel") return "done";
  if (appSlug === "storagehq" && item.label === "DNS and HTTPS verified") return "done";
  return item.status;
}

function statusWeight(status: ChecklistStatus) {
  if (status === "done") return 1;
  if (status === "in_progress") return 0.5;
  if (status === "not_applicable") return 1;
  return 0;
}

function buildAppChecklist(appSlug: string) {
  return checklistTemplate.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item, status: getAppAdjustment(appSlug, item) })),
  }));
}

function summarize(categories: ChecklistCategory[]) {
  const items = categories.flatMap((category) => category.items);
  const required = items.filter((item) => item.priority === "Required" && item.status !== "not_applicable");
  const score = Math.round((items.reduce((sum, item) => sum + statusWeight(item.status), 0) / items.length) * 100);
  return {
    score,
    done: items.filter((item) => item.status === "done").length,
    inProgress: items.filter((item) => item.status === "in_progress").length,
    blocked: items.filter((item) => item.status === "blocked").length,
    requiredOpen: required.filter((item) => item.status !== "done").length,
    total: items.length,
  };
}

function StatusPill({ status }: { status: ChecklistStatus }) {
  const copy = statusCopy[status];
  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", copy.className)}>{copy.label}</span>;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSelectedAppSlug(value: string | string[] | undefined, fallback: string) {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

export default async function CurrentAppsChecklistTestPage({ searchParams }: { searchParams: SearchParams }) {
  const apps = getCurrentApps();
  const resolvedSearchParams = await searchParams;
  const selectedSlug = getSelectedAppSlug(resolvedSearchParams.app, apps[0]?.slug ?? "");
  const selectedApp = apps.find((app) => app.slug === selectedSlug) ?? apps[0];
  const selectedCategories = selectedApp ? buildAppChecklist(selectedApp.slug) : [];
  const selectedSummary = summarize(selectedCategories);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <AdminPageHeader title="Current Apps Checklist Prototype" active="current-apps" eyebrow="RaT Studios Admin Sandbox" />

        <section className="mt-8 overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Launch readiness system</p>
                <h2 className="mt-2 text-3xl font-semibold text-neutral-950">One checklist model across every current app.</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                  Select an app below to review its launch checklist without scrolling through the whole portfolio.
                </p>
              </div>
              <Link href="/admin/testpage" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
                Back to admin test page
              </Link>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {apps.map((app) => {
                const categories = buildAppChecklist(app.slug);
                const summary = summarize(categories);
                const active = selectedApp?.slug === app.slug;
                return (
                  <Link
                    key={app.slug}
                    href={`/admin/testpage/current-apps?app=${app.slug}`}
                    className={cn(
                      "rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm",
                      active ? "border-orange-300 bg-orange-50" : "border-black/5 bg-[#fcfaf7] hover:border-black/10 hover:bg-white"
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-500">{app.type}</p>
                    <h3 className="mt-2 text-lg font-semibold text-neutral-950">{app.name}</h3>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ready</p>
                        <p className="text-2xl font-semibold text-neutral-950">{summary.score}%</p>
                      </div>
                      <div className="text-right text-xs text-neutral-500">
                        <p>{summary.blocked} blocked</p>
                        <p>{summary.requiredOpen} required open</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {selectedApp ? (
          <section className="mt-8 overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
            <div className="grid gap-6 border-b border-black/5 p-6 lg:grid-cols-[minmax(0,1fr)_420px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">{selectedApp.type}</p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{selectedApp.name}</h2>
                <p className="mt-2 text-sm text-neutral-600">{selectedApp.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-5">
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Score</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{selectedSummary.score}%</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Done</p><p className="mt-2 text-2xl font-semibold text-emerald-700">{selectedSummary.done}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Moving</p><p className="mt-2 text-2xl font-semibold text-sky-700">{selectedSummary.inProgress}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Blocked</p><p className="mt-2 text-2xl font-semibold text-red-700">{selectedSummary.blocked}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Req open</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{selectedSummary.requiredOpen}</p></div>
              </div>
            </div>

            <div className="grid gap-4 p-6 xl:grid-cols-2">
              {selectedCategories.map((category) => {
                    const categorySummary = summarize([category]);
                    return (
                      <div key={category.title} className="rounded-[28px] border border-black/5 bg-[#fcfaf7] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-950">{category.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-neutral-600">{category.intent}</p>
                          </div>
                          <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ready</p>
                            <p className="text-lg font-semibold text-neutral-950">{categorySummary.score}%</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {category.items.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-black/5 bg-white p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusPill status={item.status} />
                                <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", priorityClass[item.priority])}>{item.priority}</span>
                                <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 text-xs font-semibold text-neutral-600">Owner: {item.owner}</span>
                              </div>
                              <p className="mt-3 text-sm font-semibold text-neutral-950">{item.label}</p>
                              <p className="mt-1 text-sm text-neutral-600">{item.note}</p>
                              <div className="mt-3 rounded-xl border border-dashed border-black/10 bg-[#fcfaf7] px-3 py-2 text-xs text-neutral-500">
                                Evidence / notes slot: {item.evidence ?? "link to Vercel, GitHub, Supabase, Stripe, policy doc, QA run, or founder approval"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
