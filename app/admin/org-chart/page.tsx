import Link from "next/link";
import { ArrowRight, Building2, GitBranch, Network, Users } from "lucide-react";
import { buildAgentWorkflowSnapshot } from "@/lib/agent-workflow";
import { getOpsRuns } from "@/lib/ops-admin";
import { getOrgChartChildren, getOrgChartRoots } from "@/lib/org-chart";
import { getOrgRoleStatus, getStatusClasses } from "@/lib/org-chart-status";

function MemberCard({
  name,
  title,
  slug,
  team,
  type,
  reportsTo,
  status,
}: {
  name: string;
  title: string;
  slug: string;
  team: string;
  type: string;
  reportsTo?: string;
  status: ReturnType<typeof getOrgRoleStatus>;
}) {
  return (
    <Link href={`/admin/org-chart/${slug}`} className="block rounded-[28px] border border-black/5 bg-white p-5 shadow-sm transition hover:border-black/10 hover:bg-[#fcfaf7]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">{team}</p>
          <h3 className="mt-2 text-xl font-semibold text-neutral-950">{name}</h3>
          <p className="mt-2 text-sm text-neutral-600">{title}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <p className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">{type}</p>
            <p className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(status.state)}`}>{status.label}</p>
          </div>
          <p className="mt-3 text-sm text-neutral-500">{status.detail}</p>
          {reportsTo ? <p className="mt-2 text-xs text-neutral-400">Reports to {reportsTo}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {status.issueHref ? <span className="rounded-full bg-[#fcfaf7] px-3 py-1 font-semibold text-neutral-700">Issues linked</span> : null}
            {status.runHref ? <span className="rounded-full bg-[#fcfaf7] px-3 py-1 font-semibold text-neutral-700">Runs linked</span> : null}
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-neutral-400" />
      </div>
    </Link>
  );
}

function ReportingBand({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl bg-[#fcfaf7] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
      <p className="mt-2 text-sm text-neutral-700">{body}</p>
    </div>
  );
}

export default async function OrgChartPage() {
  const [ops, issues] = await Promise.all([
    getOpsRuns().catch(() => null),
    import("@/lib/issues-tracker").then((m) => m.getIssueTracker().catch(() => null)),
  ]);
  const workflow = buildAgentWorkflowSnapshot(issues, ops);

  const roots = getOrgChartRoots();
  const leadership = roots.filter((member) => member.slug !== "bub");
  const bub = roots.find((member) => member.slug === "bub") ?? null;
  const directReports = bub ? getOrgChartChildren(bub.name) : [];
  const executionReports = getOrgChartChildren("Execution Agent");

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Organization chart</p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950">RaT Studios leadership and agent org</h1>
              <p className="mt-4 max-w-3xl text-sm text-neutral-600">This is the working org structure for RaT Studios. Leadership sits at the top, Bub runs execution beneath them, and agents are organized into real operating roles with live work links.</p>
            </div>
            <Link href="/admin" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">Back to dashboard</Link>
          </div>
        </div>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900">
            <Users className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Top of org</h2>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {leadership.map((member) => (
              <MemberCard key={member.slug} {...member} status={getOrgRoleStatus(member.slug, workflow, ops)} />
            ))}
          </div>
          {bub ? (
            <div className="mt-6 grid gap-5 md:grid-cols-1">
              <MemberCard {...bub} status={getOrgRoleStatus(bub.slug, workflow, ops)} />
            </div>
          ) : null}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ReportingBand label="Leadership role" body="Richard and Topher set direction, approve priorities, and handle final human signoff on important work." />
            <ReportingBand label="Bub role" body="Bub orchestrates work, routes it to the right agents, and keeps the queue moving instead of waiting for manual babysitting." />
            <ReportingBand label="Verification rule" body="Nothing becomes resolved just because an agent says it is done. Finished work moves to Needs Verification first." />
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900">
            <Network className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Direct reports under Bub</h2>
          </div>
          <p className="mt-3 text-sm text-neutral-600">These are the operating roles Bub coordinates directly. Click any role to see duties, tasks, and live work links.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {directReports.map((member) => (
              <MemberCard key={member.slug} {...member} status={getOrgRoleStatus(member.slug, workflow, ops)} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900">
            <Building2 className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Engineering specialists under execution</h2>
          </div>
          <p className="mt-3 text-sm text-neutral-600">These specialists sit underneath the execution function. They are role-specific contributors, not top-level managers.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {executionReports.map((member) => (
              <MemberCard key={member.slug} {...member} status={getOrgRoleStatus(member.slug, workflow, ops)} />
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900">
            <GitBranch className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Reporting logic</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <ReportingBand label="Leadership" body="Richard + Topher" />
            <ReportingBand label="Chief of Staff / Orchestrator" body="Bub" />
            <ReportingBand label="Operating managers" body="Issues, Execution, QA, Growth, Ideas" />
            <ReportingBand label="Specialists" body="Frontend + Backend under Execution" />
          </div>
        </section>
      </div>
    </div>
  );
}
