import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Globe2,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Unlock,
} from "lucide-react";
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

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "unknown";
  return new Intl.NumberFormat("en-US", { notation: value >= 100000 ? "compact" : "standard" }).format(value);
}

function formatBytes(value?: number | null) {
  if (value === null || value === undefined) return "unknown";
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let current = value / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && current >= 1024; index += 1) {
    current /= 1024;
    unit = units[index];
  }
  return `${current.toFixed(current >= 100 ? 0 : 1)} ${unit}`;
}

function healthMeta(health: DomainRiskLevel) {
  if (health === "urgent") return { label: "Critical", tone: "bg-red-100 text-red-800 border-red-200", icon: <ShieldAlert className="h-4 w-4" /> };
  if (health === "watch") return { label: "Watch", tone: "bg-amber-100 text-amber-800 border-amber-200", icon: <AlertTriangle className="h-4 w-4" /> };
  if (health === "ok") return { label: "Healthy", tone: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="h-4 w-4" /> };
  return { label: "Unknown", tone: "bg-neutral-100 text-neutral-700 border-black/10", icon: <AlertTriangle className="h-4 w-4" /> };
}

function boolLabel(value: boolean | null, trueLabel: string, falseLabel: string) {
  if (value === null) return "unknown";
  return value ? trueLabel : falseLabel;
}

function KpiCard({ label, value, helper, icon }: { label: string; value: string | number; helper: string; icon: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
        </div>
        <div className="rounded-2xl bg-[#fcfaf7] p-3 text-neutral-700">{icon}</div>
      </div>
      <p className="mt-2 text-sm text-neutral-500">{helper}</p>
    </div>
  );
}

function HealthPill({ value, label }: { value: DomainRiskLevel; label: string }) {
  const meta = healthMeta(value);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", meta.tone)}>
      {meta.icon}
      {label}: {meta.label}
    </span>
  );
}

function MetricTile({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-2xl bg-[#fcfaf7] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-neutral-500">{helper}</p> : null}
    </div>
  );
}

function ReasonList({ title, reasons }: { title: string; reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {reasons.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>
    </div>
  );
}

function Sparkline({ domain }: { domain: DomainRegistrationRow }) {
  const points = domain.trafficSparkline.slice(-24);
  const max = Math.max(...points.map((point) => point.requests), 1);
  if (!points.length) {
    return <div className="flex h-12 items-center text-xs text-neutral-400">No traffic trend available</div>;
  }

  return (
    <div className="flex h-12 items-end gap-1">
      {points.map((point, index) => (
        <div
          key={`${point.label}-${index}`}
          className="min-w-1 flex-1 rounded-t bg-neutral-900/70"
          title={`${point.label}: ${point.requests} requests`}
          style={{ height: `${Math.max(8, (point.requests / max) * 48)}px` }}
        />
      ))}
    </div>
  );
}

function DomainCard({ domain }: { domain: DomainRegistrationRow }) {
  const overall = healthMeta(domain.overallHealthLevel);
  const cloudflareHref = `https://dash.cloudflare.com/?to=/:account/${domain.zoneId ? `${domain.zoneId}/analytics/traffic` : `domains/registrar/${encodeURIComponent(domain.domainName)}`}`;
  const rootRecords = domain.dnsRecords.filter((record) => record.name === domain.domainName || record.name === `www.${domain.domainName}`);
  const emailRecords = domain.dnsRecords.filter((record) => ["MX", "TXT"].includes(record.type));

  return (
    <details className="group rounded-[28px] border border-black/5 bg-white p-6 shadow-sm" open={domain.overallHealthLevel !== "ok"}>
      <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", overall.tone)}>
              {overall.icon}
              {overall.label}
            </span>
            <span className="rounded-full bg-[#fcfaf7] px-2.5 py-1 text-xs font-semibold text-neutral-700">{domain.status}</span>
            {domain.projectSlug ? <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">{domain.projectSlug}</span> : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-neutral-950">{domain.domainName}</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Expires {formatMountain(domain.expiresAt)} {domain.daysUntilExpiry === null ? "" : `(${domain.daysUntilExpiry} days)`}
          </p>
        </div>

        <div className="grid min-w-[260px] gap-2 text-right sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">24h traffic</p>
            <p className="mt-1 text-sm font-semibold text-neutral-950">{formatNumber(domain.traffic24hRequests)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">5xx</p>
            <p className={cn("mt-1 text-sm font-semibold", (domain.errors5xx24h ?? 0) > 0 ? "text-red-700" : "text-neutral-950")}>{formatNumber(domain.errors5xx24h)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Threats</p>
            <p className={cn("mt-1 text-sm font-semibold", (domain.threats24h ?? 0) > 0 ? "text-amber-700" : "text-neutral-950")}>{formatNumber(domain.threats24h)}</p>
          </div>
        </div>
      </summary>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <HealthPill value={domain.riskLevel} label="Registrar" />
        <HealthPill value={domain.dnsHealthLevel} label="DNS" />
        <HealthPill value={domain.sslHealthLevel} label="SSL" />
        <HealthPill value={domain.trafficHealthLevel} label="Traffic" />
        <HealthPill value={domain.emailHealthLevel} label="Email" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <MetricTile label="Auto-renew" value={boolLabel(domain.autoRenew, "on", "off")} />
            <MetricTile
              label="Transfer lock"
              value={boolLabel(domain.locked, "locked", "unlocked")}
              helper={domain.locked === false ? "Transfer lock should usually be on" : undefined}
            />
            <MetricTile label="Zone" value={domain.zoneStatus ?? "not found"} helper={domain.zonePaused ? "paused" : domain.zoneId ? "Cloudflare zone matched" : undefined} />
            <MetricTile label="SSL mode" value={domain.sslMode ?? "unknown"} />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <MetricTile label="Requests 7d" value={formatNumber(domain.traffic7dRequests)} />
            <MetricTile label="Visitors 24h" value={formatNumber(domain.traffic24hUniques)} />
            <MetricTile label="Bandwidth 24h" value={formatBytes(domain.bandwidth24hBytes)} />
            <MetricTile label="Cache hit" value={domain.cacheHitRatio24h === null ? "unknown" : `${domain.cacheHitRatio24h}%`} />
          </div>

          <div className="rounded-2xl bg-[#fcfaf7] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">7-day traffic trend</p>
              <p className="text-xs text-neutral-500">Last sync {formatMountain(domain.lastSyncedAt)}</p>
            </div>
            <div className="mt-3"><Sparkline domain={domain} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <ReasonList title="Health alerts" reasons={domain.overallHealthReasons} />
          {!domain.overallHealthReasons.length ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-semibold">No active health alerts.</p>
              <p className="mt-1">Registrar, DNS, SSL, and traffic checks look good from the cached Cloudflare data.</p>
            </div>
          ) : null}
          {domain.notes ? <p className="rounded-2xl bg-[#fcfaf7] p-4 text-sm text-neutral-700">{domain.notes}</p> : null}
          <Link href={cloudflareHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-[#fcfaf7] px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-white">
            Open in Cloudflare
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-4">
          <p className="text-sm font-semibold text-neutral-950">DNS records</p>
          <div className="mt-3 space-y-2 text-xs text-neutral-600">
            {(rootRecords.length ? rootRecords : domain.dnsRecords.slice(0, 4)).map((record) => (
              <div key={`${record.type}-${record.name}-${record.content}`} className="rounded-xl bg-[#fcfaf7] p-3">
                <p className="font-semibold text-neutral-900">{record.type} {record.name}</p>
                <p className="mt-1 break-all">{record.content}</p>
                <p className="mt-1">{record.proxied === null ? "Proxy unknown" : record.proxied ? "Proxied" : "DNS-only"} · TTL {record.ttl === 1 ? "auto" : record.ttl ?? "unknown"}</p>
              </div>
            ))}
            {!domain.dnsRecords.length ? <p>No cached DNS records yet.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4">
          <p className="text-sm font-semibold text-neutral-950">Email DNS</p>
          <div className="mt-3 space-y-2 text-xs text-neutral-600">
            {emailRecords.slice(0, 5).map((record) => (
              <div key={`${record.type}-${record.name}-${record.content}`} className="rounded-xl bg-[#fcfaf7] p-3">
                <p className="font-semibold text-neutral-900">{record.type} {record.name}</p>
                <p className="mt-1 break-all">{record.content}</p>
              </div>
            ))}
            {!emailRecords.length ? <p>No MX/TXT records detected.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4">
          <p className="text-sm font-semibold text-neutral-950">Zone nameservers</p>
          <div className="mt-3 space-y-2 text-xs text-neutral-600">
            <p className="font-semibold text-neutral-900">Cloudflare</p>
            {domain.zoneNameServers.length ? domain.zoneNameServers.map((server) => <p key={server}>{server}</p>) : <p>unknown</p>}
            <p className="pt-2 font-semibold text-neutral-900">Original</p>
            {domain.zoneOriginalNameServers.length ? domain.zoneOriginalNameServers.map((server) => <p key={server}>{server}</p>) : <p>unknown</p>}
          </div>
        </div>
      </div>
    </details>
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
  const overall = healthMeta(summary.overallHealthLevel);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <AdminPageHeader title="Web Presence Health" active="domains" />

        <section className="mt-8 rounded-[32px] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Cloudflare Health Monitor</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold text-neutral-950">Is our web presence healthy?</h1>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-semibold", overall.tone)}>
                  {overall.icon}
                  {overall.label}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm text-neutral-500">Tracks registrar safety, DNS routing, SSL posture, traffic, errors, threats, and email DNS hygiene for RaT-owned domains.</p>
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
              <p className="mt-2">Add `CLOUDFLARE_ACCOUNT_ID` and a read-only `CLOUDFLARE_API_TOKEN` to enable sync.</p>
            </div>
          ) : null}

          {syncStatus === "success" ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              <p className="font-semibold">Cloudflare sync finished.</p>
              <p className="mt-2">Web presence health cache refreshed successfully.</p>
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
          <KpiCard label="Domains" value={summary.total} helper={`${summary.healthy} healthy · ${summary.watch} watch · ${summary.urgent} critical`} icon={<Globe2 className="h-5 w-5" />} />
          <KpiCard label="Traffic 24h" value={formatNumber(summary.traffic24hRequests)} helper={`${formatNumber(summary.unique24h)} unique visitors`} icon={<Activity className="h-5 w-5" />} />
          <KpiCard label="Errors 24h" value={formatNumber(summary.errors5xx24h)} helper="5xx origin/edge failures" icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard label="Threats 24h" value={formatNumber(summary.threats24h)} helper="Blocked or challenged events" icon={<ShieldCheck className="h-5 w-5" />} />
          <KpiCard label="DNS issues" value={summary.dnsIssues} helper="Routing checks to review" icon={<Signal className="h-5 w-5" />} />
          <KpiCard label="Email DNS" value={summary.emailIssues} helper="MX/SPF/DKIM/DMARC gaps" icon={<Mail className="h-5 w-5" />} />
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Expiring 60d" value={summary.expiring60} helper="Renewal risk window" icon={<RefreshCw className="h-5 w-5" />} />
          <KpiCard label="Auto-renew off" value={summary.autoRenewOff} helper="Should usually be zero" icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard label="Unlocked" value={summary.unlocked} helper="Transfer lock off" icon={<Unlock className="h-5 w-5" />} />
          <KpiCard label="SSL issues" value={summary.sslIssues} helper="SSL mode or cert checks" icon={<Lock className="h-5 w-5" />} />
        </section>

        <section className="mt-8 rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#fcfaf7] p-3 text-neutral-700"><Globe2 className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-950">Domain health portfolio</h2>
                <p className="text-sm text-neutral-500">Last sync: {formatMountain(summary.lastSyncedAt)}</p>
              </div>
            </div>
            <Link href="/api/admin/cloudflare/registrar/domains" className="text-sm font-medium text-neutral-600 underline underline-offset-4">JSON feed</Link>
          </div>
        </section>

        <div className="mt-6 grid gap-5">
          {domains.length === 0 ? (
            <div className="rounded-[28px] border border-black/5 bg-white p-6 text-sm text-neutral-600 shadow-sm">
              No domain health rows yet. Run the SQL upgrade, then use Sync now.
            </div>
          ) : null}
          {domains.map((domain) => <DomainCard key={domain.domainName} domain={domain} />)}
        </div>
      </div>
    </div>
  );
}
