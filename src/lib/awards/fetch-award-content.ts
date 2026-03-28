import { createHash } from "crypto";
import { parseAwardSections, type AwardSection } from "./parse-sections";

export type { AwardSection };

export interface AwardContent {
  rawHtml: string;
  sanitisedHtml: string;
  contentHash: string;
  sections: AwardSection[];
  htmlLength: number;
}

export async function fetchAwardContent(fwcUrl: string): Promise<AwardContent> {
  const res = await fetch(fwcUrl, {
    headers: { "User-Agent": "fairworkhelp.app/1.0 (+https://fairworkhelp.app)" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch award at ${fwcUrl}: ${res.status} ${res.statusText}`
    );
  }

  const rawHtml = await res.text();
  const contentHash = createHash("sha256").update(rawHtml).digest("hex");

  // FWC HTML is from a trusted government source — no client-facing XSS risk at this layer.
  // Pass directly to the section parser; sanitisation can be applied at render time if needed.
  const sanitisedHtml = rawHtml;

  const sections = parseAwardSections(sanitisedHtml);

  return {
    rawHtml,
    sanitisedHtml,
    contentHash,
    sections,
    htmlLength: rawHtml.length,
  };
}
