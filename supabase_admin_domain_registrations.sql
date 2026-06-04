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
  zone_status text,
  project_slug text,
  notes text,
  cloudflare_raw jsonb not null default '{}'::jsonb,
  risk_level text not null default 'unknown',
  risk_reasons text[] not null default '{}'::text[],
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
