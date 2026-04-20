import Link from "next/link";
import { getOpsRuns } from "@/lib/ops-admin";

export default async function AgentRunsPage() {
  const data = await getOpsRuns();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>Execution Activity</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Recent run history, agent throughput, and the queue that is actually moving.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/org-chart" className="btn-gradient px-6 py-3 text-sm">Org Chart</Link>
            </div>
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
