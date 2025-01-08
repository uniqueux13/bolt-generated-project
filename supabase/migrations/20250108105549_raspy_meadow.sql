/*
  # Add file handling capabilities

  1. Changes
    - Add file_url column to deliverables table
    - Add file_name column to deliverables table
    - Add file_size column to deliverables table
    - Add file_type column to deliverables table

  2. Security
    - Update RLS policies for file access
*/

-- Add new columns for file handling
ALTER TABLE deliverables
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS file_type text;

-- Update storage policies
CREATE POLICY "Authenticated users can download files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deliverable-files'
  AND auth.role() = 'authenticated'
);
