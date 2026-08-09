-- =============================================================================
-- Flirtcraft — allow 'dating_stats' as an ai_usage_events.feature value
-- (stage 10). Powers /api/ai/dating-stats/extract-screenshot: reading a
-- matches/conversations list screenshot to prefill the weekly stats form
-- on /dashboard/progression (see lib/ai/dating-stats-vision.ts).
-- =============================================================================

alter table public.ai_usage_events
  drop constraint ai_usage_events_feature_check;

alter table public.ai_usage_events
  add constraint ai_usage_events_feature_check
  check (feature in ('profile_analysis', 'bio_generator', 'conversation_coach', 'match_simulator', 'dating_plan', 'dating_stats'));
