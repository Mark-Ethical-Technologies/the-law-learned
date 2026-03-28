export interface AwardSection {
  sectionKey: string;
  sectionTitle: string;
  html: string;
}

function slugifySection(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `section-${index + 1}-${base || "section"}`;
}

export function parseAwardSections(sanitisedHtml: string): AwardSection[] {
  const sections: AwardSection[] = [];
  const headingPattern = /<(h[23])[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<h[23]|$)/gi;
  let match: RegExpExecArray | null;
  let idx = 0;
  const seen = new Set<string>();

  while ((match = headingPattern.exec(sanitisedHtml)) !== null) {
    const rawTitle = match[2].replace(/<[^>]+>/g, "").trim();
    const sectionContent = match[3].trim();
    if (rawTitle && sectionContent.length > 10) {
      let sectionKey = slugifySection(rawTitle, idx);
      if (seen.has(sectionKey)) sectionKey = `${sectionKey}-${idx}`;
      seen.add(sectionKey);
      sections.push({
        sectionKey,
        sectionTitle: rawTitle,
        html: `<${match[1]}>${match[2]}</${match[1]}>${sectionContent}`,
      });
      idx++;
    }
  }

  if (sections.length === 0) {
    sections.push({
      sectionKey: "section-1-full-award",
      sectionTitle: "Full Award Text",
      html: sanitisedHtml,
    });
  }

  return sections;
}
