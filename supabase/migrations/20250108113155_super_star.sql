/*
  # Add payments table and policies

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `amount` (integer)
      - `status` (text)
      - `paypal_order_id` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS
    - Add policies for clients and creators
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs ON DELETE CASCADE,
  amount integer NOT NULL,
  status text NOT NULL,
  paypal_order_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

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
