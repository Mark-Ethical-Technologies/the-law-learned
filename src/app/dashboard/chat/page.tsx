"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface TextBlock {
  type: "text";
  text: string;
}

interface ImageBlock {
  type: "image";
  source: { type: "base64"; media_type: string; data: string };
}

type ContentBlock = TextBlock | ImageBlock;

interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

const WELCOME = `G'day — I'm the Fair Work Help assistant.

Tell me what you do, who you work for, and roughly what you're paid. Upload a payslip or roster if you have one. I'll tell you whether it looks right — and what's worth looking into further.

What's your situation?`;

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={j} className="italic text-slate-300">{part.slice(1, -1)}</em>;
        return <span key={j}>{part}</span>;
      })}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

export default function ChatPage() {
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [tier, setTier] = useState<string>("free");
  const [isDragging, setIsDragging] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ name: string; block: ImageBlock } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login?redirect=/dashboard/chat"); return; }
      supabase.from("profiles").select("first_name, subscription_tier").eq("id", user.id).single()
        .then(({ data }) => {
          if (data?.first_name) setFirstName(data.first_name);
          if (data?.subscription_tier) setTier(data.subscription_tier);
        });
    });
  }, [supabase, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (overrideContent?: ContentBlock[]) => {
    const text = input.trim();
    if (!text && !overrideContent && !pendingImage) return;
    if (isLoading) return;

    let userContent: string | ContentBlock[];
    if (overrideContent) {
      userContent = overrideContent;
    } else if (pendingImage) {
      userContent = [
        ...(text ? [{ type: "text" as const, text }] : [{ type: "text" as const, text: `I've uploaded a document — please analyse this ${pendingImage.name}.` }]),
        pendingImage.block,
      ];
    } else {
      userContent = text;
    }

    const userMessage: Message = { role: "user", content: userContent };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setPendingImage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.message }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, messages, isLoading, pendingImage]);

  const processFile = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert("File must be under 5MB."); return; }
    if (file.type === "application/pdf") {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I can see you've uploaded a PDF. For best results, take a screenshot of the payslip and upload that image — I can read images directly. Or paste the key details (hours, rates, dates) into the chat.",
      }]);
      return;
    }
    if (!file.type.startsWith("image/")) { alert("Please upload an image file (JPG, PNG, WEBP) or PDF."); return; }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      const block: ImageBlock = { type: "image", source: { type: "base64", media_type: file.type, data: base64 } };
      const label = file.name.toLowerCase().includes("roster") ? "roster"
        : file.name.toLowerCase().includes("contract") ? "contract"
        : "payslip";
      setPendingImage({ name: label, block });
      inputRef.current?.focus();
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const textContent = (msg: Message) =>
    typeof msg.content === "string" ? msg.content
      : (msg.content as ContentBlock[]).find((b): b is TextBlock => b.type === "text")?.text ?? "";

  const hasImage = (msg: Message) =>
    Array.isArray(msg.content) && (msg.content as ContentBlock[]).some(b => b.type === "image");

  return (
    <div className="flex h-screen bg-[#0D1B2A] text-white overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A1520] border-r border-white/8 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">FW</div>
          <span className="text-white font-bold text-sm">Fair Work Help</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 6l6-4 6 4v8H10v-4H6v4H2V6z"/>
            </svg>
            Dashboard
          </a>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M14 2H2v10l3-2h9V2z"/>
            </svg>
            Chat
          </div>
          <a href="/dashboard/matter" className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
            </svg>
            Matter Interviews
          </a>
          <a href="/awards" className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M5 6h6M5 9h4"/>
            </svg>
            Award Guides
          </a>
        </nav>

        {/* Upgrade CTA */}
        {tier === "free" && (
          <div className="mx-3 mb-4 bg-[#1B3A5C] rounded-xl p-4 border border-[#C9A84C]/20">
            <p className="text-[#C9A84C] text-xs font-semibold mb-1">Free plan</p>
            <p className="text-white text-xs mb-3 leading-relaxed">Upgrade for payslip analysis, full calculation, and PEACE interview.</p>
            <a href="/#pricing" className="block text-center bg-[#C9A84C] hover:bg-[#b8963e] text-white text-xs font-bold px-3 py-2 rounded-lg transition-all">
              Upgrade to Plus →
            </a>
          </div>
        )}

        {/* User */}
        <div className="border-t border-white/8 px-4 py-3 flex items-center justify-between">
          <span className="text-white/50 text-xs">{firstName ?? "You"}</span>
          <form action="/auth/signout" method="post">
            <button className="text-white/30 hover:text-white/60 text-xs transition-colors">Sign out</button>
          </form>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div
        ref={dropZoneRef}
        className={`flex-1 flex flex-col relative transition-all ${isDragging ? "bg-[#C9A84C]/5 ring-2 ring-inset ring-[#C9A84C]/40" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0A1520] flex-shrink-0">
          <a href="/dashboard" className="text-white/50 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 10H5M10 5l-5 5 5 5"/>
            </svg>
          </a>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#C9A84C] rounded-md flex items-center justify-center text-white font-bold text-xs">FW</div>
            <span className="text-white font-semibold text-sm">Fair Work Help</span>
          </div>
          <div className="w-5" />
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-[#1B3A5C] border-2 border-dashed border-[#C9A84C] rounded-2xl px-12 py-8 text-center">
              <div className="text-4xl mb-3">📎</div>
              <p className="text-white font-bold">Drop your payslip here</p>
              <p className="text-white/50 text-sm mt-1">JPG, PNG or WEBP</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="max-w-3xl mx-auto w-full space-y-6">

            {/* Welcome message */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-0.5">FW</div>
              <div className="flex-1 bg-[#1B3A5C]/60 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-slate-200 leading-relaxed">
                {renderMarkdown(WELCOME)}
              </div>
            </div>

            {/* Conversation */}
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const text = textContent(msg);
              const imgAttached = hasImage(msg);

              return (
                <div key={i} className={`flex gap-3 items-start ${isUser ? "flex-row-reverse" : ""}`}>
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 mt-0.5">
                      {firstName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-0.5">FW</div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#C9A84C] text-[#1B3A5C] font-medium rounded-tr-sm"
                      : "bg-[#1B3A5C]/60 text-slate-200 rounded-tl-sm"
                  }`}>
                    {imgAttached && (
                      <div className="flex items-center gap-2 mb-2 opacity-70 text-xs">
                        <span>📎</span><span>Document attached</span>
                      </div>
                    )}
                    {isUser ? text : renderMarkdown(text)}
                    {/* PEACE interview CTA */}
                    {!isUser && (text.includes("account") || text.includes("premium") || text.includes("create")) && i === messages.length - 1 && (
                      <a href="/dashboard/matter/new" className="mt-4 flex items-center gap-2 bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all w-fit">
                        <span>🎙️</span> Start a PEACE interview — document your situation →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-0.5">FW</div>
                <div className="bg-[#1B3A5C]/60 rounded-2xl rounded-tl-sm px-5 py-4">
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 160, 320].map(d => (
                      <span key={d} className="w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input area ── */}
        <div className="border-t border-white/8 bg-[#0A1520] px-4 py-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">

            {/* Pending image indicator */}
            {pendingImage && (
              <div className="flex items-center gap-2 mb-3 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-xl px-4 py-2.5">
                <span className="text-[#C9A84C] text-sm">📎</span>
                <span className="text-[#C9A84C] text-sm font-medium flex-1">{pendingImage.name} ready to send</span>
                <button onClick={() => setPendingImage(null)} className="text-white/40 hover:text-white/70 text-xs">✕ Remove</button>
              </div>
            )}

            <div className="flex gap-3 items-end">
              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload payslip, roster or timesheet"
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-[#C9A84C] transition-all border border-white/10"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 2v10M5 6l4-4 4 4M3 14h12"/>
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
              />

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={pendingImage ? "Add a note about this document, or press Enter to send…" : "Describe your job, pay, or situation — or drag a payslip here…"}
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-white/5 border border-white/10 focus:border-[#C9A84C]/60 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none resize-none leading-relaxed transition-colors"
                style={{ maxHeight: "160px" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 160) + "px";
                }}
              />

              {/* Send button */}
              <button
                onClick={() => sendMessage()}
                disabled={(!input.trim() && !pendingImage) || isLoading}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#C9A84C] hover:bg-[#b8963e] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14 8L2 2l2.5 6L2 14l12-6z"/>
                </svg>
              </button>
            </div>

            <p className="text-center text-xs text-white/20 mt-3">
              Legal education, not legal advice · Press Shift+Enter for new line ·{" "}
              <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 underline underline-offset-2 transition-colors">fairwork.gov.au</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
