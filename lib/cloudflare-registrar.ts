import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type DomainRiskLevel = "ok" | "watch" | "urgent" | "unknown";

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
  zoneStatus: string | null;
  projectSlug: string | null;
  notes: string | null;
  cloudflareRaw: unknown;
  riskLevel: DomainRiskLevel;
  riskReasons: string[];
  lastSyncedAt: string | null;
  updatedAt: string | null;
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

function normalizePrivacy(value: CloudflareRegistration) {
  if (typeof value.privacy_mode === "string") return value.privacy_mode;
  if (typeof value.privacy === "string") return value.privacy;
  if (typeof value.privacy === "boolean") return value.privacy ? "enabled" : "disabled";
  if (value.privacy && typeof value.privacy === "object") return JSON.stringify(value.privacy);
  return null;
}

function computeRisk(input: {
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

function normalizeRegistration(registration: CloudflareRegistration, zones: Map<string, CloudflareZone>, existing?: Partial<DomainRegistrationRow>): DomainRegistrationRow {
  const domainName = String(registration.domain_name ?? registration.domain ?? registration.name ?? "").toLowerCase();
  const expiresAt = toDate(registration.expires_at ?? registration.expiration_date ?? registration.expires_on);
  const daysUntilExpiry = daysUntil(expiresAt);
  const zone = zones.get(domainName);
  const status = String(registration.status ?? "unknown");
  const autoRenew = typeof registration.auto_renew === "boolean" ? registration.auto_renew : typeof registration.autorenew === "boolean" ? registration.autorenew : null;
  const locked = typeof registration.locked === "boolean" ? registration.locked : null;
  const risk = computeRisk({ status, daysUntilExpiry, autoRenew, locked, zoneStatus: zone?.status ?? null });

  return {
    domainName,
    status,
    expiresAt,
    daysUntilExpiry,
    autoRenew,
    locked,
    privacyMode: normalizePrivacy(registration),
    createdAt: toDate(registration.created_at ?? registration.created_on),
    zoneId: zone?.id ?? null,
    zoneStatus: zone?.status ?? null,
    projectSlug: existing?.projectSlug ?? null,
    notes: existing?.notes ?? null,
    cloudflareRaw: registration,
    riskLevel: risk.level,
    riskReasons: risk.reasons,
    lastSyncedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeDbRow(row: Record<string, unknown>): DomainRegistrationRow {
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
    zoneStatus: row.zone_status ? String(row.zone_status) : null,
    projectSlug: row.project_slug ? String(row.project_slug) : null,
    notes: row.notes ? String(row.notes) : null,
    cloudflareRaw: row.cloudflare_raw ?? null,
    riskLevel: String(row.risk_level ?? "unknown") as DomainRiskLevel,
    riskReasons: Array.isArray(row.risk_reasons) ? row.risk_reasons.map(String) : [],
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
  const rows = (registrations ?? [])
    .map((registration) => normalizeRegistration(registration, zoneByName, cachedByName.get(String(registration.domain_name ?? registration.domain ?? registration.name ?? "").toLowerCase())))
    .filter((row) => row.domainName);

  if (rows.length) {
    const { error } = await supabase.from("admin_domain_registrations").upsert(rows.map((row) => ({
      domain_name: row.domainName,
      status: row.status,
      expires_at: row.expiresAt,
      days_until_expiry: row.daysUntilExpiry,
      auto_renew: row.autoRenew,
      locked: row.locked,
      privacy_mode: row.privacyMode,
      registration_created_at: row.createdAt,
      zone_id: row.zoneId,
      zone_status: row.zoneStatus,
      project_slug: row.projectSlug,
      notes: row.notes,
      cloudflare_raw: row.cloudflareRaw,
      risk_level: row.riskLevel,
      risk_reasons: row.riskReasons,
      last_synced_at: row.lastSyncedAt,
      updated_at: row.updatedAt,
    })), { onConflict: "domain_name" });

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
  const urgent = domains.filter((domain) => domain.riskLevel === "urgent").length;
  const watch = domains.filter((domain) => domain.riskLevel === "watch").length;
  const autoRenewOff = domains.filter((domain) => domain.autoRenew === false).length;
  const unlocked = domains.filter((domain) => domain.locked === false).length;
  const expiring30 = domains.filter((domain) => domain.daysUntilExpiry !== null && domain.daysUntilExpiry <= 30).length;
  const expiring60 = domains.filter((domain) => domain.daysUntilExpiry !== null && domain.daysUntilExpiry <= 60).length;
  const lastSyncedAt = domains.map((domain) => domain.lastSyncedAt).filter(Boolean).sort().at(-1) ?? null;

  return {
    configured,
    domains,
    summary: {
      total: domains.length,
      urgent,
      watch,
      autoRenewOff,
      unlocked,
      expiring30,
      expiring60,
      lastSyncedAt,
    },
  };
}
