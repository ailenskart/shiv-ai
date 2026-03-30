"use client";

import { useState } from "react";
import { SUGGESTED_QUESTIONS } from "@/lib/shiva-knowledge";

export default function Home() {
  const [query, setQuery] = useState("");

  const handleAsk = (question?: string) => {
    const q = question || query;
    if (!q.trim()) return;
    window.location.href = `/chat?q=${encodeURIComponent(q.trim())}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl om-glow" style={{ fontFamily: "'Cinzel', serif" }}>
            à¥
          </div>
          <span
            className="text-xl font-semibold gradient-text"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Shiv.ai
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#about" className="hover:text-[--color-saffron] transition-colors">
            About
          </a>
          <a href="#knowledge" className="hover:text-[--color-saffron] transition-colors">
            Knowledge Base
          </a>
          <a href="#explore" className="hover:text-[--color-saffron] transition-colors">
            Explore
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 md:pt-24 pb-12">
        {/* Om Symbol */}
        <div
          className="text-8xl md:text-9xl mb-6 om-glow animate-pulse-glow rounded-full w-40 h-40 md:w-48 md:h-48 flex items-center justify-center"
          style={{
            fontFamily: "'Cinzel', serif",
            background: "radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)",
          }}
        >
          à¥
        </div>

        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-4 gradient-text"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Shiv.ai
        </h1>

        <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl mb-2">
          The World&apos;s Largest Lord Shiva Knowledge Library
        </p>
        <p className="text-sm md:text-base text-gray-500 text-center max-w-xl mb-12">
          Ask anything about Mahadev â scriptures, philosophy, mythology, temples, mantras,
          yoga, art, and living traditions from across the world.
        </p>

        {/* Search / Ask Box */}
        <div className="w-full max-w-2xl mb-16">
          <div className="glass rounded-2xl p-2 flex items-center gap-2 animate-pulse-glow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask anything about Lord Shiva..."
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none text-base md:text-lg"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              onClick={() => handleAsk()}
              className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, var(--color-saffron), var(--color-saffron-dark))",
              }}
            >
              Ask Shiv.ai
            </button>
          </div>
        </div>

        {/* Suggested Questions */}
        <div id="explore" className="w-full max-w-4xl">
          <p className="text-center text-sm text-gray-500 mb-6 uppercase tracking-widest">
            Explore the infinite dimensions of Shiva
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="glass rounded-xl px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:border-[--color-saffron] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-[--color-saffron] mr-2">â</span>
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Knowledge Stats */}
        <div id="knowledge" className="w-full max-w-4xl mt-24 mb-12">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-12 gradient-text"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            The Knowledge Within
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { number: "28+", label: "Shaiva Agamas" },
              { number: "12", label: "Jyotirlingas" },
              { number: "63", label: "Nayanar Saints" },
              { number: "112", label: "Meditation Techniques" },
              { number: "1000+", label: "Years of Tradition" },
              { number: "8+", label: "Philosophical Schools" },
              { number: "108", label: "Sacred Names" },
              { number: "â", label: "Dimensions of Shiva" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass rounded-xl p-4 text-center hover:border-[--color-saffron] transition-all"
              >
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

        {/* About Section */}
        <div id="about" className="w-full max-w-3xl mt-12 mb-24">
          <div className="glass rounded-2xl p-8 md:p-12">
            <h2
              className="text-xl md:text-2xl font-bold mb-4 gradient-text"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              About Shiv.ai
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Shiv.ai is the world&apos;s most comprehensive AI-powered knowledge library dedicated
              entirely to Lord Shiva â Mahadev, the Great God. Our mission is to collect, preserve,
              and make accessible all knowledge about Shiva from every tradition, scripture, culture,
              and era.
            </p>
            <p className="text-gray-400 leading-relaxed mb-4">
              From the Vedic hymns to Rudra, through the profound philosophies of Kashmir Shaivism
              and Shaiva Siddhanta, to the living temple traditions of Tamil Nadu and the Himalayan
              shrines â Shiv.ai brings it all together in one intelligent, conversational interface.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Ask about scriptures, mantras, meditation techniques, temple histories, iconography,
              mythology, yoga, or the deepest philosophical questions. Shiv.ai draws from thousands
              of years of collective human wisdom about the infinite reality we call Shiva.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8 px-6 text-center">
        <p className="text-gray-500 text-sm mb-2">
          <span className="om-glow text-lg mr-1">à¥</span> Om Namah Shivaya
        </p>
        <p className="text-gray-600 text-xs">
          Shiv.ai â Preserving and sharing the infinite wisdom of Mahadev
        </p>
      </footer>
    </div>
  );
}
