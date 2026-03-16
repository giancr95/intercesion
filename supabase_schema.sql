-- =============================================================
-- Intercesión — Supabase Database Schema
-- Run this entire script in the Supabase SQL Editor
-- =============================================================

-- 1. Create a public "users" profile table linked to auth.users
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  display_name text,
  created_at  timestamptz default now()
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Users can read and update only their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);


-- 2. Create an enum type for intention status
create type intention_status as enum ('Sown', 'In Cultivation', 'Harvested');


-- 3. Create the intentions table
create table if not exists public.intentions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  raw_text    text not null,
  status      intention_status not null default 'Sown',
  is_public   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Index for fast lookups by user
create index idx_intentions_user_id on public.intentions(user_id);

-- Enable RLS on intentions
alter table public.intentions enable row level security;

-- Users can ONLY see their own intentions (+ public ones later)
create policy "Users can view own intentions"
  on public.intentions for select
  using (auth.uid() = user_id);

create policy "Users can insert own intentions"
  on public.intentions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own intentions"
  on public.intentions for update
  using (auth.uid() = user_id);

create policy "Users can delete own intentions"
  on public.intentions for delete
  using (auth.uid() = user_id);


-- 4. Function to auto-create a user profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger: fires after a new auth.users row is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
