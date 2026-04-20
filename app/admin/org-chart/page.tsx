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

function TeamSection({
  icon,
  title,
  body,
  members,
  workflow,
  ops,
}: {
  icon: React.ReactNode;
  title: string;
  body?: string;
  members: Array<{ slug: string; name: string; title: string; team: string; type: string; reportsTo?: string }>;
  workflow: Parameters<typeof getOrgRoleStatus>[1];
  ops: Parameters<typeof getOrgRoleStatus>[2];
}) {
  if (!members.length) return null;

  return (
    <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-neutral-900">
        {icon}
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {body ? <p className="mt-3 text-sm text-neutral-600">{body}</p> : null}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <MemberCard key={member.slug} {...member} status={getOrgRoleStatus(member.slug, workflow, ops)} />
        ))}
      </div>
    </section>
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
  const markReports = getOrgChartChildren("Mark");
  const qaReports = getOrgChartChildren("QA / Verification Agent");

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-sm">
          <div className="h-2 gradient-bg" />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--color-orange)" }}>Admin Portal</p>
            <h1 className="mt-3 text-4xl font-bold" style={{ color: "var(--color-dark)" }}>RaT Studios Leadership and Agent Org</h1>
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--color-slate)" }}>Who owns what, how work flows, and where agent execution actually sits in the studio.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/admin" className="btn-gradient px-6 py-3 text-sm">Studio Dashboard</Link>
              <Link href="/admin/agent-runs" className="btn-gradient px-6 py-3 text-sm">Agent Runs</Link>
            </div>
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

        <TeamSection
          icon={<Network className="h-5 w-5" />}
          title="Direct reports under Bub"
          body="These are the operating roles Bub coordinates directly. Click any role to see duties, tasks, and live work links."
          members={directReports}
          workflow={workflow}
          ops={ops}
        />

        <TeamSection
          icon={<Building2 className="h-5 w-5" />}
          title="Engineering specialists under execution"
          body="These specialists sit underneath the execution function. They are role-specific contributors, not top-level managers."
          members={executionReports}
          workflow={workflow}
          ops={ops}
        />

        <TeamSection
          icon={<Building2 className="h-5 w-5" />}
          title="Marketing specialists under Mark"
          body="These agents handle growth execution and focused marketing work under the marketing lane."
          members={markReports}
          workflow={workflow}
          ops={ops}
        />

        <TeamSection
          icon={<Building2 className="h-5 w-5" />}
          title="Verification and release specialists under QA"
          body="These agents support release confidence, validation, and regression checking under the QA lane."
          members={qaReports}
          workflow={workflow}
          ops={ops}
        />

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-900">
            <GitBranch className="h-5 w-5" />
            <h2 className="text-2xl font-semibold">Reporting logic</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <ReportingBand label="Leadership" body="Richard + Topher" />
            <ReportingBand label="Chief of Staff / Orchestrator" body="Bub" />
            <ReportingBand label="Operating managers" body="Issues, Execution, QA, Growth, Ideas" />
            <ReportingBand label="Specialists" body="Frontend + Backend under Execution, workers under Mark and QA" />
          </div>
        </section>
      </div>
    </div>
  );
}
