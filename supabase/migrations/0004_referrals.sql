-- =============================================================================
-- MatchAI — Referral program & creator attribution (stage 4)
-- Additive only, same conventions as prior migrations.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- public.referrals — one durable referral code per user
-- -----------------------------------------------------------------------------
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create index referrals_code_idx on public.referrals (code);

-- -----------------------------------------------------------------------------
-- public.creators — influencer / UGC partners with a personalized landing
-- page at /creator/<slug> and an optional promo code. Managed directly in
-- the database for now (small, low-churn list) rather than via a user-facing
-- CRUD API.
-- -----------------------------------------------------------------------------
create table public.creators (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  headline text,
  promo_code text unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- public.referral_invites — one row per signup attributed to a referrer OR
-- a creator. `referred_user_id` is unique so a given account can only ever
-- be attributed once (first attribution wins).
-- -----------------------------------------------------------------------------
create table public.referral_invites (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid references public.users (id) on delete cascade,
  creator_id uuid references public.creators (id) on delete set null,
  referred_user_id uuid not null unique references public.users (id) on delete cascade,
  source text not null check (source in ('referral', 'creator')),
  created_at timestamptz not null default now(),
  constraint referral_invites_source_matches_actor check (
    (source = 'referral' and referrer_user_id is not null and creator_id is null) or
    (source = 'creator' and creator_id is not null and referrer_user_id is null)
  )
);

create index referral_invites_referrer_user_id_idx on public.referral_invites (referrer_user_id);
create index referral_invites_creator_id_idx on public.referral_invites (creator_id);

-- -----------------------------------------------------------------------------
-- public.referral_rewards — reward ledger. `expires_at` is what
-- `lib/referrals/access.ts` checks to grant temporary dashboard access
-- without touching Stripe/`subscriptions` at all.
-- -----------------------------------------------------------------------------
create table public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  reward_days smallint not null,
  reason text not null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- One grant per (user, reason) — e.g. 'first_invite' or 'five_invites' — so
-- reward computation can safely be re-run without double-granting.
create unique index referral_rewards_user_id_reason_idx on public.referral_rewards (user_id, reason);
create index referral_rewards_user_id_expires_at_idx on public.referral_rewards (user_id, expires_at desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.referrals enable row level security;
alter table public.creators enable row level security;
alter table public.referral_invites enable row level security;
alter table public.referral_rewards enable row level security;

create policy "users can view own referral code" on public.referrals
  for select using (auth.uid() = user_id);
create policy "users can create own referral code" on public.referrals
  for insert with check (auth.uid() = user_id);

-- Public, unauthenticated read — /creator/<slug> is a marketing landing page.
create policy "anyone can view active creators" on public.creators
  for select using (active = true);

create policy "referrers can view own invites" on public.referral_invites
  for select using (auth.uid() = referrer_user_id);
-- Inserted by the newly-referred user's own session right after signup
-- (see lib/referrals/attribute-signup.ts), crediting someone else.
create policy "referred users can record their own attribution" on public.referral_invites
  for insert with check (auth.uid() = referred_user_id);

create policy "users can view own rewards" on public.referral_rewards
  for select using (auth.uid() = user_id);
create policy "users can be granted own rewards" on public.referral_rewards
  for insert with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Seed a couple of example creators so /creator/<slug> has something to show
-- in development. Safe to delete/replace in production.
-- -----------------------------------------------------------------------------
insert into public.creators (slug, name, headline, promo_code) values
  ('alex', 'Alex', 'Alex sent you — here''s what MatchAI found on my own profile.', 'ALEX20'),
  ('mia', 'Mia', 'Mia''s community gets 20% off their first month.', 'MIA20')
on conflict (slug) do nothing;
