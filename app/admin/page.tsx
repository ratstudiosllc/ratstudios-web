import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const revalidate = 0;

const cards = [
  {
    title: "Agent operations",
    body: "Open the OpenClaw-backed agent run and operations dashboard.",
    href: "/admin/agent-dashboard",
    icon: Activity,
  },
  {
    title: "Studio overview",
    body: "Admin home is restored here so this route stays a hub instead of becoming a single-purpose dashboard.",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Admin access",
    body: "Use the same admin gate credentials here and log out when you are done.",
    href: "/auth/logout",
    icon: ShieldCheck,
  },
];

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/auth/login?redirect=%2Fadmin");
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">RaT Studios admin</p>
              <h1 className="mt-2 text-4xl font-semibold text-neutral-950">Admin home</h1>
              <p className="mt-3 max-w-3xl text-sm text-neutral-600">This is the admin landing page again. The OpenClaw dashboard now lives on its own subpage instead of replacing the whole admin route.</p>
            </div>
            <Link href="/auth/logout" className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-[#fcfaf7]">Log out</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]">
                <div className="rounded-2xl bg-black/[0.04] p-3 text-neutral-700 w-fit"><Icon className="h-5 w-5" /></div>
                <h2 className="mt-4 text-2xl font-semibold text-neutral-950">{card.title}</h2>
                <p className="mt-3 text-sm text-neutral-600">{card.body}</p>
              </Link>
            );
          })}
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-semibold text-neutral-950">What changed</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-neutral-600">
            <div className="rounded-2xl bg-[#fcfaf7] p-4">`/admin` is the landing page again.</div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4">The OpenClaw dashboard moved to <span className="font-medium text-neutral-900">`/admin/agent-dashboard`</span>.</div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4">This keeps the admin area extensible instead of turning the root into one giant single-purpose screen.</div>
          </div>
        </section>
      </div>
    </div>
  );
}
