export type TabId = "shiv" | "gita" | "veda" | "buddha" | "christ" | "quran" | "jain" | "all";

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
  color: string;
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
    inputPlaceholder: "Ask anything \u2014 powered by Shiva wisdom...",
    sourceLine: "Sources: Shiv Purana, Linga Purana, Vedic Texts",
    color: "#FF6B00",
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
    inputPlaceholder: "Ask anything \u2014 powered by Gita wisdom...",
    sourceLine: "Source: Bhagavad Gita, 18 Chapters, 700 Verses",
    color: "#E6A817",
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
    inputPlaceholder: "Ask anything \u2014 powered by Vedic wisdom...",
    sourceLine: "Sources: Rig Veda, Yajur Veda, Sama Veda, Atharva Veda",
    color: "#7B68EE",
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
    inputPlaceholder: "Ask anything \u2014 powered by Buddhist wisdom...",
    sourceLine: "Sources: Tripitaka, Dhammapada, Heart Sutra, Lotus Sutra",
    color: "#D4A017",
  },
  christ: {
    id: "christ",
    name: "Christ.ai",
    domain: "christ.ai",
    symbol: "\u271D\uFE0F",
    tagline: "The Complete Christian Wisdom & Biblical Knowledge Library",
    subtitle: "Explore the teachings of Jesus Christ and the Holy Bible",
    placeholder: "Ask anything and Christ.ai will answer through the teachings of Jesus and the Bible",
    buttonLabel: "Ask Christ.ai",
    footerMantra: "For God so loved the world \u271D\uFE0F",
    footerText: "Powered by Christ.ai \u2014 The Complete Christian Knowledge System",
    exploreLabel: "Explore Christian Wisdom",
    chatSubtitle: "The Complete Christian Wisdom & Biblical Knowledge Library",
    inputPlaceholder: "Ask anything \u2014 powered by Biblical wisdom...",
    sourceLine: "Sources: Holy Bible, Old & New Testament, Church Teachings",
    color: "#4169E1",
  },
  quran: {
    id: "quran",
    name: "Quran.ai",
    domain: "quran.ai",
    symbol: "\u2622\uFE0F",
    tagline: "The Complete Quranic Wisdom & Islamic Knowledge Library",
    subtitle: "Explore the divine wisdom of the Holy Quran and Islamic teachings",
    placeholder: "Ask anything and Quran.ai will answer through the wisdom of the Holy Quran",
    buttonLabel: "Ask Quran.ai",
    footerMantra: "Bismillah ir-Rahman ir-Rahim \u262A\uFE0F",
    footerText: "Powered by Quran.ai \u2014 The Complete Islamic Knowledge System",
    exploreLabel: "Explore Quranic Wisdom",
    chatSubtitle: "The Complete Quranic Wisdom & Islamic Knowledge Library",
    inputPlaceholder: "Ask anything \u2014 powered by Quranic wisdom...",
    sourceLine: "Sources: Holy Quran, Hadith, Sunnah, Islamic Scholarship",
    color: "#2E8B57",
  },
  jain: {
    id: "jain",
    name: "Jain.ai",
    domain: "jain.ai",
    symbol: "\u2721\uFE0F",
    tagline: "The Complete Jain Philosophy & Wisdom Knowledge Library",
    subtitle: "Explore the path of non-violence and spiritual liberation",
    placeholder: "Ask anything and Jain.ai will answer through the wisdom of Jain Tirthankaras",
    buttonLabel: "Ask Jain.ai",
    footerMantra: "Parasparopagraho Jivanam \uD83D\uDD49\uFE0F",
    footerText: "Powered by Jain.ai \u2014 The Complete Jain Knowledge System",
    exploreLabel: "Explore Jain Wisdom",
    chatSubtitle: "The Complete Jain Philosophy & Wisdom Knowledge Library",
    inputPlaceholder: "Ask anything \u2014 powered by Jain wisdom...",
    sourceLine: "Sources: Agamas, Tattvartha Sutra, Teachings of Tirthankaras",
    color: "#FF4500",
  },
  all: {
    id: "all",
    name: "All Wisdom",
    domain: "shiv.ai",
    symbol: "🌍",
    tagline: "The Universal Multi-Faith Wisdom Library",
    subtitle: "Combined wisdom from all spiritual traditions",
    placeholder: "Ask anything and receive wisdom drawn from all the world's great spiritual traditions",
    buttonLabel: "Seek Universal Wisdom",
    footerMantra: "🕉️ Wisdom is One, Paths are Many 🕉️",
    sourceLine: "Source: All Sacred Texts & Traditions Combined",
    color: "#9333EA",
  },
};

export function getTabConfig(tab: TabId): TabConfig {
  return TABS[tab];
}
