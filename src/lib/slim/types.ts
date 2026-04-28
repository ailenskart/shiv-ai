export type Tradition =
  | "shiv"
  | "gita"
  | "veda"
  | "buddha"
  | "christ"
  | "quran"
  | "jain"
  | "sikh"
  | "torah"
  | "tao";

export interface SlimSource {
  label: string;
  url: string;
}

export interface SlimEntry {
  id: string;
  tradition: Tradition;
  title: string;
  summary: string;
  text: string;
  tags: string[];
  sources: SlimSource[];
}

export interface RetrievalHit {
  entry: SlimEntry;
  score: number;
}

export interface KnowledgeBaseLink {
  tradition: Tradition;
  label: string;
  url: string;
  description: string;
}
