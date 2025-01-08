/*
  # Add external link to deliverables

  1. Changes
    - Add external_link column to deliverables table
*/

ALTER TABLE deliverables
ADD COLUMN external_link text;
