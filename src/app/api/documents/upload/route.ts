import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extractPayslip, extractRoster, extractPdfText } from "@/lib/documents/extract-document";
import { autoPopulateProfile, incrementDocumentCount } from "@/lib/documents/auto-populate-profile";
import { insertRosterShifts, insertPayslipShift } from "@/lib/documents/insert-shifts";
import type { UploadResult, PayslipExtractedData, RosterExtractedData } from "@/lib/documents/types";

export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB hard limit
const TARGET_SIZE = 4 * 1024 * 1024;    // 4 MB target for Vision
const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "image/heic", "image/heif",
  "application/pdf",
]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const documentType = (formData.get("document_type") as string) || "payslip";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!["payslip", "roster", "other"].includes(documentType)) {
    return NextResponse.json({ error: "Invalid document_type" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  let mimeType = file.type || "application/octet-stream";

  // Sanitise filename (no path traversal)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  const storagePath = `${user.id}/${Date.now()}-${safeName}`;

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer as ArrayBuffer);

  // HEIC → JPEG conversion
  if (mimeType === "image/heic" || mimeType === "image/heif") {
    try {
      const sharp = (await import("sharp")).default;
      buffer = Buffer.from(await sharp(buffer).jpeg({ quality: 85 }).toBuffer()) as Buffer<ArrayBuffer>;
      mimeType = "image/jpeg";
    } catch (e) {
      console.error("[upload] HEIC conversion failed:", e);
      return NextResponse.json({ error: "Could not process HEIC image" }, { status: 422 });
    }
  }

  // Resize large images before Vision API
  if (mimeType.startsWith("image/") && buffer.length > TARGET_SIZE) {
    try {
      const sharp = (await import("sharp")).default;
      buffer = Buffer.from(
        await sharp(buffer)
          .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer()
      ) as Buffer<ArrayBuffer>;
      mimeType = "image/jpeg";
    } catch (e) {
      console.error("[upload] Image resize failed:", e);
      // Non-fatal — proceed with original
    }
  }

  // Upload to Supabase Storage (service client to bypass RLS on upload)
  const service = createServiceClient();
  const { error: storageErr } = await service.storage
    .from("user-documents")
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (storageErr) {
    console.error("[upload] Storage error:", storageErr.message);
    return NextResponse.json(
      { error: "Could not store file. Please try again." },
      { status: 500 }
    );
  }

  // --- Synchronous extraction (must complete before response) ---
  let extractedData: PayslipExtractedData | RosterExtractedData | null = null;
  let extractionOk = false;
  let extractionError: string | null = null;

  if (documentType !== "other") {
    try {
      if (mimeType === "application/pdf") {
        // PDF: text extraction → treat as payslip text prompt
        const text = await extractPdfText(buffer);
        // Re-use Vision pathway with a text-only prompt by passing the text as image description
        // For PDF we'll do a simplified text-based extraction
        extractedData = await extractFromPdfText(text, documentType as "payslip" | "roster");
      } else if (mimeType.startsWith("image/")) {
        const base64 = buffer.toString("base64");
        if (documentType === "payslip") {
          extractedData = await extractPayslip(base64, mimeType);
        } else {
          extractedData = await extractRoster(base64, mimeType);
        }
      }
      extractionOk = true;
    } catch (e) {
      console.error("[upload] Extraction error:", e);
      extractionError = e instanceof Error ? e.message : "Extraction failed";
    }
  }

  // Insert document record
  const { data: docRecord, error: dbErr } = await service
    .from("uploaded_documents")
    .insert({
      user_id: user.id,
      document_type: documentType,
      storage_path: storagePath,
      file_name: safeName,
      mime_type: mimeType,
      file_size_kb: Math.round(buffer.length / 1024),
      extracted_data: extractedData,
      extraction_ok: extractionOk,
      error_message: extractionError,
    })
    .select("id")
    .single();

  if (dbErr || !docRecord) {
    console.error("[upload] DB insert error:", dbErr?.message);
    return NextResponse.json({ error: "Could not save document record" }, { status: 500 });
  }

  const documentId = docRecord.id as string;
  let profileUpdated = false;
  let shiftsInserted = 0;

  // Auto-populate profile from payslip
  if (extractionOk && extractedData && documentType === "payslip") {
    profileUpdated = await autoPopulateProfile(user.id, extractedData as PayslipExtractedData);
  }

  // Insert roster shifts
  if (extractionOk && extractedData && documentType === "roster") {
    shiftsInserted = await insertRosterShifts(user.id, documentId, extractedData as RosterExtractedData);
  }

  // Insert payslip as a shift record
  if (extractionOk && extractedData && documentType === "payslip") {
    const ps = extractedData as PayslipExtractedData;
    if (ps.pay_period_end) {
      await insertPayslipShift(user.id, documentId, {
        shift_date: ps.pay_period_end,
        hours_worked: ps.hours_worked ?? null,
        hours_paid: ps.hours_paid ?? null,
        hourly_rate: ps.hourly_rate ?? null,
        gross_pay: ps.gross_pay ?? null,
        employer: ps.employer_name ?? null,
      });
      shiftsInserted = 1;
    }
  }

  // Increment document count
  await incrementDocumentCount(user.id);

  const result: UploadResult = {
    document_id: documentId,
    storage_path: storagePath,
    document_type: documentType as "payslip" | "roster" | "other",
    extraction_ok: extractionOk,
    extracted_data: extractedData ?? undefined,
    profile_updated: profileUpdated,
    shifts_inserted: shiftsInserted,
    error: extractionError ?? undefined,
  };

  return NextResponse.json(result, { status: 201 });
}

/**
 * Fallback text-based extraction for PDFs using a text prompt to Claude.
 */
async function extractFromPdfText(
  text: string,
  docType: "payslip" | "roster"
): Promise<PayslipExtractedData | RosterExtractedData> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = docType === "payslip"
    ? `Extract payslip data from this text. Return ONLY valid JSON with fields: employer_name, employer_abn, pay_period_start, pay_period_end, pay_date, classification_level, award_identified, employment_type, hours_worked, hours_paid, hourly_rate, gross_pay, ordinary_hours, overtime_hours, penalty_hours, allowances (array), deductions (array), confidence, notes. Do NOT include employee name, TFN, bank details.\n\nText:\n${text.slice(0, 6000)}`
    : `Extract roster shifts from this text. Return ONLY valid JSON with fields: employer_name, roster_period_start, roster_period_end, shifts (array of {shift_date, start_time, end_time, break_minutes, shift_type, notes}), confidence, notes. Do NOT include employee names.\n\nText:\n${text.slice(0, 6000)}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  return JSON.parse(raw);
}
