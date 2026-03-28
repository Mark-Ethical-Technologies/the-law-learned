-- Add Stripe and payment columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS matter_pack_purchased boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS matter_pack_session_id text,
  ADD COLUMN IF NOT EXISTS matter_pack_purchased_at timestamptz;

-- Index for webhook lookups by email and customer ID
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON profiles(stripe_customer_id);

-- Sync email from auth.users into profiles on user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add user_id and stripe columns to matter_requests
ALTER TABLE matter_requests
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS amount_paid integer;

CREATE INDEX IF NOT EXISTS matter_requests_user_id_idx ON matter_requests(user_id);
CREATE INDEX IF NOT EXISTS matter_requests_stripe_session_idx ON matter_requests(stripe_session_id);
