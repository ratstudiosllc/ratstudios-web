import Link from "next/link";

export const revalidate = 300;
import { getCurrentApps } from "@/lib/studio-admin";

function stageTone(stage: string) {
  if (stage === "Active development" || stage === "Live") return "bg-emerald-100 text-emerald-800";
  if (stage === "Validating" || stage === "Building") return "bg-amber-100 text-amber-800";
  return "bg-neutral-100 text-neutral-700";
}

export default function MarketingPage() {
  const apps = getCurrentApps();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">Marketing by Application</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/current-apps" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Current Apps</Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Active apps</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{apps.length}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Needs clearer GTM</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{apps.length}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Channel plans tracked</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{apps.length}</p></div>
          <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Marketing owners visible</p><p className="mt-2 text-3xl font-semibold text-neutral-950">{apps.length}</p></div>
        </div>

        <div className="mt-8 space-y-5">
          {apps.map((app) => (
            <div key={app.slug} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">Active app</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stageTone(app.stage)}`}>{app.stage}</span>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{app.name}</h2>
                  <p className="mt-2 text-sm text-neutral-600">{app.summary}</p>
                </div>
                <Link href={app.href} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">Open app page</Link>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                <div className="rounded-2xl bg-[#fcfaf7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Marketing summary</p>
                  <p className="mt-3 text-sm leading-7 text-neutral-700">{app.marketing.summary}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Current focus</p>
                  <p className="mt-3 text-sm leading-7 text-neutral-700">{app.currentFocus}</p>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Next marketing milestone</p>
                  <p className="mt-3 text-sm leading-7 text-neutral-700">{app.nextMilestone}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl bg-[#fcfaf7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Channel / growth work</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    {app.marketing.highlights.map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-[#fcfaf7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">User and revenue context</p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                    <li>• {app.users.summary}</li>
                    <li>• {app.revenue.summary}</li>
                    <li>• Owner: {app.owner}</li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
