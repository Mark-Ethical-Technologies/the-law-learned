export interface AwardListItem {
  awardId: string;
  awardName: string;
  fwcUrl: string;
}

export async function fetchAwardsList(): Promise<AwardListItem[]> {
  // FWC restructured their site in 2026. New list URL:
  const LIST_URL =
    "https://www.fwc.gov.au/search/awards/modern-awards-list";
  // Individual award documents now live on dms.fwc.gov.au:
  const DMS_BASE = "https://dms.fwc.gov.au";

  const res = await fetch(LIST_URL, {
    headers: { "User-Agent": "fairworkhelp.app/1.0 (+https://fairworkhelp.app)" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch FWC awards list: ${res.status} ${res.statusText}`
    );
  }

  const html = await res.text();

  // New structure: href="/document-view/awards/modern/MA000001">Award Name [MA000001]</a>
  // The MA number in the href is the canonical award ID.
  const linkPattern =
    /href="(\/document-view\/awards\/modern\/(MA\d+))"[^>]*>([^<]+)</g;

  const awards: AwardListItem[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null) {
    const path = match[1];
    const maCode = match[2]; // e.g. "MA000009"
    const rawName = match[3]
      .trim()
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'")
      // Strip trailing [MAxxxxxx] label FWC appends to the link text
      .replace(/\s*\[MA\d+\]\s*$/, "")
      .trim();

    if (rawName.length < 5) continue;

    const fwcUrl = `${DMS_BASE}${path}`;
    const awardId = maCode; // Use the stable MA code as the award ID

    if (!seen.has(awardId)) {
      seen.add(awardId);
      awards.push({ awardId, awardName: rawName, fwcUrl });
    }
  }

  if (awards.length === 0) {
    throw new Error(
      "Parsed zero awards from FWC list page — page structure may have changed"
    );
  }

  return awards;
}
