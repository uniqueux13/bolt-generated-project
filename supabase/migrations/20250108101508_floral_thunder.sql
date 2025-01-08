/*
  # Initial Schema Setup for Client-Creator Marketplace

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - role (enum: client, creator)
      - full_name (text)
      - avatar_url (text)
      - bio (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - jobs
      - id (uuid, primary key)
      - client_id (uuid, references profiles)
      - title (text)
      - description (text)
      - budget (integer)
      - status (enum: draft, published, in_progress, completed)
      - category (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - proposals
      - id (uuid, primary key)
      - job_id (uuid, references jobs)
      - creator_id (uuid, references profiles)
      - price (integer)
      - description (text)
      - status (enum: pending, accepted, rejected)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'creator');
CREATE TYPE job_status AS ENUM ('draft', 'published', 'in_progress', 'completed');
CREATE TYPE proposal_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
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

-- Create jobs table
CREATE TABLE jobs (
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

-- Create proposals table
CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs NOT NULL,
  creator_id uuid REFERENCES profiles NOT NULL,
  price integer NOT NULL,
  description text NOT NULL,
  status proposal_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Jobs policies
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

-- Proposals policies
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
