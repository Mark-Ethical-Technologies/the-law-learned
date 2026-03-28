CREATE TABLE IF NOT EXISTS matter_requests (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  employer      text,
  summary       text,
  payment_link  text,
  status        text DEFAULT 'pending_payment' NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE matter_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_insert" ON matter_requests
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "service_role_select" ON matter_requests
  FOR SELECT TO service_role USING (true);

CREATE POLICY "service_role_update" ON matter_requests
  FOR UPDATE TO service_role USING (true);
