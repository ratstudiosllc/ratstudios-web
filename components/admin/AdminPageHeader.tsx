import Link from "next/link";
import {
  Activity,
  Building2,
  LayoutDashboard,
  Layers3,
  Megaphone,
  Sparkles,
  Wrench,
} from "lucide-react";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type AdminNavKey = "dashboard" | "current-apps" | "ideas" | "future-apps" | "issues" | "org-chart" | "agent-kpis" | "marketing" | "agent-runs";

const navItems: Array<{ key: AdminNavKey; href: string; label: string; icon: React.ReactNode }> = [
  { key: "dashboard", href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 text-orange-500" /> },
  { key: "current-apps", href: "/admin/current-apps", label: "Current Apps", icon: <Layers3 className="h-4 w-4 text-orange-500" /> },
  { key: "ideas", href: "/admin/ideas", label: "Ideas", icon: <Sparkles className="h-4 w-4 text-orange-500" /> },
  { key: "future-apps", href: "/admin/future-apps", label: "Future Apps", icon: <Megaphone className="h-4 w-4 text-orange-500" /> },
  { key: "issues", href: "/admin/issues", label: "Issues", icon: <Wrench className="h-4 w-4 text-orange-500" /> },
  { key: "org-chart", href: "/admin/org-chart", label: "Org Chart", icon: <Building2 className="h-4 w-4 text-orange-500" /> },
  { key: "agent-kpis", href: "/admin/agent-kpis", label: "Agent KPIs", icon: <Activity className="h-4 w-4 text-orange-500" /> },
];

export function AdminPageHeader({ active }: { title?: string; active: AdminNavKey; eyebrow?: string }) {
  return (
    <nav className="flex flex-wrap gap-3" aria-label="Admin navigation">
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
                : "border-black/10 bg-white text-neutral-800 hover:bg-[#fcfaf7] hover:border-black/20"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
