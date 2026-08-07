-- =============================================================================
-- MatchAI — Initial schema
-- Tables: users, profiles, onboarding_answers, analyses, subscriptions
-- Conventions: uuid PKs, RLS enabled everywhere, owner-based policies,
-- `updated_at` kept fresh by trigger, enums instead of free-text where the
-- value set is closed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.gender as enum ('male', 'female', 'non_binary', 'other');

create type public.dating_goal as enum (
  'serious_relationship',
  'casual_dating',
  'friends',
  'not_sure'
);

create type public.dating_app as enum ('tinder', 'bumble', 'hinge', 'other');

create type public.subscription_plan as enum (
  'free',
  'premium_monthly',
  'premium_annual'
);

create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

-- -----------------------------------------------------------------------------
-- Helper: keep `updated_at` current on every UPDATE
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- public.users — extends auth.users with product-specific profile data
-- One row per authenticated user, id == auth.users.id.
-- =============================================================================
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  gender public.gender,
  age smallint check (age is null or (age >= 18 and age <= 100)),
  country text,
  dating_goal public.dating_goal,
  dating_apps_used public.dating_app[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Product profile for each authenticated user, 1:1 with auth.users.';

create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-provision a public.users row whenever a new auth.users row is created
-- (e.g. right after Google OAuth / email sign-up completes).
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- =============================================================================
-- public.profiles — a dating-app profile (bio + photos) submitted for analysis
-- A user may have several, e.g. one per dating app.
-- =============================================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  bio text,
  photos text[] not null default '{}', -- Supabase Storage object paths
  dating_app public.dating_app not null default 'other',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.photos is 'Storage object paths in the profile-photos bucket, not public URLs.';

create index profiles_user_id_idx on public.profiles (user_id);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =============================================================================
-- public.onboarding_answers — free-form Q&A captured during onboarding
-- =============================================================================
create table public.onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create index onboarding_answers_user_id_idx on public.onboarding_answers (user_id);

-- =============================================================================
-- public.analyses — AI scoring results for a profile
-- =============================================================================
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  overall_score smallint not null check (overall_score between 0 and 100),
  photo_score smallint check (photo_score between 0 and 100),
  bio_score smallint check (bio_score between 0 and 100),
  conversation_score smallint check (conversation_score between 0 and 100),
  recommendations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

comment on column public.analyses.recommendations is 'Array of { category, title, detail } objects returned by the Mistral analysis pipeline.';

create index analyses_user_id_idx on public.analyses (user_id);
create index analyses_user_id_created_at_idx on public.analyses (user_id, created_at desc);

-- =============================================================================
-- public.subscriptions — Stripe subscription state, mirrored via webhooks
-- =============================================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  plan public.subscription_plan not null default 'free',
  status public.subscription_status,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_stripe_customer_id_idx on public.subscriptions (stripe_customer_id);

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- Default posture: a user can only ever see/write their own rows.
-- Writes that must be trusted (subscription state from Stripe webhooks) are
-- deliberately NOT exposed to the `authenticated` role — only the service
-- role (which bypasses RLS entirely) can write there.
-- =============================================================================
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.onboarding_answers enable row level security;
alter table public.analyses enable row level security;
alter table public.subscriptions enable row level security;

-- users
create policy "users can view own row" on public.users
  for select using (auth.uid() = id);

create policy "users can update own row" on public.users
  for update using (auth.uid() = id);

-- profiles
create policy "users can view own profiles" on public.profiles
  for select using (auth.uid() = user_id);

create policy "users can insert own profiles" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "users can update own profiles" on public.profiles
  for update using (auth.uid() = user_id);

create policy "users can delete own profiles" on public.profiles
  for delete using (auth.uid() = user_id);

-- onboarding_answers
create policy "users can view own onboarding answers" on public.onboarding_answers
  for select using (auth.uid() = user_id);

create policy "users can insert own onboarding answers" on public.onboarding_answers
  for insert with check (auth.uid() = user_id);

-- analyses (server writes these using the user's own session, RLS-safe)
create policy "users can view own analyses" on public.analyses
  for select using (auth.uid() = user_id);

create policy "users can insert own analyses" on public.analyses
  for insert with check (auth.uid() = user_id);

-- subscriptions — read-only for the owning user; writes are Stripe-webhook only
create policy "users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- =============================================================================
-- Storage — profile photo uploads
-- Objects are stored under `<user_id>/<filename>` so ownership can be
-- derived from the path itself.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

create policy "users can read own photos" on storage.objects
  for select using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can upload own photos" on storage.objects
  for insert with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can delete own photos" on storage.objects
  for delete using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
