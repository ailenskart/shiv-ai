"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SUGGESTED_QUESTIONS } from "@/lib/shiva-knowledge";
import { GITA_SUGGESTED_QUESTIONS } from "@/lib/gita-knowledge";
import { VEDA_SUGGESTED_QUESTIONS } from "@/lib/veda-knowledge";
import { TabId, TABS, getTabConfig } from "@/lib/tab-config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getQuestions(tab: TabId) {
  if (tab === "gita") return GITA_SUGGESTED_QUESTIONS;
  if (tab === "veda") return VEDA_SUGGESTED_QUESTIONS;
  return SUGGESTED_QUESTIONS;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const tabParam = (searchParams.get("tab") || "shiv") as TabId;

  const [activeTab, setActiveTab] = useState<TabId>(tabParam);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const tab = getTabConfig(activeTab);
  const questions = getQuestions(activeTab);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          tab: activeTab,
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
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingContent(fullContent);
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
          content: "I apologize, but I encountered an error. Please try again. 🙏",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, activeTab]);

  useEffect(() => {
    if (initialQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const switchTab = (newTab: TabId) => {
    setActiveTab(newTab);
    setMessages([]);
    setStreamingContent("");
    window.history.replaceState(null, "", `/chat?tab=${newTab}`);
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("### "))
        return (
          <h3 key={i} className="text-lg font-semibold mt-4 mb-2" style={{ color: "var(--tab-primary)", fontFamily: "'Cinzel', serif" }}>
            {line.slice(4)}
          </h3>
        );
      if (line.startsWith("## "))
        return (
          <h2 key={i} className="text-xl font-bold mt-4 mb-2" style={{ color: "var(--tab-primary)", fontFamily: "'Cinzel', serif" }}>
            {line.slice(3)}
          </h2>
        );
      const parts = line.split(/\*\*(.*?)\*\*/g);
      if (parts.length > 1) {
        return (
          <p key={i} className="mb-2 leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} style={{ color: "var(--tab-secondary)" }}>{part}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• "))
        return (
          <p key={i} className="mb-1 pl-4 leading-relaxed">
            <span style={{ color: "var(--tab-primary)" }}>•</span> {line.slice(2)}
          </p>
        );
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="mb-2 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-screen" data-tab={activeTab}>
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

        {/* Tab Switcher */}
        <nav className="flex items-center gap-1.5 bg-[rgba(26,26,46,0.8)] rounded-full px-1.5 py-1 border border-gray-800">
          {(Object.keys(TABS) as TabId[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`tab-btn ${activeTab === t ? "active" : ""}`}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
              data-tab={t}
            >
              <span className="mr-1">{TABS[t].symbol}</span>
              <span className="hidden sm:inline">{TABS[t].name}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => { setMessages([]); setStreamingContent(""); }}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-all"
        >
          New Chat
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-3xl mx-auto py-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl om-glow mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
                {tab.symbol}
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-3" style={{ fontFamily: "'Cinzel', serif" }}>
                Ask {tab.name} Anything
              </h2>
              <p className="text-gray-500 text-center max-w-md mb-8">{tab.chatSubtitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-xl">
                {questions.slice(0, 6).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="glass rounded-xl px-4 py-3 text-left text-sm text-gray-400 hover:text-white transition-all"
                  >
                    <span style={{ color: "var(--tab-primary)" }} className="mr-2">→</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`mb-6 message-enter ${msg.role === "user" ? "flex justify-end" : ""}`}>
              {msg.role === "user" ? (
                <div className="max-w-[80%] px-5 py-3 rounded-2xl rounded-tr-sm text-white"
                  style={{ background: `linear-gradient(135deg, var(--tab-primary-dark), var(--tab-primary))` }}>
                  <p className="text-sm md:text-base">{msg.content}</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm om-glow"
                    style={{
                      background: `linear-gradient(135deg, var(--tab-glow-soft), rgba(255,255,255,0.05))`,
                      border: `1px solid var(--tab-border)`,
                      fontFamily: "'Cinzel', serif",
                    }}>
                    {tab.symbol}
                  </div>
                  <div className="flex-1 text-gray-200 text-sm md:text-base">
                    {formatMessage(msg.content)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && streamingContent && (
            <div className="mb-6 message-enter flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm om-glow"
                style={{ background: `linear-gradient(135deg, var(--tab-glow-soft), rgba(255,255,255,0.05))`, border: `1px solid var(--tab-border)`, fontFamily: "'Cinzel', serif" }}>
                {tab.symbol}
              </div>
              <div className="flex-1 text-gray-200 text-sm md:text-base">
                {formatMessage(streamingContent)}
                <span className="inline-block w-2 h-4 animate-pulse ml-1" style={{ background: "var(--tab-primary)" }} />
              </div>
            </div>
          )}

          {isLoading && !streamingContent && (
            <div className="mb-6 flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm om-glow"
                style={{ background: `linear-gradient(135deg, var(--tab-glow-soft), rgba(255,255,255,0.05))`, border: `1px solid var(--tab-border)`, fontFamily: "'Cinzel', serif" }}>
                {tab.symbol}
              </div>
              <div className="flex items-center gap-1.5 py-3">
                <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)" }} />
                <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)" }} />
                <div className="w-2 h-2 rounded-full typing-dot" style={{ background: "var(--tab-primary)" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800/50 px-4 md:px-0 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-2 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={tab.inputPlaceholder}
              rows={1}
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none resize-none text-base"
              style={{ fontFamily: "'Inter', sans-serif", maxHeight: "150px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 flex-shrink-0"
              style={{ background: `linear-gradient(135deg, var(--tab-primary), var(--tab-primary-dark))` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">{tab.sourceLine}</p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-4xl om-glow animate-pulse" style={{ fontFamily: "'Cinzel', serif" }}>ॐ</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
