"use client";

import { useMemo, useState } from "react";

type CurrentApp = {
  slug: string;
  name: string;
  type: string;
  summary: string;
};

type ChecklistStatus = "done" | "in_progress" | "blocked" | "not_started" | "not_applicable";
type ChecklistPriority = "Required" | "Recommended" | "Later";
type ChecklistOwner = "Richard" | "Topher" | "Bub" | "Agent";

type ChecklistItem = {
  id: string;
  label: string;
  status: ChecklistStatus;
  owner: ChecklistOwner;
  priority: ChecklistPriority;
  targetDate: string;
  completedOn?: string;
  note: string;
  evidence?: string;
};

type ChecklistCategory = {
  title: string;
  intent: string;
  items: ChecklistItem[];
};

type AppChecklistState = Record<string, ChecklistCategory[]>;

const statusOptions: ChecklistStatus[] = ["done", "in_progress", "blocked", "not_started", "not_applicable"];
const priorityOptions: ChecklistPriority[] = ["Required", "Recommended", "Later"];
const ownerOptions: ChecklistOwner[] = ["Richard", "Topher", "Bub", "Agent"];

const statusCopy: Record<ChecklistStatus, { label: string; className: string }> = {
  done: { label: "Done", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  in_progress: { label: "In progress", className: "border-sky-200 bg-sky-50 text-sky-800" },
  blocked: { label: "Blocked", className: "border-red-200 bg-red-50 text-red-800" },
  not_started: { label: "Not started", className: "border-neutral-200 bg-neutral-50 text-neutral-600" },
  not_applicable: { label: "N/A", className: "border-zinc-200 bg-zinc-50 text-zinc-500" },
};

const priorityClass: Record<ChecklistPriority, string> = {
  Required: "bg-neutral-950 text-white border-neutral-950",
  Recommended: "bg-orange-100 text-orange-800 border-orange-200",
  Later: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

const checklistTemplate: ChecklistCategory[] = [
  {
    title: "Identity & Brand",
    intent: "Make sure the product is named, explainable, and visually ready to be shown.",
    items: [
      { id: "final-name", label: "Final app name selected", status: "done", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "No launch without a name we can stand behind." },
      { id: "name-conflicts", label: "Name checked for obvious conflicts", status: "in_progress", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Quick trademark/search sanity check before buying assets." },
      { id: "logo-icon", label: "Logo/icon created", status: "not_started", owner: "Agent", priority: "Recommended", targetDate: "2026-05-15", note: "Needed for site, app stores, and social previews." },
      { id: "positioning", label: "One-line positioning statement", status: "done", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "This app helps X do Y without Z." },
      { id: "descriptions", label: "Short and long app descriptions", status: "in_progress", owner: "Bub", priority: "Recommended", targetDate: "2026-05-15", note: "Reusable for landing pages, listings, and sales notes." },
    ],
  },
  {
    title: "Domain & URLs",
    intent: "Confirm the app has a real public home and every callback URL points to it.",
    items: [
      { id: "primary-domain", label: "Primary domain selected", status: "in_progress", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Choose the public-facing canonical domain." },
      { id: "domain-registered", label: "Domain registered", status: "not_started", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Purchase and put under the right account." },
      { id: "domain-vercel", label: "Domain added to Vercel", status: "not_started", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Attach to production project after registration." },
      { id: "dns-https", label: "DNS and HTTPS verified", status: "not_started", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "No marketing launch until HTTPS is clean." },
      { id: "auth-callbacks", label: "Auth callback URLs updated", status: "not_started", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Supabase/OAuth callbacks must match production domain." },
    ],
  },
  {
    title: "GitHub & Repo Hygiene",
    intent: "Keep the source of truth clean enough that production can be rebuilt safely.",
    items: [
      { id: "repo-name", label: "GitHub repo named correctly", status: "done", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Repo name should match the app brand." },
      { id: "main-branch", label: "Default branch and production branch are main", status: "done", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Prevents branch confusion during launch." },
      { id: "readme-env", label: "README and .env.example updated", status: "done", owner: "Bub", priority: "Recommended", targetDate: "2026-05-15", note: "Enough setup context for future work." },
      { id: "no-secrets", label: "Secrets excluded from repo", status: "done", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Only templates belong in Git." },
      { id: "schema-tracked", label: "Supabase migrations/schema tracked", status: "in_progress", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Some apps still need Docker-backed db pull." },
    ],
  },
  {
    title: "Vercel / Deployment",
    intent: "Production should deploy predictably from GitHub and be observable when it breaks.",
    items: [
      { id: "vercel-name", label: "Vercel project named correctly", status: "done", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Project should match app identity." },
      { id: "github-integration", label: "GitHub integration connected", status: "done", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "main push should trigger production." },
      { id: "prod-env", label: "Production env vars configured", status: "done", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Supabase and server-only keys present." },
      { id: "preview-env", label: "Preview env vars configured", status: "done", owner: "Topher", priority: "Recommended", targetDate: "2026-05-15", note: "Branch previews should behave like production." },
      { id: "prod-logs", label: "Latest production logs checked", status: "done", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "No recent error logs before launch review." },
    ],
  },
  {
    title: "Supabase / Backend",
    intent: "Database, auth, policies, and migration history need to be launch-safe.",
    items: [
      { id: "supabase-name", label: "Supabase project named correctly", status: "done", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Project name should match business/app context." },
      { id: "project-ref", label: "Project ref recorded", status: "done", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Needed for CLI link and operational notes." },
      { id: "tables-verified", label: "Database tables verified", status: "done", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Live tables checked through CLI inspection." },
      { id: "migration-history", label: "Migration history reconciled", status: "in_progress", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Expired FDA is clean; others need final Docker-backed pull." },
      { id: "rls-review", label: "RLS and service-role usage reviewed", status: "not_started", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Security gate before real customers." },
    ],
  },
  {
    title: "Authentication & Access",
    intent: "Users should be able to get in, get routed correctly, and stay out of places they do not belong.",
    items: [
      { id: "login", label: "Login works", status: "done", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Smoke-tested on production routes." },
      { id: "signup-invite", label: "Signup or invite flow decided", status: "in_progress", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Some apps may stay invite-only." },
      { id: "logout-session", label: "Logout and session expiry tested", status: "not_started", owner: "Agent", priority: "Recommended", targetDate: "2026-05-15", note: "Avoid stuck sessions during demos." },
      { id: "roles", label: "Role-based routing verified", status: "in_progress", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Especially important for admin/customer portals." },
      { id: "test-users", label: "Test users created", status: "not_started", owner: "Richard", priority: "Recommended", targetDate: "2026-05-15", note: "Use real demo/test accounts, not personal accounts forever." },
    ],
  },
  {
    title: "Payments & Monetization",
    intent: "If the app charges money, billing should be explicit instead of bolted on later in panic mode.",
    items: [
      { id: "pricing", label: "Pricing model selected", status: "not_started", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Facility/provider/account pricing must be decided." },
      { id: "stripe-products", label: "Stripe products and prices created", status: "not_started", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Only after business model is clear." },
      { id: "checkout", label: "Checkout and customer portal tested", status: "not_started", owner: "Agent", priority: "Required", targetDate: "2026-05-15", note: "Full paid path must be verified." },
      { id: "webhook", label: "Webhook configured", status: "not_started", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Subscription state depends on this." },
      { id: "trial-coupon", label: "Trial/coupon policy decided", status: "not_started", owner: "Richard", priority: "Later", targetDate: "2026-05-15", note: "Useful but not always launch-blocking." },
    ],
  },
  {
    title: "Core Product QA",
    intent: "The main product promise should work on production, not just compile.",
    items: [
      { id: "dashboard-loads", label: "Main dashboard loads", status: "done", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Protected routes redirect if logged out." },
      { id: "crud-flows", label: "Primary create/edit/delete flows tested", status: "not_started", owner: "Agent", priority: "Required", targetDate: "2026-05-15", note: "App-specific workflow QA still needed." },
      { id: "mobile", label: "Mobile layout checked", status: "not_started", owner: "Agent", priority: "Recommended", targetDate: "2026-05-15", note: "Do not assume desktop admin equals usable product." },
      { id: "error-empty", label: "Error and empty states checked", status: "not_started", owner: "Agent", priority: "Recommended", targetDate: "2026-05-15", note: "Demos die fast on blank/error pages." },
      { id: "smoke-test", label: "Smoke test checklist completed", status: "in_progress", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Route-level checks exist; deeper flows still need app-specific QA." },
    ],
  },
  {
    title: "Legal & Compliance",
    intent: "Cover the boring-but-real launch risks before public traffic arrives.",
    items: [
      { id: "privacy", label: "Privacy policy exists", status: "not_started", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Required before marketing traffic." },
      { id: "terms", label: "Terms of service exists", status: "not_started", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Especially for paid SaaS." },
      { id: "support-contact", label: "Support/contact email listed", status: "not_started", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Users need a clear path to reach us." },
      { id: "data-deletion", label: "Data deletion process defined", status: "not_started", owner: "Topher", priority: "Recommended", targetDate: "2026-05-15", note: "Needed as apps mature." },
      { id: "regulated-language", label: "Regulated-risk language reviewed", status: "not_started", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Healthcare/ag/finance claims need care." },
    ],
  },
  {
    title: "Marketing & Launch",
    intent: "Public launch needs a landing page, tracking, and a message sharper than 'we built a thing.'",
    items: [
      { id: "landing", label: "Landing page live", status: "not_started", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Public page should explain who it is for." },
      { id: "seo-og", label: "SEO title/meta and OG image set", status: "not_started", owner: "Agent", priority: "Recommended", targetDate: "2026-05-15", note: "Share cards and search snippets matter." },
      { id: "analytics", label: "Analytics installed", status: "not_started", owner: "Topher", priority: "Recommended", targetDate: "2026-05-15", note: "Need baseline launch traffic data." },
      { id: "launch-copy", label: "Initial launch copy drafted", status: "not_started", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Email/social/site copy can share the same core positioning." },
      { id: "target-customer", label: "Target customer defined", status: "in_progress", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "No GTM until the buyer/user is explicit." },
    ],
  },
  {
    title: "Support & Operations",
    intent: "The app needs an owner, a support path, and a way to handle bugs after launch.",
    items: [
      { id: "app-owner", label: "App owner assigned", status: "done", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Every app needs a human accountable for readiness." },
      { id: "bug-reporting", label: "Bug reporting path defined", status: "in_progress", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Admin issue tracker is the intended operating queue." },
      { id: "known-issues", label: "Known issues recorded", status: "in_progress", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "Known acceptable risk should be explicit." },
      { id: "support-faq", label: "Support FAQ started", status: "not_started", owner: "Agent", priority: "Later", targetDate: "2026-05-15", note: "Useful after first testers hit repeated questions." },
      { id: "monitoring", label: "Monitoring/log review process defined", status: "in_progress", owner: "Topher", priority: "Recommended", targetDate: "2026-05-15", note: "Vercel/Supabase logs need a regular owner." },
    ],
  },
  {
    title: "Launch Decision",
    intent: "Force a real go/no-go decision instead of drifting into launch by accident.",
    items: [
      { id: "mvp-scope", label: "MVP scope locked", status: "not_started", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Decide what is in and what waits." },
      { id: "blockers-cleared", label: "Blockers cleared", status: "blocked", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Docker-backed schema reconciliation is one shared blocker." },
      { id: "acceptable-issues", label: "Known acceptable issues documented", status: "not_started", owner: "Bub", priority: "Required", targetDate: "2026-05-15", note: "This prevents fake perfection from slowing launch." },
      { id: "richard-approval", label: "Richard approval", status: "not_started", owner: "Richard", priority: "Required", targetDate: "2026-05-15", note: "Business go/no-go." },
      { id: "topher-approval", label: "Topher approval", status: "not_started", owner: "Topher", priority: "Required", targetDate: "2026-05-15", note: "Technical go/no-go." },
    ],
  },
];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getAppAdjustment(appSlug: string, item: ChecklistItem): ChecklistStatus {
  if (appSlug === "expired-fda" && item.id === "migration-history") return "done";
  if (appSlug === "storagehq" && ["primary-domain", "domain-registered", "domain-vercel", "dns-https"].includes(item.id)) return "done";
  return item.status;
}

function buildInitialChecklistState(apps: CurrentApp[]): AppChecklistState {
  return Object.fromEntries(
    apps.map((app) => [
      app.slug,
      checklistTemplate.map((category) => ({
        ...category,
        items: category.items.map((item) => ({ ...item, status: getAppAdjustment(app.slug, item) })),
      })),
    ])
  );
}

function statusWeight(status: ChecklistStatus) {
  if (status === "done") return 1;
  if (status === "in_progress") return 0.5;
  if (status === "not_applicable") return 1;
  return 0;
}

function summarize(categories: ChecklistCategory[]) {
  const items = categories.flatMap((category) => category.items);
  const required = items.filter((item) => item.priority === "Required" && item.status !== "not_applicable");
  const score = items.length ? Math.round((items.reduce((sum, item) => sum + statusWeight(item.status), 0) / items.length) * 100) : 0;
  return {
    score,
    done: items.filter((item) => item.status === "done").length,
    inProgress: items.filter((item) => item.status === "in_progress").length,
    blocked: items.filter((item) => item.status === "blocked").length,
    requiredOpen: required.filter((item) => item.status !== "done").length,
  };
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string) {
  if (!value) return "No date";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day));
}

function EditableSelect<T extends string>({
  value,
  options,
  labelFor,
  classNameFor,
  onChange,
}: {
  value: T;
  options: T[];
  labelFor: (value: T) => string;
  classNameFor: (value: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">Change {labelFor(value)}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={cn(
          "cursor-pointer appearance-none rounded-full border py-1 pl-3 pr-7 text-xs font-semibold outline-none transition hover:shadow-sm focus:ring-2 focus:ring-orange-300",
          classNameFor(value)
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>{labelFor(option)}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-current">▾</span>
    </label>
  );
}

export function CurrentAppsChecklistClient({ apps }: { apps: CurrentApp[] }) {
  const [selectedSlug, setSelectedSlug] = useState(apps[0]?.slug ?? "");
  const [checklists, setChecklists] = useState<AppChecklistState>(() => buildInitialChecklistState(apps));

  const selectedApp = apps.find((app) => app.slug === selectedSlug) ?? apps[0];
  const selectedCategories = selectedApp ? checklists[selectedApp.slug] ?? [] : [];
  const appSummaries = useMemo(
    () => Object.fromEntries(apps.map((app) => [app.slug, summarize(checklists[app.slug] ?? [])])),
    [apps, checklists]
  );

  function updateItem<T extends keyof ChecklistItem>(categoryIndex: number, itemIndex: number, field: T, value: ChecklistItem[T]) {
    if (!selectedApp) return;
    setChecklists((current) => ({
      ...current,
      [selectedApp.slug]: (current[selectedApp.slug] ?? []).map((category, cIndex) => {
        if (cIndex !== categoryIndex) return category;
        return {
          ...category,
          items: category.items.map((item, iIndex) => (iIndex === itemIndex ? { ...item, [field]: value } : item)),
        };
      }),
    }));
  }

  function updateStatus(categoryIndex: number, itemIndex: number, status: ChecklistStatus) {
    if (!selectedApp) return;
    setChecklists((current) => ({
      ...current,
      [selectedApp.slug]: (current[selectedApp.slug] ?? []).map((category, cIndex) => {
        if (cIndex !== categoryIndex) return category;
        return {
          ...category,
          items: category.items.map((item, iIndex) => {
            if (iIndex !== itemIndex) return item;
            return {
              ...item,
              status,
              completedOn: status === "done" ? item.completedOn ?? todayDate() : undefined,
            };
          }),
        };
      }),
    }));
  }

  return (
    <>
      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {apps.map((app) => {
          const summary = appSummaries[app.slug];
          const active = selectedApp?.slug === app.slug;
          return (
            <button
              key={app.slug}
              type="button"
              onClick={() => setSelectedSlug(app.slug)}
              className={cn(
                "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                active ? "border-orange-300 bg-orange-50" : "border-black/5 bg-white hover:border-black/10 hover:bg-[#fcfaf7]"
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
            </button>
          );
        })}
      </div>

      {selectedApp ? (
        <section className="mt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">Selected app</p>
              <h2 className="mt-1 text-2xl font-semibold text-neutral-950">{selectedApp.name} checklist</h2>
            </div>
            <p className="text-sm text-neutral-500">Edit status, priority, owner, and target date directly on each item.</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {selectedCategories.map((category, categoryIndex) => {
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
                    {category.items.map((item, itemIndex) => (
                      <div key={item.id} className="rounded-2xl border border-black/5 bg-white p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <EditableSelect
                            value={item.status}
                            options={statusOptions}
                            labelFor={(value) => statusCopy[value].label}
                            classNameFor={(value) => statusCopy[value].className}
                            onChange={(value) => updateStatus(categoryIndex, itemIndex, value)}
                          />
                          <EditableSelect
                            value={item.priority}
                            options={priorityOptions}
                            labelFor={(value) => value}
                            classNameFor={(value) => priorityClass[value]}
                            onChange={(value) => updateItem(categoryIndex, itemIndex, "priority", value)}
                          />
                          <EditableSelect
                            value={item.owner}
                            options={ownerOptions}
                            labelFor={(value) => `Owner: ${value}`}
                            classNameFor={() => "border-transparent bg-[#fcfaf7] text-neutral-600"}
                            onChange={(value) => updateItem(categoryIndex, itemIndex, "owner", value)}
                          />
                          <label className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 transition hover:shadow-sm focus-within:ring-2 focus-within:ring-orange-300">
                            <span>Target:</span>
                            <input
                              type="date"
                              value={item.targetDate}
                              onChange={(event) => updateItem(categoryIndex, itemIndex, "targetDate", event.target.value)}
                              className="w-[7.9rem] cursor-pointer bg-transparent text-xs font-semibold text-amber-800 outline-none"
                              aria-label="Change target date"
                            />
                          </label>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-neutral-950">{item.label}</p>
                        <p className="mt-1 text-sm text-neutral-600">{item.note}</p>
                        <div className="mt-3 rounded-xl border border-dashed border-black/10 bg-[#fcfaf7] px-3 py-2 text-xs text-neutral-500">
                          Evidence / notes slot: {item.evidence ?? "link to Vercel, GitHub, Supabase, Stripe, policy doc, QA run, or founder approval"}
                        </div>
                        {item.completedOn ? (
                          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                            Completed on {formatDate(item.completedOn)}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}
