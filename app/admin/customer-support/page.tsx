import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  Headphones,
  Inbox,
  KeyRound,
  Lock,
  MailCheck,
  MessageSquareText,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import supportPolicy from "@/data/customer-support-agent-policy.json";

export const revalidate = 300;

const triageCategories = [
  { label: "Urgent customer issue", detail: "Paying user blocked, data missing, login failure, app-breaking workflow." },
  { label: "Billing or refund", detail: "Stripe, subscription, invoice, cancellation, refund, failed payment, plan access." },
  { label: "Bug report", detail: "Repeatable product issue with app, device, browser, account, and reproduction context." },
  { label: "Sales lead", detail: "Inbound buyer, partnership, advisor, school, co-op, clinic, or enterprise inquiry." },
  { label: "Platform alert", detail: "Apple, Google, Stripe, Vercel, Supabase, domains, email, uptime, or security provider." },
  { label: "Low priority", detail: "Newsletters, promos, vendor noise, cold outreach, non-customer messages." },
];

const notificationRules = [
  "Notify immediately for blocked customers, billing failures, refunds, legal/security issues, platform alerts, and strong sales leads.",
  "Bundle newsletters, low-value vendor mail, routine receipts, and non-urgent product updates into a daily digest.",
  "Post a support brief with sender, product, severity, summary, suggested next step, and a human-approved reply draft.",
  "Group repeat bug reports together so the issue tracker shows real customer impact instead of one-off noise.",
];

const hardGuardrails = [
  "No Gmail send permission at the OAuth/API level.",
  "No auto-replies, forwarding, deleting, archiving, spam marking, or mailbox rule changes.",
  "No refund promises, legal commitments, account ownership decisions, or tax/medical/financial advice.",
  "No password reset, account takeover, billing identity, or security incident handling without human review.",
  "Redact passwords, tokens, API keys, auth links, payment details, and unnecessary customer personal data from notifications.",
  "Escalate angry customers, legal threats, security reports, payment disputes, minors, press, and anything involving data loss.",
];

const setupSteps = [
  { title: "Create the support inbox", body: "Use a Rat Studios controlled account such as support@ratstudios.ai, hello@ratstudios.ai, or product-specific aliases that forward into one support mailbox." },
  { title: "Connect read-only Gmail access", body: "Start with metadata and message read scopes only. The agent should be technically unable to send, delete, archive, forward, or mutate labels." },
  { title: "Add source routing", body: "Route support forms, Stripe, Apple, Google, Vercel, Supabase, domain registrar, app stores, and customer replies into the monitored inbox." },
  { title: "Define severity rules", body: "Map customer-blocking, billing, legal, security, and platform messages to immediate notification. Everything else can wait for digest." },
  { title: "Create the support brief format", body: "Every escalated item should include sender, product, account clues, urgency, issue summary, proposed internal action, and a reply draft." },
  { title: "Review for two weeks", body: "Run read-only first, tune false positives, then consider safe label-writing like Needs Reply, Bug, Billing, or Sales Lead." },
];

const supportBriefFields = [
  "Customer / sender",
  "Product affected",
  "Severity",
  "Issue summary",
  "Evidence and links",
  "Suggested owner",
  "Suggested internal action",
  "Human-approved reply draft",
];

function Card({
  eyebrow,
  title,
  body,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{title}</h2>
          {body ? <p className="mt-2 text-sm leading-6 text-neutral-600">{body}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "green" | "amber" | "red" | "blue" | "neutral" }) {
  const styles = {
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-sky-100 text-sky-800",
    neutral: "bg-neutral-100 text-neutral-700",
  };

  return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${styles[tone]}`}>{children}</span>;
}

export default function CustomerSupportPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <AdminPageHeader title="Customer Support" active="customer-support" />

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Inbox operating model</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">Read-only Gmail triage for Rat Studios support</h1>
              <p className="mt-4 text-base leading-7 text-neutral-600">
                The agent watches the support inbox, classifies messages, summarizes what matters, drafts replies for humans, and escalates important customer or platform items. It does not send email or mutate the mailbox.
              </p>
            </div>
            <div className="grid min-w-[260px] gap-3 text-sm">
              <div className="rounded-2xl bg-[#fcfaf7] p-4">
                <p className="font-semibold text-neutral-950">Recommended launch mode</p>
                <p className="mt-1 text-neutral-600">Read-only, notify-only, human-approved drafts</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="green">Read allowed</Pill>
                <Pill tone="blue">Draft help</Pill>
                <Pill tone="red">No sending</Pill>
                <Pill tone="amber">Human approval</Pill>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
            <Inbox className="h-5 w-5 text-orange-500" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Mailbox access</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">Read-only</p>
            <p className="mt-1 text-sm text-neutral-500">No Gmail mutation scopes at launch.</p>
          </div>
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
            <Bell className="h-5 w-5 text-orange-500" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Urgent flow</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">Immediate alert</p>
            <p className="mt-1 text-sm text-neutral-500">Customer-blocking, billing, legal, security, platform.</p>
          </div>
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
            <MessageSquareText className="h-5 w-5 text-orange-500" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Reply support</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">Draft only</p>
            <p className="mt-1 text-sm text-neutral-500">Suggested responses stay in the dashboard or chat.</p>
          </div>
          <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-orange-500" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Risk posture</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">Low blast radius</p>
            <p className="mt-1 text-sm text-neutral-500">Useful support context without external actions.</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card
            eyebrow="Exact permissions"
            title="What the agent can do"
            body={supportPolicy.purpose}
            icon={<CheckCircle2 className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {supportPolicy.canDo.map((permission) => (
                <div key={permission} className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{permission}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            eyebrow="Exact restrictions"
            title="What the agent cannot do"
            body="These restrictions are enforced by OAuth scope validation and repeated in the agent policy."
            icon={<XCircle className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {supportPolicy.cannotDo.map((restriction) => (
                <div key={restriction} className="flex gap-3 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-900">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{restriction}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card
            eyebrow="Gmail OAuth"
            title="Allowed and forbidden scopes"
            body="The runner refuses to start if configured scopes include anything outside the allowed list or inside the forbidden list."
            icon={<KeyRound className="h-5 w-5" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Allowed</p>
                <div className="mt-3 space-y-2">
                  {supportPolicy.gmail.allowedScopes.map((scope) => (
                    <p key={scope} className="break-all rounded-xl bg-white px-3 py-2 text-xs font-medium text-emerald-900">{scope}</p>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-700">Forbidden</p>
                <div className="mt-3 space-y-2">
                  {supportPolicy.gmail.forbiddenScopes.map((scope) => (
                    <p key={scope} className="break-all rounded-xl bg-white px-3 py-2 text-xs font-medium text-red-900">{scope}</p>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card
            eyebrow="Files to review"
            title="Behavior control files"
            body="These are the files Topher and Richard should review before live Gmail access is connected."
            icon={<FileText className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {supportPolicy.reviewFiles.map((file) => (
                <div key={file} className="rounded-2xl bg-[#fcfaf7] px-4 py-3 font-mono text-sm text-neutral-800">{file}</div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card
            eyebrow="Process"
            title="Setup checklist"
            body="This is the order to wire the Gmail support agent without giving it dangerous permissions."
            icon={<ClipboardList className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {setupSteps.map((step, index) => (
                <div key={step.title} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-orange-600">{index + 1}</span>
                    <div>
                      <p className="font-semibold text-neutral-950">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{step.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            eyebrow="Guardrails"
            title="Hard no-go rules"
            body="These should be enforced in permissions first, then repeated in agent instructions and audit checks."
            icon={<Lock className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {hardGuardrails.map((rule) => (
                <div key={rule} className="flex gap-3 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-900">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{rule}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card
            eyebrow="Triage"
            title="Message categories"
            body="The agent should classify every message into one primary category before deciding whether to notify."
            icon={<MailCheck className="h-5 w-5" />}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {triageCategories.map((category) => (
                <div key={category.label} className="rounded-2xl bg-[#fcfaf7] p-4">
                  <p className="font-semibold text-neutral-950">{category.label}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{category.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            eyebrow="Notifications"
            title="What gets surfaced"
            body="The dashboard should reduce noise, not become a second inbox."
            icon={<AlertTriangle className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {notificationRules.map((rule) => (
                <div key={rule} className="flex gap-3 rounded-2xl bg-[#fcfaf7] p-4 text-sm leading-6 text-neutral-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p>{rule}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card
            eyebrow="Support brief"
            title="Escalation format"
            body="Every important item should arrive as a complete decision packet, not a vague heads-up."
            icon={<FileText className="h-5 w-5" />}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {supportBriefFields.map((field) => (
                <div key={field} className="rounded-2xl bg-[#fcfaf7] px-4 py-3 text-sm font-medium text-neutral-800">{field}</div>
              ))}
            </div>
          </Card>

          <Card
            eyebrow="Permissions"
            title="Safe permission ladder"
            body="Start smaller than you think. Add capability only after the triage quality is boringly reliable."
            icon={<KeyRound className="h-5 w-5" />}
          >
            <div className="space-y-3 text-sm leading-6 text-neutral-700">
              <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-900">
                <p className="font-semibold">Phase 1: read-only monitor</p>
                <p className="mt-1">Read messages, classify, notify, summarize, and draft suggested replies outside Gmail.</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-900">
                <p className="font-semibold">Phase 2: safe labels only</p>
                <p className="mt-1">Optionally add labels like Needs Reply, Billing, Bug, Sales Lead, and Platform Alert.</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-4 text-red-900">
                <p className="font-semibold">Do not add send authority</p>
                <p className="mt-1">Even later, keep outbound replies human-sent unless Rat Studios makes a deliberate policy change.</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-6 rounded-[32px] border border-black/5 bg-neutral-950 p-7 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">Recommended first build</p>
              <h2 className="mt-2 text-2xl font-semibold">Read-only Gmail monitor plus immediate support alerts</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                The agent checks the Rat Studios support inbox every 10 to 15 minutes during business hours, posts urgent briefs to the approved internal channel, produces one daily digest, and keeps all outbound communication human-approved.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill tone="green"><UserCheck className="mr-1 inline h-3 w-3" /> Human sends</Pill>
              <Pill tone="blue"><Headphones className="mr-1 inline h-3 w-3" /> Agent triages</Pill>
              <Pill tone="red"><XCircle className="mr-1 inline h-3 w-3" /> No auto-reply</Pill>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
