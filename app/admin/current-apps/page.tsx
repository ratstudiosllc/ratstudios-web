import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { listFutureApps } from "@/lib/future-apps-agent";
import { getCurrentApps, getAppIssueMetrics } from "@/lib/studio-admin";
import { getIssueTracker } from "@/lib/issues-tracker";

export const dynamic = "force-dynamic";

export default async function CurrentAppsPage() {
  const [tracker, promotedFutureApps] = await Promise.all([
    getIssueTracker().catch(() => null),
    listFutureApps()
      .then((apps) => apps.filter((app) => app.stage === "approved_for_planning"))
      .catch(() => []),
  ]);
  const apps = getCurrentApps();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <AdminPageHeader title="Current App Portfolio" active="current-apps" />

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

          {promotedFutureApps.map((app) => (
            <Link key={app.id} href={`/admin/future-apps/${app.slug}`} className="rounded-[28px] border border-orange-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:bg-[#fcfaf7]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">Promoted current app</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{app.name}</h2>
              <p className="mt-2 text-sm text-neutral-600">Current app portfolio • {app.status}</p>
              <p className="mt-4 text-sm text-neutral-600">{app.summary}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Owner</p><p className="mt-2 text-lg font-semibold text-neutral-950">{app.owner}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next milestone</p><p className="mt-2 text-sm font-semibold text-neutral-950">{app.nextMilestone}</p></div>
                <div className="rounded-2xl bg-[#fcfaf7] p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Blocker</p><p className="mt-2 text-sm font-semibold text-neutral-950">{app.currentBlocker}</p></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
