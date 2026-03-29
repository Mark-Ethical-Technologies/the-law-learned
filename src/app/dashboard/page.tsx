import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const firstName = profile?.first_name || user.email?.split("@")[0] || "there";
  const tier = profile?.subscription_tier || "free";

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Nav */}
      <nav className="bg-[#1B3A5C] border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">FW</div>
            <span className="text-white font-bold">Fair Work Help</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm capitalize">{tier} account</span>
            <form action="/auth/signout" method="post">
              <button className="text-white/40 hover:text-white text-sm transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1B3A5C] mb-1">
            G&apos;day, {firstName} 👋
          </h1>
          <p className="text-gray-500">
            {profile?.employer ? `${profile.industry} · ${profile.employer}` : "Complete your profile to get started."}
          </p>
        </div>

        {/* Upgrade banner for free tier */}
        {tier === "free" && (
          <div className="bg-[#1B3A5C] rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-[#C9A84C] font-semibold text-sm mb-1">You&apos;re on the Free plan</div>
              <div className="text-white font-bold text-lg">Upgrade to Plus — $4.99/week</div>
              <div className="text-white/50 text-sm mt-1">Full underpayment calculation, document upload, employer profile building</div>
            </div>
            <a href="/#pricing" className="shrink-0 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold px-6 py-3 rounded-xl transition-all">
              Upgrade now →
            </a>
          </div>
        )}

        {/* Action cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {[
            { icon: "💬", title: "Chat with the AI", desc: "Ask about your award, upload your payslip, or tell your story.", href: "/dashboard/chat", cta: "Start chatting" },
            { icon: "🎙️", title: "Matter Interviews", desc: "PEACE cognitive interview — document your situation for potential legal proceedings.", href: "/dashboard/matter", cta: "View interviews" },
            { icon: "📋", title: "Browse Award Guides", desc: "Read your Modern Award in plain English. Over 120 awards covered.", href: "/awards", cta: "Browse awards" },
          ].map((card) => (
            <div key={card.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-[#1B3A5C] mb-2">{card.title}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{card.desc}</p>
              <a href={card.href} className="inline-flex items-center gap-1 text-[#1B3A5C] font-semibold text-sm hover:underline">
                {card.cta} →
              </a>
            </div>
          ))}
        </div>

        {/* Shift tracker card */}
        <div className="bg-[#1B3A5C] rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-[#C9A84C] font-semibold text-sm mb-1">New</div>
            <div className="text-white font-bold text-lg">Log my shifts</div>
            <div className="text-white/50 text-sm mt-1">Track your hours and see if your penalty rates are being paid correctly.</div>
          </div>
          <a
            href="/dashboard/shifts"
            className="shrink-0 bg-[#C9A84C] hover:bg-[#d4b860] text-[#1B3A5C] font-bold px-6 py-3 rounded-xl transition-all text-sm"
          >
            Open shift tracker →
          </a>
        </div>

        {/* Profile summary */}
        {profile && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1B3A5C]">Your profile</h3>
              <a href="/profile/setup" className="text-sm text-[#C9A84C] hover:underline">Edit</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Industry", value: profile.industry || "Not set" },
                { label: "Employer", value: profile.employer || "Not set" },
                { label: "Pay rate", value: profile.pay_rate ? `$${profile.pay_rate}/${profile.pay_type === "hourly" ? "hr" : "yr"}` : "Not set" },
                { label: "Account", value: tier.charAt(0).toUpperCase() + tier.slice(1) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                  <div className="text-[#1B3A5C] font-semibold text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
