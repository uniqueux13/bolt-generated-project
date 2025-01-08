-- Create or replace the function to handle deliverable submission and job completion
CREATE OR REPLACE FUNCTION submit_deliverable_and_complete_job(
  p_proposal_id uuid,
  p_job_id uuid,
  p_content text,
  p_file_path text DEFAULT NULL,
  p_external_link text DEFAULT NULL
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION submit_deliverable_and_complete_job TO authenticated;
