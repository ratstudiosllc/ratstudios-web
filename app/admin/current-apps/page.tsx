import Link from "next/link";
import { getCurrentApps, getAppIssueMetrics } from "@/lib/studio-admin";
import { getIssueTracker } from "@/lib/issues-tracker";

export default async function CurrentAppsPage() {
  const tracker = await getIssueTracker().catch(() => null);
  const apps = getCurrentApps();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Current apps</p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Current app portfolio</h1>
              <p className="mt-4 max-w-3xl text-sm text-neutral-600">All active products with their real tracked issue metrics and direct links into each app view.</p>
            </div>
            <Link href="/admin" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">Back to dashboard</Link>
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
