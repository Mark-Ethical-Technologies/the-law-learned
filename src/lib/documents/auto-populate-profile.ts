import { createServiceClient } from "@/lib/supabase/service";
import type { PayslipExtractedData } from "./types";

/**
 * Auto-populate profile fields from payslip extraction.
 * Rules:
 * - Only fills EMPTY fields (never overwrites existing data)
 * - Only uses confidence=high or confidence=medium extractions
 * - Returns true if any field was updated
 */
export async function autoPopulateProfile(
  userId: string,
  data: PayslipExtractedData
): Promise<boolean> {
  if (!data.confidence || data.confidence === "low") return false;

  const supabase = createServiceClient();

  // Fetch current profile
  const { data: profile, error: fetchErr } = await supabase
    .from("profiles")
    .select("employer, employer_name, employer_abn, classification_level, award_identified, industry")
    .eq("id", userId)
    .single();

  if (fetchErr || !profile) return false;

  const updates: Record<string, string | boolean | number> = {};

  // Map payslip fields → profile columns (only if currently empty)
  if (!profile.employer_name && data.employer_name) {
    updates.employer_name = data.employer_name;
    // Also fill the legacy `employer` field if empty
    if (!profile.employer) updates.employer = data.employer_name;
  }
  if (!profile.employer_abn && data.employer_abn) {
    updates.employer_abn = data.employer_abn;
  }
  if (!profile.classification_level && data.classification_level) {
    updates.classification_level = data.classification_level;
  }
  if (!profile.award_identified && data.award_identified) {
    updates.award_identified = data.award_identified;
    if (!profile.industry) updates.industry = data.award_identified;
  }

  // Always increment document counter and flag
  updates.profile_completed_from_document = true;

  if (Object.keys(updates).length === 0) return false;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  return !error;
}

/**
 * Increment the documents_uploaded counter atomically.
 */
export async function incrementDocumentCount(userId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.rpc("increment_documents_uploaded", { user_id_input: userId });
}
