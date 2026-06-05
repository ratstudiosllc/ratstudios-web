import Link from "next/link";
import { AlertTriangle, CheckCircle2, Globe2, Lock, RefreshCw, ShieldAlert, Unlock } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getDomainRegistrationDashboard, type DomainRegistrationRow, type DomainRiskLevel } from "@/lib/cloudflare-registrar";
import { syncRegistrarDomainsAction } from "@/app/admin/domains/actions";

export const dynamic = "force-dynamic";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatMountain(dateString?: string | null) {
  if (!dateString) return "unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Denver",
    timeZoneName: "short",
  }).format(date);
}

function riskMeta(risk: DomainRiskLevel) {
  if (risk === "urgent") return { label: "Urgent", tone: "bg-red-100 text-red-800 border-red-200", icon: <ShieldAlert className="h-4 w-4" /> };
  if (risk === "watch") return { label: "Watch", tone: "bg-amber-100 text-amber-800 border-amber-200", icon: <AlertTriangle className="h-4 w-4" /> };
  if (risk === "ok") return { label: "OK", tone: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="h-4 w-4" /> };
  return { label: "Unknown", tone: "bg-neutral-100 text-neutral-700 border-black/10", icon: <AlertTriangle className="h-4 w-4" /> };
}

function boolLabel(value: boolean | null, trueLabel: string, falseLabel: string) {
  if (value === null) return "unknown";
  return value ? trueLabel : falseLabel;
}

function KpiCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{helper}</p>
    </div>
  );
}

function DomainCard({ domain }: { domain: DomainRegistrationRow }) {
  const risk = riskMeta(domain.riskLevel);
  const cloudflareHref = `https://dash.cloudflare.com/?to=/:account/domains/registrar/${encodeURIComponent(domain.domainName)}`;

  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", risk.tone)}>
              {risk.icon}
              {risk.label}
            </span>
            <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 text-xs font-semibold text-neutral-700">{domain.status}</span>
            {domain.projectSlug ? <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">{domain.projectSlug}</span> : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-neutral-950">{domain.domainName}</h2>
          <p className="mt-2 text-sm text-neutral-500">Expires {formatMountain(domain.expiresAt)} {domain.daysUntilExpiry === null ? "" : `(${domain.daysUntilExpiry} days)`}</p>
        </div>

        <Link href={cloudflareHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-[#fcfaf7] px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-white">
          Open in Cloudflare
        </Link>
      </div>

      {domain.riskReasons.length ? (
        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Needs attention</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {domain.riskReasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Auto-renew</p>
          <p className="mt-2 text-sm font-medium text-neutral-900">{boolLabel(domain.autoRenew, "on", "off")}</p>
        </div>
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Transfer lock</p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-900">
            {domain.locked === false ? <Unlock className="h-4 w-4 text-red-700" /> : <Lock className="h-4 w-4 text-neutral-600" />}
            {boolLabel(domain.locked, "locked", "unlocked")}
          </p>
        </div>
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">DNS zone</p>
          <p className="mt-2 text-sm font-medium text-neutral-900">{domain.zoneStatus ?? "not found"}</p>
        </div>
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Privacy</p>
          <p className="mt-2 text-sm font-medium text-neutral-900">{domain.privacyMode ?? "unknown"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Created</p>
          <p className="mt-2 text-sm text-neutral-800">{formatMountain(domain.createdAt)}</p>
        </div>
        <div className="rounded-2xl bg-[#fcfaf7] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Last synced</p>
          <p className="mt-2 text-sm text-neutral-800">{formatMountain(domain.lastSyncedAt)}</p>
        </div>
      </div>

      {domain.notes ? <p className="mt-4 rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-700">{domain.notes}</p> : null}
    </div>
  );
}

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function DomainsPage({
  searchParams,
}: {
  searchParams?: Promise<{ sync?: string | string[]; message?: string | string[] }> | { sync?: string | string[]; message?: string | string[] };
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const syncStatus = getSearchValue(resolvedSearchParams.sync);
  const syncMessage = getSearchValue(resolvedSearchParams.message);
  const dashboard = await getDomainRegistrationDashboard();
  const { summary, domains } = dashboard;

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <AdminPageHeader title="Domain Registrar Monitor" active="domains" />

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Cloudflare Registrar</p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Registrar registrations</h1>
              <p className="mt-2 max-w-3xl text-sm text-neutral-500">Track RaT-owned Cloudflare Registrar domains, renewal risk, transfer locks, DNS zone matches, and sync freshness.</p>
            </div>
            <form action={syncRegistrarDomainsAction}>
              <button className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
                <RefreshCw className="h-4 w-4" />
                Sync now
              </button>
            </form>
          </div>

          {!dashboard.configured ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              <p className="font-semibold">Cloudflare is not configured yet.</p>
              <p className="mt-2">Add `CLOUDFLARE_ACCOUNT_ID` and a read-only `CLOUDFLARE_API_TOKEN` to enable registrar sync. The page will show cached data here once the first sync succeeds.</p>
            </div>
          ) : null}

          {syncStatus === "success" ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              <p className="font-semibold">Cloudflare sync finished.</p>
              <p className="mt-2">Registrar cache refreshed successfully.</p>
            </div>
          ) : null}

          {syncStatus === "error" ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
              <p className="font-semibold">Cloudflare sync failed.</p>
              <p className="mt-2">{syncMessage || "No error details were returned. Check the Vercel function logs."}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <KpiCard label="Registered" value={summary.total} helper="Cached registrar domains" />
          <KpiCard label="Urgent" value={summary.urgent} helper="Needs action now" />
          <KpiCard label="Watch" value={summary.watch} helper="Review soon" />
          <KpiCard label="Expiring 30d" value={summary.expiring30} helper="Renewal window" />
          <KpiCard label="Auto-renew off" value={summary.autoRenewOff} helper="Should usually be zero" />
          <KpiCard label="Unlocked" value={summary.unlocked} helper="Transfer lock off" />
        </section>

        <section className="mt-8 rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#fcfaf7] p-3 text-neutral-700"><Globe2 className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-950">Domain portfolio</h2>
                <p className="text-sm text-neutral-500">Last sync: {formatMountain(summary.lastSyncedAt)}</p>
              </div>
            </div>
            <Link href="/api/admin/cloudflare/registrar/domains" className="text-sm font-medium text-neutral-600 underline underline-offset-4">JSON feed</Link>
          </div>
        </section>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {domains.length === 0 ? (
            <div className="rounded-[28px] border border-black/5 bg-white p-6 text-sm text-neutral-600 shadow-sm">
              No registrar cache rows yet. Add the Cloudflare env vars, run the SQL cache table, then use Sync now.
            </div>
          ) : null}
          {domains.map((domain) => <DomainCard key={domain.domainName} domain={domain} />)}
        </div>
      </div>
    </div>
  );
}
