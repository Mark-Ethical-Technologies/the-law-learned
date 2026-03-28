create table if not exists public.award_fetch_errors (
  id uuid primary key default gen_random_uuid(),
  award_id text,
  fwc_url text,
  error_message text,
  occurred_at timestamptz default now()
);
alter table public.award_fetch_errors enable row level security;
create policy "Service role only" on public.award_fetch_errors for all using (auth.role() = 'service_role');
