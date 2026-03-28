import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security Industry Award 2025 — Complete Guide | Fair Work Help",
  description: "Security Industry Award MA000016 explained simply. Pay rates Level 1–5, classification guide, penalty rates, overtime, and how to check if you're being underpaid. Better than the Fair Work Ombudsman PDF.",
  keywords: [
    "Security Industry Award", "Security Services Industry Award", "Security Industry Award PDF",
    "Security guard pay rates Australia 2025", "MA000016", "security guard underpaid",
    "security guard classification level", "security industry award level 1 2 3 4 5",
    "security guard overtime rates", "security guard penalty rates",
    "বাংলাদেশি নিরাপত্তা রক্ষী বেতন", "নেপালি সিকিউরিটি গার্ড বেতন",
  ],
  alternates: { canonical: "https://fairworkhelp.app/security-industry-award" },
  openGraph: {
    title: "Security Industry Award 2025 — Complete Plain-English Guide",
    description: "Pay rates, classification levels, penalty rates and how to check if you're underpaid. The guide the Fair Work Ombudsman should have written.",
    url: "https://fairworkhelp.app/security-industry-award",
  },
};

const LEVELS = [
  {
    level: "Level 1",
    hourly: 25.27,
    annual: 49934,
    title: "Security Officer Grade 1",
    duties: [
      "Static guarding — monitoring a fixed location",
      "Monitoring CCTV screens (basic observation only)",
      "Access control — checking credentials at entry",
      "Basic crowd control in low-risk environments",
      "Patrol of premises without response responsibility",
    ],
    note: "This is the starting classification. Most employers put all guards here regardless of actual duties.",
  },
  {
    level: "Level 2",
    hourly: 25.62,
    annual: 50625,
    title: "Security Officer Grade 2",
    duties: [
      "All Level 1 duties",
      "Operating basic security systems and alarm panels",
      "Writing incident reports and maintaining security logs",
      "Conducting basic first aid when required",
      "Crowd control in retail or hospitality environments",
    ],
    note: "Guards who write reports, operate alarm systems, or do first aid are likely Level 2 or above.",
  },
  {
    level: "Level 3",
    hourly: 26.19,
    annual: 51751,
    title: "Security Officer Grade 3",
    duties: [
      "All Level 2 duties",
      "Training or supervising Level 1 or 2 guards",
      "Cash-in-transit operations",
      "Guarding with a dog (dog handler)",
      "Monitoring complex multi-camera CCTV installations",
      "Operating in armed security contexts",
    ],
    note: "Dog handlers, CIT guards, and anyone who trains others should be at this level.",
    highlight: true,
  },
  {
    level: "Level 4",
    hourly: 26.76,
    annual: 52877,
    title: "Security Officer Grade 4 / Supervisor",
    duties: [
      "All Level 3 duties",
      "Supervising a team of security officers on shift",
      "Coordinating with police or emergency services",
      "Conducting security risk assessments",
      "Managing security control rooms",
    ],
    note: "Any guard regularly acting as shift supervisor — even informally — may qualify for Level 4.",
  },
  {
    level: "Level 5",
    hourly: 27.74,
    annual: 54813,
    title: "Security Officer Grade 5 / Senior Supervisor",
    duties: [
      "All Level 4 duties",
      "Senior supervisory responsibility across a site",
      "Reporting directly to management on security strategy",
      "Managing multiple teams or sites",
      "Developing security procedures and protocols",
    ],
    note: "Senior supervisors, security managers acting in a guard role, and multi-site coordinators.",
  },
];

const PENALTY_RATES = [
  { type: "Ordinary weekday (Mon–Fri)", rate: "100%", example: "Base rate only" },
  { type: "Saturday", rate: "125%", example: "$25.27 × 1.25 = $31.59/hr (L1)" },
  { type: "Sunday", rate: "150%", example: "$25.27 × 1.50 = $37.91/hr (L1)" },
  { type: "Public holiday", rate: "225%", example: "$25.27 × 2.25 = $56.86/hr (L1)" },
  { type: "Overtime (first 2 hrs)", rate: "150%", example: "After 8 hrs on weekday" },
  { type: "Overtime (beyond 2 hrs)", rate: "200%", example: "Double time" },
  { type: "Shift allowance (afternoon)", rate: "+15%", example: "Finishing after midnight" },
  { type: "Shift allowance (night)", rate: "+30%", example: "Majority of hours midnight–6am" },
];

const COMMON_VIOLATIONS = [
  {
    violation: "Wrong classification level",
    how: "Employer places all guards on Level 1 regardless of duties — dog handling, CIT, training others, or CCTV operation all require higher levels.",
    impact: "Can mean $1,000–$8,000/year underpayment per guard.",
  },
  {
    violation: "Unpaid Sunday penalty rates",
    how: "Rostered Sunday shifts paid at flat rate or slightly higher rate, not the required 150%.",
    impact: "A guard doing one Sunday shift per week loses ~$2,000/year.",
  },
  {
    violation: "Missed shift allowances",
    how: "Night shifts (majority of hours between midnight and 6am) must attract a 30% loading. Afternoon shifts finishing after midnight: 15%. Often not paid.",
    impact: "$50–$200 per affected shift.",
  },
  {
    violation: "Cash-in-transit not on Level 3",
    how: "CIT operations legally require Level 3 classification. Guards doing CIT on Level 1 or 2 rates are underpaid every shift.",
    impact: "~$900/year minimum per guard.",
  },
  {
    violation: "Unpaid overtime",
    how: "Guard asked to stay back but overtime paid at flat rate or not at all. The award requires 150% for the first 2 hours, 200% after.",
    impact: "Significant — depends on how often it occurs.",
  },
  {
    violation: "Meal breaks deducted but not provided",
    how: "Guard rostered for 8+ hours, 30-min break deducted from pay, but guard never actually gets a break due to operational requirements.",
    impact: "Paid 30 mins less per shift than worked.",
  },
];

export default function SecurityIndustryAwardPage() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#1B3A5C] border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">FW</div>
            <span className="text-white font-bold text-lg">Fair Work Help</span>
          </Link>
          <a href="/#early-access" className="bg-[#C9A84C] hover:bg-[#b8963e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Check my payslip free →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-[#1B3A5C] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-[#C9A84C] text-sm font-semibold mb-2 uppercase tracking-wider">Security Services Industry Award MA000016</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            The Security Industry Award.<br />
            <span className="text-[#C9A84C]">Actually explained.</span>
          </h1>
          <p className="text-white/60 text-lg mb-6 max-w-2xl">
            The Fair Work Ombudsman publishes the Security Services Industry Award as a 60-page PDF. This is the guide you actually need — plain English, with pay rates, classification levels, penalty rates, and the violations most workers don't know are happening.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <a href="#classification" className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors">Classification Levels →</a>
            <a href="#pay-rates" className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors">Pay Rates 2025 →</a>
            <a href="#penalty-rates" className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors">Penalty Rates →</a>
            <a href="#violations" className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors">Common Violations →</a>
            <a href="#pdf" className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors">Official PDF ↗</a>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 inline-block">
            <p className="text-white/50 text-xs">
              <strong className="text-white/70">Not the Fair Work Ombudsman.</strong> This guide is produced by Fair Work Help, a legal education platform. For the official award and to lodge a complaint, visit{" "}
              <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] underline">fairwork.gov.au</a>.
              The official Award PDF is freely available at the{" "}
              <a href="https://library.fairwork.gov.au/award/?krn=MA000016" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] underline">Fair Work Commission library ↗</a>.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="bg-[#152e4a] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "MA000016", label: "Award reference number" },
            { value: "5", label: "Classification levels" },
            { value: "$25.27", label: "Level 1 base rate (2024–25)" },
            { value: "$48,000+", label: "Max 6-year backpay (L1→L5)" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-extrabold text-[#C9A84C]">{stat.value}</div>
              <div className="text-white/40 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CLASSIFICATION LEVELS */}
      <section id="classification" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B3A5C] mb-2">Classification Levels — which one are you?</h2>
          <p className="text-gray-500 mb-8">The most common underpayment in the security industry is not a wrong hourly rate — it's being classified at the wrong level. These are the duties that define each level.</p>
          <div className="space-y-4">
            {LEVELS.map((level) => (
              <div key={level.level} className={`rounded-2xl border-2 overflow-hidden ${level.highlight ? "border-[#C9A84C]" : "border-gray-100"}`}>
                <div className={`px-6 py-4 flex items-center justify-between ${level.highlight ? "bg-[#1B3A5C]" : "bg-gray-50"}`}>
                  <div>
                    <span className={`font-bold text-lg ${level.highlight ? "text-[#C9A84C]" : "text-[#1B3A5C]"}`}>{level.level}</span>
                    <span className={`ml-3 text-sm ${level.highlight ? "text-white/60" : "text-gray-500"}`}>{level.title}</span>
                    {level.highlight && <span className="ml-3 text-xs bg-[#C9A84C]/20 text-[#C9A84C] px-2 py-0.5 rounded-full">Most misclassified</span>}
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-xl ${level.highlight ? "text-white" : "text-[#1B3A5C]"}`}>${level.hourly.toFixed(2)}/hr</div>
                    <div className={`text-xs ${level.highlight ? "text-white/40" : "text-gray-400"}`}>${level.annual.toLocaleString()}/yr full-time</div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-white">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Duties at this level include:</p>
                  <ul className="grid md:grid-cols-2 gap-1 mb-3">
                    {level.duties.map((duty) => (
                      <li key={duty} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#C9A84C] shrink-0 mt-0.5">→</span>{duty}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-2">{level.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-[#1B3A5C]/5 border border-[#1B3A5C]/20 rounded-xl p-6">
            <h3 className="font-bold text-[#1B3A5C] mb-2">Not sure which level applies to you?</h3>
            <p className="text-gray-600 text-sm mb-4">Upload your payslip and describe your actual duties. We'll analyse whether your current classification matches what you actually do — for free.</p>
            <a href="/#early-access" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all">
              Check my classification →
            </a>
          </div>
        </div>
      </section>

      {/* PAY RATES */}
      <section id="pay-rates" className="py-16 bg-[#F0F4F8]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B3A5C] mb-2">Pay rates 2024–2025</h2>
          <p className="text-gray-500 mb-6">These are the minimum base hourly rates from 1 July 2024. Penalty rates (weekends, nights, public holidays) are on top of these.</p>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1B3A5C] text-white">
                  <th className="px-5 py-4 text-left font-semibold">Level</th>
                  <th className="px-5 py-4 text-left font-semibold hidden md:table-cell">Title</th>
                  <th className="px-5 py-4 text-right font-semibold">Hourly</th>
                  <th className="px-5 py-4 text-right font-semibold">Weekly (38hr)</th>
                  <th className="px-5 py-4 text-right font-semibold">Annual (FT)</th>
                </tr>
              </thead>
              <tbody>
                {LEVELS.map((level, i) => (
                  <tr key={level.level} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} ${level.highlight ? "ring-2 ring-inset ring-[#C9A84C]/30" : ""}`}>
                    <td className="px-5 py-4 font-bold text-[#1B3A5C]">{level.level}</td>
                    <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{level.title}</td>
                    <td className="px-5 py-4 text-right font-mono font-semibold text-[#1B3A5C]">${level.hourly.toFixed(2)}</td>
                    <td className="px-5 py-4 text-right font-mono text-gray-600">${(level.hourly * 38).toFixed(2)}</td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-[#C9A84C]">${level.annual.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-red-50">
                  <td colSpan={3} className="px-5 py-3 text-sm text-red-700 font-medium">Level 1 to Level 5 gap</td>
                  <td className="px-5 py-3 text-right font-mono text-red-700">$2.47/hr</td>
                  <td className="px-5 py-3 text-right font-bold font-mono text-red-700">$4,879/yr</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-400">Source: Security Services Industry Award MA000016, operative from 1 July 2024 per Annual Wage Review 2023–24. Rates subject to change. Always verify with the <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="underline text-[#1B3A5C]">Fair Work Ombudsman</a>.</p>
        </div>
      </section>

      {/* PENALTY RATES */}
      <section id="penalty-rates" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1B3A5C] mb-2">Penalty rates and allowances</h2>
          <p className="text-gray-500 mb-8">Penalty rates are applied on top of your base rate. This is where most security guards lose significant money — especially on weekends and nights.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {PENALTY_RATES.map((rate) => (
              <div key={rate.type} className="flex items-start gap-4 bg-[#F0F4F8] rounded-xl p-4">
                <div className="bg-[#1B3A5C] text-white text-xs font-bold px-2 py-1 rounded-lg shrink-0 min-w-[48px] text-center">{rate.rate}</div>
                <div>
                  <div className="font-semibold text-[#1B3A5C] text-sm">{rate.type}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{rate.example}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 className="font-bold text-amber-900 mb-1">The Sunday shift calculation most guards don't know</h3>
            <p className="text-amber-800 text-sm">A Level 1 guard doing a single 8-hour Sunday shift should earn $25.27 × 1.5 × 8 = <strong>$303.24</strong>. If you're being paid $202.16 (flat rate), you're short $101.08 per Sunday shift. Over a year of weekly Sunday shifts, that's <strong>$5,256 in missed payments</strong>.</p>
          </div>
        </div>
      </section>

      {/* COMMON VIOLATIONS */}
      <section id="violations" className="py-16 bg-[#1B3A5C]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">The six most common Security Award violations</h2>
          <p className="text-white/50 mb-8">These are the patterns we see most often. Many are not obvious — employers don't always know they're doing them, but the Fair Work Act doesn't require intent.</p>
          <div className="space-y-4">
            {COMMON_VIOLATIONS.map((v, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#C9A84C]/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-7 h-7 bg-red-500/20 text-red-300 text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{v.violation}</h3>
                    <p className="text-white/50 text-sm mb-2">{v.how}</p>
                    <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-300 text-xs px-3 py-1 rounded-full">
                      <span>Impact:</span><span className="font-semibold">{v.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICIAL PDF SECTION */}
      <section id="pdf" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#1B3A5C] mb-3">The official Security Industry Award PDF</h2>
          <p className="text-gray-500 mb-6">The full legal text of the Security Services Industry Award MA000016 is maintained by the Fair Work Commission. It's the authoritative source — our guide is a plain-English companion, not a replacement.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Full award document", url: "https://library.fairwork.gov.au/award/?krn=MA000016", desc: "Fair Work Commission library — official legal text of MA000016", cta: "Open PDF ↗" },
              { title: "Pay Calculator", url: "https://calculate.fairwork.gov.au/FindYourAward", desc: "P.A.C.T — the FWO's official tool for calculating minimum pay rates", cta: "Use calculator ↗" },
              { title: "Lodge a complaint", url: "https://www.fairwork.gov.au/workplace-problems/fixing-a-workplace-problem", desc: "If you've identified an underpayment, the FWO investigates for free", cta: "Report to FWO ↗" },
            ].map((link) => (
              <a key={link.title} href={link.url} target="_blank" rel="noopener noreferrer"
                className="border-2 border-gray-100 hover:border-[#1B3A5C] rounded-xl p-5 transition-all group">
                <div className="font-bold text-[#1B3A5C] mb-1 group-hover:text-[#C9A84C] transition-colors">{link.title}</div>
                <p className="text-gray-400 text-xs mb-3 leading-relaxed">{link.desc}</p>
                <span className="text-sm font-semibold text-[#1B3A5C] group-hover:text-[#C9A84C] transition-colors">{link.cta}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1B3A5C]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Think you might be on the wrong level?</h2>
          <p className="text-white/60 mb-8">Upload your payslip and tell us your actual duties. We'll analyse whether your classification is correct — and calculate what you may be owed. Free, no account required.</p>
          <a href="/#early-access" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-[#C9A84C]/25">
            Check my payslip for free →
          </a>
          <p className="mt-4 text-white/30 text-xs">Legal education service. Does not constitute legal advice.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f2438] py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Link href="/" className="text-white font-bold hover:text-[#C9A84C] transition-colors">← Fair Work Help</Link>
              <p className="text-white/30 text-xs mt-1">Legal education platform by Ethical Technologies Pty Ltd</p>
            </div>
            <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] text-sm hover:underline">Official Fair Work Ombudsman → fairwork.gov.au</a>
          </div>
          <p className="mt-4 text-white/20 text-xs leading-relaxed">
            This guide is for educational purposes only and does not constitute legal advice. Pay rates are based on the Security Services Industry Award MA000016. Verify all rates with the Fair Work Ombudsman. Esso Australia Resources v Commissioner of Taxation [1999] HCA 67 — dominant purpose test. If you require legal advice, consult a qualified Australian legal practitioner.
          </p>
        </div>
      </footer>
    </div>
  );
}
