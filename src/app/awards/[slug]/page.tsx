import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AwardDetailClient } from "./AwardDetailClient";
import { sanitizeAwardHtml } from "@/lib/awards/sanitize";
import { parseAwardSections } from "@/lib/awards/parse-sections";
import { fetchAwardContent } from "@/lib/awards/fetch-award-content";
import { fetchAwardsList } from "@/lib/awards/fetch-awards-list";
import type { Metadata } from "next";

interface AwardRow {
  award_id: string;
  award_name: string;
  fwc_url: string;
  raw_html: string | null;
  last_changed_at: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("modern_awards")
    .select("award_name")
    .eq("award_id", slug)
    .single();

  const awardName = (data as { award_name?: string } | null)?.award_name ?? "Modern Award";
  return {
    title: `${awardName} — Fair Work Help`,
    description: `Read the ${awardName} from the Fair Work Commission. AI-assisted translation available.`,
  };
}

export default async function AwardPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  let { data: awardData } = await supabase
    .from("modern_awards")
    .select("award_id, award_name, fwc_url, raw_html, last_changed_at")
    .eq("award_id", slug)
    .single();

  // On-demand fetch: if award not in DB yet, seed it from FWC and cache it
  if (!awardData) {
    try {
      const list = await fetchAwardsList();
      const meta = list.find((a) => a.awardId === slug);
      if (!meta) notFound();

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
      awardData = {
        award_id: meta.awardId,
        award_name: meta.awardName,
        fwc_url: meta.fwcUrl,
        raw_html: content.rawHtml,
        last_changed_at: now,
      };
    } catch {
      notFound();
    }
  }

  const award = awardData as AwardRow | null;
  if (!award) notFound();

  // Get profile language preference if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let defaultLanguage: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user.id)
      .single();
    const lang = (profile as { preferred_language?: string } | null)?.preferred_language;
    if (lang && lang !== "en") defaultLanguage = lang;
  }

  // Parse sections from stored HTML
  let sections: Array<{ sectionKey: string; sectionTitle: string; html: string }> = [];

  if (award.raw_html) {
    const sanitised = sanitizeAwardHtml(award.raw_html);
    sections = parseAwardSections(sanitised);
  } else {
    sections = [
      {
        sectionKey: "section-1-unavailable",
        sectionTitle: "Content Unavailable",
        html: "<p>This award content has not yet been synced. Please check back shortly.</p>",
      },
    ];
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Print header */}
      <div className="hidden print:block border-b border-gray-300 px-6 pb-4 mb-6">
        <p className="text-lg font-bold">
          Fair Work Commission — {award.award_name}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Sourced via fairworkhelp.app | Original text: fwc.gov.au
        </p>
      </div>

      {/* Nav */}
      <nav className="bg-[#1B3A5C] border-b border-white/10 px-6 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">
              FW
            </div>
            <span className="text-white font-bold">Fair Work Help</span>
          </a>
          <span className="text-white/20 mx-2">/</span>
          <a
            href="/awards"
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Awards
          </a>
          <span className="text-white/20 mx-2">/</span>
          <span className="text-white/80 text-sm truncate max-w-xs">
            {award.award_name}
          </span>
        </div>
      </nav>

      {/* Award title */}
      <div className="bg-white border-b border-gray-100 px-6 py-6 print:hidden">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1B3A5C]">
            {award.award_name}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Source: Fair Work Commission · fwc.gov.au
          </p>
        </div>
      </div>

      <AwardDetailClient
        awardId={award.award_id}
        awardName={award.award_name}
        fwcUrl={award.fwc_url}
        sections={sections}
        lastChangedAt={award.last_changed_at}
        defaultLanguage={defaultLanguage}
      />

      <style>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          body { font-family: Georgia, serif; font-size: 11pt; }
          nav, .print\\:hidden { display: none !important; }
          .award-section-card { break-inside: avoid; }
          .beta-disclaimer { border: 2px solid #C9A84C; padding: 12px; margin-bottom: 16px; }
          .award-text { width: 100%; }
          .translated-content { width: 100%; margin-top: 24pt; }
        }
      `}</style>
    </div>
  );
}
