-- Fair Work Help — initial schema
-- Run this in Supabase SQL Editor after creating the project

-- Waitlist table: captures early access signups
CREATE TABLE IF NOT EXISTS waitlist (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text NOT NULL,
  sector      text,
  source      text DEFAULT 'fairworkhelp.app',
  created_at  timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC);

-- Row Level Security: service role can do everything, public cannot read
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Only the service role (server-side) can insert
CREATE POLICY "service_role_insert" ON waitlist
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only the service role can select (no public leakage)
CREATE POLICY "service_role_select" ON waitlist
  FOR SELECT
  TO service_role
  USING (true);

-- Confirm
SELECT 'waitlist table created successfully' AS status;
