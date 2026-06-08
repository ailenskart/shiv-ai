"use client";

import { useState } from "react";
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
  if (tab === "gita") return GITA_SUGGESTED_QUESTIONS;
  if (tab === "veda") return VEDA_SUGGESTED_QUESTIONS;
  if (tab === "buddha") return BUDDHA_SUGGESTED_QUESTIONS;
  if (tab === "christ") return CHRISTIANITY_SUGGESTED_QUESTIONS;
  if (tab === "quran") return QURAN_SUGGESTED_QUESTIONS;
  if (tab === "jain") return JAINISM_SUGGESTED_QUESTIONS;
  if (tab === "sikh") return SIKH_SUGGESTED_QUESTIONS;
    if (tab === "torah") return TORAH_SUGGESTED_QUESTIONS;
    if (tab === "tao") return TAO_SUGGESTED_QUESTIONS;
    if (tab === "all") return ALL_KNOWLEDGE_SUGGESTED_QUESTIONS;
  return SUGGESTED_QUESTIONS;
}

function getStats(tab: TabId) {
  if (tab === "gita") return GITA_KNOWLEDGE_STATS;
  if (tab === "veda") return VEDA_KNOWLEDGE_STATS;
  if (tab === "buddha") return BUDDHA_STATS;
  if (tab === "christ") return CHRISTIANITY_KNOWLEDGE_STATS;
  if (tab === "quran") return QURAN_KNOWLEDGE_STATS;
  if (tab === "jain") return JAINISM_KNOWLEDGE_STATS;
  if (tab === "sikh") return SIKH_STATS;
    if (tab === "torah") return TORAH_STATS;
    if (tab === "tao") return TAO_STATS;
    if (tab === "all") return ALL_KNOWLEDGE_STATS;
  return SHIV_STATS;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [showMobileTabs, setShowMobileTabs] = useState(false);

  const tab = getTabConfig(activeTab);
  const questions = getQuestions(activeTab);
  const stats = getStats(activeTab);

  const handleAsk = (question?: string) => {
    const q = question || query;
    if (!q.trim()) return;
    window.location.href = `/chat?tab=${activeTab}&q=${encodeURIComponent(q.trim())}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" data-tab={activeTab}>
      {/* Cosmic background particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(255, ${107 + Math.random() * 50}, 0, ${0.2 + Math.random() * 0.3})`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
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
      <main className="relative z-10 flex flex-col items-center justify-center px-4 md:px-6 pt-8 md:pt-20 pb-8 md:pb-12">
        {/* Symbol */}
        <div
          className="text-6xl md:text-9xl mb-4 md:mb-6 om-glow animate-pulse-glow rounded-full w-28 h-28 md:w-48 md:h-48 flex items-center justify-center"
          style={{
            fontFamily: "'Cinzel', serif",
            background: `radial-gradient(circle, var(--tab-glow-soft, rgba(255,107,0,0.1)) 0%, transparent 70%)`,
          }}
        >
          {tab.symbol}
        </div>

        <h1
          className="text-3xl md:text-6xl lg:text-7xl font-bold text-center mb-3 md:mb-4 gradient-text"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {tab.name}
        </h1>

        <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mb-2">
          {tab.tagline}
        </p>
        <p className="text-sm md:text-base text-gray-500 text-center max-w-xl mb-8 md:mb-12">
          {tab.subtitle}
        </p>

        {/* Search / Ask Box */}
        <div className="w-full max-w-2xl mb-10 md:mb-16">
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
        <div className="w-full max-w-4xl mt-16 md:mt-24 mb-8 md:mb-12">
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
