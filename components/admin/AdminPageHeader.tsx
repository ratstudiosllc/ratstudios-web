import Link from "next/link";
import {
  Activity,
  Building2,
  FlaskConical,
  Globe2,
  Headphones,
  LayoutDashboard,
  Layers3,
  ListTodo,
  Megaphone,
  Menu,
  PackageOpen,
  Rocket,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { orgChartMembers } from "@/lib/org-chart";
import { getCurrentApps, getFutureApps } from "@/lib/studio-admin";

type AdminNavKey = "dashboard" | "current-apps" | "ideas" | "future-apps" | "issues" | "recommendations" | "customer-support" | "domains" | "org-chart" | "agent-kpis" | "marketing" | "agent-runs";

const navItems: Array<{ key: AdminNavKey; href: string; label: string; icon: React.ReactNode }> = [
  { key: "dashboard", href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 text-orange-500" /> },
  { key: "current-apps", href: "/admin/current-apps", label: "Current Apps", icon: <Layers3 className="h-4 w-4 text-orange-500" /> },
  { key: "ideas", href: "/admin/ideas", label: "Ideas", icon: <Sparkles className="h-4 w-4 text-orange-500" /> },
  { key: "future-apps", href: "/admin/future-apps", label: "Future Apps", icon: <Megaphone className="h-4 w-4 text-orange-500" /> },
  { key: "issues", href: "/admin/issues", label: "Issues", icon: <Wrench className="h-4 w-4 text-orange-500" /> },
  { key: "recommendations", href: "/admin/recommendations", label: "Recommendations", icon: <ListTodo className="h-4 w-4 text-orange-500" /> },
  { key: "customer-support", href: "/admin/customer-support", label: "Customer Support", icon: <Headphones className="h-4 w-4 text-orange-500" /> },
  { key: "domains", href: "/admin/domains", label: "Domains", icon: <Globe2 className="h-4 w-4 text-orange-500" /> },
  { key: "org-chart", href: "/admin/org-chart", label: "Org Chart", icon: <Building2 className="h-4 w-4 text-orange-500" /> },
  { key: "agent-kpis", href: "/admin/agent-kpis", label: "Agent KPIs", icon: <Activity className="h-4 w-4 text-orange-500" /> },
];

const extraAdminPages = [
  { href: "/admin/agent-runs", label: "Agent Runs", note: "Execution activity" },
  { href: "/admin/agent-dashboard", label: "Agent Dashboard", note: "Runtime KPI prototype" },
  { href: "/admin/marketing", label: "Marketing", note: "Application marketing view" },
  { href: "/admin/ideas/new", label: "New Idea", note: "Idea intake form" },
  { href: "/admin/login", label: "Admin Login", note: "Admin gate" },
];

const sandboxPages = [
  { href: "/admin/testpage", label: "Admin Test Page", note: "Sandbox dashboard" },
  { href: "/admin/testingpage", label: "Architecture Preview", note: "Testing/admin preview" },
  { href: "/admin/testpage/current-apps", label: "Current Apps Checklist Prototype", note: "Sandbox checklist" },
  { href: "/admin/testpage/app-checklist-structure", label: "App Checklist Structure Test", note: "Sandbox checklist structure" },
];

function AdminMenuGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{ href: string; label: string; note: string }>;
}) {
  return (
    <div>
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{title}</p>
      <div className="mt-2 grid gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 transition hover:bg-[#fcfaf7]">
            <span className="block text-sm font-semibold text-neutral-950">{item.label}</span>
            <span className="mt-0.5 block text-xs text-neutral-500">{item.note}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AdminPageHeader({ active }: { title?: string; active: AdminNavKey; eyebrow?: string }) {
  const activeItem = navItems.find((item) => item.key === active) ?? navItems[0];
  const appDetailPages = getCurrentApps().map((app) => ({
    href: app.href,
    label: app.name,
    note: "Current app detail page",
  }));
  const futureAppDetailPages = getFutureApps().map((app) => ({
    href: `/admin/future-apps/${app.slug}`,
    label: app.name,
    note: "Future app detail page",
  }));
  const orgDetailPages = orgChartMembers.map((member) => ({
    href: `/admin/org-chart/${member.slug}`,
    label: member.name,
    note: member.title,
  }));

  return (
    <div className="admin-pages-bar flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Admin navigation</p>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          {activeItem.icon}
          <p className="truncate text-sm font-semibold text-neutral-950">{activeItem.label}</p>
        </div>
      </div>
      <details className="admin-pages-menu group relative">
        <summary className="admin-pages-menu-trigger inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-black/10 bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800">
          <Menu className="admin-pages-menu-open-icon h-4 w-4" />
          <X className="admin-pages-menu-close-icon hidden h-5 w-5" />
          <span className="admin-pages-menu-label hidden sm:inline">All admin pages</span>
        </summary>
        <div className="admin-pages-menu-panel border border-black/10 bg-white p-4 shadow-xl">
          <div className="mb-4 border-b border-black/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">RaT Studios Admin</p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">Every admin page</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <AdminMenuGroup
              title="Primary"
              items={navItems.map((item) => ({
                href: item.href,
                label: item.label,
                note: item.key === active ? "Current section" : "Admin section",
              }))}
            />
            <AdminMenuGroup title="Utilities" items={extraAdminPages} />
            <AdminMenuGroup title="Current app details" items={appDetailPages} />
            <AdminMenuGroup title="Future app details" items={futureAppDetailPages} />
            <AdminMenuGroup title="Org detail pages" items={orgDetailPages} />
            <AdminMenuGroup title="Sandboxes and tests" items={sandboxPages} />
            <div className="rounded-xl bg-[#fcfaf7] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Route families</p>
              <div className="mt-3 grid gap-2 text-sm text-neutral-700">
                <div className="flex items-center gap-2"><PackageOpen className="h-4 w-4 text-orange-500" /> /admin/apps/[slug]</div>
                <div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-orange-500" /> /admin/future-apps/[slug]</div>
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-orange-500" /> /admin/ideas/[slug]</div>
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-orange-500" /> /admin/org-chart/[slug]</div>
                <div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-orange-500" /> /admin/testpage/*</div>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
