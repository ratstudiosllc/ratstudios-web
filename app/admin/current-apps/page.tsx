import Link from "next/link";
import { getCurrentApps, getAppIssueMetrics } from "@/lib/studio-admin";
import { getIssueTracker } from "@/lib/issues-tracker";

export default async function CurrentAppsPage() {
  const tracker = await getIssueTracker().catch(() => null);
  const apps = getCurrentApps();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>Current App Portfolio</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Live products, issue pressure, and the next moves that actually matter.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/issues" className="btn-gradient px-6 py-3 text-sm">Tracked Issues</Link>
              <Link href="/admin/marketing" className="btn-gradient px-6 py-3 text-sm">Marketing</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {apps.map((app) => {
            const metrics = getAppIssueMetrics(app, tracker);
            return (
              <Link key={app.slug} href={app.href} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">{app.type}</p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{app.name}</h2>
                <p className="mt-2 text-sm text-neutral-600">{app.stage} • {app.status}</p>
                <p className="mt-4 text-sm text-neutral-600">{app.summary}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Open</p><p className="mt-2 text-2xl font-semibold text-neutral-950">{metrics.open}</p></div>
                  <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Blocked</p><p className="mt-2 text-2xl font-semibold text-red-700">{metrics.blocked}</p></div>
                  <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Ready for QA</p><p className="mt-2 text-2xl font-semibold text-sky-700">{metrics.readyForQa}</p></div>
                  <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">P1 open</p><p className="mt-2 text-2xl font-semibold text-red-700">{metrics.p1Open}</p></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
