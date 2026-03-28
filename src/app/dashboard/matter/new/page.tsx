"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  phase?: string;
}

const PHASE_LABELS: Record<string, string> = {
  preparation: "Preparation",
  engage: "Opening",
  account: "Your Account",
  closure: "Summary",
  evaluation: "Review",
  complete: "Complete",
};

const OPENING_MESSAGE = `Welcome. I'm here to help you document your workplace matter in a structured way.

This is a confidential interview conducted in preparation for potential legal professional review. Everything you share here is protected under the dominant purpose of preparing for legal proceedings — this is not a public record.

My job is to ask you questions and help you build a clear, complete account of what happened. I won't be giving legal advice, but I will help make sure the important details are captured properly.

Before we begin — is there anything you'd like to know about how this works, or are you ready to start?`;

export default function PeaceInterviewPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: OPENING_MESSAGE, phase: "engage" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phase, setPhase] = useState("engage");
  const [authed, setAuthed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth/login");
      else setAuthed(true);
    });
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/peace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, phase }),
      });
      const data = await res.json() as { sessionId: string; message: string; phase: string };
      setSessionId(data.sessionId);
      setPhase(data.phase);
      setMessages([...newMessages, { role: "assistant", content: data.message, phase: data.phase }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again.", phase }]);
    } finally {
      setLoading(false);
    }
  };

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">
      {/* Nav */}
      <nav className="bg-[#1B3A5C] border-b border-white/10 px-6 py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard")} className="text-white/40 hover:text-white text-sm transition-colors">← Dashboard</button>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold text-sm">Matter Interview</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full">
              Phase: <span className="text-[#C9A84C] font-semibold">{PHASE_LABELS[phase] ?? phase}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Privilege banner */}
      <div className="bg-[#C9A84C]/10 border-b border-[#C9A84C]/20 px-6 py-2 shrink-0">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#C9A84C] text-xs text-center">
            This interview is privileged — conducted for the dominant purpose of preparation for legal proceedings. (<em>Esso Australia Resources v Commissioner of Taxation</em> [1999] HCA 67)
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 bg-[#1B3A5C] rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3 shrink-0 mt-1">AI</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#1B3A5C] text-white rounded-tr-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-[#1B3A5C] rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3 shrink-0">AI</div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                <div className="flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Type your response... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B3A5C] transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="bg-[#1B3A5C] hover:bg-[#C9A84C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 rounded-xl transition-all shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-center text-gray-400 text-xs mt-2">
          Legal education platform. Does not constitute legal advice.
        </p>
      </div>
    </div>
  );
}
