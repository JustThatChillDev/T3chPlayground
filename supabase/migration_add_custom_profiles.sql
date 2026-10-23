-- Run this if the original schema.sql was already executed.
alter table public.profiles add column if not exists quote text default '';
alter table public.profiles add column if not exists page_title text default '';
alter table public.profiles add column if not exists gender text default '';
alter table public.profiles add column if not exists pronouns text default '';
alter table public.profiles add column if not exists traits text[] default '{}';
alter table public.profiles add column if not exists status text default '';
alter table public.profiles add column if not exists status_expires_at timestamptz;
alter table public.profiles add column if not exists theme_bg text default '#f8f6f0';
alter table public.profiles add column if not exists theme_text text default '#20211f';
alter table public.profiles add column if not exists enabled_sections text[] default '{about,socials,cards}';

create table if not exists public.profile_cards (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'project', title text not null, description text default '',
  url text default '', file_url text default '', position integer default 0
);
alter table public.profile_cards enable row level security;
drop policy if exists "Cards are publicly readable" on public.profile_cards;
drop policy if exists "Users manage their own cards" on public.profile_cards;
create policy "Cards are publicly readable" on public.profile_cards for select using (true);
create policy "Users manage their own cards" on public.profile_cards for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
drop policy if exists "Avatar images are publicly readable" on storage.objects;
drop policy if exists "Users upload their own avatars" on storage.objects;
drop policy if exists "Users update their own avatars" on storage.objects;
create policy "Avatar images are publicly readable" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload their own avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update their own avatars" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
