/*
  # Add file storage support
  
  1. Changes
    - Create storage bucket for deliverable files
    - Add file_path column to deliverables table
    - Add storage policies for file access control
*/

-- Add file_path column to deliverables table
ALTER TABLE deliverables 
ADD COLUMN IF NOT EXISTS file_path text;

-- Create a new bucket for deliverable files
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverable-files', 'deliverable-files', false);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload deliverable files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deliverable-files' 
  AND auth.role() = 'authenticated'
);

-- Allow job stakeholders to view files
CREATE POLICY "Job stakeholders can view deliverable files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deliverable-files'
  AND (
    EXISTS (
      SELECT 1 FROM deliverables d
      JOIN proposals p ON p.id = d.proposal_id
      JOIN jobs j ON j.id = p.job_id
      WHERE storage.objects.name = storage.objects.name
      AND (
        j.client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR
        p.creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    )
  )
);
