-- =============================================================================
-- Flirtcraft — Dating stats & future platform-connector architecture (stage 6)
-- Additive only, same conventions as prior migrations.
--
-- `dating_stats` is populated by manual user entry for the MVP (see
-- /api/dating-stats). `dating_connections` exists now so a future real
-- integration (see src/lib/dating-platforms/) can start writing sync state
-- without any schema change — nothing writes to it yet.
-- =============================================================================

create table public.dating_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  platform text not null check (platform in ('tinder', 'hinge', 'bumble', 'meetic', 'other')),
  period_start date not null,
  period_end date not null,
  likes integer not null default 0 check (likes >= 0),
  matches integer not null default 0 check (matches >= 0),
  conversations integer not null default 0 check (conversations >= 0),
  replies integer not null default 0 check (replies >= 0),
  dates integer not null default 0 check (dates >= 0),
  created_at timestamptz not null default now(),
  constraint dating_stats_period_valid check (period_end >= period_start)
);

create index dating_stats_user_id_idx on public.dating_stats (user_id);
create index dating_stats_user_id_period_start_idx on public.dating_stats (user_id, period_start desc);

create table public.dating_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  platform text not null check (platform in ('tinder', 'hinge', 'bumble', 'meetic')),
  status text not null default 'not_connected' check (status in ('not_connected', 'connected', 'error')),
  connected_at timestamptz,
  last_sync timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, platform)
);

create index dating_connections_user_id_idx on public.dating_connections (user_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.dating_stats enable row level security;
alter table public.dating_connections enable row level security;

create policy "users can view own dating stats" on public.dating_stats
  for select using (auth.uid() = user_id);
create policy "users can add own dating stats" on public.dating_stats
  for insert with check (auth.uid() = user_id);
create policy "users can delete own dating stats" on public.dating_stats
  for delete using (auth.uid() = user_id);

-- dating_connections — read-only for the owning user; writes reserved for a
-- future real connector sync job (service role), same pattern as
-- `subscriptions`. No UI writes to this table yet.
create policy "users can view own dating connections" on public.dating_connections
  for select using (auth.uid() = user_id);
