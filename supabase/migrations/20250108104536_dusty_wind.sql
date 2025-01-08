/*
  # Add job deletion policy

  1. Changes
    - Add RLS policy to allow clients to delete their own jobs
*/

-- Add policy for clients to delete their jobs
CREATE POLICY "Clients can delete own jobs"
  ON jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = jobs.client_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'client'
    )
  );
