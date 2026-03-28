"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE = `G'day — I'm your Fair Work pay calculator. No forms, no jargon, just answers.

Tell me what you do at work and I'll tell you what you should be paid. For example:

*"I'm a security guard at a pub in Perth, I work Friday nights and Sunday arvo"*

*"I work in a café, my boss pays me the same rate every day including public holidays"*

*"I drive a forklift in a warehouse on night shift"*

What's your situation?`;

export default function PayChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    if (assistantMessages.length >= 2 && !emailSent) {
      setShowEmailCapture(true);
    }
  }, [messages, emailSent]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
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

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, something went wrong. Please try again in a moment." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), sector: "chat-capture" }),
      });
    } catch {
      // silent
    }
    setEmailSent(true);
    setShowEmailCapture(false);
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, i, arr) => {
      const parts = line.split(/(\*[^*]+\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
              <em key={j} className="italic text-gray-200">{part.slice(1, -1)}</em>
            ) : (
              part
            )
          )}
          {i < arr.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#C9A84C] text-[#1B3A5C] px-5 py-3 rounded-full shadow-2xl hover:bg-[#d4b860] transition-all duration-200 font-semibold text-sm"
          aria-label="Check my pay"
        >
          <span className="text-lg">💬</span>
          <span>Check my pay</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-0 right-0 z-50 flex flex-col w-full sm:w-[420px] sm:bottom-6 sm:right-6 sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ height: "min(620px, 100dvh)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#1B3A5C] border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-sm flex-shrink-0">
                FW
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Fair Work Pay Check</p>
                <p className="text-[#C9A84C] text-xs">Free · No account needed</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-[#152d47] px-4 py-4 space-y-4">
            {/* Welcome */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-1">
                FW
              </div>
              <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-100 leading-relaxed max-w-[85%]">
                {formatMessage(WELCOME_MESSAGE)}
              </div>
            </div>

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-1">
                    FW
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-[#C9A84C] text-[#1B3A5C] font-medium rounded-tr-sm"
                      : "bg-white/10 text-gray-100 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#1B3A5C] font-bold text-xs flex-shrink-0 mt-1">
                  FW
                </div>
                <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Email capture */}
            {showEmailCapture && !emailSent && (
              <div className="bg-[#C9A84C]/20 border border-[#C9A84C]/40 rounded-2xl p-4">
                <p className="text-sm text-white font-medium mb-1">Want me to email you this analysis?</p>
                <p className="text-xs text-gray-400 mb-3">Free · No spam · Unsubscribe anytime</p>
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#C9A84C]"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#C9A84C] text-[#1B3A5C] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4b860] transition-colors"
                  >
                    Send
                  </button>
                </form>
                <button onClick={() => setShowEmailCapture(false)} className="text-xs text-gray-500 mt-2 hover:text-gray-400">
                  No thanks
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-[#1B3A5C] border-t border-white/10 px-4 py-3 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your job and shifts…"
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
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-[#C9A84C] text-[#1B3A5C] p-3 rounded-xl hover:bg-[#d4b860] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M15.75 9L2.25 2.25L5.625 9L2.25 15.75L15.75 9Z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Legal education, not legal advice ·{" "}
              <a href="https://www.fairwork.gov.au" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400">
                fairwork.gov.au
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
