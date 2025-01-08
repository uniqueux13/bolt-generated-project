/*
  # Fix creator proposal visibility

  1. Changes
    - Add policy for creators to view their own proposals
*/

-- Add policy for creators to view their own proposals
CREATE POLICY "Creators can view own proposals"
  ON proposals FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM profiles
      WHERE user_id = auth.uid()
    )
  );
