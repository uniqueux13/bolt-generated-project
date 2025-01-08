/*
  # Add policy for clients to update proposals

  1. Changes
    - Add policy allowing clients to update proposals on their jobs
*/

-- Add policy for clients to update proposals
CREATE POLICY "Clients can update proposals on their jobs"
  ON proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = proposals.job_id
      AND jobs.client_id IN (
        SELECT id FROM profiles
        WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'client'
      )
    )
  );
