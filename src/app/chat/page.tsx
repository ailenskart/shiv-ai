"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SUGGESTED_QUESTIONS } from "@/lib/shiva-knowledge";
import { GITA_SUGGESTED_QUESTIONS } from "@/lib/gita-knowledge";
import { VEDA_SUGGESTED_QUESTIONS } from "@/lib/veda-knowledge";
import { TABS, TabId } from "@/lib/tabs";

type Message = { role: "user" | "assistant"; content: string };

function getQuestions(tab: TabId) {
  switch (tab) {
    case "shiva": return SUGGESTED_QUESTIONS;
    case "gita": return GITA_SUGGESTED_QUESTIONS;
    case "veda": return VEDA_SUGGESTED_QUESTIONS;
  }
}

function formatMessage(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <div key={i} className="h-2" />;
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="text-lg font-semibold mt-4 mb-2 gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
          {line.slice(4)}
        </h3>
      );
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="text-xl font-bold mt-6 mb-3 gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("- "))
      return (
        <div key={i} className="flex items-start gap-2 ml-4 mb-1">
          <span className="text-[var(--tab-primary)] mt-1">{"\u2022"}</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    // Bold text
    const parts = line.split(/\*\*(.*?)\*\*/);
    if (parts.length > 1) {
      return (
        <p key={i} className="mb-2">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="text-white">{part}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    }
    return <p key={i} className="mb-2">{line}</p>;
  });
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get("tab") as TabId) || "shiva"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollTo({ top: messagesEndRef.current.scrollHeight, behavior: "smooth" });
  };

  const sendMessage = useCallback(async (text: string, tabOverride?: TabId) => {
    if (!text.trim()) return;
    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text.trim() }]);
    scrollToBottom();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          tab: tabOverride || activeTab,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Auto-send initial query
  useEffect(() => {
    const q = searchParams.get("q");
    const tabParam = searchParams.get("tab") as TabId;
    if (tabParam) setActiveTab(tabParam);
    if (q) {
      setInput(q);
      sendMessage(q, tabParam || "shiva");
    }
  }, [searchParams, sendMessage]);

  const tab = TABS[activeTab];
  const questions = getQuestions(activeTab);

  const handleShare = (content: string, question: string) => {
    const text = `${question}\n\n${content}\n\nShared from ${tab.name} \u2014 shiv-ai-ten.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: tab.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const handleExportPDF = async (content: string, question: string) => {
    const el = document.createElement("div");
    el.innerHTML = `
      <div style="font-family: Georgia, serif; padding: 40px; max-width: 700px; margin: auto; color: #1a1a2e;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF6B00; padding-bottom: 20px;">
          <div style="font-size: 36px; margin-bottom: 8px;">${tab.symbol}</div>
          <h1 style="font-size: 24px; color: #FF6B00; margin: 0;">${tab.name}</h1>
          <p style="font-size: 11px; color: #888; margin-top: 4px;">The World's Largest Shiva, Gita & Vedas Knowledge Library</p>
        </div>
        <div style="background: #f8f4f0; border-left: 4px solid #FF6B00; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
          <p style="font-weight: bold; color: #333; margin: 0; font-size: 16px;">${question}</p>
        </div>
        <div style="line-height: 1.8; font-size: 14px; color: #333; white-space: pre-wrap;">${content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*)/g, '<h3 style="color:#FF6B00;font-size:16px;margin-top:20px;">$1</h3>').replace(/## (.*)/g, '<h2 style="color:#FF6B00;font-size:18px;margin-top:24px;">$1</h2>').replace(/- /g, '\u2022 ')}</div>
        <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #999;">
          Generated by ${tab.name} &bull; shiv-ai-ten.vercel.app &bull; ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;
    document.body.appendChild(el);
    if (!(window as unknown as Record<string, unknown>).html2pdf) {
      await new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        s.onload = () => resolve();
        document.head.appendChild(s);
      });
    }
    const html2pdf = (window as unknown as Record<string, unknown>).html2pdf as Function;
    await html2pdf().set({ margin: 0, filename: `${tab.name}-wisdom.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: "mm", format: "a4" } }).from(el).save();
    document.body.removeChild(el);
  };

  return (
    <div className="min-h-screen flex flex-col" data-tab={activeTab}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-gray-800/50 glass">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-2xl om-glow" style={{ fontFamily: "'Cinzel', serif" }}>
            {tab.symbol}
          </div>
          <span className="text-lg font-semibold gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            {tab.name}
          </span>
        </a>

        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {(Object.keys(TABS) as TabId[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`tab-btn ${activeTab === t ? "active" : ""}`}
              data-tab={t}
            >
              <span className="mr-1">{TABS[t].symbol}</span>
              <span className="hidden sm:inline">{TABS[t].name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => {
            setMessages([]);
            setStreamingContent("");
          }}
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
        {messages.length === 0 && !streamingContent && (
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
                  onClick={() => {
                    setInput(q);
                    sendMessage(q, activeTab);
                  }}
                  className="glass p-3 rounded-xl text-left text-sm text-gray-400 hover:text-white transition-all"
                >
                  <span style={{ color: "var(--tab-primary)" }} className="mr-2">{"\u2192"}</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex justify-center">
            <div className="w-full max-w-3xl">
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div
                    className="inline-block rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] text-white"
                    style={{ background: `linear-gradient(135deg, var(--tab-primary-dark), var(--tab-primary))` }}
                  >
                    <p className="text-sm md:text-base">{msg.content}</p>
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
                    {/* Share & Export buttons */}
                    <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <button
                        onClick={() => handleShare(msg.content, messages[i - 1]?.content || "Question")}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        Share
                      </button>
                      <button
                        onClick={() => handleExportPDF(msg.content, messages[i - 1]?.content || "Question")}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="18"/><line x1="15" y1="15" x2="12" y2="18"/>
                        </svg>
                        Save PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

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
                <div className="flex items-center gap-1.5 py-3">
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)", animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)", animationDelay: "200ms" }} />
                  <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)", animationDelay: "400ms" }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 px-4 py-4 glass border-t border-gray-800/50">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input, activeTab)}
            placeholder={`Ask ${tab.name} anything...`}
            className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none border border-gray-700 focus:border-[var(--tab-primary)] transition-all"
          />
          <button
            onClick={() => sendMessage(input, activeTab)}
            disabled={loading}
            className="btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          Powered by Shiv.ai &mdash; The World&apos;s Largest Shiva Knowledge Library
        </p>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
