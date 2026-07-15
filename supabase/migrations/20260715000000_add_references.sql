create table public.references (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  theme text not null,
  pose text not null,
  hair text not null,
  build text not null,
  outfit text not null,
  details text not null default '',
  prompt text not null,
  image_path text,
  created_at timestamptz not null default now()
);

alter table public.references enable row level security;

create policy "read own references" on public.references for select using (auth.uid() = user_id);
create policy "insert own references" on public.references for insert with check (auth.uid() = user_id);
create policy "update own references" on public.references for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own references" on public.references for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('reference-images', 'reference-images', false)
on conflict (id) do nothing;

create policy "read own reference images" on storage.objects for select
using (bucket_id = 'reference-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "upload own reference images" on storage.objects for insert
with check (bucket_id = 'reference-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "update own reference images" on storage.objects for update
using (bucket_id = 'reference-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own reference images" on storage.objects for delete
using (bucket_id = 'reference-images' and (storage.foldername(name))[1] = auth.uid()::text);
