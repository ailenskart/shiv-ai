import type { KnowledgeBaseLink } from "./types";

export const KNOWLEDGE_BASES: KnowledgeBaseLink[] = [
  {
    tradition: "shiv",
    label: "Sacred-Texts: Shaiva",
    url: "https://sacred-texts.com/hin/index.htm",
    description: "Public-domain translations of Shiva Purana, Linga Purana and Shaiva Agamas.",
  },
  {
    tradition: "shiv",
    label: "Wisdom Library: Shaivism",
    url: "https://www.wisdomlib.org/hinduism/book/shiva-purana-english",
    description: "Searchable Shiva Purana with verse-level commentary.",
  },
  {
    tradition: "gita",
    label: "Bhagavad Gita (Vedabase)",
    url: "https://vedabase.io/en/library/bg/",
    description: "Sanskrit, transliteration, word-by-word and translation for all 700 verses.",
  },
  {
    tradition: "gita",
    label: "IIT-K Gita Supersite",
    url: "https://www.gitasupersite.iitk.ac.in/",
    description: "Bhagavad Gita with multiple commentaries side-by-side.",
  },
  {
    tradition: "veda",
    label: "Rig Veda (Sacred-Texts)",
    url: "https://sacred-texts.com/hin/rigveda/",
    description: "Griffith translation of all 10 mandalas of the Rig Veda.",
  },
  {
    tradition: "veda",
    label: "Vedic Heritage Portal (Govt. of India)",
    url: "https://vedicheritage.gov.in/",
    description: "Official archive of Vedic recitations, manuscripts and Upanishads.",
  },
  {
    tradition: "buddha",
    label: "SuttaCentral",
    url: "https://suttacentral.net/",
    description: "Early Buddhist texts in Pali, Sanskrit, Chinese and Tibetan with translations.",
  },
  {
    tradition: "buddha",
    label: "Access to Insight",
    url: "https://www.accesstoinsight.org/",
    description: "Theravada Tipitaka with extensive scholarly translations.",
  },
  {
    tradition: "christ",
    label: "Bible Gateway",
    url: "https://www.biblegateway.com/",
    description: "Holy Bible in 200+ translations, fully searchable.",
  },
  {
    tradition: "christ",
    label: "Vatican Library",
    url: "https://www.vatican.va/archive/index.htm",
    description: "Catechism, papal encyclicals and Church teaching.",
  },
  {
    tradition: "quran",
    label: "Quran.com",
    url: "https://quran.com/",
    description: "Holy Quran with multiple translations, recitations and tafsir.",
  },
  {
    tradition: "quran",
    label: "Sunnah.com",
    url: "https://sunnah.com/",
    description: "Authenticated collections of Hadith with chains of transmission.",
  },
  {
    tradition: "jain",
    label: "JainWorld",
    url: "https://www.jainworld.com/",
    description: "Jain Agamas, Tattvartha Sutra and Tirthankara biographies.",
  },
  {
    tradition: "sikh",
    label: "Sri Granth",
    url: "https://www.srigranth.org/",
    description: "Searchable Guru Granth Sahib with translations and Gurbani audio.",
  },
  {
    tradition: "sikh",
    label: "Sikhi to the Max",
    url: "https://www.sikhitothemax.org/",
    description: "Modern Gurbani search with English, Punjabi and transliteration.",
  },
  {
    tradition: "torah",
    label: "Sefaria",
    url: "https://www.sefaria.org/",
    description: "Open library of Jewish texts: Tanakh, Talmud, Mishnah, Kabbalah, with cross-links.",
  },
  {
    tradition: "torah",
    label: "Chabad.org Library",
    url: "https://www.chabad.org/library/",
    description: "Torah, Tanya and classical Jewish commentary in English.",
  },
  {
    tradition: "tao",
    label: "Chinese Text Project",
    url: "https://ctext.org/",
    description: "Tao Te Ching, Zhuangzi, Analects and I Ching in original Chinese with translations.",
  },
  {
    tradition: "tao",
    label: "Terebess Asia Online",
    url: "https://terebess.hu/english/tao/_index.html",
    description: "Multiple parallel translations of the Tao Te Ching.",
  },
];

export function knowledgeBasesFor(tradition: string): KnowledgeBaseLink[] {
  return KNOWLEDGE_BASES.filter((k) => k.tradition === tradition);
}
