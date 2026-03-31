export type TabId = "shiv" | "gita" | "veda" | "buddha";

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
    domain: "shiv.ai",
    symbol: "\u0950",
    tagline: "The World's Largest Lord Shiva Knowledge Library",
    subtitle: "Explore the profound wisdom of Lord Shiva",
    placeholder: "Ask anything and Shiv.ai will answer through the wisdom of Lord Shiva",
    buttonLabel: "Ask Shiv.ai",
    footerMantra: "\u0950 Namah Shivaya \uD83D\uDD31",
    footerText: "Powered by Shiv.ai \u2014 The World's Largest Shiva Knowledge Library",
    exploreLabel: "Explore Shiva Wisdom",
    chatSubtitle: "The World's Largest Lord Shiva Knowledge Library",
    inputPlaceholder: "Ask anything — powered by Shiva wisdom...",
    sourceLine: "Sources: Shiv Purana, Linga Purana, Vedic Texts",
  },
  gita: {
    id: "gita",
    name: "Gita.ai",
    domain: "gita.ai",
    symbol: "\uD83D\uDD49\uFE0F",
    tagline: "The Complete Bhagavad Gita Knowledge System",
    subtitle: "Dive into the timeless wisdom of the Bhagavad Gita",
    placeholder: "Ask anything and Gita.ai will answer through Krishna's teachings in the Bhagavad Gita",
    buttonLabel: "Ask Gita.ai",
    footerMantra: "\u0927\u0930\u094D\u092E\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0947 \u0915\u0941\u0930\u0941\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0947 \uD83D\uDCD6",
    footerText: "Powered by Gita.ai \u2014 The Complete Gita Knowledge System",
    exploreLabel: "Explore Gita Wisdom",
    chatSubtitle: "The Complete Bhagavad Gita Knowledge System",
    inputPlaceholder: "Ask anything — powered by Gita wisdom...",
    sourceLine: "Source: Bhagavad Gita, 18 Chapters, 700 Verses",
  },
  veda: {
    id: "veda",
    name: "Veda.ai",
    domain: "veda.ai",
    symbol: "\uD83D\uDCDC",
    tagline: "The Most Comprehensive Vedic Knowledge System",
    subtitle: "Explore the ancient wisdom of the Vedas",
    placeholder: "Ask anything and Veda.ai will answer through the ancient wisdom of the Vedas",
    buttonLabel: "Ask Veda.ai",
    footerMantra: "\u0905\u0938\u0924\u094B \u092E\u093E \u0938\u0926\u094D\u0917\u092E\u092F \uD83C\uDF3F",
    footerText: "Powered by Veda.ai \u2014 The Complete Vedic Knowledge System",
    exploreLabel: "Explore Vedic Wisdom",
    chatSubtitle: "The Most Comprehensive Vedic Knowledge System",
    inputPlaceholder: "Ask anything — powered by Vedic wisdom...",
    sourceLine: "Sources: Rig Veda, Yajur Veda, Sama Veda, Atharva Veda",
  },
  buddha: {
    id: "buddha",
    name: "Buddha.ai",
    domain: "buddha.ai",
    symbol: "\u2638\uFE0F",
    tagline: "The World's Most Comprehensive Buddhism Knowledge Library",
    subtitle: "Explore the path to awakening through Buddhist wisdom",
    placeholder: "Ask anything and Buddha.ai will answer through the teachings of Lord Buddha",
    buttonLabel: "Ask Buddha.ai",
    footerMantra: "\u0938\u0930\u094D\u0935\u0947 \u0938\u0924\u094D\u0924\u094D\u0935\u093E\u0903 \u0938\u0941\u0916\u093F\u0928\u094B \u092D\u0935\u0928\u094D\u0924\u0941 \u2638\uFE0F",
    footerText: "Powered by Buddha.ai \u2014 The Complete Buddhism Knowledge System",
    exploreLabel: "Explore Buddhist Wisdom",
    chatSubtitle: "The World's Most Comprehensive Buddhism Knowledge Library",
    inputPlaceholder: "Ask anything — powered by Buddhist wisdom...",
    sourceLine: "Sources: Tripitaka, Dhammapada, Heart Sutra, Lotus Sutra",
  },
};

export function getTabConfig(tab: TabId): TabConfig {
  return TABS[tab];
}
