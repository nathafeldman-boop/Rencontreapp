-- =============================================================================
-- Flirtcraft — security hardening pass (stage 13)
-- Two issues flagged by the Supabase security advisor:
--
-- 1. set_updated_at() had no pinned search_path — a function without one
--    resolves unqualified identifiers against whatever search_path is in
--    effect at call time, which is normally harmless here (the function
--    only touches NEW, no unqualified table/function names) but is cheap
--    to close off entirely as a matter of standard practice.
--
-- 2. handle_new_auth_user() is SECURITY DEFINER (needed — it inserts into
--    public.users on behalf of a just-created auth.users row, which
--    requires elevated privileges) and, like every function, is
--    EXECUTE-granted to PUBLIC by default. PostgreSQL only allows a
--    RETURNS TRIGGER function to run as an actual trigger, so calling it
--    directly via PostgREST RPC would just error — but revoking EXECUTE
--    from anon/authenticated removes the surface entirely instead of
--    relying on that behavior staying true.
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Revoking from anon/authenticated alone isn't enough: every new function
-- also gets an implicit EXECUTE grant to the PUBLIC pseudo-role, which
-- anon/authenticated inherit regardless of the explicit revoke above.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;
