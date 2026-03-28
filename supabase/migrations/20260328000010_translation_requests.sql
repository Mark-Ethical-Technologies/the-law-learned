create table if not exists public.translation_requests (
  user_identifier text not null,
  request_count integer default 1,
  window_start timestamptz default now(),
  primary key (user_identifier)
);
alter table public.translation_requests enable row level security;
create policy "Users can read own counter" on public.translation_requests for select using (user_identifier = auth.uid()::text);
create policy "Service role manages counters" on public.translation_requests for all using (auth.role() = 'service_role');
