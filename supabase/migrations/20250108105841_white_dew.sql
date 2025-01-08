/*
  # Fix file delivery system

  1. Changes
    - Add file_path column to deliverables table
    - Create storage bucket for deliverable files
    - Add storage policies for file access

  2. Security
    - Enable RLS for storage bucket
    - Add policies for upload and download
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false)
ON CONFLICT (id) DO NOTHING;

-- Add file_path column if it doesn't exist
ALTER TABLE deliverables
ADD COLUMN IF NOT EXISTS file_path text;

-- Enable RLS on storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow creators to upload files
CREATE POLICY "Creators can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deliverables'
  AND auth.role() = 'authenticated'
);

-- Allow job stakeholders to download files
CREATE POLICY "Job stakeholders can download files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deliverables'
  AND EXISTS (
    SELECT 1 FROM deliverables d
    JOIN proposals p ON p.id = d.proposal_id
    JOIN jobs j ON j.id = p.job_id
    WHERE 
      storage.objects.name = d.file_path
      AND (
        j.client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR
        p.creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
  )
);
