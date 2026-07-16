-- Run this once in your Supabase project → SQL Editor.
-- Also enable Google provider under Authentication → Providers → Google,
-- and add your published site URL + preview URL to Authentication → URL Configuration.

-- =========== PROFILES ===========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_code text unique not null,
  full_name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
-- Profiles are frozen after signup. Only service_role can edit.

-- =========== BOOKINGS ===========
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pass_type text not null check (pass_type in ('standard','vip')),
  category text not null check (category in ('girls','boys','couples')),
  full_name text not null,
  phone text not null,
  utr text not null,
  screenshot_path text,
  purchase_id text unique,
  status text not null default 'pending' check (status in ('pending','verified','declined','active')),
  created_at timestamptz not null default now()
);
grant select, insert on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
drop policy if exists "own bookings read" on public.bookings;
create policy "own bookings read" on public.bookings
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "own bookings insert" on public.bookings;
create policy "own bookings insert" on public.bookings
  for insert to authenticated with check (auth.uid() = user_id);

-- =========== STORAGE: payment-screenshots (private) ===========
insert into storage.buckets (id, name, public)
  values ('payment-screenshots', 'payment-screenshots', false)
  on conflict (id) do nothing;

drop policy if exists "own screenshot upload" on storage.objects;
create policy "own screenshot upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "own screenshot read" on storage.objects;
create policy "own screenshot read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );