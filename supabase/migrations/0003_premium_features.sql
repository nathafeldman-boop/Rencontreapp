-- =============================================================================
-- MatchAI — Premium coaching features (stage 3)
-- Additive only, same conventions as 0001/0002: uuid PKs, `user_id` on every
-- table for simple owner-based RLS (denormalized from the join path on
-- purpose, matching the existing `analyses` pattern), RLS enabled everywhere.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- public.photo_analyses — per-photo breakdown behind a profile analysis
-- -----------------------------------------------------------------------------
create table public.photo_analyses (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  photo_path text not null,
  position smallint not null,
  score smallint not null check (score between 0 and 100),
  confidence_score smallint check (confidence_score between 0 and 100),
  attractiveness_score smallint check (attractiveness_score between 0 and 100),
  technical_score smallint check (technical_score between 0 and 100),
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  recommendation text not null default '',
  suggested_role text not null default 'secondary' check (suggested_role in ('primary', 'secondary', 'remove')),
  created_at timestamptz not null default now()
);

create index photo_analyses_analysis_id_idx on public.photo_analyses (analysis_id);
create index photo_analyses_user_id_idx on public.photo_analyses (user_id);

-- -----------------------------------------------------------------------------
-- public.bio_generations — AI bio-generator history
-- -----------------------------------------------------------------------------
create table public.bio_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  style text not null,
  source_bio text,
  generated_bios text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index bio_generations_user_id_idx on public.bio_generations (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- public.conversation_coach_sessions — "paste a conversation, get replies"
-- -----------------------------------------------------------------------------
create table public.conversation_coach_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  input_text text not null,
  suggestions jsonb not null default '[]',
  created_at timestamptz not null default now()
);

comment on column public.conversation_coach_sessions.suggestions is 'Array of { tone, message, explanation }.';

create index conversation_coach_sessions_user_id_idx on public.conversation_coach_sessions (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- public.match_simulator_sessions — training mode against an AI persona
-- -----------------------------------------------------------------------------
create table public.match_simulator_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  persona jsonb not null,
  messages jsonb not null default '[]',
  conversation_score smallint check (conversation_score between 0 and 100),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

comment on column public.match_simulator_sessions.persona is '{ gender, personality }';
comment on column public.match_simulator_sessions.messages is 'Array of { role: "user" | "match", content }.';

create index match_simulator_sessions_user_id_idx on public.match_simulator_sessions (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- public.dating_plans — "My Dating Improvement Plan", one active plan/user
-- -----------------------------------------------------------------------------
create table public.dating_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  days jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.dating_plans.days is 'Array of { day, title, description, done }, regenerated in place.';

create unique index dating_plans_user_id_idx on public.dating_plans (user_id);

create trigger set_dating_plans_updated_at
  before update on public.dating_plans
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- public.ai_usage_events — lightweight metering for Mistral-backed features
-- -----------------------------------------------------------------------------
create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  feature text not null check (
    feature in ('profile_analysis', 'bio_generator', 'conversation_coach', 'match_simulator', 'dating_plan')
  ),
  credits_used smallint not null default 1,
  created_at timestamptz not null default now()
);

create index ai_usage_events_user_id_created_at_idx on public.ai_usage_events (user_id, created_at desc);

-- =============================================================================
-- Row Level Security — same owner-only pattern as 0001
-- =============================================================================
alter table public.photo_analyses enable row level security;
alter table public.bio_generations enable row level security;
alter table public.conversation_coach_sessions enable row level security;
alter table public.match_simulator_sessions enable row level security;
alter table public.dating_plans enable row level security;
alter table public.ai_usage_events enable row level security;

create policy "users can view own photo analyses" on public.photo_analyses
  for select using (auth.uid() = user_id);
create policy "users can insert own photo analyses" on public.photo_analyses
  for insert with check (auth.uid() = user_id);

create policy "users can view own bio generations" on public.bio_generations
  for select using (auth.uid() = user_id);
create policy "users can insert own bio generations" on public.bio_generations
  for insert with check (auth.uid() = user_id);

create policy "users can view own coach sessions" on public.conversation_coach_sessions
  for select using (auth.uid() = user_id);
create policy "users can insert own coach sessions" on public.conversation_coach_sessions
  for insert with check (auth.uid() = user_id);

create policy "users can view own simulator sessions" on public.match_simulator_sessions
  for select using (auth.uid() = user_id);
create policy "users can insert own simulator sessions" on public.match_simulator_sessions
  for insert with check (auth.uid() = user_id);
create policy "users can update own simulator sessions" on public.match_simulator_sessions
  for update using (auth.uid() = user_id);

create policy "users can view own dating plan" on public.dating_plans
  for select using (auth.uid() = user_id);
create policy "users can insert own dating plan" on public.dating_plans
  for insert with check (auth.uid() = user_id);
create policy "users can update own dating plan" on public.dating_plans
  for update using (auth.uid() = user_id);

create policy "users can view own ai usage" on public.ai_usage_events
  for select using (auth.uid() = user_id);
create policy "users can insert own ai usage" on public.ai_usage_events
  for insert with check (auth.uid() = user_id);
