export interface PayslipExtractedData {
  // Employer info (safe to store)
  employer_name?: string;
  employer_abn?: string;
  pay_period_start?: string;   // ISO date
  pay_period_end?: string;     // ISO date
  pay_date?: string;           // ISO date

  // Classification (safe to store)
  classification_level?: string;
  award_identified?: string;
  employment_type?: string;    // full-time | part-time | casual

  // Pay figures (safe — no PII)
  hours_worked?: number;
  hours_paid?: number;
  hourly_rate?: number;
  gross_pay?: number;
  ordinary_hours?: number;
  overtime_hours?: number;
  penalty_hours?: number;

  // Allowances (types only, no amounts containing PII)
  allowances?: Array<{ type: string; amount: number }>;

  // Deductions (types only, no TFN or bank info)
  deductions?: Array<{ type: string; amount: number }>;

  // Confidence
  confidence?: "high" | "medium" | "low";
  notes?: string;
}

export interface RosterShift {
  shift_date: string;          // ISO date YYYY-MM-DD
  start_time: string;          // HH:MM
  end_time: string;            // HH:MM
  break_minutes?: number;
  shift_type?: string;         // ordinary | overtime | public-holiday | saturday | sunday
  notes?: string;
}

export interface RosterExtractedData {
  employer_name?: string;
  roster_period_start?: string;
  roster_period_end?: string;
  shifts: RosterShift[];
  confidence?: "high" | "medium" | "low";
  notes?: string;
}

export interface UploadResult {
  document_id: string;
  storage_path: string;
  document_type: "payslip" | "roster" | "other";
  extraction_ok: boolean;
  extracted_data?: PayslipExtractedData | RosterExtractedData;
  profile_updated?: boolean;
  shifts_inserted?: number;
  error?: string;
}
