-- =============================================================================
-- Flirtcraft — anonymous (pre-signup) activity tracking.
--
-- Until now `activity_events` only ever recorded events for an authenticated
-- `user_id`, so /api/analytics/activity silently no-op'd for anything fired
-- before signup (landing_view, click_start_analysis, signup_started) — the
-- admin dashboard's funnel had no first-party record of the very top of the
-- funnel (LP entry), only PostHog did.
--
-- `anon_id` lets us persist those pre-signup events keyed by a browser
-- cookie (see lib/analytics/cookies.ts) instead of a user id. The moment
-- that visitor actually signs up, handle-new-signup.ts claims every row
-- matching their anon_id by stamping user_id on it and clearing anon_id —
-- so a claimed row is indistinguishable from one that was authenticated
-- from the start, and the per-user timeline on /admin/user/[id] shows the
-- landing page visit as the very first event with zero UI changes needed.
-- =============================================================================

alter table public.activity_events
  alter column user_id drop not null,
  add column anon_id text;

alter table public.activity_events
  add constraint activity_events_identity_check
  check (user_id is not null or anon_id is not null);

create index activity_events_anon_id_idx on public.activity_events (anon_id) where anon_id is not null;
