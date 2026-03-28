create table if not exists public.modern_awards (
  id uuid primary key default gen_random_uuid(),
  award_id text unique not null,
  award_name text not null,
  fwc_url text not null,
  content_hash text,
  raw_html text,
  html_length integer,
  last_checked_at timestamptz,
  last_changed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.modern_awards enable row level security;
create policy "Public can read awards" on public.modern_awards for select using (true);
