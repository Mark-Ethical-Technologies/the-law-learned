-- Add actual_pay_received column to shifts table.
-- Users enter the dollar amount they were actually paid for the shift.
-- The calculated_pay and award_rate_applied columns remain for future use
-- but are NOT populated by the application — rate intelligence lives in the AI layer.
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS actual_pay_received numeric(10,2);
