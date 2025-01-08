-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view their payments" ON payments;
DROP POLICY IF EXISTS "Creators can view payments for their jobs" ON payments;
DROP POLICY IF EXISTS "Clients can create payments" ON payments;

-- Create policies for payments
CREATE POLICY "Clients can view their payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = payments.job_id
      AND jobs.client_id IN (
        SELECT id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Creators can view payments for their jobs"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN proposals ON proposals.job_id = jobs.id
      WHERE jobs.id = payments.job_id
      AND proposals.creator_id IN (
        SELECT id FROM profiles
        WHERE user_id = auth.uid()
      )
      AND proposals.status = 'accepted'
    )
  );

CREATE POLICY "Clients can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = payments.job_id
      AND jobs.client_id IN (
        SELECT id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );
