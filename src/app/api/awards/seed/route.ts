/**
 * One-time bootstrap endpoint: fetches a single award by MA code from FWC
 * and stores it in the database. Used when the cron hasn't populated an award yet.
 *
 * GET /api/awards/seed?id=MA000016
 *
 * Auth: requires CRON_SECRET bearer token (same as the cron route).
 * Safe to call multiple times — uses upsert.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { fetchAwardsList } from "@/lib/awards/fetch-awards-list";
import { fetchAwardContent } from "@/lib/awards/fetch-award-content";

export const maxDuration = 60;

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Auth check
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || !authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const awardId = request.nextUrl.searchParams.get("id");
  if (!awardId) {
    return NextResponse.json({ error: "?id=MA000001 required" }, { status: 400 });
  }

  try {
    const list = await fetchAwardsList();
    const meta = list.find((a) => a.awardId === awardId);
    if (!meta) {
      return NextResponse.json({ error: `Award ${awardId} not found on FWC` }, { status: 404 });
    }

    const content = await fetchAwardContent(meta.fwcUrl);
    const service = createServiceClient();
    const now = new Date().toISOString();

    await service.from("modern_awards").upsert(
      {
        award_id: meta.awardId,
        award_name: meta.awardName,
        fwc_url: meta.fwcUrl,
        content_hash: content.contentHash,
        raw_html: content.rawHtml,
        html_length: content.htmlLength,
        last_checked_at: now,
        last_changed_at: now,
      },
      { onConflict: "award_id" }
    );

    return NextResponse.json({
      ok: true,
      award_id: meta.awardId,
      award_name: meta.awardName,
      html_length: content.htmlLength,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
