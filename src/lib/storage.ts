/**
 * Tiny localStorage helper for persisting chat conversations per tab.
 * Safe to call from server-rendered code — every operation is no-op if
 * `window` is unavailable.
 */
import type { TabId } from "./tab-config";

export type StoredMessage = { role: "user" | "assistant"; content: string };

const KEY_PREFIX = "shiv-ai:chat:";
const MAX_MESSAGES = 100; // soft cap to keep localStorage tidy

function key(tab: TabId): string {
  return `${KEY_PREFIX}${tab}`;
}

export function loadConversation(tab: TabId): StoredMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(tab));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is StoredMessage =>
        m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    );
  } catch {
    return [];
  }
}

export function saveConversation(tab: TabId, messages: StoredMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages.slice(-MAX_MESSAGES);
    window.localStorage.setItem(key(tab), JSON.stringify(trimmed));
  } catch {
    /* quota exceeded or storage disabled — ignore */
  }
}

export function clearConversation(tab: TabId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(tab));
  } catch {
    /* ignore */
  }
}
