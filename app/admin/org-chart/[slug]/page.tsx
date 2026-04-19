import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ClipboardList, ShieldCheck, UserCircle2, Wrench } from "lucide-react";
import { buildAgentWorkflowSnapshot } from "@/lib/agent-workflow";
import { getOpsRuns } from "@/lib/ops-admin";
import { getOrgChartMember } from "@/lib/org-chart";
import { getOrgRoleStatus, getStatusClasses } from "@/lib/org-chart-status";

export default async function OrgChartMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = getOrgChartMember(slug);

  if (!member) notFound();

  const [ops, issues] = await Promise.all([
    getOpsRuns().catch(() => null),
    import("@/lib/issues-tracker").then((m) => m.getIssueTracker().catch(() => null)),
  ]);
  const workflow = buildAgentWorkflowSnapshot(issues, ops);
  const status = getOrgRoleStatus(member.slug, workflow, ops);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/admin/org-chart" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
          <ChevronLeft className="h-4 w-4" />
          Back to org chart
        </Link>

        <section className="mt-4 rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">{member.team}</p>
              <h1 className="mt-2 text-4xl font-semibold text-neutral-950">{member.name}</h1>
              <p className="mt-3 text-lg text-neutral-700">{member.title}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-500">
                <span className="rounded-full bg-neutral-100 px-3 py-1 font-semibold text-neutral-700">{member.type}</span>
                {member.reportsTo ? <span className="rounded-full bg-neutral-100 px-3 py-1 font-semibold text-neutral-700">Reports to {member.reportsTo}</span> : null}
                <span className={`rounded-full px-3 py-1 font-semibold ${getStatusClasses(status.state)}`}>{status.label}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-600 max-w-sm">
              <p className="font-medium text-neutral-900">Role summary</p>
              <p className="mt-2">{member.summary}</p>
              <p className="mt-3 text-xs text-neutral-500">{status.detail}</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-neutral-900">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Duties</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-neutral-700">
              {member.duties.map((duty) => (
                <li key={duty} className="rounded-2xl bg-[#fcfaf7] p-4">{duty}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-neutral-900">
              <ClipboardList className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Tasks</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-neutral-700">
              {member.tasks.map((task) => (
                <li key={task} className="rounded-2xl bg-[#fcfaf7] p-4">{task}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900">
            <Wrench className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Live work links</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {status.issueHref ? (
              <Link href={status.issueHref} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
                View linked issues
              </Link>
            ) : null}
            {status.runHref ? (
              <Link href={status.runHref} className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
                View agent runs
              </Link>
            ) : null}
            <Link href="/admin/issues" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
              Open issue queue
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900">
            <UserCircle2 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Why this role exists</h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-neutral-700">This role exists so RaT Studios can operate like a real company instead of a loose pile of chats, ideas, and half-finished tasks. Each person or agent has a lane, clear accountability, and a defined handoff into the next stage of work.</p>
        </section>
      </div>
    </div>
  );
}
