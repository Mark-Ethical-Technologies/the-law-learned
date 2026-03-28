import Anthropic from "@anthropic-ai/sdk";
import { getServiceClient } from "@/lib/supabase/service";

const LANGUAGE_NAMES: Record<string, string> = {
  zh: "Mandarin Chinese",
  vi: "Vietnamese",
  ar: "Arabic",
  hi: "Hindi",
  tl: "Tagalog",
  es: "Spanish",
  ko: "Korean",
  pa: "Punjabi",
  el: "Greek",
  it: "Italian",
  pt: "Portuguese",
};

let _anthropic: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

export interface TranslateOptions {
  awardId: string;
  sectionKey: string;
  sectionTitle: string;
  sectionHtml: string;
  languageCode: string;
  awardName: string;
}

export async function translateSection(opts: TranslateOptions): Promise<string> {
  const { awardId, sectionKey, sectionTitle, sectionHtml, languageCode, awardName } = opts;
  const supabase = getServiceClient();
  const languageName = LANGUAGE_NAMES[languageCode] ?? languageCode;

  // Check cache — also verify award hasn't changed since translation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cached } = await (supabase as any)
    .from("award_translations")
    .select("translated_html, translated_at")
    .eq("award_id", awardId)
    .eq("section_key", sectionKey)
    .eq("language_code", languageCode)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cachedRow = cached as any;
  if (cachedRow) {
    // Check if award has changed since this translation was made
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: award } = await (supabase as any)
      .from("modern_awards")
      .select("last_changed_at")
      .eq("award_id", awardId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const awardRow = award as any;
    const awardChanged =
      awardRow?.last_changed_at
        ? new Date(awardRow.last_changed_at as string) >
          new Date(cachedRow.translated_at as string)
        : false;

    if (!awardChanged) {
      return cachedRow.translated_html as string;
    }
  }

  // Build translation prompt
  const systemPrompt = `You are a legal document translator for the Fair Work Commission of Australia. Your role is to translate sections of Modern Award documents into ${languageName} for Australian workers who may not be fluent in English.

Rules you must follow:
1. Translate ONLY the prose text. Do not translate: clause numbers (e.g. "3.1", "14.2"), defined terms that are capitalised (e.g. "Award", "Employee", "Employer", "NES"), or cross-references to other clauses or legislation.
2. Preserve all HTML tags exactly — translate only the text content within them.
3. Accuracy is more important than naturalness. This is a legal document.
4. Before your translation, output this disclaimer block (translate the disclaimer itself into ${languageName} as well, but keep the English version first):

<div class="beta-disclaimer">
<strong>⚠ BETA AI TRANSLATION</strong> — This translation is provided for general understanding only. The English text is the legally binding version. Always verify important content with a qualified interpreter before relying on it. fairworkhelp.app is a legal education platform, not a law firm.
<br><br>
<strong>⚠ BETA AI TRANSLATION (${languageName})</strong> — [Translate the above disclaimer into ${languageName}]
</div>

5. Output only valid HTML. Do not include markdown, code fences, or explanatory text outside the HTML.`;

  const userMessage = `This is section "${sectionTitle}" from the ${awardName} under Australian workplace law.

Please translate the following HTML section into ${languageName}:

${sectionHtml}`;

  const response = await getAnthropicClient().messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Anthropic");
  }

  const translatedHtml = content.text;

  // Store in cache
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("award_translations").upsert(
    {
      award_id: awardId,
      section_key: sectionKey,
      language_code: languageCode,
      translated_html: translatedHtml,
      model_used: "claude-opus-4-6",
      translated_at: new Date().toISOString(),
    },
    { onConflict: "award_id,section_key,language_code" }
  );

  return translatedHtml;
}
