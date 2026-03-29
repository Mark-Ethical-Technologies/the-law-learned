import { createServiceClient } from "@/lib/supabase/service";
import type { RosterExtractedData, RosterShift } from "./types";

interface ShiftRow {
  user_id: string;
  document_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_minutes: number | null;
  shift_type: string | null;
  notes: string | null;
  source: "document";
  employer: string | null;
}

/**
 * Bulk-insert roster shifts extracted from a document.
 * Returns the number of rows inserted.
 */
export async function insertRosterShifts(
  userId: string,
  documentId: string,
  data: RosterExtractedData
): Promise<number> {
  if (!data.shifts || data.shifts.length === 0) return 0;

  const supabase = createServiceClient();

  const rows: ShiftRow[] = data.shifts.map((shift: RosterShift) => ({
    user_id: userId,
    document_id: documentId,
    shift_date: shift.shift_date,
    start_time: shift.start_time,
    end_time: shift.end_time,
    break_minutes: shift.break_minutes ?? null,
    shift_type: shift.shift_type ?? null,
    notes: shift.notes ?? null,
    source: "document",
    employer: data.employer_name ?? null,
  }));

  const { data: inserted, error } = await supabase
    .from("shifts")
    .insert(rows)
    .select("id");

  if (error) {
    console.error("[insert-shifts] Error inserting shifts:", error.message);
    return 0;
  }

  return inserted?.length ?? 0;
}

/**
 * Insert payslip-derived shifts (single shift period from a payslip).
 */
export async function insertPayslipShift(
  userId: string,
  documentId: string,
  data: {
    shift_date: string;
    hours_worked: number | null;
    hours_paid: number | null;
    hourly_rate: number | null;
    gross_pay: number | null;
    employer: string | null;
  }
): Promise<boolean> {
  if (!data.shift_date) return false;

  const supabase = createServiceClient();

  const { error } = await supabase.from("shifts").insert({
    user_id: userId,
    document_id: documentId,
    shift_date: data.shift_date,
    start_time: "00:00",
    end_time: "00:00",
    hours_worked: data.hours_worked,
    hours_paid: data.hours_paid,
    hourly_rate: data.hourly_rate,
    gross_pay: data.gross_pay,
    source: "document",
    employer: data.employer,
    notes: "Imported from payslip",
  });

  return !error;
}
