"use client";

import { useState, useEffect } from "react";
import { AwardSectionCard } from "@/app/components/AwardSectionCard";

const LANGUAGES: Record<string, string> = {
  bn: "বাংলা (Bengali)",
  ne: "नेपाली (Nepali)",
  zh: "Mandarin",
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

interface AwardSection {
  sectionKey: string;
  sectionTitle: string;
  html: string;
}

interface Props {
  awardId: string;
  awardName: string;
  fwcUrl: string;
  sections: AwardSection[];
  lastChangedAt: string | null;
  defaultLanguage?: string;
}

export function AwardDetailClient({
  awardId,
  awardName,
  fwcUrl,
  sections,
  lastChangedAt,
  defaultLanguage,
}: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    defaultLanguage ?? null
  );

  useEffect(() => {
    // Persist anonymous selection to localStorage
    if (selectedLanguage) {
      localStorage.setItem("fw_preferred_language", selectedLanguage);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    // Restore from localStorage on mount if no default
    if (!defaultLanguage) {
      const stored = localStorage.getItem("fw_preferred_language");
      if (stored && LANGUAGES[stored]) setSelectedLanguage(stored);
    }
  }, [defaultLanguage]);

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      {/* Controls bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">View in:</span>
            <select
              value={selectedLanguage ?? ""}
              onChange={(e) =>
                setSelectedLanguage(e.target.value || null)
              }
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] bg-white"
            >
              <option value="">English only</option>
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {lastChangedAt && (
              <span className="text-xs text-gray-400">
                Updated{" "}
                {new Date(lastChangedAt).toLocaleDateString("en-AU")}
              </span>
            )}
            <a
              href={fwcUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1B3A5C] hover:underline font-medium"
            >
              View at FWC ↗
            </a>
            <button
              onClick={handlePrint}
              className="text-xs text-gray-500 hover:text-[#1B3A5C] font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#C9A84C] transition-colors"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Award sections */}
      <div className="max-w-5xl mx-auto px-6 py-8 print:px-0 print:py-4">
        {selectedLanguage && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 print:block">
            <strong>AI Translation Active</strong> — Translations are
            AI-generated and provided for general understanding only. The
            English text is the legally binding version. Always verify with a
            qualified interpreter before relying on translations.
          </div>
        )}

        {sections.map((section) => (
          <AwardSectionCard
            key={section.sectionKey}
            sectionKey={section.sectionKey}
            sectionTitle={section.sectionTitle}
            englishHtml={section.html}
            awardId={awardId}
            awardName={awardName}
            selectedLanguage={selectedLanguage}
            languageName={
              selectedLanguage
                ? (LANGUAGES[selectedLanguage] ?? selectedLanguage)
                : ""
            }
          />
        ))}
      </div>

      {/* Print footer */}
      <div className="hidden print:block border-t border-gray-300 px-6 pt-4 mt-8 text-xs text-gray-500">
        <p>
          Source: Fair Work Commission, fwc.gov.au · Sourced via
          fairworkhelp.app · Printed{" "}
          {new Date().toLocaleDateString("en-AU")}
        </p>
        <p className="mt-1">
          The English text is the legally binding version of this award.
        </p>
      </div>
    </div>
  );
}
