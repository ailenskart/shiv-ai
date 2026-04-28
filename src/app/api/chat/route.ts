import { SHIVA_SYSTEM_PROMPT } from "@/lib/shiva-knowledge";
import { GITA_SYSTEM_PROMPT } from "@/lib/gita-knowledge";
import { VEDA_SYSTEM_PROMPT } from "@/lib/veda-knowledge";
import { BUDDHA_SYSTEM_PROMPT } from "@/lib/buddha-knowledge";
import { CHRISTIANITY_SYSTEM_PROMPT } from "@/lib/christianity-knowledge";
import { QURAN_SYSTEM_PROMPT } from "@/lib/quran-knowledge";
import { JAINISM_SYSTEM_PROMPT } from "@/lib/jainism-knowledge";
import { ALL_KNOWLEDGE_SYSTEM_PROMPT } from "@/lib/all-knowledge";
import { SIKH_SYSTEM_PROMPT } from "@/lib/sikh-knowledge";
import { TORAH_SYSTEM_PROMPT } from "@/lib/torah-knowledge";
import { TAO_SYSTEM_PROMPT } from "@/lib/tao-knowledge";

export const runtime = "edge";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const HEARTBEAT_BYTE = "​"; // zero-width space, invisible filler that keeps the connection alive
const HEARTBEAT_INTERVAL_MS = 10_000;
const UPSTREAM_IDLE_TIMEOUT_MS = 90_000;
const UPSTREAM_CONNECT_TIMEOUT_MS = 30_000;

function getSystemPrompt(tab: string): string {
  if (tab === "gita") return GITA_SYSTEM_PROMPT;
  if (tab === "veda") return VEDA_SYSTEM_PROMPT;
  if (tab === "buddha") return BUDDHA_SYSTEM_PROMPT;
  if (tab === "christ") return CHRISTIANITY_SYSTEM_PROMPT;
  if (tab === "quran") return QURAN_SYSTEM_PROMPT;
  if (tab === "jain") return JAINISM_SYSTEM_PROMPT;
  if (tab === "sikh") return SIKH_SYSTEM_PROMPT;
  if (tab === "torah") return TORAH_SYSTEM_PROMPT;
  if (tab === "tao") return TAO_SYSTEM_PROMPT;
  if (tab === "all") return ALL_KNOWLEDGE_SYSTEM_PROMPT;
  return SHIVA_SYSTEM_PROMPT;
}

async function getEnhancedSystemPrompt(tab: string): Promise<string> {
  const base = getSystemPrompt(tab);
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return base;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/knowledge_entries?source=eq.${tab}&select=title,content,category&order=created_at.desc&limit=100`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) return base;
    const entries = await res.json();
    if (!entries || entries.length === 0) return base;

    const extra = entries
      .map((e: { title: string; content: string; category: string }) => `### ${e.title} [${e.category}]\n${e.content}`)
      .join("\n\n");

    return `${base}\n\n## ADDITIONAL KNOWLEDGE (dynamically added)\n\n${extra}`;
  } catch {
    return base;
  }
}

async function logQuery(question: string, provider: string, tab: string, request: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await fetch(`${supabaseUrl}/rest/v1/queries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        question,
        source: tab,
        response_provider: provider,
        ip_address: ip,
        user_agent: userAgent,
      }),
    });
  } catch (e) {
    console.error("Failed to log query:", e);
  }
}

const STREAM_HEADERS: HeadersInit = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  // Disable proxy buffering (nginx, Vercel edge) so chunks reach the client immediately.
  "X-Accel-Buffering": "no",
};

export async function POST(request: Request) {
  try {
    const { messages, tab = "shiv" }: { messages: ChatMessage[]; tab?: string } = await request.json();

    const validTab: string = ["shiv", "gita", "veda", "buddha", "christ", "quran", "jain", "sikh", "torah", "tao", "all"].includes(tab) ? tab : "shiv";
    const latestQuestion = messages.filter((m) => m.role === "user").pop()?.content || "";

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let provider = "fallback";
    if (anthropicKey) provider = "anthropic";
    else if (openaiKey) provider = "openai";

    logQuery(latestQuestion, provider, validTab, request);

    const systemPrompt = await getEnhancedSystemPrompt(validTab);

    const formattedPrompt = systemPrompt + "\n\nIMPORTANT FORMATTING RULES: Write in natural, flowing prose. Do NOT use excessive bold (**text**) formatting. Do NOT use bullet points or numbered lists unless the user specifically asks for a list. Avoid markdown headers. Keep your tone warm, conversational, and wise — like a teacher speaking to a student, not a textbook. Use short paragraphs instead of lists. Only use bold sparingly for sacred text names or key Sanskrit/Arabic/Pali terms, not for every concept.";

    if (anthropicKey) {
      return streamFromAnthropic(messages, anthropicKey, formattedPrompt);
    } else if (openaiKey) {
      return streamFromOpenAI(messages, openaiKey, formattedPrompt);
    } else {
      return generateFallbackResponse(messages, validTab);
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * Wraps an upstream model stream in a resilient passthrough:
 *  - emits a zero-width heartbeat byte every HEARTBEAT_INTERVAL_MS so proxies don't kill an idle connection
 *  - aborts the upstream request if no bytes arrive for UPSTREAM_IDLE_TIMEOUT_MS
 *  - on upstream failure mid-stream, writes a plain-text marker so the client can render whatever it already has plus the reason
 */
function buildResilientStream(
  upstreamFetch: (signal: AbortSignal) => Promise<Response>,
  parseChunk: (raw: string, emit: (text: string) => void, state: { buffer: string }) => void
): Response {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const abortController = new AbortController();
      let lastByteAt = Date.now();
      let closed = false;

      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(HEARTBEAT_BYTE));
        } catch {
          /* controller already closed */
        }
      }, HEARTBEAT_INTERVAL_MS);

      const idleWatcher = setInterval(() => {
        if (Date.now() - lastByteAt > UPSTREAM_IDLE_TIMEOUT_MS) {
          abortController.abort(new Error("upstream idle timeout"));
        }
      }, 5_000);

      const cleanup = () => {
        closed = true;
        clearInterval(heartbeat);
        clearInterval(idleWatcher);
      };

      const connectTimer = setTimeout(() => {
        abortController.abort(new Error("upstream connect timeout"));
      }, UPSTREAM_CONNECT_TIMEOUT_MS);

      try {
        const upstream = await upstreamFetch(abortController.signal);
        clearTimeout(connectTimer);

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          console.error("Upstream error:", upstream.status, errText);
          controller.enqueue(
            encoder.encode(
              `\n\n_(The upstream model returned an error (${upstream.status}). Please try again.)_`
            )
          );
          cleanup();
          controller.close();
          return;
        }

        const reader = upstream.body!.getReader();
        const state = { buffer: "" };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            lastByteAt = Date.now();
            const chunk = decoder.decode(value, { stream: true });
            parseChunk(chunk, (text) => controller.enqueue(encoder.encode(text)), state);
          }
        } catch (err) {
          console.error("Stream read error:", err);
          controller.enqueue(
            encoder.encode("\n\n_(The stream was interrupted. The partial answer above is what we received before the connection was lost.)_")
          );
        }
      } catch (err) {
        clearTimeout(connectTimer);
        console.error("Upstream fetch error:", err);
        const reason = err instanceof Error ? err.message : "unknown error";
        controller.enqueue(
          encoder.encode(
            `\n\n_(Could not reach the model: ${reason}. Please try again — your question is preserved.)_`
          )
        );
      } finally {
        cleanup();
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}

function streamFromAnthropic(messages: ChatMessage[], apiKey: string, systemPrompt: string) {
  return buildResilientStream(
    (signal) =>
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
        signal,
      }),
    (chunk, emit, state) => {
      state.buffer += chunk;
      const lines = state.buffer.split("\n");
      state.buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
            emit(parsed.delta.text);
          }
        } catch {
          /* skip malformed line */
        }
      }
    }
  );
}

function streamFromOpenAI(messages: ChatMessage[], apiKey: string, systemPrompt: string) {
  return buildResilientStream(
    (signal) =>
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 4096,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          stream: true,
        }),
        signal,
      }),
    (chunk, emit, state) => {
      state.buffer += chunk;
      const lines = state.buffer.split("\n");
      state.buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) emit(content);
        } catch {
          /* skip malformed line */
        }
      }
    }
  );
}

function generateFallbackResponse(messages: ChatMessage[], tab: string): Response {
  const fallbacks: Record<string, string> = {
    shiv: `## Welcome to Shiv.ai\n\nI am **Shiv.ai**, the world's largest Shiva knowledge library. Please ensure the API key is configured for full AI-powered responses.\n\nOm Namah Shivaya`,
    gita: `## Welcome to Gita.ai\n\nI am **Gita.ai**, dedicated to the timeless wisdom of the Bhagavad Gita. Please ensure the API key is configured for full AI-powered responses.\n\nJai Shri Krishna`,
    veda: `## Welcome to Veda.ai\n\nI am **Veda.ai**, the most comprehensive Vedic knowledge system ever created. Please ensure the API key is configured for full AI-powered responses.\n\nOm`,
    buddha: "Namo Buddhaya ☸️ The path to understanding begins with the Four Noble Truths. Buddhism teaches that suffering (dukkha) can be understood, its causes addressed, and liberation achieved through the Noble Eightfold Path. How may I illuminate the Dharma for you?",
    christ: "Peace be with you ✝️ Christ.ai is the comprehensive Christian wisdom library. The teachings of Jesus Christ emphasize love, grace, forgiveness, and the Kingdom of God. How may I illuminate Scripture for you?",
    quran: "Bismillah ir-Rahman ir-Rahim ☪️ Quran.ai is the comprehensive Islamic knowledge library. The Holy Quran is the divine guidance for all humanity. How may I share the wisdom of the Quran with you?",
    jain: "Jai Jinendra 🕉️ Jain.ai is the comprehensive Jain wisdom library. The path of Ahimsa (non-violence) and the teachings of the 24 Tirthankaras guide us toward liberation. How may I share Jain wisdom with you?",
    all: "Welcome to the Universal Wisdom Library 🌍 All the world's great spiritual traditions unite here. From the Vedas to the Bible, from the Quran to the teachings of Buddha and Mahavira — ask anything and receive wisdom drawn from all faiths. How may universal wisdom guide you today?",
  };

  void messages;
  const response = fallbacks[tab] || fallbacks.shiv;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = response.split(" ");
      for (let i = 0; i < words.length; i++) {
        const word = (i === 0 ? "" : " ") + words[i];
        controller.enqueue(encoder.encode(word));
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}
