create table if not exists admin_issues (
  id text primary key,
  number integer not null unique,
  project text not null,
  priority text not null default 'P3',
  title text not null,
  status text not null default 'Unresolved',
  identified text,
  committed text not null default 'No',
  pushed text not null default 'No',
  deployed text not null default 'No',
  commits text not null default '—',
  summary text,
  current_state text,
  next_step text,
  updated_at timestamptz not null default now()
);

create or replace function set_admin_issues_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DROP TRIGGER IF EXISTS trg_admin_issues_updated_at ON admin_issues;
create trigger trg_admin_issues_updated_at
before update on admin_issues
for each row
execute function set_admin_issues_updated_at();
