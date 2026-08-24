create extension if not exists pgcrypto;

create table if not exists public.birthday_photos (
  id uuid primary key default gen_random_uuid(),
  wall_id text not null,
  kind text not null check (kind in ('center', 'orbit')),
  url text not null,
  storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.birthday_notes (
  id uuid primary key default gen_random_uuid(),
  wall_id text not null,
  note_date date not null default current_date,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.birthday_photos enable row level security;
alter table public.birthday_notes enable row level security;

drop policy if exists "birthday photos public read" on public.birthday_photos;
drop policy if exists "birthday photos public insert" on public.birthday_photos;
drop policy if exists "birthday photos public update" on public.birthday_photos;
drop policy if exists "birthday photos public delete" on public.birthday_photos;

create policy "birthday photos public read"
  on public.birthday_photos for select
  using (true);

create policy "birthday photos public insert"
  on public.birthday_photos for insert
  with check (true);

create policy "birthday photos public update"
  on public.birthday_photos for update
  using (true)
  with check (true);

create policy "birthday photos public delete"
  on public.birthday_photos for delete
  using (true);

drop policy if exists "birthday notes public read" on public.birthday_notes;
drop policy if exists "birthday notes public insert" on public.birthday_notes;
drop policy if exists "birthday notes public update" on public.birthday_notes;
drop policy if exists "birthday notes public delete" on public.birthday_notes;

create policy "birthday notes public read"
  on public.birthday_notes for select
  using (true);

create policy "birthday notes public insert"
  on public.birthday_notes for insert
  with check (true);

create policy "birthday notes public update"
  on public.birthday_notes for update
  using (true)
  with check (true);

create policy "birthday notes public delete"
  on public.birthday_notes for delete
  using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'birthday-photos',
  'birthday-photos',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "birthday storage public read" on storage.objects;
drop policy if exists "birthday storage public insert" on storage.objects;
drop policy if exists "birthday storage public update" on storage.objects;
drop policy if exists "birthday storage public delete" on storage.objects;

create policy "birthday storage public read"
  on storage.objects for select
  using (bucket_id = 'birthday-photos');

create policy "birthday storage public insert"
  on storage.objects for insert
  with check (bucket_id = 'birthday-photos');

create policy "birthday storage public update"
  on storage.objects for update
  using (bucket_id = 'birthday-photos')
  with check (bucket_id = 'birthday-photos');

create policy "birthday storage public delete"
  on storage.objects for delete
  using (bucket_id = 'birthday-photos');
