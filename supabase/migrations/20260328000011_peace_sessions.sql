-- PEACE Interview sessions table
create table if not exists peace_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'My matter',
  phase text not null default 'preparation' check (phase in ('preparation', 'engage', 'account', 'closure', 'evaluation', 'complete')),
  messages jsonb not null default '[]',
  summary text,
  privilege_statement text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table peace_sessions enable row level security;

create policy "Users can manage their own peace sessions"
  on peace_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index peace_sessions_user_id_idx on peace_sessions(user_id);
