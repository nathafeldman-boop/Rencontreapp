-- =============================================================================
-- MatchAI — Analysis extras for the conversion funnel (stage 2)
-- Additive only: extends `analyses` with the 4th sub-score used by the
-- simulated analysis engine, plus a couple of columns the free-results
-- screen and the simulated pipeline need. Nothing existing is dropped or
-- renamed.
-- =============================================================================

alter table public.analyses
  add column if not exists attractiveness_score smallint check (attractiveness_score between 0 and 100);

comment on column public.analyses.attractiveness_score is 'Overall attractiveness sub-score, distinct from the photo-technical-quality score.';

-- Free-tier teaser shown on /results before the paywall (1-2 short insights).
-- Kept separate from `recommendations` (the full, paywalled list) so RLS /
-- product logic can treat "free" and "locked" content differently without
-- parsing JSONB.
alter table public.analyses
  add column if not exists free_insights text[] not null default '{}';

comment on column public.analyses.free_insights is 'Short, ungated insights shown on the free results page to drive paywall conversion.';

-- Marks rows produced by the deterministic simulation (src/lib/ai/simulate-analysis.ts)
-- vs. a real Mistral-backed analysis, so the two can coexist while the AI
-- pipeline is being built out.
alter table public.analyses
  add column if not exists is_simulated boolean not null default true;

comment on column public.analyses.is_simulated is 'True while scored by the deterministic MVP simulation instead of the real Mistral pipeline.';
