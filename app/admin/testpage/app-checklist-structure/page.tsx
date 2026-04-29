"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, ExternalLink, GitBranch, LayoutDashboard, MessageSquareText, Rocket } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

type AppSlug = "storagehq" | "mowpro" | "expired-fda";
type Status = "done" | "in_progress" | "blocked" | "not_started";
type Owner = "Richard" | "Topher" | "Bub" | "Agent";
type Priority = "Required" | "Recommended" | "Later";

type ChecklistItem = {
  id: string;
  label: string;
  status: Status;
  priority: Priority;
  owner: Owner;
  targetDate: string;
  completedOn?: string;
  note: string;
};

type AppPreview = {
  slug: AppSlug;
  name: string;
  type: string;
  summary: string;
  domain: string;
  repo: string;
  owner: Owner;
  stage: string;
  issueCount: number;
  deployment: string;
  checklist: ChecklistItem[];
};

const apps: AppPreview[] = [
  {
    slug: "storagehq",
    name: "StorageHQ",
    type: "SaaS / Storage Operations",
    summary: "Facility dashboard, units, tenants, payments, and operator workflows.",
    domain: "storagehq.vercel.app",
    repo: "ratstudiosllc/storagehq",
    owner: "Topher",
    stage: "Production setup",
    issueCount: 4,
    deployment: "Ready",
    checklist: [
      { id: "domain", label: "Primary domain and HTTPS verified", status: "in_progress", priority: "Required", owner: "Topher", targetDate: "2026-05-03", note: "Attach final domain before public demos." },
      { id: "rls", label: "RLS and service-role usage reviewed", status: "blocked", priority: "Required", owner: "Topher", targetDate: "2026-05-05", note: "Security gate before real customer data." },
      { id: "qa", label: "Primary create/edit/delete flows tested", status: "not_started", priority: "Required", owner: "Agent", targetDate: "2026-05-07", note: "Run through facility, tenant, and unit workflows." },
      { id: "logs", label: "Latest production logs checked", status: "done", priority: "Required", owner: "Bub", targetDate: "2026-04-29", completedOn: "2026-04-29", note: "No recent production errors in Vercel logs." },
    ],
  },
  {
    slug: "mowpro",
    name: "MowPro",
    type: "Field Service SaaS",
    summary: "Mowing jobs, customer requests, scheduling, and operator/customer portals.",
    domain: "mowpro.vercel.app",
    repo: "ratstudiosllc/mowpro",
    owner: "Richard",
    stage: "Launch prep",
    issueCount: 2,
    deployment: "Ready",
    checklist: [
      { id: "pricing", label: "Pricing model selected", status: "not_started", priority: "Required", owner: "Richard", targetDate: "2026-05-02", note: "Decide simple launch offer before Stripe setup." },
      { id: "auth", label: "Role-based routing verified", status: "in_progress", priority: "Required", owner: "Topher", targetDate: "2026-05-04", note: "Customer and operator routes need clean separation." },
      { id: "mobile", label: "Mobile layout checked", status: "not_started", priority: "Recommended", owner: "Agent", targetDate: "2026-05-06", note: "Customers will mostly hit this from phones." },
      { id: "repo", label: "Repo hygiene and env templates updated", status: "done", priority: "Recommended", owner: "Bub", targetDate: "2026-04-29", completedOn: "2026-04-29", note: "Secrets stay out of git; templates are documented." },
    ],
  },
  {
    slug: "expired-fda",
    name: "Expired FDA",
    type: "Healthcare Compliance SaaS",
    summary: "Expiration tracking and compliance workflows for regulated inventory.",
    domain: "expired-fda-cyan.vercel.app",
    repo: "ratstudiosllc/expired-fda",
    owner: "Richard",
    stage: "Migration cleanup",
    issueCount: 3,
    deployment: "Ready",
    checklist: [
      { id: "regulated", label: "Regulated-risk language reviewed", status: "not_started", priority: "Required", owner: "Richard", targetDate: "2026-05-03", note: "Healthcare-facing claims need careful wording." },
      { id: "terms", label: "Terms and privacy policy exist", status: "not_started", priority: "Required", owner: "Richard", targetDate: "2026-05-04", note: "Required before external traffic." },
      { id: "migration", label: "Supabase migration history reconciled", status: "done", priority: "Required", owner: "Topher", targetDate: "2026-04-29", completedOn: "2026-04-29", note: "Remote timestamped migrations were fetched successfully." },
      { id: "support", label: "Support/contact email listed", status: "in_progress", priority: "Required", owner: "Bub", targetDate: "2026-05-05", note: "Users need a visible way to reach us." },
    ],
  },
];

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "checklist", label: "Launch Checklist", icon: ClipboardList },
  { key: "issues", label: "Issues", icon: AlertTriangle },
  { key: "deployments", label: "Deployments", icon: Rocket },
  { key: "notes", label: "Notes", icon: MessageSquareText },
] as const;

const statusCopy: Record<Status, { label: string; className: string }> = {
  done: { label: "Done", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  in_progress: { label: "In progress", className: "border-sky-200 bg-sky-50 text-sky-800" },
  blocked: { label: "Blocked", className: "border-red-200 bg-red-50 text-red-800" },
  not_started: { label: "Not started", className: "border-neutral-200 bg-neutral-50 text-neutral-600" },
};

const priorityClass: Record<Priority, string> = {
  Required: "border-neutral-950 bg-neutral-950 text-white",
  Recommended: "border-orange-200 bg-orange-100 text-orange-800",
  Later: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function score(items: ChecklistItem[]) {
  const weight: Record<Status, number> = { done: 1, in_progress: 0.55, blocked: 0.1, not_started: 0 };
  return Math.round((items.reduce((sum, item) => sum + weight[item.status], 0) / items.length) * 100);
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day));
}

function AppRollupCard({ app, active, onClick }: { app: AppPreview; active: boolean; onClick: () => void }) {
  const blocked = app.checklist.filter((item) => item.status === "blocked").length;
  const requiredOpen = app.checklist.filter((item) => item.priority === "Required" && item.status !== "done").length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
        active ? "border-orange-300 bg-orange-50" : "border-black/5 bg-white hover:border-black/10"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">{app.type}</p>
      <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{app.name}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-neutral-600">{app.summary}</p>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ready</p>
          <p className="mt-1 text-xl font-semibold text-neutral-950">{score(app.checklist)}%</p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Blocked</p>
          <p className="mt-1 text-xl font-semibold text-neutral-950">{blocked}</p>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Req open</p>
          <p className="mt-1 text-xl font-semibold text-neutral-950">{requiredOpen}</p>
        </div>
      </div>
    </button>
  );
}

export default function AppChecklistStructureTestPage() {
  const [selectedSlug, setSelectedSlug] = useState<AppSlug>("storagehq");
  const selectedApp = apps.find((app) => app.slug === selectedSlug) ?? apps[0];
  const selectedScore = useMemo(() => score(selectedApp.checklist), [selectedApp]);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <AdminPageHeader title="App Checklist Structure Test" active="current-apps" eyebrow="RaT Studios Admin Sandbox" />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Structure prototype</p>
            <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Current Apps → App Detail → Launch Checklist</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              This shows the checklist living inside each app page, with Current Apps acting as the portfolio rollup instead of a standalone checklist destination.
            </p>
          </div>
          <Link href="/admin/testpage" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-[#fcfaf7]">
            Back to test page
          </Link>
        </div>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {apps.map((app) => (
            <AppRollupCard key={app.slug} app={app} active={app.slug === selectedSlug} onClick={() => setSelectedSlug(app.slug)} />
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">App detail</p>
                <h2 className="mt-2 text-3xl font-semibold text-neutral-950">{selectedApp.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{selectedApp.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ready</p>
                  <p className="mt-1 text-2xl font-semibold text-neutral-950">{selectedScore}%</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Owner</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-950">{selectedApp.owner}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Stage</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-950">{selectedApp.stage}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Deploy</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-950">{selectedApp.deployment}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-b border-black/10 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.key === "checklist";
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition",
                      active ? "border-orange-200 bg-orange-50 text-neutral-950" : "border-black/10 bg-[#fcfaf7] text-neutral-600"
                    )}
                  >
                    <Icon className="h-4 w-4 text-orange-500" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="space-y-3">
                <div className="rounded-2xl border border-black/5 bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Domain</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-950"><ExternalLink className="h-4 w-4 text-orange-500" />{selectedApp.domain}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Repo</p>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-950"><GitBranch className="h-4 w-4 text-orange-500" />{selectedApp.repo}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Open issues</p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-950">{selectedApp.issueCount}</p>
                </div>
              </aside>

              <div>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Active tab</p>
                    <h3 className="mt-1 text-2xl font-semibold text-neutral-950">Launch Checklist</h3>
                  </div>
                  <p className="text-sm text-neutral-500">Checklist is contextual to this app, not a separate top-level tool.</p>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  {selectedApp.checklist.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-black/5 bg-[#fcfaf7] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusCopy[item.status].className)}>{statusCopy[item.status].label}</span>
                        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", priorityClass[item.priority])}>{item.priority}</span>
                        <span className="rounded-full border border-transparent bg-white px-3 py-1 text-xs font-semibold text-neutral-600">Owner: {item.owner}</span>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Target: {formatDate(item.targetDate)}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-neutral-950">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{item.note}</p>
                      {item.completedOn ? (
                        <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" /> Completed on {formatDate(item.completedOn)}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
