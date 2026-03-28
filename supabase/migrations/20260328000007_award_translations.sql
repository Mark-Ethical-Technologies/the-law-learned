create table if not exists public.award_translations (
  id uuid primary key default gen_random_uuid(),
  award_id text not null references public.modern_awards(award_id) on delete cascade,
  section_key text not null,
  language_code text not null,
  translated_html text not null,
  model_used text,
  translated_at timestamptz default now(),
  unique(award_id, section_key, language_code)
);
alter table public.award_translations enable row level security;
create policy "Public can read translations" on public.award_translations for select using (true);
create policy "Service role can write translations" on public.award_translations for all using (auth.role() = 'service_role');
