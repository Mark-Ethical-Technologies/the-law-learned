"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PayChatWidget from "@/app/components/PayChatWidget";

// ---------- Types ----------

interface ShiftRow {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  shift_type: string;
  actual_pay_received: number | null;
  base_hourly_rate: number | null;
  employer: string | null;
  notes: string | null;
  created_at: string;
}

interface Profile {
  pay_rate: number | null;
  employer: string | null;
  industry: string | null;
  first_name: string | null;
}

type ShiftTypeValue = "ordinary" | "saturday" | "sunday" | "public_holiday" | "night";

const SHIFT_TYPE_LABELS: Record<ShiftTypeValue, string> = {
  ordinary: "Ordinary",
  saturday: "Saturday",
  sunday: "Sunday",
  public_holiday: "Public Holiday",
  night: "Night",
};

const SHIFT_TYPE_COLOURS: Record<ShiftTypeValue, string> = {
  ordinary: "bg-gray-100 text-gray-700",
  saturday: "bg-blue-100 text-blue-700",
  sunday: "bg-purple-100 text-purple-700",
  public_holiday: "bg-red-100 text-red-700",
  night: "bg-indigo-100 text-indigo-700",
};

// ---------- Helpers ----------

function parseHHmm(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function calcHoursWorked(start: string, end: string, breakMins: number): number {
  let endMins = parseHHmm(end);
  const startMins = parseHHmm(start);
  if (endMins <= startMins) endMins += 24 * 60; // overnight shift
  const worked = Math.max(0, endMins - startMins - breakMins);
  return Math.round((worked / 60) * 100) / 100;
}

function formatTime(t: string) {
  // "09:00:00" → "9:00 am"
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr ?? "0");
  const m = mStr ?? "00";
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function buildAIMessage(shifts: ShiftRow[], employerName: string): string {
  const recent = [...shifts]
    .sort((a, b) => b.shift_date.localeCompare(a.shift_date))
    .slice(0, 7);

  const rows = recent.map((s) => {
    const hrs = calcHoursWorked(s.start_time, s.end_time, s.break_minutes ?? 0);
    const type = SHIFT_TYPE_LABELS[s.shift_type as ShiftTypeValue] ?? s.shift_type;
    const paid = s.actual_pay_received != null ? `$${s.actual_pay_received.toFixed(2)}` : "not recorded";
    return `  • ${s.shift_date} (${type}) — ${hrs}h — paid: ${paid}`;
  }).join("\n");

  return `I've logged the following shifts and need to know if I was paid correctly under Fair Work rules. Please identify which Modern Award likely applies to my work and check whether my pay was correct for each shift type.

${rows}

My employer is ${employerName || "not recorded"}. Can you check if the rates I was paid look correct for each shift type, and flag any that may be underpayments?`;
}

// ---------- Component ----------

export default function ShiftsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiSeedMessage, setAiSeedMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: today,
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: "0",
    shiftType: "ordinary" as ShiftTypeValue,
    employer: "",
    baseHourlyRate: "",
    actualPayReceived: "",
    notes: "",
  });

  // ---------- Auth + data load ----------

  const loadShifts = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("shifts")
      .select("*")
      .eq("user_id", userId)
      .order("shift_date", { ascending: false })
      .limit(30);
    setShifts((data as ShiftRow[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("pay_rate, employer, industry, first_name")
        .eq("id", user.id)
        .single();

      const prof = profileData as Profile | null;
      setProfile(prof);

      // Pre-fill form defaults from profile
      setForm((f) => ({
        ...f,
        employer: prof?.employer ?? "",
        baseHourlyRate: prof?.pay_rate ? String(prof.pay_rate) : "",
      }));

      await loadShifts(user.id);
      setLoading(false);
    }
    init();
  }, [router, supabase, loadShifts]);

  // ---------- Gap detection ----------
  // Show alert if any shift has actual_pay_received MORE than 5% below
  // (base_hourly_rate * hours_worked) — i.e. possible underpayment
  const gapShifts = shifts.filter((s) => {
    if (s.actual_pay_received == null || s.base_hourly_rate == null) return false;
    const hrs = calcHoursWorked(s.start_time, s.end_time, s.break_minutes ?? 0);
    const flatPay = s.base_hourly_rate * hrs;
    // calculated_pay > 5% more than actual = underpayment
    return s.actual_pay_received < flatPay * 0.95;
  });
  const gapTotal = gapShifts.reduce((sum, s) => {
    const hrs = calcHoursWorked(s.start_time, s.end_time, s.break_minutes ?? 0);
    const flatPay = (s.base_hourly_rate ?? 0) * hrs;
    return sum + (flatPay - (s.actual_pay_received ?? 0));
  }, 0);
  const showGapBanner = gapShifts.length > 0;

  // ---------- Totals ----------
  const totalHours = shifts.reduce(
    (sum, s) => sum + calcHoursWorked(s.start_time, s.end_time, s.break_minutes ?? 0),
    0
  );
  const totalHoursDisplay = Math.round(totalHours * 100) / 100;

  // ---------- Submit ----------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }

      const rate = form.baseHourlyRate ? parseFloat(form.baseHourlyRate) : null;
      const paid = form.actualPayReceived ? parseFloat(form.actualPayReceived) : null;
      const breakMins = parseInt(form.breakMinutes) || 0;

      const { error } = await supabase.from("shifts").insert({
        user_id: user.id,
        shift_date: form.date,
        start_time: form.startTime,
        end_time: form.endTime,
        break_minutes: breakMins,
        shift_type: form.shiftType,
        employer: form.employer || null,
        base_hourly_rate: rate,
        actual_pay_received: paid,
        notes: form.notes || null,
        // award_rate_applied and calculated_pay intentionally left null —
        // rate intelligence lives in the AI layer
      });

      if (error) {
        setSubmitError("Couldn't save shift. Please try again.");
        return;
      }

      await loadShifts(user.id);
      setForm((f) => ({
        ...f,
        date: today,
        actualPayReceived: "",
        notes: "",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- AI CTA ----------

  function handleAskAI() {
    const employerName = shifts[0]?.employer ?? profile?.employer ?? "";
    setAiSeedMessage(buildAIMessage(shifts, employerName));
    setShowAIChat(true);
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-[#1B3A5C] font-semibold">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Nav */}
      <nav className="bg-[#1B3A5C] border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">FW</div>
            <span className="text-white font-bold">Fair Work Help</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">← Dashboard</a>
            <form action="/auth/signout" method="post">
              <button className="text-white/40 hover:text-white text-sm transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1B3A5C] mb-1">Shift Tracker</h1>
          <p className="text-gray-500">
            Log your hours and pay received. The AI will check your penalty rates.
          </p>
        </div>

        {/* Gap detection banner */}
        {showGapBanner && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  Possible underpayment detected — some shifts show a gap of{" "}
                  <span className="font-bold">${gapTotal.toFixed(2)}</span> compared to flat-rate pay. This may be worth investigating.
                </p>
                {shifts.length >= 7 && (
                  <p className="text-amber-700 text-sm mt-1">
                    You now have enough shift data to generate a full Matter Pack.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Totals card */}
        {shifts.length > 0 && (
          <div className="bg-[#1B3A5C] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[#C9A84C] font-semibold text-sm mb-1">Your last 30 shifts</div>
              <div className="text-white font-bold text-2xl">
                {totalHoursDisplay} hours
              </div>
              <div className="text-white/50 text-sm mt-1">
                across {shifts.length} shift{shifts.length !== 1 ? "s" : ""} logged
              </div>
            </div>
            <button
              onClick={handleAskAI}
              className="shrink-0 bg-[#C9A84C] hover:bg-[#d4b860] text-[#1B3A5C] font-bold px-5 py-3 rounded-xl transition-all text-sm"
            >
              💬 Ask the AI to check my rates
            </button>
          </div>
        )}

        {/* Shift entry form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-bold text-[#1B3A5C] mb-5">Log a shift</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs text-gray-500 font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Start time</label>
                <input
                  type="time"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">End time</label>
                <input
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Break (mins)</label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={form.breakMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, breakMinutes: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Shift type</label>
                <select
                  value={form.shiftType}
                  onChange={(e) => setForm((f) => ({ ...f, shiftType: e.target.value as ShiftTypeValue }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                >
                  <option value="ordinary">Ordinary</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                  <option value="public_holiday">Public Holiday</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Base hourly rate ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={profile?.pay_rate ? String(profile.pay_rate) : "e.g. 24.73"}
                  value={form.baseHourlyRate}
                  onChange={(e) => setForm((f) => ({ ...f, baseHourlyRate: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Pay received ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="What you were actually paid"
                  value={form.actualPayReceived}
                  onChange={(e) => setForm((f) => ({ ...f, actualPayReceived: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs text-gray-500 font-medium mb-1">Employer</label>
                <input
                  type="text"
                  placeholder="Who do you work for?"
                  value={form.employer}
                  onChange={(e) => setForm((f) => ({ ...f, employer: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                />
              </div>

              <div className="col-span-2 sm:col-span-3">
                <label className="block text-xs text-gray-500 font-medium mb-1">Notes (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Any details worth remembering about this shift…"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] resize-none"
                />
              </div>
            </div>

            {submitError && (
              <p className="text-red-500 text-sm mb-3">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1B3A5C] hover:bg-[#152e49] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              {submitting ? "Saving…" : "Save shift"}
            </button>
          </form>
        </div>

        {/* Shift history table */}
        {shifts.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[#1B3A5C] mb-5">Shift history</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-gray-100">
                    <th className="text-left pb-3 pr-4">Date</th>
                    <th className="text-left pb-3 pr-4">Start – End</th>
                    <th className="text-left pb-3 pr-4">Type</th>
                    <th className="text-right pb-3 pr-4">Hours</th>
                    <th className="text-right pb-3 pr-4">Rate</th>
                    <th className="text-right pb-3">Pay received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shifts.map((s) => {
                    const hrs = calcHoursWorked(s.start_time, s.end_time, s.break_minutes ?? 0);
                    const typeKey = s.shift_type as ShiftTypeValue;
                    return (
                      <tr key={s.id} className="text-gray-700">
                        <td className="py-3 pr-4 font-medium text-[#1B3A5C]">
                          {formatDate(s.shift_date)}
                          {s.employer && (
                            <div className="text-xs text-gray-400 font-normal">{s.employer}</div>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {formatTime(s.start_time)} – {formatTime(s.end_time)}
                          {(s.break_minutes ?? 0) > 0 && (
                            <div className="text-xs text-gray-400">{s.break_minutes}m break</div>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${SHIFT_TYPE_COLOURS[typeKey] ?? "bg-gray-100 text-gray-700"}`}>
                            {SHIFT_TYPE_LABELS[typeKey] ?? s.shift_type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">{hrs}h</td>
                        <td className="py-3 pr-4 text-right text-gray-500">
                          {s.base_hourly_rate != null ? `$${s.base_hourly_rate}/hr` : "—"}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {s.actual_pay_received != null
                            ? `$${Number(s.actual_pay_received).toFixed(2)}`
                            : <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 font-semibold text-[#1B3A5C]">
                    <td colSpan={3} className="pt-3 pr-4">Total</td>
                    <td className="pt-3 pr-4 text-right">{totalHoursDisplay}h</td>
                    <td className="pt-3 pr-4"></td>
                    <td className="pt-3 text-right"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-gray-400 text-xs mt-4">
              Showing last 30 shifts. Rate calculations are performed by the AI — use &quot;Ask the AI to check my rates&quot; above.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-3">🕐</div>
            <p className="text-gray-500 font-medium">No shifts logged yet.</p>
            <p className="text-gray-400 text-sm mt-1">Add your first shift above to get started.</p>
          </div>
        )}

        {/* First-shift AI CTA (shown when no shifts yet) */}
        {shifts.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already know your situation?{" "}
              <button onClick={() => { setAiSeedMessage(""); setShowAIChat(true); }} className="text-[#C9A84C] font-semibold hover:underline">
                Ask the AI directly →
              </button>
            </p>
          </div>
        )}

      </div>

      {/* PayChatWidget — rendered when user clicks "Ask the AI" */}
      {showAIChat && (
        <PayChatWidget defaultOpen={true} seedMessage={aiSeedMessage} />
      )}
    </div>
  );
}
