-- Shifts table — stores individual shift records for penalty rate calculations
CREATE TABLE IF NOT EXISTS shifts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  break_minutes integer DEFAULT 0,
  shift_type text CHECK (shift_type IN ('ordinary','saturday','sunday','public_holiday','night')) DEFAULT 'ordinary',
  award_rate_applied numeric(10,4),
  base_hourly_rate numeric(10,2),
  calculated_pay numeric(10,2),
  employer text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shifts" ON shifts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shifts" ON shifts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shifts" ON shifts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shifts" ON shifts
  FOR DELETE USING (auth.uid() = user_id);
