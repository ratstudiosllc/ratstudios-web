import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getFutureAppById, listFutureApps } from "@/lib/future-apps-agent";

export const revalidate = 300;

function stageClasses(stage: string) {
  if (stage === "ready_for_decision") return "bg-emerald-100 text-emerald-800";
  if (stage === "evaluation_in_progress") return "bg-violet-100 text-violet-800";
  if (stage === "needs_founder_input") return "bg-amber-100 text-amber-800";
  if (stage === "approved_for_planning") return "bg-sky-100 text-sky-800";
  if (stage === "hold" || stage === "rejected") return "bg-neutral-200 text-neutral-700";
  return "bg-neutral-100 text-neutral-700";
}

function stageLabel(stage: string) {
  return stage.replaceAll("_", " ");
}

function Section({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <section className={tone === "muted" ? "rounded-[28px] bg-[#f4efe7] px-6 py-6" : "border-t border-black/8 pt-8"}>
      <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
      <div className="mt-4 text-[15px] leading-7 text-neutral-700">{children}</div>
    </section>
  );
}

function InlineMeta({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</dt>
      <dd className="mt-1 text-sm text-neutral-800">{value && value.trim() ? value : "Not defined yet"}</dd>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-sm text-neutral-500">No details yet.</p>;
  }

  return (
    <ul className="space-y-3 pl-5 text-[15px] leading-7 text-neutral-700 marker:text-neutral-400 list-disc">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function FutureAppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = await getFutureAppById(slug);

  if (!app) notFound();

  const appLinks = await listFutureApps();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <AdminPageHeader title="Future App Pipeline" active="future-apps" />

        <article className="mt-8 rounded-[32px] border border-black/5 bg-white px-6 py-8 shadow-sm sm:px-8 lg:px-12 lg:py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{app.bucket}</p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950 sm:text-4xl">{app.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stageClasses(app.stage)}`}>{stageLabel(app.stage)}</span>
                <span>{app.status}</span>
                <span>• {app.owner}</span>
              </div>
              <p className="mt-5 max-w-3xl text-[15px] leading-7 text-neutral-700">{app.summary}</p>
            </div>
            <Link href="/admin/future-apps" className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-black/[0.03]">
              Back to future apps
            </Link>
          </div>

          <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-black/8 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <InlineMeta label="Owner" value={app.owner} />
            <InlineMeta label="Current blocker" value={app.currentBlocker} />
            <InlineMeta label="Next milestone" value={app.nextMilestone} />
            <InlineMeta
              label="Evaluation status"
              value={app.evaluation.status === "ready" ? "Evaluation brief ready" : app.evaluation.status.replaceAll("_", " ")}
            />
            <InlineMeta label="Recommendation" value={app.evaluation.recommendation} />
            <InlineMeta label="Confidence" value={app.evaluation.confidence} />
            <InlineMeta label="Best wedge" value={app.evaluation.bestWedge} />
            <InlineMeta label="Best initial customer" value={app.evaluation.bestInitialCustomer} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-black/8 pt-6">
            {appLinks.map((item) => (
              <Link
                key={item.slug}
                href={`/admin/future-apps/${item.slug}`}
                className={
                  item.slug === app.slug
                    ? "rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
                    : "rounded-full border border-black/10 bg-[#fcfaf7] px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-white"
                }
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-8">
            <Section title="Overview">
              <div className="space-y-4">
                <p>
                  <span className="font-medium text-neutral-950">Problem.</span> {app.problemStatement}
                </p>
                <p>
                  <span className="font-medium text-neutral-950">Decision summary.</span>{" "}
                  {app.evaluation.decisionSummary ?? "No decision summary yet."}
                </p>
                <p>
                  <span className="font-medium text-neutral-950">Next action.</span>{" "}
                  {app.evaluation.nextAction.replaceAll("_", " ")}
                </p>
              </div>
            </Section>

            <Section title="Target users">
              <BulletList items={app.targetUsers} />
            </Section>

            <Section title="Research and findings">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Prior research notes</h3>
                  <div className="mt-3">
                    <BulletList items={app.priorResearchNotes} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Verified findings</h3>
                  <div className="mt-3">
                    <BulletList items={app.evaluation.verifiedFindings} />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Path forward">
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Next steps</h3>
                  <div className="mt-3">
                    <BulletList items={app.nextSteps} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Progress notes</h3>
                  <div className="mt-3">
                    <BulletList items={app.progressNotes} />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Evaluation">
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Reasons to pursue</h3>
                  <div className="mt-3">
                    <BulletList items={app.evaluation.topReasonsToPursue} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Reasons for caution</h3>
                  <div className="mt-3">
                    <BulletList items={app.evaluation.topReasonsForCaution} />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Assumptions, unknowns, and kill criteria" tone="muted">
              <div className="grid gap-8 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Assumptions</h3>
                  <div className="mt-3">
                    <BulletList items={app.evaluation.assumptions} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Unknowns</h3>
                  <div className="mt-3">
                    <BulletList items={app.evaluation.unknowns} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-500">Kill criteria</h3>
                  <div className="mt-3">
                    <BulletList items={app.evaluation.killCriteria} />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Evaluation brief">
              {app.evaluation.reportSections.length ? (
                <div className="space-y-7">
                  {app.evaluation.reportSections.map((section) => (
                    <section key={section.title}>
                      <h3 className="text-base font-semibold text-neutral-950">{section.title}</h3>
                      <p className="mt-2 text-[15px] leading-7 text-neutral-700">{section.body}</p>
                    </section>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No evaluation brief yet.</p>
              )}
            </Section>

            <div className="flex flex-wrap gap-3 border-t border-black/8 pt-8">
              <form action={`/api/admin/future-apps/${app.id}`} method="POST">
                <input type="hidden" name="action" value="run_evaluation" />
                <button
                  formAction={`/api/admin/future-apps/${app.id}`}
                  formMethod="post"
                  className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Run evaluation
                </button>
              </form>

              <form action={`/api/admin/future-apps/${app.id}`} method="POST">
                <input type="hidden" name="action" value="promote_to_current" />
                <button
                  formAction={`/api/admin/future-apps/${app.id}`}
                  formMethod="post"
                  disabled={app.stage === "approved_for_planning"}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  {app.stage === "approved_for_planning" ? "Already in Current Apps" : "Move to Current Apps"}
                </button>
              </form>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
