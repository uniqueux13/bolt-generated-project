/*
  # Initial Schema Setup for Client-Creator Marketplace
  
  Creates tables and policies with checks for existing policies
*/

-- Create custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'creator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('draft', 'published', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role user_role NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  budget integer NOT NULL,
  status job_status DEFAULT 'draft',
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs NOT NULL,
  creator_id uuid REFERENCES profiles NOT NULL,
  price integer NOT NULL,
  description text NOT NULL,
  status proposal_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
    DROP POLICY IF EXISTS "Clients can create jobs" ON jobs;
    DROP POLICY IF EXISTS "Clients can update own jobs" ON jobs;
    DROP POLICY IF EXISTS "Proposals are viewable by job owner and creator" ON proposals;
    DROP POLICY IF EXISTS "Creators can submit proposals" ON proposals;
    DROP POLICY IF EXISTS "Creators can update own proposals" ON proposals;
END $$;

-- Recreate policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Clients can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'client'
    )
  );

CREATE POLICY "Clients can update own jobs"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = jobs.client_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Proposals are viewable by job owner and creator"
  ON proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = proposals.job_id
      AND (
        jobs.client_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
        OR
        proposals.creator_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Creators can submit proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'creator'
    )
  );

CREATE POLICY "Creators can update own proposals"
  ON proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = proposals.creator_id
      AND profiles.user_id = auth.uid()
    )
  );
