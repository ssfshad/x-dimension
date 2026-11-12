-- X Dimension: database setup. Run once in Supabase > SQL Editor.
-- Everyone can read the site content. Only people listed in "admins" can change it.

create table if not exists public.admins (
  email text primary key
);

create table if not exists public.strings (
  key text primary key,
  en text not null default '',
  bn text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id text primary key,
  collection text not null,
  sort integer not null default 0,
  visible boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists items_collection_sort on public.items (collection, sort);

create table if not exists public.settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

-- True when the signed-in user's email is in the admins table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

alter table public.admins enable row level security;
alter table public.strings enable row level security;
alter table public.items enable row level security;
alter table public.settings enable row level security;

-- admins: no policies, so nobody can read or change it from the website.

drop policy if exists "read strings" on public.strings;
create policy "read strings" on public.strings for select using (true);
drop policy if exists "admin writes strings" on public.strings;
create policy "admin writes strings" on public.strings for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read items" on public.items;
create policy "read items" on public.items for select using (true);
drop policy if exists "admin writes items" on public.items;
create policy "admin writes items" on public.items for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read settings" on public.settings;
create policy "read settings" on public.settings for select using (true);
drop policy if exists "admin writes settings" on public.settings;
create policy "admin writes settings" on public.settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Image uploads: a public bucket that only admins can write to.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "read media" on storage.objects;
create policy "read media" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "admin writes media" on storage.objects;
create policy "admin writes media" on storage.objects for all
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- LAST STEP: put your own login email here, then run this line.
-- insert into public.admins (email) values ('you@example.com');
