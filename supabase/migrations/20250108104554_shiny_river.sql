/*
  # Add cascading delete for jobs

  1. Changes
    - Modify foreign key constraint on proposals table to cascade delete
    - Modify foreign key constraint on deliverables table to cascade delete
*/

-- First drop the existing foreign key constraint
ALTER TABLE proposals
DROP CONSTRAINT proposals_job_id_fkey;

-- Re-create it with CASCADE DELETE
ALTER TABLE proposals
ADD CONSTRAINT proposals_job_id_fkey
FOREIGN KEY (job_id)
REFERENCES jobs(id)
ON DELETE CASCADE;

-- Also update deliverables table to cascade delete when proposal is deleted
ALTER TABLE deliverables
DROP CONSTRAINT deliverables_proposal_id_fkey;

ALTER TABLE deliverables
ADD CONSTRAINT deliverables_proposal_id_fkey
FOREIGN KEY (proposal_id)
REFERENCES proposals(id)
ON DELETE CASCADE;
