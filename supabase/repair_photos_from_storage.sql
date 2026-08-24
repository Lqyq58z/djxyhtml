-- Run this once in Supabase SQL Editor if photos exist in Storage
-- but the photo wall opens with empty placeholder bubbles.
--
-- It rebuilds public.birthday_photos records from files already stored in:
-- birthday-photos/lsc-birthday-wall/

with storage_photos as (
  select
    'lsc-birthday-wall'::text as wall_id,
    case
      when storage.filename(name) like 'center-%' then 'center'
      else 'orbit'
    end as kind,
    'https://nsqxumnoyvywv11dgjvu.supabase.co/storage/v1/object/public/' || bucket_id || '/' || name as url,
    name as storage_path,
    row_number() over (
      partition by case when storage.filename(name) like 'center-%' then 'center' else 'orbit' end
      order by created_at, name
    )::integer as sort_order,
    created_at
  from storage.objects
  where bucket_id = 'birthday-photos'
    and name like 'lsc-birthday-wall/%'
    and (
      storage.filename(name) like 'center-%.png'
      or storage.filename(name) like 'orbit-%.png'
      or storage.filename(name) like 'center-%.jpg'
      or storage.filename(name) like 'orbit-%.jpg'
      or storage.filename(name) like 'center-%.jpeg'
      or storage.filename(name) like 'orbit-%.jpeg'
      or storage.filename(name) like 'center-%.webp'
      or storage.filename(name) like 'orbit-%.webp'
    )
)
insert into public.birthday_photos (
  wall_id,
  kind,
  url,
  storage_path,
  sort_order,
  created_at
)
select
  wall_id,
  kind,
  url,
  storage_path,
  sort_order,
  created_at
from storage_photos
where not exists (
  select 1
  from public.birthday_photos existing
  where existing.storage_path = storage_photos.storage_path
);
