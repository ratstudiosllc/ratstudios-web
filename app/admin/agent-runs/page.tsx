import Link from "next/link";
import { getOpsRuns } from "@/lib/ops-admin";

export default async function AgentRunsPage() {
  const data = await getOpsRuns();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-orange-500">Execution Activity</h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Dashboard</Link>
            <Link href="/admin/org-chart" className="rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-white hover:border-black/20">Org Chart</Link>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {data.runs.map((run) => (
            <div key={run.id} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 font-semibold text-neutral-700">{run.project}</span>
                <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 font-semibold text-neutral-700">{run.agent_name}</span>
                <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 font-semibold text-neutral-700">{run.status}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-neutral-950">{run.task_title}</h2>
              <p className="mt-2 text-sm text-neutral-600">Owner: {run.owner}</p>
              <p className="mt-1 text-sm text-neutral-500">Updated: {new Date(run.updated_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
