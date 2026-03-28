export interface AwardListItem {
  awardId: string;
  awardName: string;
  fwcUrl: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function fetchAwardsList(): Promise<AwardListItem[]> {
  const BASE = "https://www.fwc.gov.au";
  const LIST_URL = `${BASE}/agreements-awards/awards/modern-awards/modern-awards-list`;

  const res = await fetch(LIST_URL, {
    headers: { "User-Agent": "fairworkhelp.app/1.0 (+https://fairworkhelp.app)" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch FWC awards list: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // Parse award links from the HTML
  // FWC uses anchor tags with href containing /agreements-awards/awards/modern-awards/...
  const linkPattern = /href="(\/agreements-awards\/awards\/modern-awards\/[^"]+)"[^>]*>([^<]+)</g;
  const awards: AwardListItem[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null) {
    const path = match[1];
    const rawName = match[2]
      .trim()
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'");

    // Skip non-award detail pages (list page itself, etc.)
    if (
      !path.includes("modern-award") ||
      path === "/agreements-awards/awards/modern-awards/modern-awards-list" ||
      rawName.length < 5
    )
      continue;

    const fwcUrl = `${BASE}${path}`;
    const awardId = slugify(rawName);

    if (!seen.has(awardId) && awardId.length > 0) {
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
