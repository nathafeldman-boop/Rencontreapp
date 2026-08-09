-- =============================================================================
-- Flirtcraft — drop dating_connections (stage 11)
-- Built in 0007_dating_stats.sql for a future OAuth platform-connector
-- integration (see the now-deleted src/lib/dating-platforms/) that will
-- never exist: Tinder, Hinge and Bumble have no public API, and Flirtcraft
-- does not connect to them automatically, officially or otherwise. Nothing
-- ever wrote to this table (RLS had no insert/update policy for it). The
-- "which apps do you use" need it was meant to eventually serve is already
-- covered by users.dating_apps_used, captured at onboarding.
-- =============================================================================

drop table public.dating_connections;
