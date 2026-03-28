"use client";

import { useState, useEffect, useRef } from "react";
import PayChatWidget from "./components/PayChatWidget";
import { createClient } from "@/lib/supabase/client";

const SECTORS = [
  { name: "Security", icon: "🛡️", award: "Security Services Industry Award", hook: "Level misclassification costs guards $6,000–$48,000", color: "from-blue-900 to-blue-800" },
  { name: "Healthcare & Nursing", icon: "🏥", award: "Nurses Award / Health Professionals Award", hook: "Overtime, on-call and allowances routinely underpaid", color: "from-rose-900 to-rose-800" },
  { name: "Aged Care", icon: "🤝", award: "Aged Care Award", hook: "Pay equity decisions mean millions in unpaid wages owed now", color: "from-purple-900 to-purple-800" },
  { name: "NDIS & Disability", icon: "♿", award: "SCHADS Award", hook: "Sleepover provisions and travel time frequently missed", color: "from-green-900 to-green-800" },
  { name: "Retail", icon: "🛒", award: "General Retail Industry Award", hook: "Weekend penalty rates and casual loading often underpaid", color: "from-orange-900 to-orange-800" },
  { name: "Hospitality", icon: "🍽️", award: "Hospitality Industry Award", hook: "Split shift penalties and public holiday rates ignored", color: "from-yellow-900 to-yellow-800" },
  { name: "Fast Food", icon: "🍔", award: "Fast Food Industry Award", hook: "Young workers lose thousands in Sunday and PH rates", color: "from-red-900 to-red-800" },
  { name: "Cleaning", icon: "🧹", award: "Cleaning Services Award", hook: "Shift allowances and travel time systematically missed", color: "from-teal-900 to-teal-800" },
  { name: "Childcare", icon: "👶", award: "Children's Services Award", hook: "Pay equity gap — workers may be owed years of back pay", color: "from-pink-900 to-pink-800" },
  { name: "Transport & Logistics", icon: "🚛", award: "Road Transport Award", hook: "Overtime and fatigue break provisions often violated", color: "from-indigo-900 to-indigo-800" },
];

const LANGUAGES = [
  { code: "bn", name: "বাংলা", english: "Bengali", searchTerm: "ন্যায্য কাজের সাহায্য",
    headline: "আপনার প্রাপ্য মজুরি পাচ্ছেন তো?", cta: "আমার পে স্লিপ চেক করুন — বিনামূল্যে" },
  { code: "ne", name: "नेपाली", english: "Nepali", searchTerm: "उचित काम सहायता",
    headline: "के तपाईंलाई प्राप्य पारिश्रमिक मिलेको छ?", cta: "मेरो पे स्लिप जाँच गर्नुहोस् — निःशुल्क" },
  { code: "hi", name: "हिन्दी", english: "Hindi", searchTerm: "उचित काम सहायता",
    headline: "क्या आपको वह मजदूरी मिल रही है जिसके आप हकदार हैं?", cta: "मेरी पे स्लिप जाँचें — मुफ़्त में" },
  { code: "pa", name: "ਪੰਜਾਬੀ", english: "Punjabi", searchTerm: "ਨਿਆਂਪੂਰਨ ਕੰਮ ਮਦਦ",
    headline: "ਕੀ ਤੁਹਾਨੂੰ ਉਹ ਭੁਗਤਾਨ ਮਿਲ ਰਿਹਾ ਹੈ ਜਿਸਦੇ ਤੁਸੀਂ ਹੱਕਦਾਰ ਹੋ?", cta: "ਮੇਰੀ ਪੇ ਸਲਿੱਪ ਜਾਂਚੋ — ਮੁਫ਼ਤ" },
  { code: "ur", name: "اردو", english: "Urdu", searchTerm: "منصفانہ کام کی مدد",
    headline: "کیا آپ کو وہ تنخواہ مل رہی ہے جس کے آپ مستحق ہیں؟", cta: "میری پے سلپ چیک کریں — مفت" },
  { code: "ta", name: "தமிழ்", english: "Tamil", searchTerm: "நியாயமான வேலை உதவி",
    headline: "உங்களுக்கு உரிய ஊதியம் கிடைக்கிறதா?", cta: "என் சம்பள சீட்டை சரிபார்க்கவும் — இலவசம்" },
  { code: "si", name: "සිංහල", english: "Sinhala", searchTerm: "සාධාරණ කාර්ය සහාය",
    headline: "ඔබට ලැබිය යුතු වේතනය ලැබෙනවාද?", cta: "මගේ Pay Slip පරීක්ෂා කරන්න — නොමිලේ" },
  { code: "my", name: "မြန်မာ", english: "Burmese", searchTerm: "မျှတသောအလုပ်အကူအညီ",
    headline: "သင်ထိုက်တန်သော လုပ်ခ ရနေလား?", cta: "ကျွန်ုပ်၏ pay slip စစ်ဆေးပါ — အခမဲ့" },
  { code: "tl", name: "Filipino", english: "Tagalog", searchTerm: "Tulong sa Makatarungang Trabaho",
    headline: "Natatanggap mo ba ang tamang bayad?", cta: "Suriin ang aking payslip — libre" },
  { code: "th", name: "ภาษาไทย", english: "Thai", searchTerm: "ความช่วยเหลือด้านงานที่เป็นธรรม",
    headline: "คุณได้รับค่าจ้างที่สมควรได้รับหรือไม่?", cta: "ตรวจสอบสลิปเงินเดือนของฉัน — ฟรี" },
  { code: "id", name: "Indonesia", english: "Indonesian", searchTerm: "Bantuan kerja yang adil",
    headline: "Apakah Anda dibayar sesuai yang Anda dapatkan?", cta: "Periksa slip gaji saya — gratis" },
  { code: "vi", name: "Tiếng Việt", english: "Vietnamese", searchTerm: "Hỗ trợ công việc công bằng",
    headline: "Bạn có được trả lương đúng với những gì bạn xứng đáng không?", cta: "Kiểm tra phiếu lương của tôi — miễn phí" },
  { code: "zh", name: "普通话", english: "Mandarin", searchTerm: "公平工作帮助",
    headline: "你得到了应得的报酬吗？", cta: "检查我的工资单 — 免费" },
  { code: "yue", name: "廣東話", english: "Cantonese", searchTerm: "公平工作幫助",
    headline: "你有冇攞到你應得嘅薪酬？", cta: "查看我嘅薪金單 — 免費" },
  { code: "ko", name: "한국어", english: "Korean", searchTerm: "공정한 업무 지원",
    headline: "당신은 마땅히 받아야 할 급여를 받고 있나요?", cta: "내 급여명세서 확인하기 — 무료" },
  { code: "ja", name: "日本語", english: "Japanese", searchTerm: "公正な労働支援",
    headline: "あなたは本当に受け取るべき賃金を受け取っていますか？", cta: "給与明細を確認する — 無料" },
  { code: "es", name: "Español", english: "Spanish", searchTerm: "Ayuda laboral justa",
    headline: "¿Te están pagando lo que realmente mereces?", cta: "Verificar mi recibo de sueldo — gratis" },
  { code: "ar", name: "العربية", english: "Arabic", searchTerm: "مساعدة عادلة في العمل",
    headline: "هل تتلقى الأجر الذي تستحقه فعلاً؟", cta: "تحقق من كشف راتبي — مجاناً" },
  { code: "other", name: "Other →", english: "All languages", searchTerm: "", headline: "", cta: "" },
];

const STATS = [
  { value: 47000, suffix: "+", label: "Australian workers potentially underpaid right now", prefix: "" },
  { value: 23000, suffix: "", label: "Average underpayment recovered per wage claim", prefix: "$" },
  { value: 6, suffix: " years", label: "Maximum back-pay period under the Fair Work Act", prefix: "" },
  { value: 120, suffix: "+", label: "Modern awards covering Australian workers — we know every one", prefix: "" },
];

function AnimatedCounter({ target, prefix = "", suffix = "", duration = 2000 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState<typeof LANGUAGES[0] | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const handleCheckout = async (priceId: string, mode: "payment" | "subscription") => {
    setCheckoutLoading(priceId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong starting checkout. Please try again.");
      }
    } catch {
      alert("Could not connect to checkout. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sector }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#1B3A5C] border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">FW</div>
            <div>
              <span className="text-white font-bold text-lg">Fair Work Help</span>
              <span className="hidden sm:inline text-[#C9A84C]/70 text-xs ml-2">by Ethical Technologies</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/awards" className="hidden md:inline text-white/70 hover:text-white text-sm transition-colors">Award Guides</a>
            <a href="#how-it-works" className="hidden md:inline text-white/70 hover:text-white text-sm transition-colors">How it works</a>
            {isLoggedIn ? (
              <a href="/dashboard" className="bg-[#C9A84C] hover:bg-[#b8963e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                My account →
              </a>
            ) : (
              <>
                <a href="/auth/login" className="hidden md:inline text-white/70 hover:text-white text-sm transition-colors">Login</a>
                <a href="/auth/login" className="bg-[#C9A84C] hover:bg-[#b8963e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Get started free
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-[#1B3A5C] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-pulse" />
              Free payslip analysis — no account required
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Are you being paid<br />
              <span className="text-[#C9A84C]">what you're actually owed?</span>
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Upload your payslip. We analyse your award level against your actual duties — not just the minimum rate. Most workers are underpaid. Most don't know it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#early-access" className="bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 text-center shadow-lg shadow-[#C9A84C]/25">
                Check my payslip — it's free
              </a>
              <a href="#how-it-works" className="border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all text-center">
                How it works →
              </a>
            </div>
            <p className="mt-4 text-white/40 text-sm">
              Not the Fair Work Ombudsman. We don't investigate — we help you understand and prepare.{" "}
              <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="underline text-white/50 hover:text-white/70">Official FWO site →</a>
            </p>
          </div>
        </div>
      </section>

      {/* ANIMATED STATS BAR */}
      <section className="bg-[#152e4a] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-[#C9A84C]">
                <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-white/50 text-xs mt-2 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FWO COMPARISON — anti-diversion rebuttal */}
      <section className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1B3A5C] mb-3">We work <em>with</em> the Fair Work Ombudsman — not instead of it</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Fair Work Help is a legal education platform. We are not a government agency, we don't investigate employers, and we don't replace the free official service. Here's how we're different — and why you may need both.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* FWO card */}
            <div className="border-2 border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">🏛️</div>
                <div>
                  <div className="font-bold text-gray-900">Fair Work Ombudsman</div>
                  <div className="text-xs text-gray-400">fairwork.gov.au — free government service</div>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Tells you the legal minimum pay rates for your award","Investigates and prosecutes employer breaches","Operates an anonymous tip-off line","Provides official pay calculators and leave tools","Manages formal complaints and mediations"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-green-500 mt-0.5 shrink-0">✓</span>{item}</li>
                ))}
                {["Doesn't analyse your actual payslip","Doesn't check if your classification level is correct","No document preparation or case building","English-first — limited multilingual support","Complex navigation — award PDFs hard to find"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-gray-300 mt-0.5 shrink-0">✗</span><span className="text-gray-400">{item}</span></li>
                ))}
              </ul>
              <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1B3A5C] hover:underline">
                Visit fairwork.gov.au →
              </a>
            </div>
            {/* Fair Work Help card */}
            <div className="border-2 border-[#C9A84C] rounded-2xl p-6 bg-[#1B3A5C]/2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#C9A84C]/20 rounded-lg flex items-center justify-center text-lg">⚖️</div>
                <div>
                  <div className="font-bold text-[#1B3A5C]">Fair Work Help</div>
                  <div className="text-xs text-gray-400">fairworkhelp.app — legal education platform</div>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Analyses your actual payslip against award rates","Detects classification level misclassification","PEACE cognitive interview — tell your story once","Document preparation and chronology building","18 languages — all major migrant worker communities","Award navigation guide — finds what FWO makes hard","Prepares your case for FWO lodgement or legal review"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-[#C9A84C] mt-0.5 shrink-0">✓</span>{item}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-gray-400 italic">Legal education service only. Does not constitute legal advice. Outputs designed for legal professional review (Esso HCA 67).</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY GUARD HOOK — SEO section */}
      <section className="bg-[#1B3A5C] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="text-[#C9A84C] text-sm font-semibold mb-2 uppercase tracking-wider">Security Industry Award MA000016</div>
              <h2 className="text-3xl font-bold text-white mb-4">Security guard? <br />You may be on the wrong level.</h2>
              <p className="text-white/60 mb-6">The Security Services Industry Award has 5 classification levels. Most guards are paid Level 1 regardless of their actual duties. That gap — compounded over 6 years — adds up to significant backpay.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/awards/security-services-industry-award-2020" className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105">
                  Read the Award Guide →
                </a>
                <a href="/awards" className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold px-6 py-3 rounded-xl transition-all">
                  Browse all awards →
                </a>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-[#C9A84C] font-semibold text-sm mb-4">Why classification matters</div>
                <div className="space-y-3">
                  {["5 classification levels — not just Level 1", "Level determines your base rate, overtime, and allowances", "6-year limitation period applies to underpayment claims", "Misclassification is the most common underpayment pattern"].map((point) => (
                    <div key={point} className="flex items-start gap-2">
                      <span className="text-[#C9A84C] mt-0.5">✓</span>
                      <span className="text-white/60 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 text-white/30 text-xs">
                  Read the full award to check your classification. The AI can help you interpret it.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-[#F0F4F8]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B3A5C] mb-4">Three steps. One session.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Tell your story once. We turn it into a complete picture of what you're owed and what to do about it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "📄", title: "Upload your payslip", desc: "Photograph or screenshot your payslip. We read it and extract your current pay, classification, and hours — automatically." },
              { step: "02", icon: "🔍", title: "We analyse the gap", desc: "We compare your actual pay against the correct award level for your duties — not just the minimum. Most people are on the wrong level." },
              { step: "03", icon: "📋", title: "Get your full picture", desc: "We calculate what you're owed, build your chronology, and prepare your case — ready for the FWO, a union, or a lawyer." },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#1B3A5C] rounded-full flex items-center justify-center text-white text-xs font-bold">{item.step}</div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-[#1B3A5C] text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTOR TILES */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1B3A5C] mb-3">Which industry are you in?</h2>
            <p className="text-gray-500">Every award has its own traps. We know them all.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SECTORS.map((sector) => (
              <a key={sector.name} href="/awards"
                className="group bg-[#1B3A5C] hover:bg-[#C9A84C] rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-[#C9A84C]/20">
                <div className="text-2xl mb-2">{sector.icon}</div>
                <div className="text-white font-bold text-sm mb-1">{sector.name}</div>
                <div className="text-white/50 group-hover:text-white/80 text-xs leading-snug line-clamp-2">{sector.hook}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* MULTILINGUAL SEO SECTION */}
      <section className="py-16 bg-[#1B3A5C]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Your language. Your rights.
          </h2>
          <p className="text-white/50 mb-10 max-w-xl mx-auto">Fair Work Help is built for Australia's multicultural workforce. Tell your story in the language you think in.</p>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3 mb-10">
            {LANGUAGES.map((lang) => (
              lang.code === "other" ? (
                <a key={lang.code} href="/languages" className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 hover:border-[#C9A84C]/70 hover:bg-[#C9A84C]/20 rounded-xl p-3 transition-all cursor-pointer group">
                  <div className="text-[#C9A84C] font-bold text-sm">{lang.name}</div>
                  <div className="text-[#C9A84C]/60 text-xs group-hover:text-[#C9A84C]/80">{lang.english}</div>
                </a>
              ) : (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(activeLang?.code === lang.code ? null : lang)}
                  className={`rounded-xl p-3 transition-all cursor-pointer group text-left w-full ${
                    activeLang?.code === lang.code
                      ? "bg-[#C9A84C] border border-[#C9A84C]"
                      : "bg-white/5 border border-white/10 hover:border-[#C9A84C]/50 hover:bg-white/10"
                  }`}
                >
                  <div className={`font-bold text-sm ${activeLang?.code === lang.code ? "text-white" : "text-white"}`}>{lang.name}</div>
                  <div className={`text-xs ${activeLang?.code === lang.code ? "text-white/80" : "text-white/40 group-hover:text-white/60"}`}>{lang.english}</div>
                  <span className="sr-only">{lang.searchTerm}</span>
                </button>
              )
            ))}
          </div>

          {/* Bilingual content panel — shows when a language is selected */}
          {activeLang && (
            <div className="bg-white/5 border border-[#C9A84C]/30 rounded-2xl p-6 mb-6 animate-pulse-once">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Bilingual headline — mother tongue first, English scaffolded below */}
                  <div className="mb-4">
                    <p className="text-white font-bold text-xl leading-snug mb-1">{activeLang.headline}</p>
                    <p className="text-white/40 text-sm italic">Are you being paid what you&apos;re actually owed?</p>
                  </div>
                  <div className="mb-4">
                    <a
                      href="/auth/login"
                      className="inline-block bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold px-6 py-3 rounded-xl transition-all mb-1"
                    >
                      {activeLang.cta}
                    </a>
                    <p className="text-white/30 text-xs mt-1 italic">Check my payslip — it&apos;s free</p>
                  </div>
                  <p className="text-white/40 text-sm">
                    {activeLang.english === "Arabic" || activeLang.english === "Urdu"
                      ? "Chat with us in your language below ↓"
                      : `Chat with us in ${activeLang.english} in the chat below ↓`}
                    <span className="text-white/20 ml-2 italic">Chat with us in your language below ↓</span>
                  </p>
                </div>
                <button
                  onClick={() => setActiveLang(null)}
                  className="text-white/30 hover:text-white/70 text-2xl transition-colors shrink-0"
                  aria-label="Back to English"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {/* Hidden SEO text for multilingual search */}
          <div className="sr-only">
            <p>Fair Work Help — ন্যায্য কাজের সাহায্য — বাংলাদেশি কর্মীদের জন্য মজুরি সহায়তা অস্ট্রেলিয়া</p>
            <p>Fair Work Help — उचित काम सहायता — नेपाली कामदारहरूको लागि तलब सहायता अस्ट्रेलिया</p>
            <p>Fair Work Help — उचित काम सहायता — भारतीय श्रमिकों के लिए मजदूरी सहायता ऑस्ट्रेलिया</p>
            <p>Fair Work Help — ਨਿਆਂਪੂਰਨ ਕੰਮ ਮਦਦ — ਪੰਜਾਬੀ ਕਾਮਿਆਂ ਲਈ ਤਨਖ਼ਾਹ ਮਦਦ ਆਸਟ੍ਰੇਲੀਆ</p>
            <p>Fair Work Help — நியாயமான வேலை உதவி — தமிழ் தொழிலாளர்களுக்கான ஊதிய உதவி ஆஸ்திரேலியா</p>
            <p>Fair Work Help — Tulong sa Makatarungang Trabaho — tulong sa sahod para sa mga Pilipino sa Australia</p>
            <p>Fair Work Help — 公平工作帮助 — 为澳大利亚华人工人提供工资援助</p>
            <p>Fair Work Help — Hỗ trợ công việc công bằng — hỗ trợ tiền lương cho người Việt tại Úc</p>
            <p>Security guard fair work rights — 保安公平工作权利 — Security guard underpaid Australia</p>
            <p>Security Industry Award PDF download — security guard pay rates Australia 2024 2025</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 bg-[#F0F4F8]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1B3A5C] mb-3">Start free. Pay only if you find something.</h2>
            <p className="text-gray-500">The payslip check is free. You only need to pay when you want to do something about it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free Check",
                price: "$0",
                period: "always free",
                highlight: false,
                features: ["Upload your payslip", "Compare to award minimum rates", "See your classification level", "Identify the gap in dollars", "Link to FWO official tools"],
                cta: "Start free",
                ctaHref: "/auth/login",
                ctaMode: "link" as const,
              },
              {
                name: "Plus",
                price: "$4.99",
                period: "per week",
                highlight: true,
                features: ["Everything in Free", "Duties analysis — correct level check", "Full underpayment calculation", "PEACE cognitive interview", "Chronology and evidence log", "Claim roadmap and next steps"],
                cta: "Get early access",
                ctaHref: "",
                ctaMode: "checkout" as const,
                priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_WEEKLY || "price_1TFrhUQ1Be0MYtutV2W6anSj",
                checkoutMode: "subscription" as const,
              },
              {
                name: "Matter Pack",
                price: "$299",
                period: "one-time per matter",
                highlight: false,
                features: ["Everything in Plus", "Complete document preparation", "Case law surfacing", "Procedural roadmap", "Matter summary PDF", "Ready for FWO lodgement or lawyer review"],
                cta: "Get the Matter Pack",
                ctaHref: "",
                ctaMode: "checkout" as const,
                priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MATTER_PACK || "price_1TFrhYQ1Be0MYtutYI2Nyzba",
                checkoutMode: "payment" as const,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 border-2 ${plan.highlight ? "border-[#C9A84C] bg-[#1B3A5C] shadow-xl shadow-[#1B3A5C]/20" : "border-gray-200 bg-white"}`}>
                {plan.highlight && <div className="text-[#C9A84C] text-xs font-bold uppercase tracking-wider mb-2">Most popular</div>}
                <div className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-[#1B3A5C]"}`}>{plan.name}</div>
                <div className={`text-4xl font-extrabold mb-1 ${plan.highlight ? "text-[#C9A84C]" : "text-[#1B3A5C]"}`}>{plan.price}</div>
                <div className={`text-xs mb-6 ${plan.highlight ? "text-white/40" : "text-gray-400"}`}>{plan.period}</div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-start gap-2 ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>
                      <span className={`mt-0.5 shrink-0 ${plan.highlight ? "text-[#C9A84C]" : "text-[#1B3A5C]"}`}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                {((plan as {ctaMode?: string}).ctaMode === "checkout") ? (
                  <button
                    onClick={() => handleCheckout(
                      (plan as {priceId: string}).priceId,
                      (plan as {checkoutMode: "payment" | "subscription"}).checkoutMode
                    )}
                    disabled={checkoutLoading !== null}
                    className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${plan.highlight ? "bg-[#C9A84C] hover:bg-[#b8963e] text-white" : "border-2 border-[#1B3A5C] text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white"}`}
                  >
                    {checkoutLoading === (plan as {priceId: string}).priceId ? "Redirecting..." : plan.cta}
                  </button>
                ) : (
                  <a href={plan.ctaHref} className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.highlight ? "bg-[#C9A84C] hover:bg-[#b8963e] text-white" : "border-2 border-[#1B3A5C] text-[#1B3A5C] hover:bg-[#1B3A5C] hover:text-white"}`}>
                    {plan.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-6">
            Lawyer review add-on: $499 fixed fee — BNPL available. Panel solicitor reviews your complete prepared file and establishes legal professional privilege.
          </p>
        </div>
      </section>

      {/* EARLY ACCESS FORM */}
      <section id="early-access" className="py-20 bg-[#1B3A5C]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Get early access</h2>
          <p className="text-white/60 mb-8">We're onboarding users now. Join the list and we'll notify you when your sector opens — usually within 48 hours.</p>
          {submitted ? (
            <div className="bg-[#C9A84C]/20 border border-[#C9A84C]/40 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">✓</div>
              <div className="text-white font-bold text-xl mb-2">You're on the list.</div>
              <p className="text-white/60 text-sm">We'll be in touch within 48 hours. In the meantime, check your rights on the Fair Work Ombudsman site at <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="underline text-[#C9A84C]">fairwork.gov.au</a>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none"
              >
                <option value="" className="bg-[#1B3A5C]">Select your industry (optional)</option>
                {SECTORS.map((s) => <option key={s.name} value={s.name} className="bg-[#1B3A5C]">{s.name}</option>)}
              </select>
              <button type="submit" disabled={loading}
                className="w-full bg-[#C9A84C] hover:bg-[#b8963e] disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-[#C9A84C]/25">
                {loading ? "Sending..." : "Get early access →"}
              </button>
              <p className="text-white/30 text-xs">No spam. No account required to check your payslip. Unsubscribe any time.</p>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f2438] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-xs">FW</div>
                <span className="text-white font-bold">Fair Work Help</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed mb-3">A legal education platform by Ethical Technologies Pty Ltd. We help Australian workers understand their rights under the Fair Work Act 2009. We are not the Fair Work Ombudsman.</p>
              <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] text-xs hover:underline">Official Fair Work Ombudsman → fairwork.gov.au</a>
            </div>
            <div>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Award Guides</div>
              <ul className="space-y-2 text-xs text-white/40">
                <li><a href="/awards" className="hover:text-white/70 transition-colors">Browse all awards →</a></li>
                <li><a href="/awards/security-services-industry-award-2020" className="hover:text-white/70 transition-colors">Security Industry Award</a></li>
                <li><a href="/awards/nurses-award-2020" className="hover:text-white/70 transition-colors">Nurses Award</a></li>
                <li><a href="/awards/social-community-home-care-and-disability-services-industry-award-2010" className="hover:text-white/70 transition-colors">SCHADS Award</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Official Resources</div>
              <ul className="space-y-2 text-xs text-white/40">
                <li><a href="https://www.fairwork.gov.au/pay-and-wages/pay-calculator" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">FWO Pay Calculator ↗</a></li>
                <li><a href="https://www.fairwork.gov.au/employment-conditions/awards" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">All Modern Awards ↗</a></li>
                <li><a href="https://www.fairworkcommission.gov.au" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Fair Work Commission ↗</a></li>
                <li><a href="https://www.fwc.gov.au/issues-we-help-with/unfair-dismissal" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Unfair Dismissal Applications ↗</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/25 text-xs leading-relaxed">
              Fair Work Help is a legal education platform, not a law firm. Information provided is for educational purposes only and does not constitute legal advice. All platform outputs are designed with the dominant purpose of preparation for legal professional review (<em>Esso Australia Resources v Commissioner of Taxation</em> [1999] HCA 67). If you require legal advice, please consult a qualified Australian legal practitioner. Ethical Technologies Pty Ltd, ABN held by Sentinel Holding Group. <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/50">The Fair Work Ombudsman at fairwork.gov.au provides free official government services.</a>
            </p>
          </div>
        </div>
      </footer>
      <PayChatWidget />
    </div>
  );
}
