import { createHash } from "crypto";
import DOMPurify from "isomorphic-dompurify";
import { parseAwardSections, type AwardSection } from "./parse-sections";

export type { AwardSection };

export interface AwardContent {
  rawHtml: string;
  sanitisedHtml: string;
  contentHash: string;
  sections: AwardSection[];
  htmlLength: number;
}

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "strong", "em", "b", "i", "u", "s",
  "span", "div", "section", "article",
  "a", "blockquote", "pre", "code",
];

const ALLOWED_ATTR = ["class", "id", "href", "title", "colspan", "rowspan"];

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

  const sanitisedHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORCE_BODY: true,
  });

  const sections = parseAwardSections(sanitisedHtml);

  return {
    rawHtml,
    sanitisedHtml,
    contentHash,
    sections,
    htmlLength: rawHtml.length,
  };
}
