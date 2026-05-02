-- Supabase Storage bucket setup
-- Bucket name: school-files
-- Set public to false if you want a private bucket.
insert into storage.buckets (id, name, public)
values ('school-files', 'school-files', true)
on conflict (id) do update
  set public = excluded.public;

drop policy if exists "Authenticated users can read school files" on storage.objects;
drop policy if exists "Authenticated users can upload school files" on storage.objects;
drop policy if exists "Authenticated users can update school files" on storage.objects;
drop policy if exists "Authenticated users can delete school files" on storage.objects;

-- Allow authenticated users to read files from this bucket.
create policy "Authenticated users can read school files"
on storage.objects
for select
to authenticated
using (bucket_id = 'school-files');

-- Allow authenticated users to upload files to this bucket.
create policy "Authenticated users can upload school files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'school-files');

-- Allow authenticated users to update files in this bucket.
create policy "Authenticated users can update school files"
on storage.objects
for update
to authenticated
using (bucket_id = 'school-files')
with check (bucket_id = 'school-files');

-- Allow authenticated users to delete files from this bucket.
create policy "Authenticated users can delete school files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'school-files');
