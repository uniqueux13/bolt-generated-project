/*
  # Fix Jobs Policy for Clients
  
  Updates the jobs policy to correctly reference client profiles
*/

-- Drop and recreate the jobs policy with correct client reference
DROP POLICY IF EXISTS "Clients can create jobs" ON jobs;

CREATE POLICY "Clients can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'client'
      AND profiles.id = jobs.client_id
    )
  );
