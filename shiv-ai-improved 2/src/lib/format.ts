/**
 * Lightweight markdown-ish formatter helpers used by the chat UI.
 * We don't pull in a full markdown library to keep the bundle small.
 */

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface InlineSegment {
  type: "text" | "bold" | "italic" | "code" | "link";
  content: string;
  href?: string;
}

/**
 * Parse a single line of inline markdown into segments.
 * Supports: **bold**, *italic*, `code`, [text](url).
 * Order of operations matters — links are extracted first so URLs are not
 * mangled by italic/bold rules.
 */
export function parseInline(line: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  // Tokenize by greedy regex: link | bold | italic | code | plain
  const pattern = /(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: line.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith("[") && token.includes("](")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        segments.push({ type: "link", content: linkMatch[1], href: linkMatch[2] });
      } else {
        segments.push({ type: "text", content: token });
      }
    } else if (token.startsWith("**")) {
      segments.push({ type: "bold", content: token.slice(2, -2) });
    } else if (token.startsWith("*")) {
      segments.push({ type: "italic", content: token.slice(1, -1) });
    } else if (token.startsWith("`")) {
      segments.push({ type: "code", content: token.slice(1, -1) });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < line.length) {
    segments.push({ type: "text", content: line.slice(lastIndex) });
  }
  return segments;
}

/**
 * Convert markdown-ish text to safe HTML. Used by the PDF export so user
 * content (and model output) is properly escaped before being written into
 * a new window. Escape first, then re-introduce a small set of tags.
 */
export function toSafeHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}
