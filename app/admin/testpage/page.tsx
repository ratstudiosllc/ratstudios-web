import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BellRing,
  Briefcase,
  Building2,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  MonitorCog,
  Rocket,
  Settings2,
  Sparkles,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Mode = "ops" | "saas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  note: string;
};

type Tile = {
  title: string;
  body: string;
  icon: React.ReactNode;
  accent: string;
  items: Array<{ label: string; value: string; note: string }>;
};

const modeCopy: Record<Mode, { label: string }> = {
  ops: {
    label: "Internal Ops",
  },
  saas: {
    label: "SaaS Dashboard",
  },
};

const internalAdminNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-4 w-4 text-orange-500" />,
    note: "Studio-level operating overview and priority visibility.",
  },
  {
    label: "Current Apps",
    href: "/admin/current-apps",
    icon: <MonitorCog className="h-4 w-4 text-orange-500" />,
    note: "Shipping products and active delivery lanes.",
  },
  {
    label: "Ideas",
    href: "/admin/ideas",
    icon: <Sparkles className="h-4 w-4 text-orange-500" />,
    note: "Research and validation flow for future bets.",
  },
  {
    label: "Future Apps",
    href: "/admin/future-apps",
    icon: <Rocket className="h-4 w-4 text-orange-500" />,
    note: "Promoted opportunities being shaped into real bets.",
  },
  {
    label: "Issues",
    href: "/admin/issues",
    icon: <Wrench className="h-4 w-4 text-orange-500" />,
    note: "Incident, QA, and release-followup visibility.",
  },
  {
    label: "Org Chart",
    href: "/admin/org-chart",
    icon: <Building2 className="h-4 w-4 text-orange-500" />,
    note: "Roles, responsibilities, and operating alignment.",
  },
  {
    label: "Agent KPIs",
    href: "/admin/agent-kpis",
    icon: <Activity className="h-4 w-4 text-orange-500" />,
    note: "Automation throughput and reliability tracking.",
  },
];

const navByMode: Record<Mode, NavItem[]> = {
  ops: internalAdminNav,
  saas: internalAdminNav,
};

const tilesByMode: Record<Mode, Tile[]> = {
  ops: [
    {
      title: "Studio command deck",
      body: "Internal ops mode stays focused on running the studio: what is shipping, what is blocked, and where founder/operator attention should go next.",
      icon: <LayoutDashboard className="h-5 w-5" />,
      accent: "bg-orange-100 text-orange-800",
      items: [
        { label: "Shipping lanes", value: "4", note: "Current apps actively moving this week." },
        { label: "Cross-team blockers", value: "3", note: "Dependencies spanning engineering, content, and ops." },
        { label: "Founder review slots", value: "2", note: "Decisions waiting on approvals or prioritization." },
      ],
    },
    {
      title: "Automation + agent ops",
      body: "A studio ops dashboard should keep automation health close to the surface so manual intervention is obvious before work backs up.",
      icon: <Rocket className="h-5 w-5" />,
      accent: "bg-sky-100 text-sky-800",
      items: [
        { label: "Daily runs healthy", value: "94%", note: "Preview placeholder for run success and retry rollups." },
        { label: "Queued approvals", value: "5", note: "Human decisions needed before workflows continue." },
        { label: "Ops scripts needing cleanup", value: "2", note: "Maintenance debt visible at the admin layer." },
      ],
    },
    {
      title: "Portfolio execution",
      body: "This mode treats the studio as a portfolio machine: active products, future bets, and operating cadence in one view.",
      icon: <Briefcase className="h-5 w-5" />,
      accent: "bg-emerald-100 text-emerald-800",
      items: [
        { label: "Current products", value: "4", note: "Apps in market or active build-out." },
        { label: "Future bets in pipeline", value: "3", note: "Opportunities already promoted from ideation." },
        { label: "Release train focus", value: "Rat Studios admin", note: "Primary platform workstream this week." },
      ],
    },
    {
      title: "Internal governance",
      body: "Operational accountability matters in this mode: permissions, audit context, and org alignment stay close to execution data.",
      icon: <Building2 className="h-5 w-5" />,
      accent: "bg-violet-100 text-violet-800",
      items: [
        { label: "Org changes pending", value: "1", note: "Role or responsibility changes needing review." },
        { label: "Audit follow-ups", value: "4", note: "Recent changes requiring explicit owner confirmation." },
        { label: "Team pulse", value: "Stable", note: "No urgent resourcing gap flagged in this preview." },
      ],
    },
  ],
  saas: [
    {
      title: "Customer lifecycle",
      body: "SaaS mode pivots the surface toward customer health, onboarding, retention, and renewal signals that an operator would need every day.",
      icon: <Users className="h-5 w-5" />,
      accent: "bg-orange-100 text-orange-800",
      items: [
        { label: "Active accounts", value: "318", note: "Preview customer base across paid tenants." },
        { label: "At-risk renewals", value: "12", note: "Accounts showing usage, support, or billing warning signs." },
        { label: "Onboarding in progress", value: "27", note: "Customers still in activation/setup flow." },
      ],
    },
    {
      title: "Billing + revenue systems",
      body: "This mode emphasizes Stripe-style admin architecture: payment failures, plan state, MRR movement, and collections work queues.",
      icon: <Wallet className="h-5 w-5" />,
      accent: "bg-emerald-100 text-emerald-800",
      items: [
        { label: "MRR snapshot", value: "$42.8k", note: "Preview rollup for recurring revenue." },
        { label: "Failed payments", value: "6", note: "Collections and retry queue for the week." },
        { label: "Expansion opportunities", value: "9", note: "Accounts with usage suggesting upgrade motion." },
      ],
    },
    {
      title: "Tenant support + reliability",
      body: "SaaS admin needs a direct line between customer-facing support pressure and product/infra reliability events.",
      icon: <BellRing className="h-5 w-5" />,
      accent: "bg-sky-100 text-sky-800",
      items: [
        { label: "Open escalations", value: "7", note: "High-importance support threads needing action." },
        { label: "SLA risk", value: "3", note: "Conversations close to breaching response targets." },
        { label: "Incident-linked tickets", value: "2", note: "Customer pain currently tied to active reliability work." },
      ],
    },
    {
      title: "Growth + admin controls",
      body: "A SaaS operator still needs admin governance, but it is framed around tenants, revenue, and product analytics instead of internal studio coordination.",
      icon: <Settings2 className="h-5 w-5" />,
      accent: "bg-violet-100 text-violet-800",
      items: [
        { label: "Feature adoption watchlist", value: "4", note: "Capabilities with weak activation or depth of use." },
        { label: "Admin overrides", value: "11", note: "Recent billing/support actions worth auditing." },
        { label: "Expansion campaign status", value: "Drafting", note: "Lifecycle marketing work tied to product usage segments." },
      ],
    },
  ],
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getMode(value: string | string[] | undefined): Mode {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "saas" ? "saas" : "ops";
}

function ModeToggle({ currentMode }: { currentMode: Mode }) {
  const options: Array<{ mode: Mode; label: string }> = [
    { mode: "ops", label: "Internal Ops" },
    { mode: "saas", label: "SaaS Dashboard" },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-black/10 bg-[#fcfaf7] p-1">
      {options.map((option) => {
        const active = option.mode === currentMode;
        return (
          <Link
            key={option.mode}
            href={`/admin/testpage?mode=${option.mode}`}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              active ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600 hover:text-neutral-950"
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function PreviewCard({ tile }: { tile: Tile }) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]", tile.accent)}>
            {tile.icon}
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-neutral-950">{tile.title}</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{tile.body}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {tile.items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-[#fcfaf7] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">{item.value}</p>
            <p className="mt-2 text-sm text-neutral-600">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function AdminTestPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const mode = getMode(resolvedSearchParams.mode);
  const selectedMode: Mode = mode === "saas" ? "saas" : "ops";
  const navItems = navByMode[selectedMode];
  const tiles = tilesByMode[selectedMode];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-[1500px] px-6 py-10">
        <section className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8">
            <div>
              <h1 className="text-4xl font-bold text-neutral-950">Admin Test Page</h1>
              <div className="mt-4">
                <ModeToggle currentMode={selectedMode} />
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {navItems.map((item) => (
                <Link key={`${selectedMode}-${item.label}`} href={item.href} className="rounded-3xl border border-black/5 bg-[#fcfaf7] p-5 shadow-sm transition hover:border-black/10 hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">{item.icon}</div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-neutral-950">{item.label}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{item.note}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {tiles.map((tile) => (
            <PreviewCard key={`${selectedMode}-${tile.title}`} tile={tile} />
          ))}
        </div>

      </div>
    </div>
  );
}
