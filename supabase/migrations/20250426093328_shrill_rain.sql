/*
  # Create slides storage bucket

  1. Changes
    - Creates a new storage bucket for slide images
    - Sets up public access for the bucket
*/

insert into storage.buckets (id, name, public)
values ('slides', 'slides', true);

CREATE POLICY "Enable read access for all users" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'slides');

CREATE POLICY "Enable insert access for authenticated users" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'slides');