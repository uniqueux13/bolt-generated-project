/*
  # Add stored procedure for deliverable submission

  1. New Procedure
    - Creates a stored procedure that handles:
      - Inserting a new deliverable
      - Updating the job status to completed
    - All operations are performed in a single transaction
  
  2. Changes
    - Adds `submit_deliverable_and_complete_job` procedure
*/

CREATE OR REPLACE FUNCTION submit_deliverable_and_complete_job(
  p_proposal_id uuid,
  p_job_id uuid,
  p_content text,
  p_file_path text,
  p_external_link text
) RETURNS void AS $$
BEGIN
  -- Insert the deliverable
  INSERT INTO deliverables (
    proposal_id,
    content,
    file_path,
    external_link
  ) VALUES (
    p_proposal_id,
    p_content,
    p_file_path,
    p_external_link
  );

  -- Update the job status to completed
  UPDATE jobs
  SET status = 'completed'
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
