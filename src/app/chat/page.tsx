"use client";

import { useState, useRef, useEffect, useCallback, Suspense, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import { SUGGESTED_QUESTIONS } from "@/lib/shiva-knowledge";
import { GITA_SUGGESTED_QUESTIONS } from "@/lib/gita-knowledge";
import { VEDA_SUGGESTED_QUESTIONS } from "@/lib/veda-knowledge";
import { BUDDHA_SUGGESTED_QUESTIONS } from "@/lib/buddha-knowledge";
import { CHRISTIANITY_SUGGESTED_QUESTIONS } from "@/lib/christianity-knowledge";
import { QURAN_SUGGESTED_QUESTIONS } from "@/lib/quran-knowledge";
import { JAINISM_SUGGESTED_QUESTIONS } from "@/lib/jainism-knowledge";
import { ALL_KNOWLEDGE_SUGGESTED_QUESTIONS } from "@/lib/all-knowledge";
import { SIKH_SUGGESTED_QUESTIONS } from "@/lib/sikh-knowledge";
import { TORAH_SUGGESTED_QUESTIONS } from "@/lib/torah-knowledge";
import { TAO_SUGGESTED_QUESTIONS } from "@/lib/tao-knowledge";
import { TABS, TabId } from "@/lib/tab-config";
import { parseInline, toSafeHtml, escapeHtml } from "@/lib/format";
import { loadConversation, saveConversation, clearConversation } from "@/lib/storage";

type Message = { role: "user" | "assistant"; content: string };

function getQuestions(tab: TabId) {
  switch (tab) {
    case "shiv": return SUGGESTED_QUESTIONS;
    case "gita": return GITA_SUGGESTED_QUESTIONS;
    case "veda": return VEDA_SUGGESTED_QUESTIONS;
    case "buddha": return BUDDHA_SUGGESTED_QUESTIONS;
    case "christ": return CHRISTIANITY_SUGGESTED_QUESTIONS;
    case "quran": return QURAN_SUGGESTED_QUESTIONS;
    case "jain": return JAINISM_SUGGESTED_QUESTIONS;
    case "sikh": return SIKH_SUGGESTED_QUESTIONS;
    case "torah": return TORAH_SUGGESTED_QUESTIONS;
    case "tao": return TAO_SUGGESTED_QUESTIONS;
    case "all": return ALL_KNOWLEDGE_SUGGESTED_QUESTIONS;
    default: return SUGGESTED_QUESTIONS;
  }
}

function renderInline(line: string, lineKey: number) {
  const segments = parseInline(line);
  return segments.map((seg, i) => {
    const k = `${lineKey}-${i}`;
    if (seg.type === "bold") return <strong key={k} className="text-white">{seg.content}</strong>;
    if (seg.type === "italic") return <em key={k}>{seg.content}</em>;
    if (seg.type === "code") return (
      <code key={k} className="px-1.5 py-0.5 rounded bg-white/10 text-[0.9em] font-mono">{seg.content}</code>
    );
    if (seg.type === "link" && seg.href) return (
      <a
        key={k}
        href={seg.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-dotted hover:opacity-80"
        style={{ color: "var(--tab-primary-light)" }}
      >
        {seg.content}
      </a>
    );
    return <Fragment key={k}>{seg.content}</Fragment>;
  });
}

function formatMessage(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <div key={i} className="h-2" />;
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="text-lg font-semibold mt-4 mb-2 gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
          {renderInline(line.slice(4), i)}
        </h3>
      );
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="text-xl font-bold mt-6 mb-3 gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
          {renderInline(line.slice(3), i)}
        </h2>
      );
    if (line.startsWith("- "))
      return (
        <div key={i} className="flex items-start gap-2 ml-4 mb-1">
          <span className="text-[var(--tab-primary)] mt-1">{"•"}</span>
          <span>{renderInline(line.slice(2), i)}</span>
        </div>
      );
    return <p key={i} className="mb-2">{renderInline(line, i)}</p>;
  });
}

const VALID_TABS = new Set<TabId>([
  "shiv", "gita", "veda", "buddha", "christ", "quran",
  "jain", "sikh", "torah", "tao", "all",
]);

function isValidTab(t: string | null): t is TabId {
  return t !== null && VALID_TABS.has(t as TabId);
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialTab: TabId = isValidTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as TabId)
    : "shiv";
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQueryHandled = useRef(false);

  const tab = TABS[activeTab];
  const questions = getQuestions(activeTab);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollTo({ top: messagesEndRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  // Update document title per tab so browser tabs are distinguishable.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${tab.name} — ${tab.tagline}`;
    }
  }, [tab.name, tab.tagline]);

  // Load persisted conversation when tab changes (but skip the very first
  // load when ?q= is provided — we don't want to clobber the incoming query).
  useEffect(() => {
    if (!initialQueryHandled.current && searchParams.get("q")) {
      return; // wait for the initial query effect below
    }
    const stored = loadConversation(activeTab);
    setMessages(stored);
    setStreamingContent("");
    setErrorMessage(null);
  }, [activeTab, searchParams]);

  // Persist conversations whenever messages change.
  useEffect(() => {
    if (messages.length > 0) {
      saveConversation(activeTab, messages);
    }
  }, [messages, activeTab]);

  const sendMessage = useCallback(async (text: string, tabOverride?: TabId, replaceLastAssistant = false) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    setErrorMessage(null);
    setInput("");
    const targetTab = tabOverride || activeTab;

    // Build the message list we'll send. If replaceLastAssistant is true (regenerate),
    // we drop the last assistant turn but keep its preceding user prompt.
    const baseMessages: Message[] = replaceLastAssistant
      ? (() => {
          const copy = [...messages];
          if (copy.length && copy[copy.length - 1].role === "assistant") copy.pop();
          return copy;
        })()
      : [...messages, { role: "user" as const, content: trimmed }];

    setMessages(baseMessages);
    setTimeout(scrollToBottom, 0);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: baseMessages,
          tab: targetTab,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullContent += chunk;
          setStreamingContent(fullContent);
          scrollToBottom();
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setStreamingContent("");
    } finally {
      setLoading(false);
    }
  }, [activeTab, messages, scrollToBottom]);

  // Auto-send initial query from ?q= once.
  useEffect(() => {
    if (initialQueryHandled.current) return;
    const q = searchParams.get("q");
    const tabParam = searchParams.get("tab");
    if (isValidTab(tabParam)) setActiveTab(tabParam);
    if (q) {
      initialQueryHandled.current = true;
      // Reset prior conversation when arriving with a fresh question.
      setMessages([]);
      sendMessage(q, isValidTab(tabParam) ? tabParam : "shiv");
    } else {
      initialQueryHandled.current = true;
    }
    // We intentionally only run this once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus input when not loading.
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading, activeTab]);

  const handleCopyMessage = (content: string, msgIndex: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(msgIndex);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const handleShare = (content: string, question: string, msgIndex: number) => {
    const text = `${question}\n\n${content}\n\nShared from ${tab.name} — ${tab.domain}`;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === "function") {
      nav.share({ title: `${tab.name} Wisdom`, text, url: window.location.href })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedShareId(msgIndex);
        setTimeout(() => setCopiedShareId(null), 1500);
      });
    }
  };

  const handleExportPDF = (content: string, question: string) => {
    const w = window.open("", "_blank");
    if (!w) return;
    const title = escapeHtml(`${tab.name} - ${question.slice(0, 50)}`);
    const safeQuestion = escapeHtml(question);
    const safeContentHtml = toSafeHtml(content);
    const safeTabName = escapeHtml(tab.name);
    const safeSymbol = escapeHtml(tab.symbol);
    const safeDomain = escapeHtml(tab.domain);
    const color = tab.color;
    const dateStr = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;color:#1a1a2e;padding:50px 60px;max-width:900px;margin:auto}.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid ${color}}.header .symbol{font-size:42px;margin-bottom:8px}.header .title{font-size:26px;font-weight:bold;color:${color}}.question{color:#555;font-style:italic;font-size:16px;margin-bottom:25px;padding:15px;background:#f8f8f8;border-left:4px solid ${color};border-radius:0 8px 8px 0}.answer{line-height:1.9;font-size:15px;word-wrap:break-word}.answer h1,.answer h2,.answer h3{color:${color};margin:18px 0 10px}.answer code{background:#f1f1f1;padding:2px 6px;border-radius:4px;font-family:Menlo,monospace;font-size:0.9em}.footer{margin-top:50px;padding-top:20px;border-top:1px solid #ddd;color:#999;font-size:12px;text-align:center}@media print{body{padding:30px 40px}@page{margin:1.5cm}}</style></head><body><div class="header"><div class="symbol">${safeSymbol}</div><div class="title">${safeTabName}</div></div><div class="question">Q: ${safeQuestion}</div><div class="answer">${safeContentHtml}</div><div class="footer"><p>Generated by ${safeTabName} &mdash; ${safeDomain}</p><p>${escapeHtml(dateStr)}</p></div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const handleNewChat = () => {
    setMessages([]);
    setStreamingContent("");
    setErrorMessage(null);
    clearConversation(activeTab);
    inputRef.current?.focus();
  };

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    sendMessage(lastUser.content, activeTab, true);
  };

  const handleRetry = () => {
    setErrorMessage(null);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) sendMessage(lastUser.content, activeTab, false);
  };

  return (
    <div className="min-h-screen flex flex-col" data-tab={activeTab}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-gray-800/50 glass">
        <a href={`/?tab=${activeTab}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-2xl om-glow" style={{ fontFamily: "'Cinzel', serif" }}>
            {tab.symbol}
          </div>
          <span className="text-lg font-semibold gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            {tab.name}
          </span>
        </a>

        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide" aria-label="Wisdom tradition">
          {(Object.keys(TABS) as TabId[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`tab-btn ${activeTab === t ? "active" : ""}`}
              data-tab={t}
              aria-pressed={activeTab === t}
              aria-label={TABS[t].name}
            >
              <span className="mr-1">{TABS[t].symbol}</span>
              <span className="hidden sm:inline">{TABS[t].name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleNewChat}
          className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
        >
          New Chat
        </button>
      </header>

      {/* Messages */}
      <div
        ref={messagesEndRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        {messages.length === 0 && !streamingContent && !errorMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center pt-20">
            <div className="text-6xl mb-4 om-glow" style={{ fontFamily: "'Cinzel', serif" }}>
              {tab.symbol}
            </div>
            <h2 className="text-2xl font-bold gradient-text mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
              Ask {tab.name}
            </h2>
            <p className="text-gray-500 mb-8">{tab.tagline}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {questions.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q, activeTab)}
                  className="glass p-3 rounded-xl text-left text-sm text-gray-400 hover:text-white transition-all"
                >
                  <span style={{ color: "var(--tab-primary)" }} className="mr-2">{"→"}</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === "assistant" && i === messages.length - 1;
          return (
            <div key={i} className="flex justify-center">
              <div className="w-full max-w-3xl">
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <div
                      className="inline-block rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] text-white"
                      style={{ background: `linear-gradient(135deg, var(--tab-primary-dark), var(--tab-primary))` }}
                    >
                      <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: `radial-gradient(circle, var(--tab-glow-soft), rgba(255,255,255,0.05))`, border: `1px solid var(--tab-border)`, fontFamily: "'Cinzel', serif" }}>
                      {tab.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm md:text-base text-gray-200 leading-relaxed">
                        {formatMessage(msg.content)}
                      </div>
                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <button
                          onClick={() => handleCopyMessage(msg.content, i)}
                          aria-label="Copy answer"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          {copiedId === i ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={() => handleShare(msg.content, messages[i - 1]?.content || "Question", i)}
                          aria-label="Share answer"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                          {copiedShareId === i ? "Copied!" : "Share"}
                        </button>
                        <button
                          onClick={() => handleExportPDF(msg.content, messages[i - 1]?.content || "Question")}
                          aria-label="Export to PDF"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="18"/><line x1="15" y1="15" x2="12" y2="18"/>
                          </svg>
                          Save PDF
                        </button>
                        {isLastAssistant && !loading && (
                          <button
                            onClick={handleRegenerate}
                            aria-label="Regenerate answer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                            Regenerate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {(loading || streamingContent) && (
          <div className="flex justify-center">
            <div className="w-full max-w-3xl flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: `radial-gradient(circle, var(--tab-glow-soft), rgba(255,255,255,0.05))`, border: `1px solid var(--tab-border)`, fontFamily: "'Cinzel', serif" }}>
                {tab.symbol}
              </div>
              {streamingContent ? (
                <div className="flex-1 min-w-0">
                  <div className="text-sm md:text-base text-gray-200 leading-relaxed">
                    {formatMessage(streamingContent)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 py-3" aria-label="Loading">
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)", animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)", animationDelay: "200ms" }} />
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)", animationDelay: "400ms" }} />
                </div>
              )}
            </div>
          </div>
        )}

        {errorMessage && !loading && (
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <div
                className="rounded-xl px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                role="alert"
              >
                <div className="text-red-300">
                  <strong className="font-semibold">Couldn&apos;t reach the server.</strong>{" "}
                  <span className="text-red-200/80">{errorMessage}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="text-xs px-3 py-1.5 rounded-full border border-red-400/40 text-red-200 hover:text-white hover:border-red-300 transition-all whitespace-nowrap"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 px-4 py-4 glass border-t border-gray-800/50">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input, activeTab)}
            placeholder={tab.inputPlaceholder || `Ask ${tab.name} anything...`}
            aria-label={`Ask ${tab.name}`}
            className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none border border-gray-700 focus:border-[var(--tab-primary)] transition-all"
          />
          <button
            onClick={() => sendMessage(input, activeTab)}
            disabled={loading}
            aria-label="Send message"
            className="btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, var(--tab-primary), var(--tab-primary-dark))`, color: "white" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          {tab.footerText}
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
