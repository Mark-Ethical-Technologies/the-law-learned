import Anthropic from "@anthropic-ai/sdk";
import type { PayslipExtractedData, RosterExtractedData } from "./types";

// Lazy Anthropic factory — never instantiated at module level
function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Fields that must NEVER be stored — scrub before returning
const PII_KEYS: Array<keyof PayslipExtractedData> = [];
const PII_STRING_PATTERNS = [
  /\b\d{3}\s?\d{3}\s?\d{3}\b/g,  // TFN: 9 digits
  /\bBSB\s*\d{3}[\s-]\d{3}\b/gi,  // BSB
  /\b\d{6,9}\b/g,                  // Account numbers (broad fallback)
];

export function scrubPII(text: string): string {
  let out = text;
  for (const pattern of PII_STRING_PATTERNS) {
    out = out.replace(pattern, "[REDACTED]");
  }
  return out;
}

/**
 * Scrub PII from extracted data object.
 * Removes employee_name, tfn, bank_account, bsb from any nested level.
 */
export function scrubExtractedData<T>(data: T): T {
  const PII_FIELD_NAMES = new Set([
    "employee_name", "worker_name", "name", "full_name",
    "tfn", "tax_file_number",
    "bank_account", "account_number", "bsb",
    "address", "phone", "email",
  ]);

  function scrubObj(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "string") return scrubPII(obj);
    if (Array.isArray(obj)) return obj.map(scrubObj);
    if (typeof obj === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
        if (PII_FIELD_NAMES.has(key.toLowerCase())) continue;
        result[key] = scrubObj(val);
      }
      return result;
    }
    return obj;
  }

  return scrubObj(data as unknown) as T;
}

const PAYSLIP_PROMPT = `You are extracting structured data from an Australian payslip image.
Return ONLY valid JSON matching this schema — no markdown, no explanation:
{
  "employer_name": string | null,
  "employer_abn": string | null,
  "pay_period_start": "YYYY-MM-DD" | null,
  "pay_period_end": "YYYY-MM-DD" | null,
  "pay_date": "YYYY-MM-DD" | null,
  "classification_level": string | null,
  "award_identified": string | null,
  "employment_type": "full-time" | "part-time" | "casual" | null,
  "hours_worked": number | null,
  "hours_paid": number | null,
  "hourly_rate": number | null,
  "gross_pay": number | null,
  "ordinary_hours": number | null,
  "overtime_hours": number | null,
  "penalty_hours": number | null,
  "allowances": [{ "type": string, "amount": number }],
  "deductions": [{ "type": string, "amount": number }],
  "confidence": "high" | "medium" | "low",
  "notes": string | null
}
CRITICAL: Do NOT include employee name, TFN, bank account, BSB, address, or phone number.
Only include employer details and pay figures.`;

const ROSTER_PROMPT = `You are extracting structured shift data from an Australian work roster image.
Return ONLY valid JSON matching this schema — no markdown, no explanation:
{
  "employer_name": string | null,
  "roster_period_start": "YYYY-MM-DD" | null,
  "roster_period_end": "YYYY-MM-DD" | null,
  "shifts": [
    {
      "shift_date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "break_minutes": number | null,
      "shift_type": "ordinary" | "overtime" | "public-holiday" | "saturday" | "sunday" | null,
      "notes": string | null
    }
  ],
  "confidence": "high" | "medium" | "low",
  "notes": string | null
}
CRITICAL: Do NOT include employee names, TFN, bank details, or any personal information.`;

export async function extractPayslip(
  imageBase64: string,
  mimeType: string
): Promise<PayslipExtractedData> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text", text: PAYSLIP_PROMPT },
        ],
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const parsed = JSON.parse(text) as PayslipExtractedData;
  return scrubExtractedData(parsed) as PayslipExtractedData;
}

export async function extractRoster(
  imageBase64: string,
  mimeType: string
): Promise<RosterExtractedData> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text", text: ROSTER_PROMPT },
        ],
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const parsed = JSON.parse(text) as RosterExtractedData;
  return scrubExtractedData(parsed) as RosterExtractedData;
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Use require to load CJS module and avoid ESM compat issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return scrubPII(result.text);
}
