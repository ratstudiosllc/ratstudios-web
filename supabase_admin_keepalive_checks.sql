-- Supabase project keepalive monitor for the RaT Studios admin dashboard.
-- Run this in the RaT Studios admin Supabase project.

create table if not exists public.admin_supabase_keepalive_checks (
  id text primary key,
  app_name text not null,
  slug text not null,
  project_ref text not null,
  supabase_url text not null,
  health_url text not null,
  schedule text not null default 'Daily at 06:15 Mountain',
  status text not null default 'unknown',
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_latency_ms integer,
  consecutive_failures integer not null default 0,
  response jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_supabase_keepalive_checks_status_check
    check (status in ('healthy', 'stale', 'failing', 'unknown'))
);

create index if not exists admin_supabase_keepalive_checks_status_idx
  on public.admin_supabase_keepalive_checks(status);

create index if not exists admin_supabase_keepalive_checks_last_checked_idx
  on public.admin_supabase_keepalive_checks(last_checked_at desc);

insert into public.admin_supabase_keepalive_checks (
  id,
  app_name,
  slug,
  project_ref,
  supabase_url,
  health_url,
  schedule
) values
  (
    'stitchlogic',
    'StitchLogic',
    'stitchlogic',
    'daprwnaehmwzdauojmsh',
    'https://daprwnaehmwzdauojmsh.supabase.co',
    'https://www.stitchlogic.app/api/health/supabase',
    'Daily at 06:15 Mountain'
  ),
  (
    'agalmanac',
    'AgAlmanac',
    'agalmanac',
    'qysmyzxikbaslrjkhiyx',
    'https://qysmyzxikbaslrjkhiyx.supabase.co',
    'https://agalmanac.app/api/health/supabase',
    'Daily at 06:15 Mountain'
  ),
  (
    'mowpro',
    'MowPro',
    'mowpro',
    'nlpzynitzmrbtwfgjvlm',
    'https://nlpzynitzmrbtwfgjvlm.supabase.co',
    'https://mowpro.app/api/health/supabase',
    'Daily at 06:15 Mountain'
  ),
  (
    'medtracker',
    'MedTracker',
    'medtracker',
    'czyeqrrptufqlcbxnzxj',
    'https://czyeqrrptufqlcbxnzxj.supabase.co',
    'pending://hosted-health-endpoint-needed',
    'Not scheduled until a hosted health endpoint exists'
  )
on conflict (id) do update set
  app_name = excluded.app_name,
  slug = excluded.slug,
  project_ref = excluded.project_ref,
  supabase_url = excluded.supabase_url,
  health_url = excluded.health_url,
  schedule = excluded.schedule,
  updated_at = now();
