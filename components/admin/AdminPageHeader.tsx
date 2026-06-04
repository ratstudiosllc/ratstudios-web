import Link from "next/link";
import {
  Activity,
  Building2,
  Globe2,
  Headphones,
  LayoutDashboard,
  Layers3,
  ListTodo,
  Megaphone,
  Menu,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { orgChartMembers } from "@/lib/org-chart";
import { getCurrentApps, getFutureApps } from "@/lib/studio-admin";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

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

export function AdminPageHeader({ active }: { title?: string; active: AdminNavKey; eyebrow?: string }) {
  const appDetailPages = getCurrentApps().map((app) => ({
    href: app.href,
    label: app.name,
  }));
  const futureAppDetailPages = getFutureApps().map((app) => ({
    href: `/admin/future-apps/${app.slug}`,
    label: app.name,
  }));
  const orgDetailPages = orgChartMembers.map((member) => ({
    href: `/admin/org-chart/${member.slug}`,
    label: member.name,
  }));
  const allAdminPages = [
    ...navItems.map((item) => ({ href: item.href, label: item.label })),
    ...extraAdminPages.map((item) => ({ href: item.href, label: item.label })),
    ...appDetailPages,
    ...futureAppDetailPages,
    ...orgDetailPages,
    ...sandboxPages.map((item) => ({ href: item.href, label: item.label })),
  ];

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <nav className="hidden flex-wrap gap-3 md:flex" aria-label="Admin navigation">
        {navItems.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "border-orange-200 bg-orange-50 text-neutral-950"
                  : "border-black/10 bg-white text-neutral-800 hover:border-black/20 hover:bg-[#fcfaf7]"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <details className="admin-pages-menu group relative">
        <summary className="admin-pages-menu-trigger inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-black/10 bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800">
          <Menu className="admin-pages-menu-open-icon h-4 w-4" />
          <X className="admin-pages-menu-close-icon hidden h-5 w-5" />
          <span className="admin-pages-menu-label hidden sm:inline">All admin pages</span>
        </summary>
        <div className="admin-pages-menu-panel border border-black/10 bg-white p-4 shadow-xl">
          <div className="mb-4 border-b border-black/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">RaT Studios Admin</p>
            <p className="mt-1 text-lg font-semibold text-neutral-950">All pages</p>
          </div>
          <div className="grid gap-1">
            {allAdminPages.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-[#fcfaf7]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}
