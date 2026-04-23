import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpenText,
  CreditCard,
  LineChart,
  MonitorCog,
  Rocket,
  Settings2,
  ShieldCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const overviewKpis = [
  {
    label: "MRR snapshot",
    value: "$42.8k",
    note: "Preview/demo metric — shows where consolidated studio revenue would sit.",
    tone: "text-emerald-700",
  },
  {
    label: "Active customers",
    value: "318",
    note: "Preview/demo metric across current products and managed accounts.",
    tone: "text-neutral-950",
  },
  {
    label: "Open alerts",
    value: "7",
    note: "Preview/demo count combining infra, billing, and product health alerts.",
    tone: "text-amber-700",
  },
  {
    label: "Automations healthy",
    value: "94%",
    note: "Preview/demo rollup for daily runs and internal ops workflows.",
    tone: "text-sky-700",
  },
];

const alerts = [
  { title: "Billing webhook retries elevated", severity: "High", owner: "Finance ops", action: "Review failed events and Stripe retry logs." },
  { title: "One customer account near plan limit", severity: "Medium", owner: "Success", action: "Prompt upgrade or limit tuning discussion." },
  { title: "Incident postmortem missing owner", severity: "Medium", owner: "Engineering", action: "Assign follow-up before next release train." },
];

const customers = [
  { name: "Studio Tier accounts", value: "24", note: "Top-value customers with renewal/watchlist visibility." },
  { name: "At-risk renewals", value: "3", note: "Preview slot for churn-risk signals and outreach tasks." },
  { name: "Support backlog", value: "11", note: "Would merge customer pain, bugs, and SLA urgency." },
];

const billing = [
  { label: "Monthly recurring revenue", value: "$42.8k", note: "Preview/demo — unified finance overview." },
  { label: "Net revenue retention", value: "108%", note: "Useful for judging expansion vs. churn." },
  { label: "Failed payments this week", value: "6", note: "Should link directly into collections workflows later." },
];

const analytics = [
  "Activation funnel by app to spot onboarding friction quickly.",
  "Usage depth trends to separate sticky products from shallow adoption.",
  "Feature adoption and cohort retention panels once event plumbing is real.",
];

const issues = [
  { id: "INC-214", title: "Background sync lag in one production lane", status: "Needs triage" },
  { id: "BUG-178", title: "Admin export timeout on large customer sets", status: "In progress" },
  { id: "POST-32", title: "Open action items from latest incident review", status: "Owner needed" },
];

const runs = [
  { name: "Nightly reporting", state: "Healthy", note: "Would show success rate, last run, and failures." },
  { name: "Lead enrichment", state: "Attention", note: "Good candidate for queue depth + retries summary." },
  { name: "Support tagging", state: "Healthy", note: "Should eventually expose approvals and exception handling." },
];

const portfolio = [
  "Current apps with revenue, customer count, and health rollups.",
  "Future bets with stage, owner, and readiness gates.",
  "Shared dependencies/risk map so one weak system is obvious fast.",
];

const growth = [
  { channel: "Organic / content", status: "Scaling", note: "Preview place for acquisition trend + content velocity." },
  { channel: "Lifecycle / email", status: "Needs work", note: "Should tie campaigns to activation and retention impact." },
  { channel: "Partnerships", status: "Experimental", note: "Useful for pipeline quality and sourced revenue tracking." },
];

const auditItems = [
  "Role changes, admin actions, and billing overrides in one chronological feed.",
  "Operationally important because finance/support changes need accountability.",
  "Best kept filterable by customer, app, actor, and severity.",
];

const settingsItems = [
  "Permission groups for founders, operators, finance, support, and contractors.",
  "Environment-level controls for integrations, automations, and release safeguards.",
  "A clean place for admin configuration instead of scattering it across tools.",
];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function PreviewCard({
  title,
  icon,
  body,
  children,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[28px] border border-black/5 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-500">
            {icon}
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">Preview section</p>
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-neutral-950">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600">{body}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function AdminTestingPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <AdminPageHeader title="Admin Architecture Preview" active="dashboard" eyebrow="RaT Studios Admin Preview" />

        <section className="mt-8 overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="grid gap-6 p-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
            <div>
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                Temporary internal wireframe
              </span>
              <h1 className="mt-4 text-4xl font-bold text-neutral-950">/admin/testingpage</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-neutral-700">
                This preview is a proposed SaaS-style admin architecture for Richard to evaluate before any main dashboard replacement.
                It intentionally mixes current visual language with clearly labeled demo content so the structure can be reviewed honestly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">
                  Back to current /admin
                </Link>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                  Demo placeholders are labeled below
                </span>
              </div>
            </div>
            <div className="rounded-[28px] bg-[#fcfaf7] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Why this page exists</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-700">
                <li>• Shows how an executive/admin surface could consolidate studio operations.</li>
                <li>• Separates top-level monitoring from deeper product-specific admin pages.</li>
                <li>• Helps judge whether this architecture is useful before committing live integrations.</li>
              </ul>
            </div>
          </div>
        </section>

        <PreviewCard
          title="Overview KPIs"
          icon={<Activity className="h-5 w-5" />}
          body="Top-row executive signals should answer: are revenue, customers, alerts, and automations healthy right now? These are demo values for layout review only."
          className="mt-8"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewKpis.map((item) => (
              <div key={item.label} className="rounded-3xl bg-[#fcfaf7] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{item.label}</p>
                <p className={cn("mt-3 text-3xl font-semibold", item.tone)}>{item.value}</p>
                <p className="mt-2 text-sm text-neutral-600">{item.note}</p>
              </div>
            ))}
          </div>
        </PreviewCard>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <PreviewCard
            title="Alerts Center"
            icon={<BellRing className="h-5 w-5" />}
            body="A single place for the most important cross-functional alerts keeps operators from hunting across tools."
          >
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">{alert.severity}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{alert.owner}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-neutral-900">{alert.title}</p>
                  <p className="mt-1 text-sm text-neutral-600">{alert.action}</p>
                </div>
              ))}
            </div>
          </PreviewCard>

          <PreviewCard
            title="Customers"
            icon={<Users className="h-5 w-5" />}
            body="Customer health belongs near the top so revenue, churn risk, and support pressure are visible together."
          >
            <div className="grid gap-3 md:grid-cols-3">
              {customers.map((item) => (
                <div key={item.name} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{item.name}</p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-950">{item.value}</p>
                  <p className="mt-2 text-sm text-neutral-600">{item.note}</p>
                </div>
              ))}
            </div>
          </PreviewCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <PreviewCard
            title="Billing / Revenue"
            icon={<Wallet className="h-5 w-5" />}
            body="Finance should be legible without opening Stripe or spreadsheets first. This area would later be backed by real billing integrations."
          >
            <div className="space-y-3">
              {billing.map((item) => (
                <div key={item.label} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-neutral-950">{item.value}</p>
                    </div>
                    <CreditCard className="mt-1 h-5 w-5 text-orange-500" />
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{item.note}</p>
                </div>
              ))}
            </div>
          </PreviewCard>

          <PreviewCard
            title="Product Analytics"
            icon={<LineChart className="h-5 w-5" />}
            body="This column is less about vanity charts and more about product decision support across the portfolio."
          >
            <div className="space-y-3">
              {analytics.map((item) => (
                <div key={item} className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-700">{item}</div>
              ))}
            </div>
          </PreviewCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <PreviewCard
            title="Issues / Incidents"
            icon={<AlertTriangle className="h-5 w-5" />}
            body="Operations and engineering need a common incident lane so urgent reliability work is visible at the admin level."
          >
            <div className="space-y-3">
              {issues.map((item) => (
                <div key={item.id} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white">{item.id}</span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{item.status}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-neutral-900">{item.title}</p>
                </div>
              ))}
            </div>
          </PreviewCard>

          <PreviewCard
            title="Runs / Automations"
            icon={<Rocket className="h-5 w-5" />}
            body="Automations deserve their own health module so failures, queue buildup, and manual approvals are obvious."
          >
            <div className="space-y-3">
              {runs.map((run) => (
                <div key={run.name} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-neutral-900">{run.name}</p>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", run.state === "Healthy" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>{run.state}</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{run.note}</p>
                </div>
              ))}
            </div>
          </PreviewCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <PreviewCard
            title="App Portfolio"
            icon={<MonitorCog className="h-5 w-5" />}
            body="A studio-level admin needs one portfolio view that spans current apps, future bets, and shared risks."
          >
            <div className="space-y-3">
              {portfolio.map((item) => (
                <div key={item} className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-700">{item}</div>
              ))}
            </div>
          </PreviewCard>

          <PreviewCard
            title="Marketing / Growth"
            icon={<ArrowRight className="h-5 w-5" />}
            body="Growth visibility should connect channels to real business outcomes rather than living in a separate silo."
          >
            <div className="space-y-3">
              {growth.map((item) => (
                <div key={item.channel} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900">{item.channel}</p>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">{item.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-neutral-600">{item.note}</p>
                </div>
              ))}
            </div>
          </PreviewCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <PreviewCard
            title="Audit Log"
            icon={<BookOpenText className="h-5 w-5" />}
            body="Richard can use this section to judge whether admin actions, sensitive changes, and accountability feel first-class enough."
          >
            <div className="space-y-3">
              {auditItems.map((item) => (
                <div key={item} className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-700">{item}</div>
              ))}
            </div>
          </PreviewCard>

          <PreviewCard
            title="Settings / Permissions"
            icon={<Settings2 className="h-5 w-5" />}
            body="Configuration and access controls should live in a clear admin home rather than being scattered across app pages."
          >
            <div className="space-y-3">
              {settingsItems.map((item) => (
                <div key={item} className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-700">{item}</div>
              ))}
            </div>
          </PreviewCard>
        </div>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Preview notes</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">How to evaluate this architecture</h2>
              <p className="mt-2 max-w-3xl text-sm text-neutral-600">
                The goal is not pixel-perfect final UI yet. It is to validate whether this information architecture gives Richard the right top-level control surface before wiring live data and deciding what should remain separate.
              </p>
            </div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-700">
              <div className="flex items-center gap-2 font-medium text-neutral-900"><ShieldCheck className="h-4 w-4 text-orange-500" /> Honest preview scope</div>
              <p className="mt-2">All numbers on this page are explicitly demo placeholders unless already linked elsewhere in the app.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
