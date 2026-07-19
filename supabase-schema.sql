-- Run this once in your Supabase project → SQL Editor.
-- Also enable Google provider under Authentication → Providers → Google,
-- and add your published site URL + preview URL to Authentication → URL Configuration.

-- =========== PROFILES ===========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_code text unique not null,
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists email text;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
-- Profiles are frozen after signup. Only service_role can edit.

-- =========== BOOKINGS ===========
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pass_type text not null check (pass_type in ('standard','vip','host')),
  category text not null check (category in ('girls','boys','couples')),
  full_name text not null,
  phone text not null,
  utr text not null,
  screenshot_path text,
  purchase_id text unique,
  status text not null default 'pending' check (status in ('pending','verified','declined','active')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
drop policy if exists "own bookings read" on public.bookings;
create policy "own bookings read" on public.bookings
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "own bookings insert" on public.bookings;
create policy "own bookings insert" on public.bookings
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "own pending bookings update" on public.bookings;
create policy "own pending bookings update" on public.bookings
  for update to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

-- Two-step booking flow: row is inserted BEFORE payment (name/phone captured),
-- then updated with utr + screenshot after the user pays.
alter table public.bookings alter column utr drop not null;
alter table public.bookings drop constraint if exists bookings_pass_type_check;
alter table public.bookings add constraint bookings_pass_type_check
  check (pass_type in ('standard','vip','host'));
alter table public.bookings drop constraint if exists bookings_category_check;
alter table public.bookings add constraint bookings_category_check
  check (category in ('single','couple'));

-- =========== GATE CHECK-IN COLUMNS ===========
alter table public.bookings
  add column if not exists ticket_token text unique,
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_in_by uuid references auth.users(id);

create index if not exists bookings_ticket_token_idx on public.bookings (ticket_token);

-- =========== COUPONS ===========
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  percent_off smallint not null check (percent_off > 0 and percent_off <= 100),
  pass_type text not null default 'all' check (pass_type in ('standard','vip','all')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons
  add column if not exists max_uses integer;
grant select on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
-- No client-side read/write policies — all access goes through server functions.

alter table public.bookings
  add column if not exists coupon_code text,
  add column if not exists discount_percent smallint,
  add column if not exists final_amount numeric(10,2);

-- Auto-mint a ticket_token when a booking becomes 'verified'.
create or replace function public.mint_ticket_token()
returns trigger language plpgsql as $$
declare
  candidate text;
  tries int := 0;
begin
  if new.status = 'verified' and (new.ticket_token is null or new.ticket_token = '') then
    loop
      candidate := upper(replace(replace(encode(gen_random_bytes(16), 'base64'), '/', ''), '+', ''));
      candidate := substr(candidate, 1, 24);
      exit when not exists (select 1 from public.bookings where ticket_token = candidate);
      tries := tries + 1;
      if tries > 8 then raise exception 'could not mint ticket_token'; end if;
    end loop;
    new.ticket_token := candidate;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_mint_ticket_token on public.bookings;
create trigger bookings_mint_ticket_token
  before insert or update of status on public.bookings
  for each row execute function public.mint_ticket_token();

-- =========== ROLES ===========
do $$ begin
  create type public.app_role as enum ('admin', 'gate');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
drop policy if exists "own roles read" on public.user_roles;
create policy "own roles read" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

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