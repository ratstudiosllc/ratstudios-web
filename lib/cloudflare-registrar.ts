import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type DomainRiskLevel = "ok" | "watch" | "urgent" | "unknown";

export interface DomainTrafficSparkPoint {
  label: string;
  requests: number;
}

export interface DomainRegistrationRow {
  domainName: string;
  status: string;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  autoRenew: boolean | null;
  locked: boolean | null;
  privacyMode: string | null;
  createdAt: string | null;
  zoneId: string | null;
  zoneNameServers: string[];
  zoneOriginalNameServers: string[];
  zonePaused: boolean | null;
  zoneStatus: string | null;
  projectSlug: string | null;
  notes: string | null;
  cloudflareRaw: unknown;
  riskLevel: DomainRiskLevel;
  riskReasons: string[];
  dnsHealthLevel: DomainRiskLevel;
  dnsHealthReasons: string[];
  dnsRecords: DomainDnsRecordSummary[];
  emailHealthLevel: DomainRiskLevel;
  emailHealthReasons: string[];
  sslHealthLevel: DomainRiskLevel;
  sslHealthReasons: string[];
  sslMode: string | null;
  sslRaw: unknown;
  trafficHealthLevel: DomainRiskLevel;
  trafficHealthReasons: string[];
  traffic24hRequests: number | null;
  traffic7dRequests: number | null;
  traffic24hUniques: number | null;
  traffic7dUniques: number | null;
  bandwidth24hBytes: number | null;
  bandwidth7dBytes: number | null;
  cacheHitRatio24h: number | null;
  cacheHitRatio7d: number | null;
  threats24h: number | null;
  threats7d: number | null;
  errors4xx24h: number | null;
  errors5xx24h: number | null;
  trafficSparkline: DomainTrafficSparkPoint[];
  trafficRaw: unknown;
  overallHealthLevel: DomainRiskLevel;
  overallHealthReasons: string[];
  lastSyncedAt: string | null;
  updatedAt: string | null;
}

export interface DomainDnsRecordSummary {
  id?: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean | null;
  proxiable: boolean | null;
  ttl: number | null;
}

interface CloudflareListResponse<T> {
  success?: boolean;
  errors?: Array<{ message?: string }>;
  result?: T;
}

interface CloudflareRegistration {
  domain?: string;
  domain_name?: string;
  name?: string;
  status?: string;
  expires_at?: string;
  expiration_date?: string;
  expires_on?: string;
  auto_renew?: boolean;
  autorenew?: boolean;
  locked?: boolean;
  privacy?: string | boolean | Record<string, unknown>;
  privacy_mode?: string;
  created_at?: string;
  created_on?: string;
  [key: string]: unknown;
}

interface CloudflareZone {
  id?: string;
  name?: string;
  status?: string;
  paused?: boolean;
  name_servers?: string[];
  original_name_servers?: string[];
}

interface CloudflareDnsRecord {
  id?: string;
  type?: string;
  name?: string;
  content?: string;
  proxied?: boolean;
  proxiable?: boolean;
  ttl?: number;
}

interface CloudflareZoneSetting {
  id?: string;
  value?: unknown;
  editable?: boolean;
  modified_on?: string;
}

interface CloudflareUniversalSslSetting {
  enabled?: boolean;
  value?: unknown;
  modeError?: string;
}

interface TrafficMetricWindow {
  requests: number | null;
  uniques: number | null;
  bytes: number | null;
  cachedBytes: number | null;
  threats: number | null;
  errors4xx: number | null;
  errors5xx: number | null;
}

interface TrafficMetrics {
  last24h: TrafficMetricWindow;
  last7d: TrafficMetricWindow;
  sparkline: DomainTrafficSparkPoint[];
  raw: unknown;
}

interface CloudflareTrafficGraphqlResponse {
  viewer?: {
    zones?: Array<{
      last7d?: Array<Record<string, unknown>>;
      last24h?: Array<Record<string, unknown>>;
    }>;
  };
}

function getCloudflareConfig() {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
  };
}

export function isCloudflareRegistrarConfigured() {
  const config = getCloudflareConfig();
  return Boolean(config.accountId && config.apiToken);
}

function missingConfigError() {
  return new Error("Cloudflare registrar env vars missing: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN");
}

async function cloudflareFetch<T>(path: string): Promise<T> {
  const { accountId, apiToken } = getCloudflareConfig();
  if (!accountId || !apiToken) throw missingConfigError();

  const response = await fetch(`https://api.cloudflare.com/client/v4${path.replace("{account_id}", accountId)}`, {
    headers: {
      authorization: `Bearer ${apiToken}`,
      "content-type": "application/json",
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null) as CloudflareListResponse<T> | null;
  if (!response.ok || body?.success === false) {
    const message = body?.errors?.map((error) => error.message).filter(Boolean).join("; ") || `Cloudflare API error ${response.status}`;
    throw new Error(message);
  }

  return body?.result as T;
}

async function cloudflareGraphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const { apiToken } = getCloudflareConfig();
  if (!apiToken) throw missingConfigError();

  const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null) as { data?: T; errors?: Array<{ message?: string }> } | null;
  if (!response.ok || body?.errors?.length) {
    const message = body?.errors?.map((error) => error.message).filter(Boolean).join("; ") || `Cloudflare GraphQL error ${response.status}`;
    throw new Error(message);
  }

  if (!body?.data) throw new Error("Cloudflare GraphQL returned no data");
  return body.data;
}

function toDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function daysUntil(value: string | null) {
  if (!value) return null;
  const diffMs = new Date(value).getTime() - Date.now();
  if (Number.isNaN(diffMs)) return null;
  return Math.ceil(diffMs / 86400000);
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toHealthLevel(value: unknown): DomainRiskLevel {
  if (value === "ok" || value === "watch" || value === "urgent" || value === "unknown") return value;
  return "unknown";
}

function normalizePrivacy(value: CloudflareRegistration) {
  if (typeof value.privacy_mode === "string") return value.privacy_mode;
  if (typeof value.privacy === "string") return value.privacy;
  if (typeof value.privacy === "boolean") return value.privacy ? "enabled" : "disabled";
  if (value.privacy && typeof value.privacy === "object") return JSON.stringify(value.privacy);
  return null;
}

function mergeHealth(...inputs: Array<{ level: DomainRiskLevel; reasons: string[] }>) {
  const reasons = inputs.flatMap((input) => input.reasons);
  if (inputs.some((input) => input.level === "urgent")) return { level: "urgent" as const, reasons };
  if (inputs.some((input) => input.level === "watch")) return { level: "watch" as const, reasons };
  if (inputs.every((input) => input.level === "ok")) return { level: "ok" as const, reasons };
  return { level: "unknown" as const, reasons };
}

function computeRegistrarRisk(input: {
  status: string;
  daysUntilExpiry: number | null;
  autoRenew: boolean | null;
  locked: boolean | null;
  zoneStatus: string | null;
}) {
  const reasons: string[] = [];
  let level: DomainRiskLevel = "ok";
  const status = input.status.toLowerCase();

  if (status && !["active", "registered"].includes(status)) {
    reasons.push(`Registrar status is ${input.status}`);
    level = "urgent";
  }
  if (input.daysUntilExpiry !== null && input.daysUntilExpiry < 30) {
    reasons.push(`Expires in ${input.daysUntilExpiry} days`);
    level = "urgent";
  } else if (input.daysUntilExpiry !== null && input.daysUntilExpiry < 60) {
    reasons.push(`Expires in ${input.daysUntilExpiry} days`);
    if (level !== "urgent") level = "watch";
  }
  if (input.autoRenew === false) {
    reasons.push("Auto-renew is off");
    if (level !== "urgent") level = "watch";
  }
  if (input.locked === false) {
    reasons.push("Transfer lock is off");
    if (level !== "urgent") level = "watch";
  }
  if (!input.zoneStatus) {
    reasons.push("No matching Cloudflare zone found");
    if (level !== "urgent") level = "watch";
  }

  return { level, reasons };
}

function simplifyDnsRecord(record: CloudflareDnsRecord): DomainDnsRecordSummary {
  return {
    id: record.id,
    type: String(record.type ?? "unknown"),
    name: String(record.name ?? ""),
    content: String(record.content ?? ""),
    proxied: typeof record.proxied === "boolean" ? record.proxied : null,
    proxiable: typeof record.proxiable === "boolean" ? record.proxiable : null,
    ttl: typeof record.ttl === "number" ? record.ttl : null,
  };
}

function getHostRecord(records: DomainDnsRecordSummary[], domainName: string, host: string) {
  return records.find((record) => record.name.toLowerCase() === host.toLowerCase() && ["A", "AAAA", "CNAME"].includes(record.type)) ??
    records.find((record) => record.name.toLowerCase() === host.toLowerCase());
}

function computeDnsHealth(domainName: string, zone: CloudflareZone | undefined, records: DomainDnsRecordSummary[], fetchError?: string) {
  const reasons: string[] = [];
  let level: DomainRiskLevel = "ok";
  const apex = getHostRecord(records, domainName, domainName);
  const www = getHostRecord(records, domainName, `www.${domainName}`);

  if (fetchError) {
    reasons.push(`DNS records unavailable: ${fetchError}`);
    return { level: "unknown" as const, reasons };
  }
  if (!zone?.id) {
    reasons.push("No Cloudflare DNS zone found");
    return { level: "watch" as const, reasons };
  }
  if (zone.status && zone.status !== "active") {
    reasons.push(`Zone status is ${zone.status}`);
    level = "urgent";
  }
  if (zone.paused) {
    reasons.push("Zone is paused");
    level = "urgent";
  }
  if (!apex) {
    reasons.push("Apex/root DNS record is missing");
    level = "urgent";
  }
  if (!www) {
    reasons.push("www DNS record is missing");
    if (level !== "urgent") level = "watch";
  }
  for (const record of [apex, www].filter(Boolean) as DomainDnsRecordSummary[]) {
    if (record.proxiable && record.proxied === false) {
      reasons.push(`${record.name} is DNS-only`);
      if (level !== "urgent") level = "watch";
    }
  }

  return { level, reasons };
}

function computeEmailHealth(domainName: string, records: DomainDnsRecordSummary[], fetchError?: string) {
  const reasons: string[] = [];
  let level: DomainRiskLevel = "ok";
  const mx = records.filter((record) => record.type === "MX");
  const txt = records.filter((record) => record.type === "TXT");
  const spf = txt.some((record) => record.content.toLowerCase().includes("v=spf1"));
  const dmarc = txt.some((record) => record.name.toLowerCase() === `_dmarc.${domainName}` && record.content.toLowerCase().includes("v=dmarc1"));
  const dkim = txt.some((record) => record.name.toLowerCase().includes("._domainkey."));

  if (fetchError) {
    reasons.push(`Email DNS unavailable: ${fetchError}`);
    return { level: "unknown" as const, reasons };
  }
  if (!mx.length) {
    reasons.push("No MX records found");
    level = "watch";
  }
  if (!spf) {
    reasons.push("SPF TXT record missing");
    level = "watch";
  }
  if (!dmarc) {
    reasons.push("DMARC TXT record missing");
    level = "watch";
  }
  if (!dkim) {
    reasons.push("DKIM record not detected");
    level = "watch";
  }

  return { level, reasons };
}

function computeSslHealth(sslMode: string | null, sslError?: string) {
  const reasons: string[] = [];
  if (sslError) {
    reasons.push(`SSL status unavailable: ${sslError}`);
    return { level: "unknown" as const, reasons };
  }
  if (!sslMode) {
    reasons.push("SSL mode is unknown");
    return { level: "unknown" as const, reasons };
  }
  if (["off"].includes(sslMode)) {
    reasons.push("SSL mode is off");
    return { level: "urgent" as const, reasons };
  }
  if (["flexible"].includes(sslMode)) {
    reasons.push("SSL mode is flexible");
    return { level: "watch" as const, reasons };
  }

  return { level: "ok" as const, reasons };
}

async function fetchSslStatus(zoneId: string): Promise<CloudflareZoneSetting | CloudflareUniversalSslSetting> {
  try {
    return await cloudflareFetch<CloudflareZoneSetting>(`/zones/${zoneId}/settings/ssl`);
  } catch (modeError) {
    const universal = await cloudflareFetch<CloudflareUniversalSslSetting>(`/zones/${zoneId}/ssl/universal/settings`);
    return {
      ...universal,
      value: universal.enabled === false ? "universal ssl off" : "universal ssl on",
      modeError: modeError instanceof Error ? modeError.message : String(modeError),
    };
  }
}

function emptyTrafficWindow(): TrafficMetricWindow {
  return {
    requests: null,
    uniques: null,
    bytes: null,
    cachedBytes: null,
    threats: null,
    errors4xx: null,
    errors5xx: null,
  };
}

function sumTrafficGroups(groups: Array<Record<string, unknown>>): TrafficMetricWindow {
  const result = emptyTrafficWindow();
  result.requests = 0;

  for (const group of groups) {
    const sum = (group.sum ?? {}) as Record<string, unknown>;
    const uniq = (group.uniq ?? {}) as Record<string, unknown>;
    result.requests = (result.requests ?? 0) + (toNumber(group.count) ?? toNumber(sum.requests) ?? 0);
    result.uniques = (result.uniques ?? 0) + (toNumber(uniq.uniques) ?? 0);
    result.bytes = (result.bytes ?? 0) + (toNumber(sum.edgeResponseBytes) ?? toNumber(sum.bytes) ?? 0);
    result.cachedBytes = (result.cachedBytes ?? 0) + (toNumber(sum.cachedBytes) ?? toNumber(sum.cachedResponseBytes) ?? 0);
    result.threats = (result.threats ?? 0) + (toNumber(sum.threats) ?? 0);

    const statusMap = Array.isArray(sum.edgeResponseStatusMap) ? sum.edgeResponseStatusMap as Array<Record<string, unknown>> : [];
    for (const entry of statusMap) {
      const status = toNumber(entry.edgeResponseStatus);
      const requests = toNumber(entry.requests) ?? 0;
      if (status !== null && status >= 400 && status < 500) result.errors4xx = (result.errors4xx ?? 0) + requests;
      if (status !== null && status >= 500) result.errors5xx = (result.errors5xx ?? 0) + requests;
    }
  }

  if (result.uniques === 0) result.uniques = null;
  if (result.cachedBytes === 0) result.cachedBytes = null;
  if (result.threats === 0) result.threats = null;
  if (result.errors4xx === 0) result.errors4xx = null;
  if (result.errors5xx === 0) result.errors5xx = null;

  return result;
}

function cacheHitRatio(bytes: number | null, cachedBytes: number | null) {
  if (!bytes || cachedBytes === null) return null;
  return Math.round((cachedBytes / bytes) * 1000) / 10;
}

function computeTrafficHealth(metrics: TrafficMetrics | null, error?: string) {
  const reasons: string[] = [];
  let level: DomainRiskLevel = "ok";
  if (error) {
    reasons.push(`Traffic analytics unavailable: ${error}`);
    return { level: "unknown" as const, reasons };
  }
  if (!metrics) {
    reasons.push("Traffic analytics unavailable");
    return { level: "unknown" as const, reasons };
  }
  if ((metrics.last24h.requests ?? 0) === 0 && (metrics.last7d.requests ?? 0) > 0) {
    reasons.push("Traffic dropped to zero in the last 24 hours");
    level = "urgent";
  }
  if ((metrics.last24h.errors5xx ?? 0) > 0) {
    const rate = (metrics.last24h.requests ?? 0) > 0 ? (metrics.last24h.errors5xx ?? 0) / (metrics.last24h.requests ?? 1) : 0;
    reasons.push(`5xx errors in last 24 hours: ${metrics.last24h.errors5xx}`);
    level = rate > 0.02 ? "urgent" : "watch";
  }
  if ((metrics.last24h.threats ?? 0) > 0) {
    reasons.push(`Threats blocked in last 24 hours: ${metrics.last24h.threats}`);
    if (level !== "urgent") level = "watch";
  }

  return { level, reasons };
}

function mergeTrafficWindows(windows: TrafficMetricWindow[]): TrafficMetricWindow {
  const result = emptyTrafficWindow();

  for (const window of windows) {
    result.requests = (result.requests ?? 0) + (window.requests ?? 0);
    result.uniques = window.uniques === null ? result.uniques : (result.uniques ?? 0) + window.uniques;
    result.bytes = window.bytes === null ? result.bytes : (result.bytes ?? 0) + window.bytes;
    result.cachedBytes = window.cachedBytes === null ? result.cachedBytes : (result.cachedBytes ?? 0) + window.cachedBytes;
    result.threats = window.threats === null ? result.threats : (result.threats ?? 0) + window.threats;
    result.errors4xx = window.errors4xx === null ? result.errors4xx : (result.errors4xx ?? 0) + window.errors4xx;
    result.errors5xx = window.errors5xx === null ? result.errors5xx : (result.errors5xx ?? 0) + window.errors5xx;
  }

  return result;
}

async function fetchTrafficGroups(zoneId: string, since: string, until: string) {
  const query = `
    query DomainTraffic($zoneTag: string!, $since: string!, $until: string!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          traffic: httpRequestsAdaptiveGroups(
            limit: 1000
            filter: { datetime_geq: $since, datetime_lt: $until }
          ) {
            dimensions { datetimeHour }
            count
            sum { edgeResponseBytes }
          }
        }
      }
    }
  `;
  const data = await cloudflareGraphql<CloudflareTrafficGraphqlResponse>(query, {
    zoneTag: zoneId,
    since,
    until,
  });

  return {
    data,
    groups: (data.viewer?.zones?.[0] as { traffic?: Array<Record<string, unknown>> } | undefined)?.traffic ?? [],
  };
}

async function fetchTrafficMetrics(zoneId: string): Promise<TrafficMetrics> {
  const now = Date.now();
  const until = new Date(now).toISOString();
  const since24h = new Date(now - 24 * 3600000).toISOString();
  const last24h = await fetchTrafficGroups(zoneId, since24h, until);
  const daily = await Promise.all(Array.from({ length: 7 }, (_, index) => {
    const start = now - (7 - index) * 86400000;
    const end = now - (6 - index) * 86400000;
    return fetchTrafficGroups(zoneId, new Date(start).toISOString(), new Date(end).toISOString());
  }));
  const dailyGroups = daily.map((day) => day.groups);

  return {
    last24h: sumTrafficGroups(last24h.groups),
    last7d: mergeTrafficWindows(dailyGroups.map(sumTrafficGroups)),
    sparkline: dailyGroups.map((groups, index) => ({
      label: new Date(now - (6 - index) * 86400000).toISOString().slice(0, 10),
      requests: sumTrafficGroups(groups).requests ?? 0,
    })),
    raw: {
      last24h: last24h.data,
      last7d: daily.map((day) => day.data),
    },
  };
}

async function getOptional<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

async function buildDomainHealth(input: {
  registration: CloudflareRegistration;
  zone: CloudflareZone | undefined;
  existing?: Partial<DomainRegistrationRow>;
}) {
  const { registration, zone, existing } = input;
  const domainName = String(registration.domain_name ?? registration.domain ?? registration.name ?? "").toLowerCase();
  const expiresAt = toDate(registration.expires_at ?? registration.expiration_date ?? registration.expires_on);
  const daysUntilExpiry = daysUntil(expiresAt);
  const status = String(registration.status ?? "unknown");
  const autoRenew = typeof registration.auto_renew === "boolean" ? registration.auto_renew : typeof registration.autorenew === "boolean" ? registration.autorenew : null;
  const locked = typeof registration.locked === "boolean" ? registration.locked : null;
  const zoneId = zone?.id ?? null;

  const [dnsResult, sslResult, trafficResult] = await Promise.all([
    zoneId ? getOptional(() => cloudflareFetch<CloudflareDnsRecord[]>(`/zones/${zoneId}/dns_records?per_page=500`)) : Promise.resolve({ data: null, error: null }),
    zoneId ? getOptional(() => fetchSslStatus(zoneId)) : Promise.resolve({ data: null, error: null }),
    zoneId ? getOptional(() => fetchTrafficMetrics(zoneId)) : Promise.resolve({ data: null, error: null }),
  ]);

  const dnsRecords = (dnsResult.data ?? []).map(simplifyDnsRecord);
  const registrarRisk = computeRegistrarRisk({ status, daysUntilExpiry, autoRenew, locked, zoneStatus: zone?.status ?? null });
  const dnsHealth = computeDnsHealth(domainName, zone, dnsRecords, dnsResult.error ?? undefined);
  const emailHealth = computeEmailHealth(domainName, dnsRecords, dnsResult.error ?? undefined);
  const sslMode = sslResult.data?.value ? String(sslResult.data.value) : null;
  const sslHealth = computeSslHealth(sslMode, sslResult.error ?? undefined);
  const trafficHealth = computeTrafficHealth(trafficResult.data, trafficResult.error ?? undefined);
  const overallHealth = mergeHealth(registrarRisk, dnsHealth, sslHealth, trafficHealth, emailHealth);
  const now = new Date().toISOString();

  return {
    domainName,
    status,
    expiresAt,
    daysUntilExpiry,
    autoRenew,
    locked,
    privacyMode: normalizePrivacy(registration),
    createdAt: toDate(registration.created_at ?? registration.created_on),
    zoneId,
    zoneNameServers: toStringArray(zone?.name_servers),
    zoneOriginalNameServers: toStringArray(zone?.original_name_servers),
    zonePaused: typeof zone?.paused === "boolean" ? zone.paused : null,
    zoneStatus: zone?.status ?? null,
    projectSlug: existing?.projectSlug ?? null,
    notes: existing?.notes ?? null,
    cloudflareRaw: registration,
    riskLevel: registrarRisk.level,
    riskReasons: registrarRisk.reasons,
    dnsHealthLevel: dnsHealth.level,
    dnsHealthReasons: dnsHealth.reasons,
    dnsRecords,
    emailHealthLevel: emailHealth.level,
    emailHealthReasons: emailHealth.reasons,
    sslHealthLevel: sslHealth.level,
    sslHealthReasons: sslHealth.reasons,
    sslMode,
    sslRaw: sslResult.data,
    trafficHealthLevel: trafficHealth.level,
    trafficHealthReasons: trafficHealth.reasons,
    traffic24hRequests: trafficResult.data?.last24h.requests ?? null,
    traffic7dRequests: trafficResult.data?.last7d.requests ?? null,
    traffic24hUniques: trafficResult.data?.last24h.uniques ?? null,
    traffic7dUniques: trafficResult.data?.last7d.uniques ?? null,
    bandwidth24hBytes: trafficResult.data?.last24h.bytes ?? null,
    bandwidth7dBytes: trafficResult.data?.last7d.bytes ?? null,
    cacheHitRatio24h: cacheHitRatio(trafficResult.data?.last24h.bytes ?? null, trafficResult.data?.last24h.cachedBytes ?? null),
    cacheHitRatio7d: cacheHitRatio(trafficResult.data?.last7d.bytes ?? null, trafficResult.data?.last7d.cachedBytes ?? null),
    threats24h: trafficResult.data?.last24h.threats ?? null,
    threats7d: trafficResult.data?.last7d.threats ?? null,
    errors4xx24h: trafficResult.data?.last24h.errors4xx ?? null,
    errors5xx24h: trafficResult.data?.last24h.errors5xx ?? null,
    trafficSparkline: trafficResult.data?.sparkline ?? [],
    trafficRaw: trafficResult.data?.raw ?? null,
    overallHealthLevel: overallHealth.level,
    overallHealthReasons: overallHealth.reasons,
    lastSyncedAt: now,
    updatedAt: now,
  } satisfies DomainRegistrationRow;
}

function normalizeDbRow(row: Record<string, unknown>): DomainRegistrationRow {
  const trafficSparkline = Array.isArray(row.traffic_sparkline)
    ? row.traffic_sparkline.map((point) => point as DomainTrafficSparkPoint)
    : [];

  return {
    domainName: String(row.domain_name),
    status: String(row.status ?? "unknown"),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    daysUntilExpiry: row.days_until_expiry === null || row.days_until_expiry === undefined ? null : Number(row.days_until_expiry),
    autoRenew: row.auto_renew === null || row.auto_renew === undefined ? null : Boolean(row.auto_renew),
    locked: row.locked === null || row.locked === undefined ? null : Boolean(row.locked),
    privacyMode: row.privacy_mode ? String(row.privacy_mode) : null,
    createdAt: row.registration_created_at ? String(row.registration_created_at) : null,
    zoneId: row.zone_id ? String(row.zone_id) : null,
    zoneNameServers: toStringArray(row.zone_name_servers),
    zoneOriginalNameServers: toStringArray(row.zone_original_name_servers),
    zonePaused: row.zone_paused === null || row.zone_paused === undefined ? null : Boolean(row.zone_paused),
    zoneStatus: row.zone_status ? String(row.zone_status) : null,
    projectSlug: row.project_slug ? String(row.project_slug) : null,
    notes: row.notes ? String(row.notes) : null,
    cloudflareRaw: row.cloudflare_raw ?? null,
    riskLevel: toHealthLevel(row.risk_level),
    riskReasons: toStringArray(row.risk_reasons),
    dnsHealthLevel: toHealthLevel(row.dns_health_level),
    dnsHealthReasons: toStringArray(row.dns_health_reasons),
    dnsRecords: Array.isArray(row.dns_records) ? row.dns_records.map((record) => record as DomainDnsRecordSummary) : [],
    emailHealthLevel: toHealthLevel(row.email_health_level),
    emailHealthReasons: toStringArray(row.email_health_reasons),
    sslHealthLevel: toHealthLevel(row.ssl_health_level),
    sslHealthReasons: toStringArray(row.ssl_health_reasons),
    sslMode: row.ssl_mode ? String(row.ssl_mode) : null,
    sslRaw: row.ssl_raw ?? null,
    trafficHealthLevel: toHealthLevel(row.traffic_health_level),
    trafficHealthReasons: toStringArray(row.traffic_health_reasons),
    traffic24hRequests: toNumber(row.traffic_24h_requests),
    traffic7dRequests: toNumber(row.traffic_7d_requests),
    traffic24hUniques: toNumber(row.traffic_24h_uniques),
    traffic7dUniques: toNumber(row.traffic_7d_uniques),
    bandwidth24hBytes: toNumber(row.bandwidth_24h_bytes),
    bandwidth7dBytes: toNumber(row.bandwidth_7d_bytes),
    cacheHitRatio24h: toNumber(row.cache_hit_ratio_24h),
    cacheHitRatio7d: toNumber(row.cache_hit_ratio_7d),
    threats24h: toNumber(row.threats_24h),
    threats7d: toNumber(row.threats_7d),
    errors4xx24h: toNumber(row.errors_4xx_24h),
    errors5xx24h: toNumber(row.errors_5xx_24h),
    trafficSparkline,
    trafficRaw: row.traffic_raw ?? null,
    overallHealthLevel: toHealthLevel(row.overall_health_level ?? row.risk_level),
    overallHealthReasons: toStringArray(row.overall_health_reasons ?? row.risk_reasons),
    lastSyncedAt: row.last_synced_at ? String(row.last_synced_at) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

export async function listCachedDomainRegistrations() {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_domain_registrations")
      .select("*")
      .order("domain_name", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row) => normalizeDbRow(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

function buildUpsertRow(row: DomainRegistrationRow) {
  return {
    domain_name: row.domainName,
    status: row.status,
    expires_at: row.expiresAt,
    days_until_expiry: row.daysUntilExpiry,
    auto_renew: row.autoRenew,
    locked: row.locked,
    privacy_mode: row.privacyMode,
    registration_created_at: row.createdAt,
    zone_id: row.zoneId,
    zone_name_servers: row.zoneNameServers,
    zone_original_name_servers: row.zoneOriginalNameServers,
    zone_paused: row.zonePaused,
    zone_status: row.zoneStatus,
    project_slug: row.projectSlug,
    notes: row.notes,
    cloudflare_raw: row.cloudflareRaw,
    risk_level: row.riskLevel,
    risk_reasons: row.riskReasons,
    dns_health_level: row.dnsHealthLevel,
    dns_health_reasons: row.dnsHealthReasons,
    dns_records: row.dnsRecords,
    email_health_level: row.emailHealthLevel,
    email_health_reasons: row.emailHealthReasons,
    ssl_health_level: row.sslHealthLevel,
    ssl_health_reasons: row.sslHealthReasons,
    ssl_mode: row.sslMode,
    ssl_raw: row.sslRaw,
    traffic_health_level: row.trafficHealthLevel,
    traffic_health_reasons: row.trafficHealthReasons,
    traffic_24h_requests: row.traffic24hRequests,
    traffic_7d_requests: row.traffic7dRequests,
    traffic_24h_uniques: row.traffic24hUniques,
    traffic_7d_uniques: row.traffic7dUniques,
    bandwidth_24h_bytes: row.bandwidth24hBytes,
    bandwidth_7d_bytes: row.bandwidth7dBytes,
    cache_hit_ratio_24h: row.cacheHitRatio24h,
    cache_hit_ratio_7d: row.cacheHitRatio7d,
    threats_24h: row.threats24h,
    threats_7d: row.threats7d,
    errors_4xx_24h: row.errors4xx24h,
    errors_5xx_24h: row.errors5xx24h,
    traffic_sparkline: row.trafficSparkline,
    traffic_raw: row.trafficRaw,
    overall_health_level: row.overallHealthLevel,
    overall_health_reasons: row.overallHealthReasons,
    last_synced_at: row.lastSyncedAt,
    updated_at: row.updatedAt,
  };
}

export async function syncCloudflareRegistrarRegistrations() {
  const supabase = createSupabaseAdmin();
  if (!isCloudflareRegistrarConfigured()) throw missingConfigError();

  const [registrations, zones, cached] = await Promise.all([
    cloudflareFetch<CloudflareRegistration[]>("/accounts/{account_id}/registrar/registrations"),
    cloudflareFetch<CloudflareZone[]>("/zones?per_page=500"),
    listCachedDomainRegistrations(),
  ]);

  const zoneByName = new Map((zones ?? []).filter((zone) => zone.name).map((zone) => [String(zone.name).toLowerCase(), zone]));
  const cachedByName = new Map(cached.map((row) => [row.domainName, row]));
  const rows = (await Promise.all((registrations ?? [])
    .map((registration) => buildDomainHealth({
      registration,
      zone: zoneByName.get(String(registration.domain_name ?? registration.domain ?? registration.name ?? "").toLowerCase()),
      existing: cachedByName.get(String(registration.domain_name ?? registration.domain ?? registration.name ?? "").toLowerCase()),
    }))))
    .filter((row) => row.domainName);

  if (rows.length) {
    const { error } = await supabase.from("admin_domain_registrations").upsert(rows.map(buildUpsertRow), { onConflict: "domain_name" });
    if (error) throw error;
  }

  return {
    ok: true,
    syncedAt: new Date().toISOString(),
    count: rows.length,
    domains: rows,
  };
}

export async function getDomainRegistrationDashboard() {
  const domains = await listCachedDomainRegistrations();
  const configured = isCloudflareRegistrarConfigured();
  const urgent = domains.filter((domain) => domain.overallHealthLevel === "urgent").length;
  const watch = domains.filter((domain) => domain.overallHealthLevel === "watch").length;
  const healthy = domains.filter((domain) => domain.overallHealthLevel === "ok").length;
  const unknown = domains.filter((domain) => domain.overallHealthLevel === "unknown").length;
  const autoRenewOff = domains.filter((domain) => domain.autoRenew === false).length;
  const unlocked = domains.filter((domain) => domain.locked === false).length;
  const expiring30 = domains.filter((domain) => domain.daysUntilExpiry !== null && domain.daysUntilExpiry <= 30).length;
  const expiring60 = domains.filter((domain) => domain.daysUntilExpiry !== null && domain.daysUntilExpiry <= 60).length;
  const dnsIssues = domains.filter((domain) => ["watch", "urgent"].includes(domain.dnsHealthLevel)).length;
  const sslIssues = domains.filter((domain) => ["watch", "urgent"].includes(domain.sslHealthLevel)).length;
  const emailIssues = domains.filter((domain) => ["watch", "urgent"].includes(domain.emailHealthLevel)).length;
  const trafficIssues = domains.filter((domain) => ["watch", "urgent"].includes(domain.trafficHealthLevel)).length;
  const traffic24hRequests = domains.reduce((total, domain) => total + (domain.traffic24hRequests ?? 0), 0);
  const traffic7dRequests = domains.reduce((total, domain) => total + (domain.traffic7dRequests ?? 0), 0);
  const unique24h = domains.reduce((total, domain) => total + (domain.traffic24hUniques ?? 0), 0);
  const errors5xx24h = domains.reduce((total, domain) => total + (domain.errors5xx24h ?? 0), 0);
  const threats24h = domains.reduce((total, domain) => total + (domain.threats24h ?? 0), 0);
  const lastSyncedAt = domains.map((domain) => domain.lastSyncedAt).filter(Boolean).sort().at(-1) ?? null;
  const overallHealthLevel: DomainRiskLevel = urgent > 0 ? "urgent" : watch > 0 ? "watch" : domains.length > 0 && unknown === 0 ? "ok" : "unknown";

  return {
    configured,
    domains,
    summary: {
      total: domains.length,
      urgent,
      watch,
      healthy,
      unknown,
      autoRenewOff,
      unlocked,
      expiring30,
      expiring60,
      dnsIssues,
      sslIssues,
      emailIssues,
      trafficIssues,
      traffic24hRequests,
      traffic7dRequests,
      unique24h,
      errors5xx24h,
      threats24h,
      overallHealthLevel,
      lastSyncedAt,
    },
  };
}
