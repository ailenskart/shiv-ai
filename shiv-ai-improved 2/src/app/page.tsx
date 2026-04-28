"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SUGGESTED_QUESTIONS } from "@/lib/shiva-knowledge";
import { GITA_SUGGESTED_QUESTIONS, GITA_KNOWLEDGE_STATS } from "@/lib/gita-knowledge";
import { VEDA_SUGGESTED_QUESTIONS, VEDA_KNOWLEDGE_STATS } from "@/lib/veda-knowledge";
import { BUDDHA_SUGGESTED_QUESTIONS } from "@/lib/buddha-knowledge";
import { CHRISTIANITY_SUGGESTED_QUESTIONS, CHRISTIANITY_KNOWLEDGE_STATS } from "@/lib/christianity-knowledge";
import { QURAN_SUGGESTED_QUESTIONS, QURAN_KNOWLEDGE_STATS } from "@/lib/quran-knowledge";
import { JAINISM_SUGGESTED_QUESTIONS, JAINISM_KNOWLEDGE_STATS } from "@/lib/jainism-knowledge";
import { ALL_KNOWLEDGE_SUGGESTED_QUESTIONS, ALL_KNOWLEDGE_STATS } from "@/lib/all-knowledge";
import { SIKH_SUGGESTED_QUESTIONS, SIKH_STATS } from "@/lib/sikh-knowledge";
import { TORAH_SUGGESTED_QUESTIONS, TORAH_STATS } from "@/lib/torah-knowledge";
import { TAO_SUGGESTED_QUESTIONS, TAO_STATS } from "@/lib/tao-knowledge";
import { TabId, TABS, getTabConfig } from "@/lib/tab-config";

const SHIV_STATS = [
  { number: "28+", label: "Shaiva Agamas" },
  { number: "12", label: "Jyotirlingas" },
  { number: "63", label: "Nayanar Saints" },
  { number: "112", label: "Meditation Techniques" },
  { number: "1000+", label: "Years of Tradition" },
  { number: "8+", label: "Philosophical Schools" },
  { number: "108", label: "Sacred Names" },
  { number: "∞", label: "Dimensions of Shiva" },
];

const BUDDHA_STATS = [
  { number: "84,000+", label: "Dharma Teachings" },
  { number: "3", label: "Major Traditions" },
  { number: "500+", label: "Jataka Tales" },
  { number: "108", label: "Sacred Practices" },
  { number: "2,500+", label: "Years of Wisdom" },
  { number: "4", label: "Noble Truths" },
];

function getQuestions(tab: TabId) {
  switch (tab) {
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

function getStats(tab: TabId) {
  switch (tab) {
    case "gita": return GITA_KNOWLEDGE_STATS;
    case "veda": return VEDA_KNOWLEDGE_STATS;
    case "buddha": return BUDDHA_STATS;
    case "christ": return CHRISTIANITY_KNOWLEDGE_STATS;
    case "quran": return QURAN_KNOWLEDGE_STATS;
    case "jain": return JAINISM_KNOWLEDGE_STATS;
    case "sikh": return SIKH_STATS;
    case "torah": return TORAH_STATS;
    case "tao": return TAO_STATS;
    case "all": return ALL_KNOWLEDGE_STATS;
    default: return SHIV_STATS;
  }
}

const VALID_TABS = new Set<TabId>([
  "shiv", "gita", "veda", "buddha", "christ", "quran",
  "jain", "sikh", "torah", "tao", "all",
]);

function isValidTab(t: string | null): t is TabId {
  return t !== null && VALID_TABS.has(t as TabId);
}

function HomeContent() {
  const searchParams = useSearchParams();
  const initialTab: TabId = isValidTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as TabId)
    : "shiv";

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const tab = getTabConfig(activeTab);
  const questions = getQuestions(activeTab);
  const stats = getStats(activeTab);

  // Stable particle positions: generated once per mount (avoids hydration mismatch + jitter on re-render).
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: 0.2 + Math.random() * 0.3,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 4,
      })),
    []
  );

  // Sync URL ?tab= with active tab (so users can share/bookmark a specific tradition).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const current = url.searchParams.get("tab");
    if (current === activeTab) return;
    if (activeTab === "shiv") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", activeTab);
    }
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  // Update document title per tab.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${tab.name} — ${tab.tagline}`;
    }
  }, [tab.name, tab.tagline]);

  // Browser back/forward should update the active tab too.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("tab");
      if (isValidTab(t)) setActiveTab(t);
      else setActiveTab("shiv");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleAsk = (question?: string) => {
    const q = question || query;
    if (!q.trim()) return;
    window.location.href = `/chat?tab=${activeTab}&q=${encodeURIComponent(q.trim())}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" data-tab={activeTab}>
      {/* Cosmic background particles (deterministic-per-mount) */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: `var(--tab-glow, rgba(255, 107, 0, ${p.opacity}))`,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Header with Tabs */}
      <header className="relative z-10 flex flex-col md:flex-row items-center justify-between px-3 md:px-12 py-4 md:py-6 gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl om-glow" style={{ fontFamily: "'Cinzel', serif" }}>
            {tab.symbol}
          </div>
          <span className="text-xl font-semibold gradient-text" style={{ fontFamily: "'Cinzel', serif" }}>
            {tab.name}
          </span>
        </div>

        {/* Tab Switcher */}
        <nav
          className="flex items-center gap-1 md:gap-2 overflow-x-auto bg-[rgba(26,26,46,0.8)] rounded-full px-2 py-1.5 border border-gray-800 max-w-[90vw] scrollbar-hide"
          aria-label="Choose a wisdom tradition"
        >
          {(Object.keys(TABS) as TabId[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`tab-btn ${activeTab === t ? "active" : ""}`}
              data-tab={t}
              aria-pressed={activeTab === t}
              aria-label={TABS[t].name}
            >
              <span className="mr-1.5">{TABS[t].symbol}</span>
              {TABS[t].name}
            </button>
          ))}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 md:pt-20 pb-12">
        {/* Symbol */}
        <div
          className="text-8xl md:text-9xl mb-6 om-glow animate-pulse-glow rounded-full w-40 h-40 md:w-48 md:h-48 flex items-center justify-center"
          style={{
            fontFamily: "'Cinzel', serif",
            background: `radial-gradient(circle, var(--tab-glow-soft, rgba(255,107,0,0.1)) 0%, transparent 70%)`,
          }}
        >
          {tab.symbol}
        </div>

        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-4 gradient-text"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {tab.name}
        </h1>

        <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mb-2">
          {tab.tagline}
        </p>
        <p className="text-sm md:text-base text-gray-500 text-center max-w-xl mb-12">
          {tab.subtitle}
        </p>

        {/* Search / Ask Box */}
        <div className="w-full max-w-2xl mb-16">
          <div className="glass rounded-2xl p-2 flex items-center gap-2 animate-pulse-glow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder={tab.placeholder}
              aria-label={`Ask ${tab.name}`}
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

        {/* Suggested Questions */}
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

        {/* Knowledge Stats */}
        <div className="w-full max-w-4xl mt-24 mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-12 gradient-text"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            The Knowledge Within
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 text-center transition-all">
                <div
                  className="text-2xl md:text-3xl font-bold gradient-text mb-1"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8 px-6 text-center">
        <p className="text-gray-500 text-sm mb-2">
          <span className="om-glow text-lg mr-1">{tab.symbol}</span> {tab.footerMantra}
        </p>
        <p className="text-gray-600 text-xs">
          {tab.footerText}
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading…
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
