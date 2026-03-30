"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SUGGESTED_QUESTIONS } from "@/lib/shiva-knowledge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullContent },
      ]);
      setStreamingContent("");
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error while seeking the wisdom you requested. Please try again, and I shall illuminate your path. Om Namah Shivaya. ð\n\n*Note: Please ensure your API key is configured in the environment variables.*",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

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

  const formatMessage = (content: string) => {
    // Basic markdown-like formatting
    return content
      .split("\n")
      .map((line, i) => {
        // Headers
        if (line.startsWith("### "))
          return (
            <h3 key={i} className="text-lg font-semibold text-[--color-saffron] mt-4 mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
              {line.slice(4)}
            </h3>
          );
        if (line.startsWith("## "))
          return (
            <h2 key={i} className="text-xl font-bold text-[--color-saffron] mt-4 mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
              {line.slice(3)}
            </h2>
          );
        // Bold
        const parts = line.split(/\*\*(.*?)\*\*/g);
        if (parts.length > 1) {
          return (
            <p key={i} className="mb-2 leading-relaxed">
              {parts.map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className="text-[--color-sacred-gold]">
                    {part}
                  </strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          );
        }
        // Bullet points
        if (line.startsWith("- ") || line.startsWith("â¢ "))
          return (
            <p key={i} className="mb-1 pl-4 leading-relaxed">
              <span className="text-[--color-saffron]">â¢</span> {line.slice(2)}
            </p>
          );
        // Empty lines
        if (line.trim() === "") return <br key={i} />;
        // Regular text
        return (
          <p key={i} className="mb-2 leading-relaxed">
            {line}
          </p>
        );
      });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-800/50 glass">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-2xl om-glow" style={{ fontFamily: "'Cinzel', serif" }}>
            à¥
          </div>
          <span
            className="text-lg font-semibold gradient-text"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Shiv.ai
          </span>
        </a>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 hidden md:block">
            The World&apos;s Largest Shiva Knowledge Library
          </span>
          <button
            onClick={() => {
              setMessages([]);
              setStreamingContent("");
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-[--color-saffron] transition-all"
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-3xl mx-auto py-6">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl om-glow mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
                à¥
              </div>
              <h2
                className="text-2xl font-bold gradient-text mb-3"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Ask Shiv.ai Anything
              </h2>
              <p className="text-gray-500 text-center max-w-md mb-8">
                Explore the infinite knowledge of Lord Shiva â from ancient scriptures to
                living traditions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTED_QUESTIONS.slice(0, 6).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="glass rounded-xl px-4 py-3 text-left text-sm text-gray-400 hover:text-white hover:border-[--color-saffron] transition-all"
                  >
                    <span className="text-[--color-saffron] mr-2">â</span>
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
                  style={{ background: "linear-gradient(135deg, var(--color-saffron-dark), var(--color-saffron))" }}>
                  <p className="text-sm md:text-base">{msg.content}</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm om-glow"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,107,0,0.2), rgba(212,168,67,0.2))",
                      border: "1px solid rgba(255,107,0,0.3)",
                      fontFamily: "'Cinzel', serif",
                    }}>
                    à¥
                  </div>
                  <div className="flex-1 text-gray-200 text-sm md:text-base">
                    {formatMessage(msg.content)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Streaming response */}
          {isLoading && streamingContent && (
            <div className="mb-6 message-enter flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm om-glow"
                style={{
                  background: "linear-gradient(135deg, rgba(255,107,0,0.2), rgba(212,168,67,0.2))",
                  border: "1px solid rgba(255,107,0,0.3)",
                  fontFamily: "'Cinzel', serif",
                }}>
                à¥
              </div>
              <div className="flex-1 text-gray-200 text-sm md:text-base">
                {formatMessage(streamingContent)}
                <span className="inline-block w-2 h-4 bg-[--color-saffron] animate-pulse ml-1" />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingContent && (
            <div className="mb-6 flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm om-glow"
                style={{
                  background: "linear-gradient(135deg, rgba(255,107,0,0.2), rgba(212,168,67,0.2))",
                  border: "1px solid rgba(255,107,0,0.3)",
                  fontFamily: "'Cinzel', serif",
                }}>
                à¥
              </div>
              <div className="flex items-center gap-1.5 py-3">
                <div className="w-2 h-2 rounded-full bg-[--color-saffron] typing-dot" />
                <div className="w-2 h-2 rounded-full bg-[--color-saffron] typing-dot" />
                <div className="w-2 h-2 rounded-full bg-[--color-saffron] typing-dot" />
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
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Lord Shiva..."
              rows={1}
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none resize-none text-base"
              style={{ fontFamily: "'Inter', sans-serif", maxHeight: "150px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--color-saffron), var(--color-saffron-dark))",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            Shiv.ai draws from Vedas, Puranas, Agamas, Upanishads, and thousands of years of Shaivite tradition
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-4xl om-glow animate-pulse" style={{ fontFamily: "'Cinzel', serif" }}>à¥</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
