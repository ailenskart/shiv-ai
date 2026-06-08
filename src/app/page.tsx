"use client";

import { useState } from "react";
import { SUGGESTED_QUESTIONS } from "@/lib/shiva-knowledge";
import { GITA_SUGGESTED_QUESTIONS } from "@/lib/gita-knowledge";
import { VEDA_SUGGESTED_QUESTIONS } from "@/lib/veda-knowledge";
import { BUDDHA_SUGGESTED_QUESTIONS } from "@/lib/buddha-knowledge";
import { CHRISTIANITY_SUGGESTED_QUESTIONS } from "@/lib/christianity-knowledge";
import { QURAN_SUGGESTED_QUESTIONS } from "@/lib/quran-knowledge";
import { JAINISM_SUGGESTED_QUESTIONS } from "@/lib/jainism-knowledge";
import { SIKH_SUGGESTED_QUESTIONS } from "@/lib/sikh-knowledge";
import { TORAH_SUGGESTED_QUESTIONS } from "@/lib/torah-knowledge";
import { TAO_SUGGESTED_QUESTIONS } from "@/lib/tao-knowledge";
import { TabId, TABS, getTabConfig } from "@/lib/tab-config";

/* Happiness-first suggested questions (for "All" tab) */
const HAPPINESS_QUESTIONS = [
  "I feel anxious and can't stop worrying about the future",
  "I lost someone I love and don't know how to cope",
  "I feel lost — what is my purpose in life?",
  "How do I find peace when everything is chaotic?",
  "I'm struggling with anger and resentment",
  "How can I be happy with what I have?",
  "I feel alone even around people — how do I connect?",
  "How do I forgive someone who hurt me deeply?",
  "I'm afraid of death and what comes after",
];

/* Universal stats about shared wisdom */
const HAPPINESS_STATS = [
  { number: "11", label: "Wisdom Traditions" },
  { number: "3,500+", label: "Years of Wisdom" },
  { number: "1", label: "Shared Truth" },
  { number: "\u221e", label: "Paths to Happiness" },
];

function getQuestions(tab: TabId) {
  if (tab === "gita") return GITA_SUGGESTED_QUESTIONS;
  if (tab === "veda") return VEDA_SUGGESTED_QUESTIONS;
  if (tab === "buddha") return BUDDHA_SUGGESTED_QUESTIONS;
  if (tab === "christ") return CHRISTIANITY_SUGGESTED_QUESTIONS;
  if (tab === "quran") return QURAN_SUGGESTED_QUESTIONS;
  if (tab === "jain") return JAINISM_SUGGESTED_QUESTIONS;
  if (tab === "sikh") return SIKH_SUGGESTED_QUESTIONS;
  if (tab === "torah") return TORAH_SUGGESTED_QUESTIONS;
  if (tab === "tao") return TAO_SUGGESTED_QUESTIONS;
  if (tab === "all") return HAPPINESS_QUESTIONS;
  return SUGGESTED_QUESTIONS;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [showMobileTabs, setShowMobileTabs] = useState(false);

  const tab = getTabConfig(activeTab);
  const questions = getQuestions(activeTab);

  const handleAsk = (question?: string) => {
    const q = question || query;
    if (!q.trim()) return;
    window.location.href = `/chat?tab=${activeTab}&q=${encodeURIComponent(q.trim())}`;
  };

  const isAll = activeTab === "all";

  return (
    <div className="min-h-screen relative overflow-hidden" data-tab={activeTab}>
      {/* Warm golden particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: isAll
                ? `rgba(245, ${180 + Math.random() * 60}, ${Math.random() * 50}, ${0.15 + Math.random() * 0.25})`
                : `rgba(255, ${107 + Math.random() * 50}, 0, ${0.2 + Math.random() * 0.3})`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row items-center justify-between px-3 md:px-12 py-4 md:py-6 gap-3 md:gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("all")}>
          <div className="text-2xl md:text-3xl" style={{ fontFamily: "'Cinzel', serif" }}>
            ✦
          </div>
          <span className="text-lg md:text-xl font-semibold gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            Shiv.ai
          </span>
        </div>

        {/* Tab Switcher - Desktop */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto bg-[rgba(26,26,46,0.8)] rounded-full px-1.5 py-1.5 border border-gray-800 max-w-[calc(100vw-200px)] scrollbar-hide">
          {(Object.keys(TABS) as TabId[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`tab-btn ${activeTab === t ? "active" : ""}`}
              data-tab={t}
            >
              <span className="mr-1.5">{TABS[t].symbol}</span>
              {TABS[t].name}
            </button>
          ))}
        </nav>

        {/* Tab Switcher - Mobile */}
        <div className="md:hidden w-full relative">
          <button
            onClick={() => setShowMobileTabs(!showMobileTabs)}
            className="w-full flex items-center justify-between bg-[rgba(26,26,46,0.8)] rounded-xl px-4 py-3 border border-gray-800"
          >
            <span className="flex items-center gap-2 text-white font-medium">
              <span className="text-lg">{tab.symbol}</span>
              {tab.name}
            </span>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${showMobileTabs ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showMobileTabs && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[rgba(20,20,40,0.95)] backdrop-blur-xl rounded-2xl border border-gray-700 p-3 z-50 grid grid-cols-3 gap-2 shadow-2xl">
              {(Object.keys(TABS) as TabId[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setActiveTab(t); setShowMobileTabs(false); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${activeTab === t ? "bg-[var(--tab-primary)] text-white shadow-lg" : "bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)]"}`}
                  data-tab={t}
                >
                  <span className="text-2xl">{TABS[t].symbol}</span>
                  <span className="text-xs font-medium truncate w-full text-center">{TABS[t].name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 md:px-6 pt-8 md:pt-16 pb-8 md:pb-12">
        {/* Symbol with warm glow */}
        <div
          className="text-6xl md:text-8xl mb-4 md:mb-6 om-glow animate-pulse-glow rounded-full w-28 h-28 md:w-40 md:h-40 flex items-center justify-center"
          style={{
            fontFamily: "'Cinzel', serif",
            background: `radial-gradient(circle, var(--tab-glow-soft, rgba(245, 158, 11, 0.15)) 0%, transparent 70%)`,
          }}
        >
          {tab.symbol}
        </div>

        {/* Main headline */}
        {isAll ? (
          <>
            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-3 md:mb-4"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              <span className="gradient-text">Every Religion Started</span>
              <br />
              <span className="gradient-text">With One Idea</span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-300/90 text-center max-w-2xl mb-2 font-medium" style={{ fontFamily: "'Cinzel', serif" }}>
              Happiness.
            </p>
          </>
        ) : (
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-center mb-3 md:mb-4 gradient-text"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {tab.name}
          </h1>
        )}

        <p className="text-base md:text-lg text-gray-300 text-center max-w-2xl mb-2">
          {tab.tagline}
        </p>
        <p className="text-sm md:text-base text-gray-400 text-center max-w-xl mb-8 md:mb-10 leading-relaxed">
          {tab.subtitle}
        </p>

        {/* Search Box */}
        <div className="w-full max-w-2xl mb-10 md:mb-14">
          <div className="glass rounded-2xl p-2 flex items-center gap-2 animate-pulse-glow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder={tab.placeholder}
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none text-base md:text-lg"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              onClick={() => handleAsk()}
              className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, var(--tab-primary), var(--tab-primary-dark))`,
              }}
            >
              {tab.buttonLabel}
            </button>
          </div>
        </div>

        {/* Suggested Questions / Struggles */}
        <div className="w-full max-w-4xl">
          <p className="text-center text-sm text-gray-500 mb-6 uppercase tracking-widest">
            {tab.exploreLabel}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="glass rounded-xl px-4 py-3 text-left text-sm text-gray-300 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span style={{ color: "var(--tab-primary)" }} className="mr-2">→</span>
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Unity Message — only on All tab */}
        {isAll && (
          <div className="w-full max-w-3xl mt-16 md:mt-20">
            <div className="glass rounded-2xl p-8 md:p-10 text-center">
              <h2
                className="text-xl md:text-2xl font-bold mb-4 gradient-text"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                One Wisdom, Many Voices
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                The Gita says: <em>&ldquo;Happiness comes from within.&rdquo;</em> The Buddha agrees: <em>&ldquo;Peace comes from your own mind.&rdquo;</em> The Quran confirms: <em>&ldquo;In remembrance of God, hearts find rest.&rdquo;</em> Jesus teaches: <em>&ldquo;Come to me, and I will give you rest.&rdquo;</em> The Tao adds: <em>&ldquo;Be still, and the world comes to you.&rdquo;</em>
              </p>
              <p className="text-gray-400 text-sm">
                Different words. Different centuries. Different cultures. The same truth.
              </p>
            </div>
          </div>
        )}

        {/* Tradition Icons — only on All tab */}
        {isAll && (
          <div className="w-full max-w-4xl mt-12 md:mt-16 mb-8 md:mb-12">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {(Object.keys(TABS) as TabId[]).filter(t => t !== "all").map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full glass flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition-all" data-tab={t}>
                    {TABS[t].symbol}
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{TABS[t].name}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-600 mt-6">
              Tap any tradition to explore its unique path to happiness
            </p>
          </div>
        )}

        {/* Stats — compact, meaningful */}
        <div className="w-full max-w-2xl mt-8 md:mt-12 mb-8 md:mb-12">
          <div className="grid grid-cols-4 gap-3">
            {HAPPINESS_STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-xl md:text-2xl font-bold gradient-text mb-1"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {stat.number}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-8 px-6 text-center">
        <p className="text-gray-400 text-sm mb-2">
          {tab.footerMantra}
        </p>
        <p className="text-gray-600 text-xs">
          {tab.footerText}
        </p>
      </footer>
    </div>
  );
}
