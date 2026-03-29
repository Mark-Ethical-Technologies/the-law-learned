"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ONBOARDING_LANGS = [
  { text: "Let's build your profile" },
  { text: "உங்கள் சுயவிவரத்தை உருவாக்குவோம்" },      // Tamil
  { text: "Hãy xây dựng hồ sơ của bạn" },              // Vietnamese
  { text: "让我们建立您的档案" },                          // Mandarin
  { text: "चलिए आपकी प्रोफ़ाइल बनाते हैं" },           // Hindi
  { text: "Buuin natin ang iyong profile" },            // Tagalog
];

const INDUSTRIES = [
  "Security", "Healthcare & Nursing", "Aged Care", "NDIS & Disability",
  "Retail", "Hospitality", "Fast Food", "Cleaning", "Childcare",
  "Transport & Logistics", "Construction", "Agriculture", "Administration", "Other"
];

const STEPS = [
  { id: 1, label: "Your name", hint: "How should we address you?" },
  { id: 2, label: "Your work", hint: "What industry are you in?" },
  { id: 3, label: "Your employer", hint: "Who do you work for?" },
  { id: 4, label: "Your pay", hint: "Roughly what are you paid?" },
  { id: 5, label: "Quick win", hint: "Here's what we found" },
];

export default function ProfileSetup() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [langIdx, setLangIdx] = useState(0);

  const [form, setForm] = useState({
    firstName: "",
    industry: "",
    employer: "",
    payRate: "",
    payType: "hourly" as "hourly" | "salary",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth/login");
      else setUserId(user.id);
    });
  }, [supabase, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLangIdx((i) => (i + 1) % ONBOARDING_LANGS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  const handleCheckout = async () => {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_WEEKLY;
    if (!priceId) { router.push("/dashboard"); return; }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode: "subscription" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Could not start checkout. Please try again.");
        setCheckoutLoading(false);
      }
    } catch {
      alert("Could not connect to checkout. Please check your connection.");
      setCheckoutLoading(false);
    }
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      // Save profile
      setSaveError(null);
      setLoading(true);
      if (userId) {
        const { error } = await supabase.from("profiles").upsert({
          id: userId,
          first_name: form.firstName,
          industry: form.industry,
          employer: form.employer,
          pay_rate: parseFloat(form.payRate) || null,
          pay_type: form.payType,
          onboarding_complete: true,
        });
        if (error) {
          setSaveError("Couldn't save your profile. Please try again.");
          setLoading(false);
          return;
        }
      }
      setLoading(false);
      setStep(5);
    }
  };

  const canProgress = () => {
    if (step === 1) return form.firstName.trim().length > 0;
    if (step === 2) return form.industry.length > 0;
    if (step === 3) return form.employer.trim().length > 0;
    if (step === 4) return form.payRate.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#1B3A5C] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Bilingual welcome */}
        <div className="text-center mb-4 h-8 flex items-center justify-center">
          <p className="text-[#C9A84C]/80 text-sm transition-all duration-500">
            {ONBOARDING_LANGS[langIdx].text}
          </p>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">FW</div>
          <span className="text-white font-bold">Fair Work Help</span>
        </div>

        {/* Progress */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex justify-between text-white/30 text-xs mb-2">
              <span>Building your profile</span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C9A84C] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEPS.slice(0, 4).map((s) => (
                <div key={s.id} className={`text-xs ${step >= s.id ? "text-[#C9A84C]" : "text-white/20"}`}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          {/* Step 1: Name */}
          {step === 1 && (
            <div>
              <div className="text-4xl mb-4">👋</div>
              <h2 className="text-white font-bold text-2xl mb-2">What&apos;s your name?</h2>
              <p className="text-white/50 text-sm mb-6">We&apos;ll use this to personalise your experience.</p>
              <input
                type="text" autoFocus placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && canProgress() && handleNext()}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#C9A84C] text-lg"
              />
            </div>
          )}

          {/* Step 2: Industry */}
          {step === 2 && (
            <div>
              <div className="text-4xl mb-4">💼</div>
              <h2 className="text-white font-bold text-2xl mb-2">What do you do, {form.firstName}?</h2>
              <p className="text-white/50 text-sm mb-6">
                Each industry has its own award and traps. We need to know yours.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map((ind) => (
                  <button key={ind}
                    onClick={() => setForm({ ...form, industry: ind })}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all text-left ${
                      form.industry === ind
                        ? "bg-[#C9A84C] text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Employer */}
          {step === 3 && (
            <div>
              <div className="text-4xl mb-4">🏢</div>
              <h2 className="text-white font-bold text-2xl mb-2">Who employs you?</h2>
              <p className="text-white/50 text-sm mb-6">
                We build a profile on employers over time. Your employer may already be on our radar.
              </p>
              <input
                type="text" autoFocus placeholder="Employer name"
                value={form.employer}
                onChange={(e) => setForm({ ...form, employer: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && canProgress() && handleNext()}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#C9A84C] text-lg"
              />
              <p className="text-white/25 text-xs mt-3">
                This information is stored securely and never shared without your consent.
              </p>
            </div>
          )}

          {/* Step 4: Pay */}
          {step === 4 && (
            <div>
              <div className="text-4xl mb-4">💰</div>
              <h2 className="text-white font-bold text-2xl mb-2">What are you paid?</h2>
              <p className="text-white/50 text-sm mb-6">
                Approximate is fine. We&apos;ll compare this against your award rate.
              </p>
              <div className="flex gap-3 mb-4">
                {(["hourly", "salary"] as const).map((type) => (
                  <button key={type}
                    onClick={() => setForm({ ...form, payType: type })}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                      form.payType === type ? "bg-[#C9A84C] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {type === "hourly" ? "Per hour" : "Annual salary"}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">$</span>
                <input
                  type="number" autoFocus
                  placeholder={form.payType === "hourly" ? "e.g. 28.50" : "e.g. 55000"}
                  value={form.payRate}
                  onChange={(e) => setForm({ ...form, payRate: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && canProgress() && handleNext()}
                  className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#C9A84C] text-lg"
                />
              </div>
            </div>
          )}

          {/* Step 5: Plan selection */}
          {step === 5 && (
            <div>
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-white font-bold text-2xl mb-2">
                Profile saved, {form.firstName}. Choose your plan.
              </h2>
              <p className="text-white/50 text-sm mb-6">
                Start free — upgrade anytime when you&apos;re ready to go further.
              </p>
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">Free</span>
                    <span className="text-[#C9A84C] font-bold">$0</span>
                  </div>
                  <ul className="text-white/50 text-sm space-y-1 mb-4">
                    <li>✓ AI chat — triage your situation</li>
                    <li>✓ Award Guides — read your award</li>
                    <li>✓ Shift tracker — log your hours</li>
                  </ul>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all"
                  >
                    Continue with free →
                  </button>
                </div>
                <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/40 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#C9A84C] font-bold">Plus</span>
                    <span className="text-[#C9A84C] font-bold">$4.99/week</span>
                  </div>
                  <ul className="text-white/70 text-sm space-y-1 mb-4">
                    <li>✓ Everything in Free</li>
                    <li>✓ Payslip upload + AI analysis</li>
                    <li>✓ Full underpayment calculation</li>
                    <li>✓ Document upload for evidence</li>
                  </ul>
                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full py-3 bg-[#C9A84C] hover:bg-[#b8963e] disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    {checkoutLoading ? "Redirecting to checkout..." : "Upgrade to Plus — $4.99/wk →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step < 5 && (
            <>
              {saveError && (
                <p className="text-red-400 text-sm mt-3 text-center">{saveError}</p>
              )}
              <button
                onClick={handleNext}
                disabled={!canProgress() || loading}
                className="w-full mt-4 bg-[#C9A84C] hover:bg-[#b8963e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-lg"
              >
                {loading ? "Saving..." : step === 4 ? "Save my profile →" : "Continue →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
