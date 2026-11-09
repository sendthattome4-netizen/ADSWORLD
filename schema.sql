-- Run this whole script in Supabase Dashboard > SQL Editor > New query.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'advertiser' check (role in ('advertiser','publisher','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  destination_url text,
  objective text,
  country text default 'Worldwide',
  age_range text,
  gender text,
  interests text,
  duration_days integer not null check (duration_days between 1 and 365),
  budget numeric(12,2),
  currency text default 'XAF',
  description text,
  status text not null default 'draft' check (status in ('draft','pending','active','paused','completed','rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can view own campaigns" on public.campaigns;
create policy "Users can view own campaigns" on public.campaigns for select using (auth.uid() = user_id);
drop policy if exists "Users can create own campaign drafts" on public.campaigns;
create policy "Users can create own campaign drafts" on public.campaigns for insert with check (auth.uid() = user_id and status = 'draft');
drop policy if exists "Users can update own campaign drafts" on public.campaigns;
create policy "Users can update own campaign drafts" on public.campaigns for update using (auth.uid() = user_id and status = 'draft') with check (auth.uid() = user_id and status = 'draft');
drop policy if exists "Users can delete own campaign drafts" on public.campaigns;
create policy "Users can delete own campaign drafts" on public.campaigns for delete using (auth.uid() = user_id and status = 'draft');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Publisher website applications and dashboard.
create table if not exists public.publisher_sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_name text not null,
  site_url text not null,
  category text not null,
  monthly_visitors text not null default 'Not sure',
  ad_format text not null default 'Banner placement',
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  created_at timestamptz not null default now()
);

alter table public.publisher_sites enable row level security;

drop policy if exists "Users can view own publisher sites" on public.publisher_sites;
create policy "Users can view own publisher sites"
on public.publisher_sites for select
using (auth.uid() = user_id);

drop policy if exists "Users can submit own publisher sites" on public.publisher_sites;
create policy "Users can submit own publisher sites"
on public.publisher_sites for insert
with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users can update own pending publisher sites" on public.publisher_sites;
create policy "Users can update own pending publisher sites"
on public.publisher_sites for update
using (auth.uid() = user_id and status = 'pending')
with check (auth.uid() = user_id and status = 'pending');
