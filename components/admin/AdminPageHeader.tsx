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

export function AdminPageHeader({
  title,
  active,
  eyebrow = "RaT Studios Admin",
}: {
  title: string;
  active: AdminNavKey;
  eyebrow?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
      <div className="h-2 gradient-bg" />
      <div className="p-8 md:p-10">
        <p className="text-3xl font-semibold text-orange-500">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold text-neutral-950">{title}</h1>
        <div className="mt-8 flex flex-wrap gap-3">
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
                    : "border-black/10 bg-[#fcfaf7] text-neutral-800 hover:bg-white hover:border-black/20"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
