-- =============================================================================
-- Flirtcraft — self-serve affiliate onboarding (stage 15)
--
-- Real-world funnel: the team closes a deal with an affiliate over DM, then
-- sends them a one-time invite link instead of manually creating their
-- account. `affiliate_invites` is that link's backing row — a lightweight,
-- admin-only table (no RLS policies, same reasoning as `activity_events`:
-- every read/write goes through a trusted server route) distinct from
-- `affiliates` itself, since at invite time there's no user account yet to
-- attach a row to.
-- =============================================================================

create table public.affiliate_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  -- Free-text reminder for the admin of who this link was sent to
  -- (e.g. "flowri_te") — purely informational, not validated against
  -- anything the affiliate later enters.
  label text,
  commission_rate numeric(4, 3) not null default 0.600 check (commission_rate > 0 and commission_rate <= 1),
  used_at timestamptz,
  used_by_affiliate_id uuid references public.affiliates (id) on delete set null,
  created_at timestamptz not null default now()
);

create index affiliate_invites_token_idx on public.affiliate_invites (token);

alter table public.affiliate_invites enable row level security;
-- Service-role only: /admin generates these, /affilie/rejoindre/<token>
-- validates and consumes them server-side after `src/proxy.ts` has already
-- required the visitor to be authenticated.

alter table public.affiliates add column display_name text;
