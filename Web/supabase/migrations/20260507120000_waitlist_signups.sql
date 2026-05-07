-- Marketing site waitlist (Vercel Next.js → POST /api/waitlist).
-- Duplicate of MealMind/App/RecipeApp/supabase/migrations/20260507120000_waitlist_signups.sql — keep in sync.
--
-- HOW TO RUN (once per Supabase project):
-- 1. Select everything from `create table` down to the last line (not this comment block).
-- 2. Supabase Dashboard → SQL Editor → New query → paste → Run.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  source text not null default 'web_landing'
);

comment on table public.waitlist_signups is 'Email waitlist from mealmind web landing; view rows in Table Editor.';

create unique index if not exists waitlist_signups_email_lower_key
  on public.waitlist_signups (lower(trim(email)));

alter table public.waitlist_signups enable row level security;

drop policy if exists "waitlist_signups_insert_anon" on public.waitlist_signups;

-- Route handler uses the anon key; inserts only (no public reads).
create policy "waitlist_signups_insert_anon"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

grant usage on schema public to anon;
grant insert on table public.waitlist_signups to anon;

notify pgrst, 'reload schema';
