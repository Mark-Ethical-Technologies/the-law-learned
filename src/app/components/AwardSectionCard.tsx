"use client";

import { useState, useId } from "react";

interface Props {
  sectionKey: string;
  sectionTitle: string;
  englishHtml: string;
  awardId: string;
  awardName: string;
  selectedLanguage: string | null;
  languageName: string;
}

interface TranslateResponse {
  translatedHtml?: string;
  error?: string;
}

export function AwardSectionCard({
  sectionKey,
  sectionTitle,
  englishHtml,
  awardId,
  awardName,
  selectedLanguage,
  languageName,
}: Props) {
  const [translatedHtml, setTranslatedHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardId = useId();

  async function handleTranslate() {
    if (!selectedLanguage || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/awards/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awardId,
          sectionKey,
          sectionTitle,
          sectionHtml: englishHtml,
          languageCode: selectedLanguage,
          awardName,
        }),
      });

      const data = (await res.json()) as TranslateResponse;
      if (!res.ok || data.error) {
        setError(data.error ?? "Translation failed. Please try again.");
      } else if (data.translatedHtml) {
        setTranslatedHtml(data.translatedHtml);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="award-section-card mb-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white print:rounded-none print:border print:border-gray-300 print:mb-8">
      {/* Section header */}
      <div className="bg-[#1B3A5C] px-5 py-3 flex items-center justify-between print:bg-gray-100">
        <h2 className="text-white font-bold text-sm print:text-gray-900">
          {sectionTitle}
        </h2>
        {selectedLanguage && !translatedHtml && !loading && (
          <button
            onClick={handleTranslate}
            className="text-[#C9A84C] hover:text-white text-xs font-semibold transition-colors print:hidden"
          >
            Translate → {languageName}
          </button>
        )}
      </div>

      {/* Content columns */}
      <div
        className={`grid ${translatedHtml ? "md:grid-cols-2" : "grid-cols-1"} divide-x divide-gray-100`}
      >
        {/* English column */}
        <div className="p-5 award-text">
          <div className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wide mb-3">
            English (official)
          </div>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: englishHtml }}
            id={`${cardId}-en`}
          />
        </div>

        {/* Translation column */}
        {selectedLanguage && (
          <div className="p-5">
            <div className="text-xs font-semibold text-[#C9A84C] uppercase tracking-wide mb-3">
              {languageName}
            </div>

            {loading && (
              <div className="space-y-3 animate-pulse">
                {[80, 60, 90, 70, 50].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 bg-gray-100 rounded"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm">
                {error}
                <button
                  onClick={handleTranslate}
                  className="ml-2 underline text-[#C9A84C]"
                >
                  Retry
                </button>
              </div>
            )}

            {translatedHtml && (
              <div
                className="prose prose-sm max-w-none text-gray-700 translated-content"
                dangerouslySetInnerHTML={{ __html: translatedHtml }}
                id={`${cardId}-translated`}
              />
            )}

            {!loading && !translatedHtml && !error && (
              <div className="text-center py-8">
                <button
                  onClick={handleTranslate}
                  className="bg-[#C9A84C] hover:bg-[#d4b860] text-[#1B3A5C] font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Translate this section
                </button>
                <p className="text-gray-400 text-xs mt-2">
                  AI translation · beta
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
