create table if not exists admin_issue_runs (
  id bigserial primary key,
  issue_id text references admin_issues(id) on delete set null,
  issue_number integer,
  project text not null,
  owner_agent text,
  run_id text,
  task_title text,
  source text not null default 'issue-runner',
  status text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  estimated_cost_usd numeric(10,2),
  failure_category text,
  failure_message text,
  raw_spawn_result text,
  raw_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admin_issue_runs
  add column if not exists run_id text,
  add column if not exists task_title text,
  add column if not exists source text not null default 'issue-runner',
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists completed_at timestamptz,
  add column if not exists duration_ms integer,
  add column if not exists estimated_cost_usd numeric(10,2),
  add column if not exists failure_category text,
  add column if not exists failure_message text,
  add column if not exists raw_result text;

create index if not exists idx_admin_issue_runs_started_at on admin_issue_runs(started_at desc);
create index if not exists idx_admin_issue_runs_status on admin_issue_runs(status);
create index if not exists idx_admin_issue_runs_project on admin_issue_runs(project);
create index if not exists idx_admin_issue_runs_run_id on admin_issue_runs(run_id) where run_id is not null;

create or replace function set_admin_issue_runs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_admin_issue_runs_updated_at on admin_issue_runs;
create trigger trg_admin_issue_runs_updated_at
before update on admin_issue_runs
for each row
execute function set_admin_issue_runs_updated_at();
