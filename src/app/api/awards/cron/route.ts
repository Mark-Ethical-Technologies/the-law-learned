import { NextRequest, NextResponse } from "next/server";
import { fetchAwardsList } from "@/lib/awards/fetch-awards-list";
import { fetchAwardContent } from "@/lib/awards/fetch-award-content";
import { getServiceClient } from "@/lib/supabase/service";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const supabase = getServiceClient();
  let checked = 0;
  let changed = 0;
  let errors = 0;
  const changedAwards: string[] = [];

  // Fetch award list from FWC
  let awards;
  try {
    awards = await fetchAwardsList();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to fetch awards list: ${msg}` },
      { status: 500 }
    );
  }

  // Process each award
  for (const award of awards) {
    try {
      const content = await fetchAwardContent(award.fwcUrl);
      checked++;

      // Get existing record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from("modern_awards")
        .select("content_hash")
        .eq("award_id", award.awardId)
        .single();

      const now = new Date().toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingHash = (existing as any)?.content_hash as string | undefined;
      const hasChanged = !existing || existingHash !== content.contentHash;

      if (hasChanged) {
        changed++;
        changedAwards.push(award.awardName);

        // Delete stale translations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("award_translations")
          .delete()
          .eq("award_id", award.awardId);
      }

      // Upsert award record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("modern_awards").upsert(
        {
          award_id: award.awardId,
          award_name: award.awardName,
          fwc_url: award.fwcUrl,
          content_hash: content.contentHash,
          raw_html: content.rawHtml,
          html_length: content.htmlLength,
          last_checked_at: now,
          ...(hasChanged ? { last_changed_at: now } : {}),
        },
        { onConflict: "award_id" }
      );
    } catch (err) {
      errors++;
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("award_fetch_errors").insert({
        award_id: award.awardId,
        fwc_url: award.fwcUrl,
        error_message: msg,
      });
    }
  }

  // Send email notification if awards changed
  if (
    changedAwards.length > 0 &&
    process.env.RESEND_API_KEY &&
    process.env.ADMIN_EMAIL
  ) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Fair Work Help <notifications@fairworkhelp.app>",
          to: [process.env.ADMIN_EMAIL],
          subject: `[fairworkhelp] ${changedAwards.length} award(s) changed`,
          html: `<h2>Modern Award Changes Detected</h2><p>${changedAwards.length} award(s) changed during the daily sync:</p><ul>${changedAwards.map((n) => `<li>${n}</li>`).join("")}</ul><p>Stale translations have been invalidated.</p>`,
        }),
      });
    } catch {
      // Non-fatal — email failure doesn't abort cron
    }
  }

  return NextResponse.json({ checked, changed, errors });
}
