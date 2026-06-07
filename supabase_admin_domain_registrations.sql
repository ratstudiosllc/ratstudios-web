-- Cloudflare Registrar monitor cache for the RaT Studios admin dashboard.
-- Run this in the RaT Studios admin Supabase project.

create table if not exists public.admin_domain_registrations (
  domain_name text primary key,
  status text not null default 'unknown',
  expires_at timestamptz,
  days_until_expiry integer,
  auto_renew boolean,
  locked boolean,
  privacy_mode text,
  registration_created_at timestamptz,
  zone_id text,
  zone_name_servers text[] not null default '{}'::text[],
  zone_original_name_servers text[] not null default '{}'::text[],
  zone_paused boolean,
  zone_status text,
  project_slug text,
  notes text,
  cloudflare_raw jsonb not null default '{}'::jsonb,
  risk_level text not null default 'unknown',
  risk_reasons text[] not null default '{}'::text[],
  dns_health_level text not null default 'unknown',
  dns_health_reasons text[] not null default '{}'::text[],
  dns_records jsonb not null default '[]'::jsonb,
  email_health_level text not null default 'unknown',
  email_health_reasons text[] not null default '{}'::text[],
  ssl_health_level text not null default 'unknown',
  ssl_health_reasons text[] not null default '{}'::text[],
  ssl_mode text,
  ssl_raw jsonb,
  traffic_health_level text not null default 'unknown',
  traffic_health_reasons text[] not null default '{}'::text[],
  traffic_24h_requests bigint,
  traffic_7d_requests bigint,
  traffic_24h_uniques bigint,
  traffic_7d_uniques bigint,
  bandwidth_24h_bytes bigint,
  bandwidth_7d_bytes bigint,
  cache_hit_ratio_24h numeric,
  cache_hit_ratio_7d numeric,
  threats_24h bigint,
  threats_7d bigint,
  errors_4xx_24h bigint,
  errors_5xx_24h bigint,
  traffic_sparkline jsonb not null default '[]'::jsonb,
  traffic_raw jsonb,
  overall_health_level text not null default 'unknown',
  overall_health_reasons text[] not null default '{}'::text[],
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_domain_registrations_risk_check
    check (risk_level in ('ok', 'watch', 'urgent', 'unknown'))
);

create index if not exists admin_domain_registrations_risk_idx
  on public.admin_domain_registrations(risk_level);

create index if not exists admin_domain_registrations_expires_idx
  on public.admin_domain_registrations(expires_at);

create index if not exists admin_domain_registrations_project_idx
  on public.admin_domain_registrations(project_slug);

alter table public.admin_domain_registrations
  add column if not exists zone_name_servers text[] not null default '{}'::text[],
  add column if not exists zone_original_name_servers text[] not null default '{}'::text[],
  add column if not exists zone_paused boolean,
  add column if not exists dns_health_level text not null default 'unknown',
  add column if not exists dns_health_reasons text[] not null default '{}'::text[],
  add column if not exists dns_records jsonb not null default '[]'::jsonb,
  add column if not exists email_health_level text not null default 'unknown',
  add column if not exists email_health_reasons text[] not null default '{}'::text[],
  add column if not exists ssl_health_level text not null default 'unknown',
  add column if not exists ssl_health_reasons text[] not null default '{}'::text[],
  add column if not exists ssl_mode text,
  add column if not exists ssl_raw jsonb,
  add column if not exists traffic_health_level text not null default 'unknown',
  add column if not exists traffic_health_reasons text[] not null default '{}'::text[],
  add column if not exists traffic_24h_requests bigint,
  add column if not exists traffic_7d_requests bigint,
  add column if not exists traffic_24h_uniques bigint,
  add column if not exists traffic_7d_uniques bigint,
  add column if not exists bandwidth_24h_bytes bigint,
  add column if not exists bandwidth_7d_bytes bigint,
  add column if not exists cache_hit_ratio_24h numeric,
  add column if not exists cache_hit_ratio_7d numeric,
  add column if not exists threats_24h bigint,
  add column if not exists threats_7d bigint,
  add column if not exists errors_4xx_24h bigint,
  add column if not exists errors_5xx_24h bigint,
  add column if not exists traffic_sparkline jsonb not null default '[]'::jsonb,
  add column if not exists traffic_raw jsonb,
  add column if not exists overall_health_level text not null default 'unknown',
  add column if not exists overall_health_reasons text[] not null default '{}'::text[];

create index if not exists admin_domain_registrations_overall_health_idx
  on public.admin_domain_registrations(overall_health_level);

create index if not exists admin_domain_registrations_dns_health_idx
  on public.admin_domain_registrations(dns_health_level);
