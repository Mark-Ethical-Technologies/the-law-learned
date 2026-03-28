"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

interface ContentBlock {
  type: "text" | "image";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

interface MatterPackForm {
  name: string;
  email: string;
  employer: string;
}

const WELCOME_MESSAGE = `G'day — I'm the Fair Work Help assistant.

Tell me what you do and roughly what you're being paid. I'll let you know whether it looks right, and what's worth looking into further.

What's your situation?`;

interface PayChatWidgetProps {
  defaultOpen?: boolean;
  seedMessage?: string;
}

export default function PayChatWidget({ defaultOpen, seedMessage }: PayChatWidgetProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  const seededRef = useRef(false);

  // Email capture
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [captureEmail, setCaptureEmail] = useState("");

  // Matter Pack flow
  const [showMatterPack, setShowMatterPack] = useState(false);
  const [matterPackStep, setMatterPackStep] = useState<"form" | "sent">("form");
  const [matterPackForm, setMatterPackForm] = useState<MatterPackForm>({ name: "", email: "", employer: "" });
  const [matterPackSummary, setMatterPackSummary] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showMatterPack]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Seed the input with a pre-filled message (once) when the widget opens
  useEffect(() => {
    if (isOpen && seedMessage && !seededRef.current) {
      setInput(seedMessage);
      seededRef.current = true;
    }
  }, [isOpen, seedMessage]);

  // Show email capture after 2nd assistant response
  useEffect(() => {
    const count = messages.filter((m) => m.role === "assistant").length;
    if (count >= 2 && !emailCaptured) setShowEmailCapture(true);
  }, [messages, emailCaptured]);

  // Check if latest assistant message suggests Matter Pack
  useEffect(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    const text = typeof last.content === "string" ? last.content : "";
    if ((text.includes("Matter Pack") || text.includes("$299")) && !showMatterPack && matterPackStep === "form") {
      // Don't auto-show — let the button in the message trigger it
    }
  }, [messages, showMatterPack, matterPackStep]);

  const sendMessage = async (extraContent?: ContentBlock[]) => {
    const textContent = input.trim();
    if (!textContent && !extraContent) return;
    if (isLoading) return;

    let userContent: string | ContentBlock[];
    if (extraContent) {
      userContent = [
        ...(textContent ? [{ type: "text" as const, text: textContent }] : []),
        ...extraContent,
      ];
    } else {
      userContent = textContent;
    }

    const userMessage: Message = { role: "user", content: userContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed");
      const data = await response.json();

      // Extract summary from last few messages for Matter Pack context
      const recentText = newMessages
        .slice(-4)
        .map((m) => (typeof m.content === "string" ? m.content : ""))
        .join(" ")
        .slice(0, 500);
      setMatterPackSummary(recentText);

      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File too large. Please upload files under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

      const imageBlock: ContentBlock = {
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      };

      const prefix = input.trim()
        ? input.trim()
        : `I've uploaded a document — please analyse this ${file.name.toLowerCase().includes("roster") ? "roster" : file.name.toLowerCase().includes("contract") ? "employment contract" : "payslip"} and tell me what you find.`;

      setInput("");
      await sendMessage([...( prefix ? [{ type: "text" as const, text: prefix }] : []), imageBlock]);
    };

    if (file.type === "application/pdf") {
      // For PDFs, we tell the user to convert — Claude vision needs images
      const msg: Message = {
        role: "assistant",
        content: "I can see you've uploaded a PDF. For the best analysis, please take a screenshot of the payslip or roster and upload that instead — I can read images directly. Alternatively, you can copy and paste the key details (hours, rates, dates) into the chat.",
      };
      setMessages((prev) => [...prev, msg]);
      return;
    }

    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: captureEmail.trim(), sector: "chat-analysis" }),
      });
    } catch { /* silent */ }
    setEmailCaptured(true);
    setShowEmailCapture(false);
  };

  const handleMatterPackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/matter-pack-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: matterPackForm.name,
          email: matterPackForm.email,
          employer: matterPackForm.employer,
          summary: matterPackSummary,
        }),
      });
      setMatterPackStep("sent");
    } catch {
      setMatterPackStep("sent");
    }
  };

  const renderText = (content: string) => {
    return content.split("\n").map((line, i, arr) => (
      <span key={i}>
        {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**"))
            return <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
          if (part.startsWith("*") && part.endsWith("*"))
            return <em key={j} className="italic text-gray-200">{part.slice(1, -1)}</em>;
          return part;
        })}
        {i < arr.length - 1 && <br />}
      </span>
    ));
  };

  const hasMatterPackKeywords = (content: string) =>
    content.includes("Matter Pack") || content.includes("$299") || content.includes("build a proper file");

  return (
    <>
      {/* Trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#C9A84C] text-[#1B3A5C] px-5 py-3 rounded-full shadow-2xl hover:bg-[#d4b860] transition-all duration-200 font-semibold text-sm"
        >
          <span className="text-lg">💬</span>
          <span>Check my pay</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-0 right-0 z-50 flex flex-col w-full sm:w-[420px] sm:bottom-6 sm:right-6 sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ height: "min(640px, 100dvh)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1B3A5C] border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-sm">
                FW
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Fair Work Pay Check</p>
                <p className="text-[#C9A84C] text-xs">Free check · All industries · No account needed</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white p-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-[#152d47] px-4 py-4 space-y-4">
            {/* Welcome */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-1">FW</div>
              <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-100 leading-relaxed max-w-[85%]">
                {renderText(WELCOME_MESSAGE)}
              </div>
            </div>

            {/* Conversation */}
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const textContent = typeof msg.content === "string"
                ? msg.content
                : msg.content.find((b): b is ContentBlock & { type: "text" } => b.type === "text")?.text || "";
              const hasImage = Array.isArray(msg.content) && msg.content.some((b) => b.type === "image");

              return (
                <div key={i} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-1">FW</div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] ${
                    isUser ? "bg-[#C9A84C] text-[#1B3A5C] font-medium rounded-tr-sm" : "bg-white/10 text-gray-100 rounded-tl-sm"
                  }`}>
                    {hasImage && <p className="text-xs opacity-70 mb-1">📎 Document uploaded</p>}
                    {textContent && (isUser ? textContent : renderText(textContent))}
                    {/* Matter Pack CTA */}
                    {!isUser && hasMatterPackKeywords(textContent) && !showMatterPack && matterPackStep === "form" && (
                      <button
                        onClick={() => setShowMatterPack(true)}
                        className="mt-3 w-full bg-[#C9A84C] text-[#1B3A5C] py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#d4b860] transition-colors"
                      >
                        Yes — get my Matter Pack →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-1">FW</div>
                <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Email capture */}
            {showEmailCapture && !emailCaptured && (
              <div className="bg-[#C9A84C]/15 border border-[#C9A84C]/30 rounded-2xl p-4">
                <p className="text-sm text-white font-medium mb-1">Want a copy of this analysis?</p>
                <p className="text-xs text-gray-400 mb-3">We&apos;ll email it to you. Free, no spam.</p>
                <form onSubmit={handleEmailCapture} className="flex gap-2">
                  <input
                    type="email"
                    value={captureEmail}
                    onChange={(e) => setCaptureEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C9A84C]"
                    required
                  />
                  <button type="submit" className="bg-[#C9A84C] text-[#1B3A5C] px-3 py-2 rounded-lg text-sm font-semibold">Send</button>
                </form>
                <button onClick={() => setShowEmailCapture(false)} className="text-xs text-gray-500 mt-2 hover:text-gray-400">No thanks</button>
              </div>
            )}

            {/* Matter Pack form */}
            {showMatterPack && (
              <div className="bg-[#1B3A5C] border border-[#C9A84C]/40 rounded-2xl p-4">
                {matterPackStep === "form" ? (
                  <>
                    <p className="text-white font-semibold text-sm mb-1">Matter Pack — $299</p>
                    <p className="text-gray-400 text-xs mb-4">Full file: chronology, entitlements calculation, demand letter. We&apos;ll be in touch personally.</p>
                    <form onSubmit={handleMatterPackSubmit} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={matterPackForm.name}
                        onChange={(e) => setMatterPackForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C9A84C]"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Your email address"
                        value={matterPackForm.email}
                        onChange={(e) => setMatterPackForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C9A84C]"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Employer name (optional)"
                        value={matterPackForm.employer}
                        onChange={(e) => setMatterPackForm((f) => ({ ...f, employer: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C9A84C]"
                      />
                      <button type="submit" className="w-full bg-[#C9A84C] text-[#1B3A5C] py-2 rounded-lg text-sm font-bold hover:bg-[#d4b860] transition-colors">
                        Send me the payment link →
                      </button>
                    </form>
                    <button onClick={() => setShowMatterPack(false)} className="text-xs text-gray-500 mt-2 hover:text-gray-400">Cancel</button>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-white font-semibold text-sm">Payment link sent to {matterPackForm.email}</p>
                    <p className="text-gray-400 text-xs mt-1">Once payment is made, you&apos;ll hear from us personally within 24 hours to start building your file.</p>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-[#1B3A5C] border-t border-white/10 px-4 py-3 flex-shrink-0">
            <div className="flex gap-2 items-end">
              {/* File upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-white/50 hover:text-[#C9A84C] transition-colors p-2 flex-shrink-0"
                title="Upload payslip, roster or timesheet"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 16l3-3m0 0l3-3m-3 3h8M4 8V5a1 1 0 011-1h5l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1v-3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = "";
                }}
              />

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your job and shifts… or upload a payslip"
                rows={1}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C9A84C] resize-none leading-relaxed"
                style={{ maxHeight: "120px" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="bg-[#C9A84C] text-[#1B3A5C] p-3 rounded-xl hover:bg-[#d4b860] transition-colors disabled:opacity-40 flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M15.75 9L2.25 2.25L5.625 9L2.25 15.75L15.75 9Z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Legal education, not legal advice ·{" "}
              <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">fairwork.gov.au</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
