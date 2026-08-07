-- =============================================================================
-- MatchAI — Customer feedback (stage 5)
-- Backs the "Did MatchAI help you?" widget shown after key moments (viewing
-- results, using an AI tool) and a lightweight bug/feature/general form.
-- Additive only, same conventions as prior migrations.
-- =============================================================================

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  category text not null check (category in ('bug', 'feature', 'general')),
  context text, -- where it was captured, e.g. 'results', 'dashboard', 'coach'
  helpful boolean, -- thumbs up/down from the "Did this help you?" prompt
  message text,
  created_at timestamptz not null default now()
);

create index feedback_user_id_idx on public.feedback (user_id);
create index feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

create policy "users can submit own feedback" on public.feedback
  for insert with check (auth.uid() = user_id);
create policy "users can view own feedback" on public.feedback
  for select using (auth.uid() = user_id);
