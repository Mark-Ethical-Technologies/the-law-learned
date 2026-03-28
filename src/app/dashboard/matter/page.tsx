"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PeaceSession {
  id: string;
  title: string | null;
  phase: string;
  created_at: string;
  updated_at: string;
}

const PHASE_LABELS: Record<string, string> = {
  preparation: "Preparation",
  engage: "Opening",
  account: "Your Account",
  closure: "Summary",
  evaluation: "Review",
  complete: "Complete",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function phaseBadgeClass(phase: string): string {
  if (phase === "complete") return "bg-green-100 text-green-700";
  if (phase === "closure" || phase === "evaluation") return "bg-[#C9A84C]/10 text-[#C9A84C]";
  return "bg-blue-50 text-blue-600";
}

function isDownloadable(phase: string): boolean {
  return phase === "closure" || phase === "evaluation" || phase === "complete";
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="h-6 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
      <div className="flex gap-3">
        <div className="h-9 bg-gray-100 rounded-xl w-28" />
      </div>
    </div>
  );
}

export default function MatterHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<PeaceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      fetch("/api/peace")
        .then((res) => res.json())
        .then((data: PeaceSession[]) => {
          setSessions(Array.isArray(data) ? data : []);
        })
        .catch(() => setSessions([]))
        .finally(() => setLoading(false));
    });
  }, [router]);

  const downloadMatterPack = async (sessionId: string) => {
    setDownloadingId(sessionId);
    try {
      const res = await fetch("/api/matter-pack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `matter-pack-${sessionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not generate PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Nav */}
      <nav className="bg-[#1B3A5C] border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm">
              FW
            </div>
            <span className="text-white font-bold">Fair Work Help</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-white/40 hover:text-white text-sm transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumb + heading row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/dashboard"
              className="text-[#1B3A5C]/50 hover:text-[#1B3A5C] text-sm font-medium transition-colors"
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#1B3A5C] mt-1">Matter Interviews</h1>
          </div>
          <Link
            href="/dashboard/matter/new"
            className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shrink-0"
          >
            + New Interview
          </Link>
        </div>

        {/* Privilege notice */}
        <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-xl px-5 py-3 mb-8">
          <p className="text-[#C9A84C] text-xs text-center">
            All interviews are privileged — conducted for the dominant purpose of preparation for legal proceedings.
            (<em>Esso Australia Resources v Commissioner of Taxation</em> [1999] HCA 67)
          </p>
        </div>

        {/* Session list */}
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-16 text-center">
            <div className="text-4xl mb-4">🎙️</div>
            <h2 className="text-lg font-bold text-[#1B3A5C] mb-2">
              You haven&apos;t started any interviews yet
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              A PEACE cognitive interview helps you document your workplace matter in a structured,
              privileged format ready for legal review.
            </p>
            <Link
              href="/dashboard/matter/new"
              className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8963e] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
            >
              Start your first interview →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1B3A5C] text-base truncate">
                      {session.title || "Untitled interview"}
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Started {formatDate(session.created_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${phaseBadgeClass(session.phase)}`}
                  >
                    {PHASE_LABELS[session.phase] ?? session.phase}
                  </span>
                </div>

                <p className="text-gray-400 text-xs mb-4">
                  Last updated {formatDate(session.updated_at)}
                </p>

                <div className="flex flex-wrap gap-3">
                  {!isDownloadable(session.phase) && (
                    <Link
                      href={`/dashboard/matter/new?session=${session.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#1B3A5C] hover:bg-[#152d47] text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                    >
                      Continue →
                    </Link>
                  )}
                  {isDownloadable(session.phase) && (
                    <>
                      <Link
                        href={`/dashboard/matter/new?session=${session.id}`}
                        className="inline-flex items-center gap-1.5 border border-[#1B3A5C]/20 hover:border-[#1B3A5C]/40 text-[#1B3A5C] font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                      >
                        View interview →
                      </Link>
                      <button
                        onClick={() => downloadMatterPack(session.id)}
                        disabled={downloadingId === session.id}
                        className="inline-flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#b8963e] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                      >
                        {downloadingId === session.id ? "Generating PDF..." : "Download Matter Pack →"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
