-- Engagement/activation tracking for the guided dashboard funnel and the
-- daily stats reminder opt-in.

alter table public.profiles
  add column photos_optimized boolean not null default false;

comment on column public.profiles.photos_optimized is
  'Set true the first time this profile''s photo set is changed via PATCH /api/profile (reorder/delete/add) — drives the "optimise tes photos" step of the dashboard activation checklist.';

alter table public.users
  add column daily_reminder_enabled boolean;

comment on column public.users.daily_reminder_enabled is
  'Null = not asked yet. Opt-in for the daily email nudging the user to log their real dating stats and check the AI coach after a new match.';
