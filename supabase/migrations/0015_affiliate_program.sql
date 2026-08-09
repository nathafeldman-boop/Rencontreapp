-- =============================================================================
-- Flirtcraft — paid affiliate program (stage 14)
--
-- Distinct from the existing `referrals` (free-user-invites-a-friend, reward
-- is bonus Premium days) and `creators` (influencer landing page + optional
-- discount promo code) programs. This one pays out real money: an affiliate
-- gets a tracking link (`/aff/<code>`), and earns a commission on every
-- subscription sale it brings in.
--
-- An affiliate is just a normal Flirtcraft user (signs in the same way,
-- `auth.uid()`/`public.users` already exists for them) that an admin has
-- additionally linked to a row here — mirrors how `creators` is "managed
-- directly in the database for now (small, low-churn list)".
-- =============================================================================

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  code text not null unique,
  -- Fraction of the sale amount paid out, e.g. 0.600 = 60%. Frozen onto each
  -- commission row at sale time (see affiliate_commissions), so changing
  -- this later never rewrites payout history.
  commission_rate numeric(4, 3) not null default 0.600 check (commission_rate > 0 and commission_rate <= 1),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index affiliates_code_idx on public.affiliates (code);

-- -----------------------------------------------------------------------------
-- public.affiliate_clicks — one row per visit to `/aff/<code>`. Anonymous
-- (no user yet), purely for the "clicks" side of the click -> signup ->
-- sale funnel shown on both the affiliate's own dashboard and the admin
-- panel.
-- -----------------------------------------------------------------------------
create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  occurred_at timestamptz not null default now()
);

create index affiliate_clicks_affiliate_id_occurred_at_idx on public.affiliate_clicks (affiliate_id, occurred_at desc);

-- -----------------------------------------------------------------------------
-- public.affiliate_referrals — one row per signup attributed to an
-- affiliate. `referred_user_id` is unique so an account can only ever be
-- attributed to one affiliate (first attribution wins, same rule as
-- `referral_invites`).
-- -----------------------------------------------------------------------------
create table public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  referred_user_id uuid not null unique references public.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index affiliate_referrals_affiliate_id_idx on public.affiliate_referrals (affiliate_id);

-- -----------------------------------------------------------------------------
-- public.affiliate_commissions — one row per paid sale attributed to an
-- affiliate. Written by the Stripe webhook (`checkout.session.completed`),
-- keyed on the Checkout Session id so a webhook retry can never double-pay
-- a commission. `status` lets the admin panel mark a batch as paid out
-- without deleting the record.
-- -----------------------------------------------------------------------------
create table public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  referred_user_id uuid not null references public.users (id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  amount_cents integer not null check (amount_cents > 0),
  commission_cents integer not null check (commission_cents > 0),
  status text not null default 'due' check (status in ('due', 'paid', 'void')),
  created_at timestamptz not null default now()
);

create index affiliate_commissions_affiliate_id_status_idx on public.affiliate_commissions (affiliate_id, status);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.affiliates enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_commissions enable row level security;

-- Every write to these four tables goes through a service-role client
-- (the /aff/<code> redirect, signup attribution, the Stripe webhook, and
-- the /admin affiliate panel) — only read access needs an authenticated
-- policy, so an affiliate can see their own dashboard.
create policy "affiliates can view own record" on public.affiliates
  for select using (auth.uid() = user_id);

create policy "affiliates can view own clicks" on public.affiliate_clicks
  for select using (affiliate_id in (select id from public.affiliates where user_id = auth.uid()));

create policy "affiliates can view own referrals" on public.affiliate_referrals
  for select using (affiliate_id in (select id from public.affiliates where user_id = auth.uid()));

create policy "affiliates can view own commissions" on public.affiliate_commissions
  for select using (affiliate_id in (select id from public.affiliates where user_id = auth.uid()));
