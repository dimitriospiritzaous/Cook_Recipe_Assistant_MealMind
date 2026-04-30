-- Run once in Supabase → SQL Editor (paste all, then Run).
-- Fixes: "Could not find the table 'public.profiles' in the schema cache"
-- After success: wait ~1 minute or Dashboard → Settings → API → reload schema if offered.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists profiles_updated_at_idx on public.profiles (updated_at desc);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant usage on schema public to authenticated;
grant select, insert, update on table public.profiles to authenticated;
