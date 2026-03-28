import { createClient } from "@/lib/supabase/server";

interface ModernAward {
  award_id: string;
  award_name: string;
  last_changed_at: string | null;
}

export const metadata = {
  title: "Modern Awards Library — Fair Work Help",
  description:
    "Browse all Australian Modern Awards from the Fair Work Commission. Free access for all workers.",
};

export default async function AwardsPage() {
  const supabase = await createClient();
  const { data: awards } = await supabase
    .from("modern_awards")
    .select("award_id, award_name, last_changed_at")
    .order("award_name", { ascending: true });

  const awardList = (awards as ModernAward[] | null) ?? [];

  // Group by first letter
  const grouped: Record<string, ModernAward[]> = {};
  for (const award of awardList) {
    const letter = award.award_name[0]?.toUpperCase() ?? "#";
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(award);
  }
  const letters = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <nav className="bg-[#1B3A5C] border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">
              FW
            </div>
            <span className="text-white font-bold">Fair Work Help</span>
          </a>
          <span className="text-white/20 mx-2">/</span>
          <span className="text-white/70 text-sm">Modern Awards Library</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1B3A5C] mb-2">
            Modern Awards Library
          </h1>
          <p className="text-gray-500 text-sm max-w-2xl">
            All award text is sourced directly from the Fair Work Commission
            (fwc.gov.au) and updated automatically when changes are detected.
            fairworkhelp.app does not modify or interpret award content.
          </p>
        </div>

        {awardList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">⏳</div>
            <h2 className="text-[#1B3A5C] font-bold text-lg mb-2">
              Awards library is being built
            </h2>
            <p className="text-gray-500 text-sm">
              The awards are syncing from the Fair Work Commission. Check back
              shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-2">
              <span className="text-gray-400 text-sm">🔍</span>
              <span className="text-gray-400 text-sm">
                {awardList.length} Modern Awards — use Ctrl+F to search
              </span>
            </div>

            {letters.map((letter) => (
              <div key={letter} className="mb-6">
                <div className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-2 pl-1">
                  {letter}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {grouped[letter].map((award) => (
                    <a
                      key={award.award_id}
                      href={`/awards/${award.award_id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8F5EE] transition-colors group"
                    >
                      <span className="text-[#1B3A5C] font-medium text-sm group-hover:underline">
                        {award.award_name}
                      </span>
                      <span className="text-gray-300 text-sm">→</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
