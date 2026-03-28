"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/profile/setup";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(errorParam || "");
  const supabase = createClient();

  useEffect(() => {
    if (errorParam === "auth_failed") setError("Sign-in failed. Please try again.");
  }, [errorParam]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleApple = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#1B3A5C] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#C9A84C] rounded-xl flex items-center justify-center text-white font-bold">FW</div>
          <div>
            <div className="text-white font-bold text-xl">Fair Work Help</div>
            <div className="text-white/40 text-xs">by Ethical Technologies</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-white font-bold text-xl mb-2">Check your inbox</h2>
              <p className="text-white/60 text-sm mb-6">
                We sent a sign-in link to <strong className="text-white">{email}</strong>.
                Click it to continue — no password needed.
              </p>
              <p className="text-white/30 text-xs">Didn&apos;t get it? Check spam, or{" "}
                <button onClick={() => setSent(false)} className="text-[#C9A84C] hover:underline">try again</button>.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-white font-bold text-2xl mb-2">Create your free account</h1>
              <p className="text-white/50 text-sm mb-6">
                Save your conversation, upload documents, and build your case — all in one place.
              </p>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Social sign-in */}
              <div className="space-y-3 mb-6">
                <button onClick={handleGoogle} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button onClick={handleApple} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs">or use email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email magic link */}
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <input type="email" required placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl focus:outline-none focus:border-[#C9A84C] transition-colors" />
                <button type="submit" disabled={loading}
                  className="w-full bg-[#C9A84C] hover:bg-[#b8963e] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all">
                  {loading ? "Sending link..." : "Send sign-in link →"}
                </button>
              </form>

              <p className="text-white/25 text-xs text-center mt-6 leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="/privacy" className="underline hover:text-white/50">Privacy Policy</a> and{" "}
                <a href="/terms" className="underline hover:text-white/50">Terms of Use</a>.
                We comply with Australian Privacy Principles (APP) under the Privacy Act 1988.
              </p>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back to Fair Work Help</a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1B3A5C]" />}>
      <LoginForm />
    </Suspense>
  );
}
