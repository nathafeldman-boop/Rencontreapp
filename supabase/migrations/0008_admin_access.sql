-- =============================================================================
-- Flirtcraft — Shared admin dashboard access (stage 7)
-- Code-based auth for the founders' shared admin dashboard at /admin,
-- entirely separate from Supabase Auth (regular users never touch these
-- tables). RLS is enabled with NO policies for anon/authenticated — every
-- read/write goes through the server-side service-role client
-- (see src/lib/supabase/admin.ts), never through a user's own session.
-- =============================================================================

create table public.admin_access_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text, -- who the code belongs to, e.g. "Nathanaël" — purely informational
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  last_used_at timestamptz
);

create table public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  access_code_id uuid not null references public.admin_access_codes (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now()
);

create index admin_sessions_token_idx on public.admin_sessions (token);
create index admin_sessions_access_code_id_idx on public.admin_sessions (access_code_id);

alter table public.admin_access_codes enable row level security;
alter table public.admin_sessions enable row level security;

-- No policies — service-role only. Do not add anon/authenticated policies
-- to these tables; they intentionally have no relationship to app users.

-- Seed one code for the first admin. Rotate/replace via the "Générer un
-- nouveau code" action on /admin once logged in with this one.
insert into public.admin_access_codes (code, label) values ('FC-NATHA-9427', 'Nathanaël');
