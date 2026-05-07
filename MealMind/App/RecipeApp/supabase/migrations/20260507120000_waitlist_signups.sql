-- Marketing site waitlist (Next.js landing → /api/waitlist).
--
-- HOW TO RUN (once per Supabase project):
-- 1. Open THIS file in your editor (Cursor/VS Code), select everything from `create table` down to the last line.
-- 2. Supabase Dashboard → SQL Editor → New query → paste that SQL only → Run.
-- Do NOT paste the file path (e.g. MealMind/App/...) into SQL Editor—that is not valid SQL.
--
-- If the API still says "schema cache", wait ~1 min or Project Settings → API → reload schema.

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

-- Server route uses anon key; inserts only (no public reads).
create policy "waitlist_signups_insert_anon"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

grant usage on schema public to anon;
grant insert on table public.waitlist_signups to anon;

-- Refresh PostgREST so `waitlist_signups` appears in the API immediately.
notify pgrst, 'reload schema';
