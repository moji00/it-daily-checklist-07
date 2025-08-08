-- Create table to store user performance reports
create table if not exists public.user_performance_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  generated_by uuid not null,
  period_start date not null,
  period_end date not null,
  title text,
  metrics jsonb not null default '{}'::jsonb,
  report_html text,
  format text not null default 'html',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_performance_reports enable row level security;

-- Policies
create policy if not exists "Admins can insert reports"
  on public.user_performance_reports
  for insert
  to authenticated
  with check (get_current_user_role() = 'admin');

create policy if not exists "Admins can view all reports"
  on public.user_performance_reports
  for select
  to authenticated
  using (get_current_user_role() = 'admin');

create policy if not exists "Users can view their own reports"
  on public.user_performance_reports
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy if not exists "Admins can update any report"
  on public.user_performance_reports
  for update
  to authenticated
  using (get_current_user_role() = 'admin');

create policy if not exists "Admins can delete any report"
  on public.user_performance_reports
  for delete
  to authenticated
  using (get_current_user_role() = 'admin');

-- Trigger to update updated_at
create trigger if not exists update_user_performance_reports_updated_at
before update on public.user_performance_reports
for each row execute function public.update_updated_at_column();

-- Helpful indexes
create index if not exists idx_user_performance_reports_user_id_created_at
  on public.user_performance_reports (user_id, created_at desc);

create index if not exists idx_user_performance_reports_generated_by
  on public.user_performance_reports (generated_by);
