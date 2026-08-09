-- =============================================================================
-- Flirtcraft — First-party activity tracking for the admin user detail page
-- (stage 9). PostHog (see lib/analytics/*) stays the source of truth for
-- funnel dashboards, but pulling a single user's raw timeline back out of
-- PostHog isn't wired up and PostHog isn't guaranteed to be configured in
-- every environment (POSTHOG_API_KEY is optional). This table is a
-- lightweight, always-available mirror of the same funnel events, written
-- by trackServer() alongside the PostHog capture, purely so
-- /admin/user/[id] can render a real session/action history. Tracking
-- starts the moment this migration ships — nothing earlier is backfilled.
-- =============================================================================

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  event text not null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index activity_events_user_id_occurred_at_idx on public.activity_events (user_id, occurred_at desc);

alter table public.activity_events enable row level security;
-- No anon/authenticated policies — every write goes through trackServer()
-- with the service-role client, and every read goes through /admin (also
-- service-role). Regular users never query this table directly.

-- Manually-recorded payments — covers cash/off-platform payments and the
-- manually-granted premium accounts (subscriptions.stripe_customer_id
-- = 'manual_owner_grant' / 'manual_affiliate_grant') that have no real
-- Stripe invoice for the admin LTV total to sum.
create table public.manual_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  note text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index manual_payments_user_id_idx on public.manual_payments (user_id);

alter table public.manual_payments enable row level security;
-- Service-role only (via /admin), same reasoning as above.

-- First-touch marketing attribution, captured by middleware cookies (see
-- lib/analytics/assign-landing-source-cookie.ts) and written once at
-- signup (lib/auth/handle-new-signup.ts) — powers the admin "Origine" field.
alter table public.users
  add column signup_referrer text,
  add column signup_utm_source text;
