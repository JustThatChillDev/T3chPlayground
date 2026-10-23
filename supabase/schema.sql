-- Run this once in the Supabase SQL Editor for the T3chPlayground project.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  page_title text default '',
  name text default '',
  nickname text default '',
  bio text default '',
  avatar_url text default '',
  headline text default '',
  location text default '',
  songs text default '',
  quote text default '',
  gender text default '',
  pronouns text default '',
  traits text[] default '{}',
  status text default '',
  status_expires_at timestamptz,
  theme_bg text default '#f8f6f0',
  theme_text text default '#20211f',
  enabled_sections text[] default '{about,socials,cards}',
  updated_at timestamptz default now()
);
create table if not exists public.links (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null, url text not null, kind text default 'website', position integer default 0
);
create table if not exists public.projects (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, description text default '', url text default '', position integer default 0
);
create table if not exists public.profile_cards (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'project',
  title text not null,
  description text default '',
  url text default '',
  file_url text default '',
  position integer default 0
);
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.projects enable row level security;
alter table public.profile_cards enable row level security;
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users manage their own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Links are publicly readable" on public.links for select using (true);
create policy "Users manage their own links" on public.links for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Projects are publicly readable" on public.projects for select using (true);
create policy "Users manage their own projects" on public.projects for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Cards are publicly readable" on public.profile_cards for select using (true);
create policy "Users manage their own cards" on public.profile_cards for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Public avatar hosting. Files are limited to the signed-in user's folder.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
create policy "Avatar images are publicly readable" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload their own avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update their own avatars" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
