import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { translateSection } from "@/lib/awards/translate-section";

interface TranslateBody {
  awardId?: string;
  sectionKey?: string;
  languageCode?: string;
  sectionTitle?: string;
  sectionHtml?: string;
  awardName?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as TranslateBody;
  const { awardId, sectionKey, languageCode, sectionTitle, sectionHtml, awardName } = body;

  if (!awardId || !sectionKey || !languageCode || !sectionHtml || !awardName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Identify user (authenticated or anonymous via a client-provided identifier)
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userIdentifier =
    user?.id ?? request.headers.get("x-anonymous-id") ?? "anonymous";

  // Rate limiting via service client
  const service = getServiceClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: rateRecord } = await service
    .from("translation_requests")
    .select("request_count, window_start")
    .eq("user_identifier", userIdentifier)
    .single();

  if (rateRecord) {
    const record = rateRecord as { request_count: number; window_start: string };
    const windowExpired = record.window_start < oneHourAgo;
    if (windowExpired) {
      await service
        .from("translation_requests")
        .update({
          request_count: 1,
          window_start: new Date().toISOString(),
        })
        .eq("user_identifier", userIdentifier);
    } else if (record.request_count >= 10) {
      return NextResponse.json(
        { error: "Rate limit exceeded — 10 translations per hour" },
        { status: 429 }
      );
    } else {
      await service
        .from("translation_requests")
        .update({ request_count: record.request_count + 1 })
        .eq("user_identifier", userIdentifier);
    }
  } else {
    await service.from("translation_requests").insert({
      user_identifier: userIdentifier,
      request_count: 1,
      window_start: new Date().toISOString(),
    });
  }

  try {
    const translatedHtml = await translateSection({
      awardId,
      sectionKey,
      sectionTitle: sectionTitle ?? sectionKey,
      sectionHtml,
      languageCode,
      awardName,
    });

    return NextResponse.json({ translatedHtml });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
