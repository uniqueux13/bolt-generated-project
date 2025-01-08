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
    -- Check if user is the client or creator
    EXISTS (
      SELECT 1 FROM deliverables d
      JOIN proposals p ON p.id = d.proposal_id
      JOIN jobs j ON j.id = p.job_id
      WHERE storage.objects.name = d.file_path
      AND (
        j.client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR
        p.creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    )
  )
);

-- Add file_path column to deliverables
ALTER TABLE deliverables 
ADD COLUMN file_path text;
