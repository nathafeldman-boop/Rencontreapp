-- =============================================================================
-- Flirtcraft — Hinge-style prompt/answer bio format (stage 12)
-- Tinder and Bumble use one free-text bio; Hinge replaces that with 3
-- short prompt+answer cards instead. Additive only: `bio` stays the
-- canonical text every other part of the app already reads (scoring,
-- conversation-coach context, etc.) — whenever `prompts` is saved, the
-- API flattens it into `bio` too (see lib/profile-prompts.ts), so nothing
-- else needs to change. Null for every existing profile; only populated
-- for users who go through the new Hinge prompts flow.
-- =============================================================================

alter table public.profiles
  add column prompts jsonb;
