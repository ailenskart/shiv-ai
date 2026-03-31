export type TabId = "shiv" | "gita" | "veda";

export interface TabConfig {
  id: TabId;
  name: string;
  domain: string;
  symbol: string;
  tagline: string;
  subtitle: string;
  placeholder: string;
  buttonLabel: string;
  footerMantra: string;
  footerText: string;
  exploreLabel: string;
  chatSubtitle: string;
  inputPlaceholder: string;
  sourceLine: string;
}

export const TABS: Record<TabId, TabConfig> = {
  shiv: {
    id: "shiv",
    name: "Shiv.ai",
    domain: "Shiv.ai",
    symbol: "ॐ",
    tagline: "The World’s Largest Lord Shiva Knowledge Library",
    subtitle: "Ask Anything from Shiv.ai — scriptures, philosophy, mythology, temples, mantras, yoga, art, and living traditions from across the world.",
    placeholder: "Ask Anything from Shiv.ai...",
    buttonLabel: "Ask Shiv.ai",
    footerMantra: "Om Namah Shivaya",
    footerText: "Shiv.ai — Preserving and sharing the infinite wisdom of Mahadev",
    exploreLabel: "Explore the infinite dimensions of Shiva",
    chatSubtitle: "Explore the infinite knowledge of Lord Shiva — from ancient scriptures to living traditions",
    inputPlaceholder: "Ask about Lord Shiva...",
    sourceLine: "Shiv.ai draws from Vedas, Puranas, Agamas, Upanishads, and thousands of years of Shaivite tradition",
  },
  gita: {
    id: "gita",
    name: "Gita.ai",
    domain: "Gita.ai",
    symbol: "🕉️",
    tagline: "The Complete Bhagavad Gita Knowledge Library",
    subtitle: "Ask Anything from Gita.ai — all 18 chapters, 700 verses, every major commentary, translations, and the timeless teachings of Lord Krishna.",
    placeholder: "Ask Anything from Gita.ai...",
    buttonLabel: "Ask Gita.ai",
    footerMantra: "Jai Shri Krishna",
    footerText: "Gita.ai — Illuminating the eternal song of the Divine",
    exploreLabel: "Explore the timeless wisdom of the Gita",
    chatSubtitle: "Explore the Bhagavad Gita — all versions, commentaries, and the teachings of Lord Krishna",
    inputPlaceholder: "Ask about the Bhagavad Gita...",
    sourceLine: "Gita.ai draws from all major translations, commentaries by Shankaracharya, Ramanujacharya, Madhvacharya, and modern scholars",
  },
  veda: {
    id: "veda",
    name: "Veda.ai",
    domain: "Veda.ai",
    symbol: "📜",
    tagline: "The Complete Encyclopaedia of All Vedas",
    subtitle: "Ask Anything from Veda.ai — Rigveda, Yajurveda, Samaveda, Atharvaveda, Brahmanas, Aranyakas, Upanishads, and Vedangas.",
    placeholder: "Ask Anything from Veda.ai...",
    buttonLabel: "Ask Veda.ai",
    footerMantra: "Om Asato Ma Sadgamaya",
    footerText: "Veda.ai — Preserving the most ancient knowledge of humanity",
    exploreLabel: "Explore the most ancient wisdom of humanity",
    chatSubtitle: "Explore all four Vedas — hymns, rituals, philosophy, and the foundation of all Hindu knowledge",
    inputPlaceholder: "Ask about the Vedas...",
    sourceLine: "Veda.ai draws from Rigveda, Yajurveda, Samaveda, Atharvaveda, Brahmanas, Aranyakas, Upanishads, and Vedangas",
  },
};

export function getTabConfig(tabId: string | null): TabConfig {
  if (tabId && tabId in TABS) return TABS[tabId as TabId];
  return TABS.shiv;
}
