create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  username_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles are visible" on public.profiles for select using (true);
create policy "create own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "update own profile monthly" on public.profiles for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id and
  (username = (select p.username from public.profiles p where p.user_id = auth.uid()) or
   (select p.username_changed_at from public.profiles p where p.user_id = auth.uid()) <= now() - interval '30 days')
);

alter table public.references add column final_art_path text;
alter table public.references add column is_public boolean not null default true;
create policy "public references are visible" on public.references for select using (is_public = true);

update storage.buckets set public = true where id = 'reference-images';
create policy "upload own final artwork" on storage.objects for insert
with check (bucket_id = 'reference-images' and (storage.foldername(name))[1] = auth.uid()::text);
