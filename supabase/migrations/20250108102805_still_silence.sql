/*
  # Add deliverables functionality

  1. New Types
    - `deliverable_status`: 'pending_review' | 'approved' | 'needs_revision'

  2. New Tables
    - `deliverables`
      - `id` (uuid, primary key)
      - `proposal_id` (uuid, references proposals)
      - `content` (text, deliverable description/links)
      - `status` (deliverable_status)
      - `revision_notes` (text, optional feedback from client)
      - timestamps
*/

-- Create deliverable status type
CREATE TYPE deliverable_status AS ENUM ('pending_review', 'approved', 'needs_revision');

-- Create deliverables table
CREATE TABLE deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals NOT NULL,
  content text NOT NULL,
  status deliverable_status DEFAULT 'pending_review',
  revision_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Policies for deliverables
CREATE POLICY "Deliverables are viewable by job stakeholders"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN jobs ON jobs.id = proposals.job_id
      WHERE proposals.id = deliverables.proposal_id
      AND (
        jobs.client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR
        proposals.creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Creators can submit deliverables"
  ON deliverables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = deliverables.proposal_id
      AND proposals.creator_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
      AND proposals.status = 'accepted'
    )
  );

CREATE POLICY "Stakeholders can update deliverables"
  ON deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN jobs ON jobs.id = proposals.job_id
      WHERE proposals.id = deliverables.proposal_id
      AND (
        jobs.client_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR
        proposals.creator_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
      )
    )
  );
