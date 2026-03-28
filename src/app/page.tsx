"use client";

import { useState } from "react";

const SECTORS = [
  { name: "Security", icon: "🛡️", award: "Security Services Industry Award", hook: "Level misclassification costs guards $6,000–$48,000 in backpay" },
  { name: "Healthcare & Nursing", icon: "🏥", award: "Nurses Award / Health Professionals Award", hook: "Overtime, on-call and allowances routinely underpaid" },
  { name: "Aged Care", icon: "🤝", award: "Aged Care Award", hook: "Pay equity decisions mean millions in unpaid wages owed now" },
  { name: "NDIS & Disability", icon: "♿", award: "SCHADS Award", hook: "Sleepover provisions and travel time frequently missed" },
  { name: "Retail", icon: "🛒", award: "General Retail Industry Award", hook: "Weekend penalty rates and casual loading often underpaid" },
  { name: "Hospitality", icon: "🍽️", award: "Hospitality Industry Award", hook: "Split shift penalties and public holiday rates ignored" },
  { name: "Fast Food", icon: "🍔", award: "Fast Food Industry Award", hook: "Young workers lose thousands in Sunday and PH rates" },
  { name: "Cleaning", icon: "🧹", award: "Cleaning Services Award", hook: "Shift allowances and travel time systematically missed" },
  { name: "Childcare", icon: "👶", award: "Children's Services Award", hook: "Pay equity gap — workers may be owed years of back pay" },
  { name: "Transport & Logistics", icon: "🚛", award: "Road Transport Award", hook: "Overtime and fatigue break provisions often violated" },
];

const LANGUAGES = [
  { code: "bn", name: "বাংলা", english: "Bengali", searchTerm: "ন্যায্য কাজের সাহায্য" },
  { code: "ne", name: "नेपाली", english: "Nepali", searchTerm: "उचित काम सहायता" },
  { code: "hi", name: "हिंदी", english: "Hindi", searchTerm: "उचित काम मदद" },
  { code: "pa", name: "ਪੰਜਾਬੀ", english: "Punjabi", searchTerm: "ਨਿਰਪੱਖ ਕੰਮ ਮਦਦ" },
  { code: "ta", name: "தமிழ்", english: "Tamil", searchTerm: "நியாயமான வேலை உதவி" },
  { code: "tl", name: "Filipino", english: "Tagalog", searchTerm: "tulong sa trabaho" },
  { code: "zh", name: "中文", english: "Mandarin", searchTerm: "公平工作帮助" },
  { code: "yue", name: "廣東話", english: "Cantonese", searchTerm: "公平工作幫助" },
  { code: "vi", name: "Tiếng Việt", english: "Vietnamese", searchTerm: "giúp đỡ việc làm công bằng" },
  { code: "ar", name: "العربية", english: "Arabic", searchTerm: "مساعدة العمل العادل" },
  { code: "ko", name: "한국어", english: "Korean", searchTerm: "공정한 직장 도움" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sector }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#1B3A5C]">

      {/* NAV */}
      <nav className="border-b border-[#1B3A5C]/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#1B3A5C]">Fair Work Help</span>
          <span className="text-xs bg-[#C9A84C]/20 text-[#C9A84C] font-semibold px-2 py-0.5 rounded-full">by Ethical Technologies</span>
        </div>
        <a href="#early-access" className="text-sm font-semibold text-[#C9A84C] hover:underline">
          Get early access →
        </a>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-block bg-red-50 text-red-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          ⚠️ Most Australian workers are paid at the wrong award level
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1B3A5C] leading-tight mb-6">
          Are you being paid<br />
          <span className="text-[#C9A84C]">what you&apos;re actually owed?</span>
        </h1>
        <p className="text-lg sm:text-xl text-[#1B3A5C]/70 mb-8 max-w-2xl mx-auto">
          Upload your payslip. We analyse your award level against your duties and tell you exactly what the gap is — and how much you&apos;re owed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <a
            href="#early-access"
            className="bg-[#1B3A5C] text-white font-semibold px-8 py-4 rounded-xl text-lg hover:bg-[#1B3A5C]/90 transition"
          >
            Check my pay for free →
          </a>
          <a
            href="#how-it-works"
            className="border border-[#1B3A5C]/30 text-[#1B3A5C] font-semibold px-8 py-4 rounded-xl text-lg hover:bg-[#F0F4F8] transition"
          >
            How it works
          </a>
        </div>
        <p className="text-sm text-[#1B3A5C]/50">No credit card · No lawyer needed · 100% confidential</p>
      </section>

      {/* SECURITY GUARD HOOK — highest conversion sector */}
      <section className="bg-[#1B3A5C] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-[#C9A84C] font-semibold text-sm mb-2">SECURITY INDUSTRY EXAMPLE</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Level 1 security guard doing Level 5 duties?
              </h2>
              <p className="text-white/80 mb-4">
                Most security companies pay everyone at Level 1 — the minimum. But the award has 5 levels based on your actual duties. If you supervise others, carry a firearm, or manage a control room, you may be owed years of backpay.
              </p>
              <p className="text-white/60 text-sm">
                Security Services Industry Award 2020 (MA000016)
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/20 pb-3">
                <span className="text-white/70 text-sm">Classification</span>
                <span className="text-white/70 text-sm">Annual (38hr week)</span>
              </div>
              {[
                { level: "Level 1 (min)", rate: "$49,934" },
                { level: "Level 2", rate: "$51,360" },
                { level: "Level 3", rate: "$52,229" },
                { level: "Level 4", rate: "$53,102" },
                { level: "Level 5 (supervisor)", rate: "$54,813" },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between items-center ${i === 0 ? "text-red-300" : i === 4 ? "text-[#C9A84C] font-semibold" : "text-white"}`}>
                  <span className="text-sm">{row.level}</span>
                  <span className="text-sm">{row.rate}</span>
                </div>
              ))}
              <div className="bg-[#C9A84C]/20 rounded-xl p-3 mt-2">
                <p className="text-[#C9A84C] text-sm font-semibold">Level 1 → Level 5 gap with weekend penalties: up to <span className="text-lg">$48,000</span> over 6 years</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 px-6 bg-[#F0F4F8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1B3A5C] mb-3">How it works</h2>
          <p className="text-[#1B3A5C]/60 mb-12">Free analysis. No commitment. Takes 60 seconds.</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload your payslip", desc: "Photo or screenshot of any recent payslip. We read the rate, hours, and employer name.", icon: "📱" },
              { step: "2", title: "We analyse the award", desc: "Live data from the Fair Work Commission. We match your rate against every classification level in your industry award.", icon: "⚖️" },
              { step: "3", title: "You see the gap", desc: "We show you what level you are, what level you should be, and what the dollar difference looks like weekly and over time.", icon: "💰" },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 text-left shadow-sm">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-[#C9A84C] font-bold text-xs mb-1">STEP {item.step}</p>
                <h3 className="font-bold text-[#1B3A5C] mb-2">{item.title}</h3>
                <p className="text-[#1B3A5C]/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm text-left max-w-2xl mx-auto">
            <p className="text-[#1B3A5C] font-semibold mb-2">Then what?</p>
            <p className="text-[#1B3A5C]/70 text-sm">
              Free analysis shows you your award level and the basic gap. Upgrade to <strong>Plus ($4.99/week)</strong> and we walk through your exact duties against the award classifications — so you know the precise claim amount and exactly how to lodge it.
            </p>
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1B3A5C] text-center mb-3">Your industry, your award</h2>
          <p className="text-[#1B3A5C]/60 text-center mb-10">Every modern award has classification levels. Most employers pay the minimum. Most workers are owed more.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECTORS.map((sector) => (
              <div key={sector.name} className="border border-[#1B3A5C]/10 rounded-xl p-5 hover:border-[#C9A84C]/50 hover:shadow-sm transition cursor-pointer">
                <div className="text-2xl mb-2">{sector.icon}</div>
                <h3 className="font-bold text-[#1B3A5C] mb-1">{sector.name}</h3>
                <p className="text-xs text-[#1B3A5C]/40 mb-2">{sector.award}</p>
                <p className="text-sm text-[#1B3A5C]/70">{sector.hook}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MULTILINGUAL SECTION — SEO + genuine UX */}
      <section className="bg-[#F0F4F8] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1B3A5C] mb-3">We help workers in every language</h2>
          <p className="text-[#1B3A5C]/60 mb-8">
            The Fair Work Ombudsman provides information. We provide <em>action</em> — in your language.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className="bg-white rounded-xl px-4 py-3 shadow-sm text-center min-w-[110px]">
                <p className="font-bold text-[#1B3A5C] text-sm">{lang.name}</p>
                <p className="text-[#1B3A5C]/50 text-xs">{lang.english}</p>
              </div>
            ))}
          </div>
          {/* Hidden but indexable language-specific search phrases for SEO */}
          <div className="sr-only" aria-hidden="true">
            {LANGUAGES.map((lang) => (
              <span key={lang.code} lang={lang.code}>{lang.searchTerm} - fair work help australia</span>
            ))}
          </div>
          <p className="text-sm text-[#1B3A5C]/50">Full multilingual support launching with the platform. Early access available now.</p>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#1B3A5C] mb-3">Simple, honest pricing</h2>
          <p className="text-[#1B3A5C]/60 mb-10">Start free. Upgrade when you&apos;re ready to act.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                desc: "Know where you stand",
                features: ["Payslip upload & analysis", "Award level check", "Basic gap calculation", "Know your rights"],
                cta: "Start free",
                highlight: false,
              },
              {
                name: "Plus",
                price: "$4.99",
                period: "per week",
                desc: "Build your claim",
                features: ["Everything in Free", "Full duties analysis", "Exact backpay calculation", "Claim letter template", "PEACE intake interview", "Document preparation"],
                cta: "Get Plus",
                highlight: true,
              },
              {
                name: "Matter Pack",
                price: "$299",
                period: "one-time",
                desc: "Complete file preparation",
                features: ["Everything in Plus", "Full matter chronology", "Evidence pack", "Lawyer-ready brief", "Case law summary", "Lawyer review add-on available"],
                cta: "Get Matter Pack",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 text-left ${plan.highlight ? "bg-[#1B3A5C] text-white shadow-xl ring-2 ring-[#C9A84C]" : "bg-[#F0F4F8] text-[#1B3A5C]"}`}
              >
                {plan.highlight && (
                  <span className="bg-[#C9A84C] text-white text-xs font-bold px-2 py-1 rounded-full mb-3 inline-block">MOST POPULAR</span>
                )}
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-[#1B3A5C]"}`}>{plan.name}</h3>
                <div className="mb-1">
                  <span className={`text-3xl font-bold ${plan.highlight ? "text-[#C9A84C]" : "text-[#1B3A5C]"}`}>{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? "text-white/60" : "text-[#1B3A5C]/50"}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-white/70" : "text-[#1B3A5C]/60"}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-white/80" : "text-[#1B3A5C]/70"}`}>
                      <span className="text-[#C9A84C] mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#early-access"
                  className={`block text-center font-semibold py-3 rounded-xl transition ${plan.highlight ? "bg-[#C9A84C] text-white hover:bg-[#C9A84C]/90" : "bg-white text-[#1B3A5C] hover:bg-white/80 border border-[#1B3A5C]/20"}`}
                >
                  {plan.cta} →
                </a>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#1B3A5C]/50">Lawyer review add-on from $499 · Split over 4 fortnightly payments via Zip / AfterPay</p>
        </div>
      </section>

      {/* EARLY ACCESS FORM */}
      <section id="early-access" className="bg-[#1B3A5C] py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Get early access</h2>
          <p className="text-white/70 mb-8">
            Platform launches soon. Early access users get 3 months free Plus and help shape the product.
          </p>
          {submitted ? (
            <div className="bg-white/10 rounded-2xl p-8">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-white font-bold text-xl mb-2">You&apos;re on the list</h3>
              <p className="text-white/70">We&apos;ll be in touch as soon as early access opens. In the meantime — know your rights.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white text-[#1B3A5C] placeholder-[#1B3A5C]/40 text-base focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-5 py-4 rounded-xl bg-white text-[#1B3A5C] text-base focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                <option value="">My industry (optional)</option>
                {SECTORS.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
              {error && <p className="text-red-300 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C9A84C] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#C9A84C]/90 transition disabled:opacity-60"
              >
                {loading ? "Joining..." : "Get early access →"}
              </button>
              <p className="text-white/40 text-xs">No spam. No credit card. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </section>

      {/* LEGAL DISCLAIMER FOOTER */}
      <footer className="bg-[#F0F4F8] py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
            <div>
              <p className="font-bold text-[#1B3A5C] mb-1">Fair Work Help</p>
              <p className="text-[#1B3A5C]/50 text-xs">by Ethical Technologies Pty Ltd</p>
              <p className="text-[#1B3A5C]/50 text-xs">Know the law. Change everything.</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#1B3A5C]/60">
              <a href="#how-it-works" className="hover:text-[#1B3A5C]">How it works</a>
              <a href="#early-access" className="hover:text-[#1B3A5C]">Early access</a>
              <a href="mailto:help@fairworkhelp.app" className="hover:text-[#1B3A5C]">Contact</a>
            </div>
          </div>
          <div className="border-t border-[#1B3A5C]/10 pt-6">
            <p className="text-xs text-[#1B3A5C]/40 leading-relaxed">
              Fair Work Help is a legal education platform, not a law firm. Information provided is for educational purposes only and does not constitute legal advice. All platform outputs are designed with the dominant purpose of preparation for legal professional review (
              <em>Esso Australia Resources v Commissioner of Taxation</em> [1999] HCA 67). If you require legal advice, please consult a qualified Australian legal practitioner. Ethical Technologies Pty Ltd, ABN held by Sentinel Holding Group.
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}
