import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Languages — Fair Work Help | Fair Work Rights in Your Language",
  description: "Fair Work Help supports workers in every language. Know your pay rights in Bengali, Nepali, Hindi, Tamil, Tagalog, Vietnamese, Mandarin, Thai, Indonesian, Spanish, Japanese, Korean, Arabic and more.",
};

const ALL_LANGUAGES = [
  // South Asian — highest exploitation per FWC Migrant Workers Task Force
  { code: "bn", name: "বাংলা", english: "Bengali / Bangla", region: "Bangladesh, West Bengal", note: "Particularly high exploitation in cleaning, fast food, and convenience stores" },
  { code: "ne", name: "नेपाली", english: "Nepali", region: "Nepal", note: "Students and visa workers in hospitality, cleaning and fast food" },
  { code: "hi", name: "हिन्दी", english: "Hindi", region: "India", note: "Large community across all industries" },
  { code: "pa", name: "ਪੰਜਾਬੀ", english: "Punjabi", region: "India, Pakistan", note: "Truck drivers, agriculture, retail" },
  { code: "ur", name: "اردو", english: "Urdu", region: "Pakistan", note: "Retail, cleaning, driving" },
  { code: "ta", name: "தமிழ்", english: "Tamil", region: "Sri Lanka, India", note: "IT, cleaning, aged care" },
  { code: "si", name: "සිංහල", english: "Sinhala", region: "Sri Lanka", note: "Cleaning, driving, hospitality" },
  { code: "ml", name: "മലയാളം", english: "Malayalam", region: "Kerala, India", note: "Nurses, aged care, hospitality" },
  { code: "te", name: "తెలుగు", english: "Telugu", region: "Andhra Pradesh, India", note: "IT, retail, food service" },
  { code: "my", name: "မြန်မာ", english: "Burmese / Myanmar", region: "Myanmar", note: "Agriculture, cleaning, manufacturing" },

  // Southeast Asian
  { code: "tl", name: "Filipino", english: "Tagalog / Filipino", region: "Philippines", note: "Aged care, nursing, hospitality, cleaning" },
  { code: "th", name: "ภาษาไทย", english: "Thai", region: "Thailand", note: "Massage therapy, hospitality, cleaning — significant exploitation risk" },
  { code: "id", name: "Bahasa Indonesia", english: "Indonesian", region: "Indonesia", note: "Domestic workers, agriculture, hospitality" },
  { code: "vi", name: "Tiếng Việt", english: "Vietnamese", region: "Vietnam", note: "Retail, hospitality, nail/beauty, agriculture" },
  { code: "km", name: "ខ្មែរ", english: "Khmer / Cambodian", region: "Cambodia", note: "Agriculture, manufacturing" },
  { code: "ms", name: "Melayu", english: "Malay", region: "Malaysia", note: "Hospitality, retail, food service" },

  // East Asian
  { code: "zh", name: "普通话", english: "Mandarin (Simplified)", region: "China, Singapore", note: "Students in hospitality, retail, construction" },
  { code: "yue", name: "廣東話", english: "Cantonese", region: "Hong Kong, Guangdong", note: "Restaurants, hospitality, retail" },
  { code: "ko", name: "한국어", english: "Korean", region: "South Korea", note: "Restaurants, retail, working holiday visa workers" },
  { code: "ja", name: "日本語", english: "Japanese", region: "Japan", note: "Working holiday makers in hospitality and agriculture" },

  // Middle East / Central Asia
  { code: "ar", name: "العربية", english: "Arabic", region: "MENA region", note: "Taxi/ride-share, hospitality, retail" },
  { code: "fa", name: "فارسی", english: "Farsi / Persian", region: "Iran, Afghanistan", note: "Retail, hospitality, cleaning" },
  { code: "tr", name: "Türkçe", english: "Turkish", region: "Turkey", note: "Food service, retail" },

  // European / Pacific (working holiday and backpackers)
  { code: "es", name: "Español", english: "Spanish", region: "South/Central America, Spain", note: "Working holiday makers in agriculture and hospitality" },
  { code: "pt", name: "Português", english: "Portuguese", region: "Brazil, Portugal", note: "Construction, agriculture, hospitality" },
  { code: "fr", name: "Français", english: "French", region: "France, New Caledonia", note: "Working holiday, hospitality" },
  { code: "de", name: "Deutsch", english: "German", region: "Germany, Austria, Switzerland", note: "Working holiday makers — agriculture and tourism" },
  { code: "it", name: "Italiano", english: "Italian", region: "Italy", note: "Working holiday — hospitality and agriculture" },

  // Pacific
  { code: "fj", name: "Vosa Vakaviti", english: "Fijian", region: "Fiji", note: "Seasonal Worker Program — agriculture and meat processing" },
  { code: "to", name: "Lea Faka-Tonga", english: "Tongan", region: "Tonga", note: "Seasonal Worker Program — agriculture" },
  { code: "sm", name: "Gagana Samoa", english: "Samoan", region: "Samoa", note: "Seasonal Worker Program and RSMS visa workers" },
  { code: "haw", name: "ʻŌlelo Hawaiʻi", english: "Tok Pisin", region: "Papua New Guinea", note: "Agriculture and hospitality" },
];

const GROUPS = [
  { label: "South Asian", codes: ["bn", "ne", "hi", "pa", "ur", "ta", "si", "ml", "te", "my"] },
  { label: "Southeast Asian", codes: ["tl", "th", "id", "vi", "km", "ms"] },
  { label: "East Asian", codes: ["zh", "yue", "ko", "ja"] },
  { label: "Middle East & Central Asia", codes: ["ar", "fa", "tr"] },
  { label: "European & Backpackers", codes: ["es", "pt", "fr", "de", "it"] },
  { label: "Pacific Worker Programs", codes: ["fj", "to", "sm", "haw"] },
];

export default function LanguagesPage() {
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#1B3A5C] border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">FW</div>
            <span className="text-white font-bold text-lg">Fair Work Help</span>
          </a>
          <a href="/" className="text-white/60 hover:text-white text-sm">← Back to home</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#1B3A5C] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Your language. Your rights.
          </h1>
          <p className="text-white/60 text-xl mb-6 max-w-2xl mx-auto">
            Fair Work Help uses Claude AI, which understands and responds in every major world language. Tell your story in the language you think in — we'll handle the rest.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] text-sm px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse" />
            {ALL_LANGUAGES.length}+ languages supported · Powered by Claude API
          </div>
        </div>
      </section>

      {/* Language groups */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          {GROUPS.map((group) => {
            const langs = ALL_LANGUAGES.filter((l) => group.codes.includes(l.code));
            return (
              <div key={group.label}>
                <h2 className="text-xl font-bold text-[#1B3A5C] mb-6 pb-3 border-b border-gray-200">{group.label}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {langs.map((lang) => (
                    <div key={lang.code} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-2xl font-bold text-[#1B3A5C] leading-tight">{lang.name}</span>
                          <span className="block text-sm text-gray-500 mt-0.5">{lang.english}</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg ml-2 shrink-0">{lang.region}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{lang.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1B3A5C] py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Don't see your language?</h2>
          <p className="text-white/60 mb-6">Just start a conversation in your language. Claude AI understands and responds in hundreds of languages — if you can type it, we can help.</p>
          <a href="/" className="inline-block bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105">
            Check my pay — free →
          </a>
        </div>
      </section>

      {/* Footer note */}
      <div className="bg-[#0f2438] py-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-white/25 text-xs">Fair Work Help is a legal education platform, not a law firm. Not the Fair Work Ombudsman. <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="underline">fairwork.gov.au</a></p>
        </div>
      </div>
    </div>
  );
}
