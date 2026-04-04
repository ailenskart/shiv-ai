import { SHIVA_SYSTEM_PROMPT } from "@/lib/shiva-knowledge";
import { GITA_SYSTEM_PROMPT } from "@/lib/gita-knowledge";
import { VEDA_SYSTEM_PROMPT } from "@/lib/veda-knowledge";
import { BUDDHA_SYSTEM_PROMPT } from "@/lib/buddha-knowledge";
import { CHRISTIANITY_SYSTEM_PROMPT } from "@/lib/christianity-knowledge";
import { QURAN_SYSTEM_PROMPT } from "@/lib/quran-knowledge";
import { JAINISM_SYSTEM_PROMPT } from "@/lib/jainism-knowledge";
import { ALL_KNOWLEDGE_SYSTEM_PROMPT } from "@/lib/all-knowledge";

export const runtime = "edge";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}


function getSystemPrompt(tab: string): string {
  if (tab === "gita") return GITA_SYSTEM_PROMPT;
  if (tab === "veda") return VEDA_SYSTEM_PROMPT;
  if (tab === "buddha") return BUDDHA_SYSTEM_PROMPT;
  if (tab === "christ") return CHRISTIANITY_SYSTEM_PROMPT;
  if (tab === "quran") return QURAN_SYSTEM_PROMPT;
  if (tab === "jain") return JAINISM_SYSTEM_PROMPT;
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
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
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

export async function POST(request: Request) {
  try {
    const { messages, tab = "shiv" }: { messages: ChatMessage[]; tab?: string } = await request.json();

    const validTab: string = ["shiv", "gita", "veda", "buddha", "christ", "quran", "jain", "all"].includes(tab) ? tab : "shiv";
    const latestQuestion = messages.filter((m) => m.role === "user").pop()?.content || "";

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let provider = "fallback";
    if (anthropicKey) provider = "anthropic";
    else if (openaiKey) provider = "openai";

    logQuery(latestQuestion, provider, validTab, request);

    const systemPrompt = await getEnhancedSystemPrompt(validTab);

    if (anthropicKey) {
      return streamFromAnthropic(messages, anthropicKey, systemPrompt);
    } else if (openaiKey) {
      return streamFromOpenAI(messages, openaiKey, systemPrompt);
    } else {
      return generateFallbackResponse(messages, validTab);
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

async function streamFromAnthropic(messages: ChatMessage[], apiKey: string, systemPrompt: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
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
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Anthropic API error:", errorText);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                  controller.enqueue(encoder.encode(parsed.delta.text));
                }
              } catch { /* skip */ }
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

async function streamFromOpenAI(messages: ChatMessage[], apiKey: string, systemPrompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) controller.enqueue(encoder.encode(content));
              } catch { /* skip */ }
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

function generateFallbackResponse(messages: ChatMessage[], tab: string): Response {
  const fallbacks: Record<string, string> = {
    shiv: `## Welcome to Shiv.ai\n\nI am **Shiv.ai**, the world's largest Shiva knowledge library. Please ensure the API key is configured for full AI-powered responses.\n\nOm Namah Shivaya`,
    gita: `## Welcome to Gita.ai\n\nI am **Gita.ai**, dedicated to the timeless wisdom of the Bhagavad Gita. Please ensure the API key is configured for full AI-powered responses.\n\nJai Shri Krishna`,
    veda: `## Welcome to Veda.ai\n\nI am **Veda.ai**, the most comprehensive Vedic knowledge system ever created. Please ensure the API key is configured for full AI-powered responses.\n\nOm`,
      buddha: "Namo Buddhaya \u2638\uFE0F The path to understanding begins with the Four Noble Truths. Buddhism teaches that suffering (dukkha) can be understood, its causes addressed, and liberation achieved through the Noble Eightfold Path. How may I illuminate the Dharma for you?",
    christ: "Peace be with you \u271D\uFE0F Christ.ai is the comprehensive Christian wisdom library. The teachings of Jesus Christ emphasize love, grace, forgiveness, and the Kingdom of God. How may I illuminate Scripture for you?",
    quran: "Bismillah ir-Rahman ir-Rahim \u262A\uFE0F Quran.ai is the comprehensive Islamic knowledge library. The Holy Quran is the divine guidance for all humanity. How may I share the wisdom of the Quran with you?",
    jain: "Jai Jinendra \uD83D\uDD49\uFE0F Jain.ai is the comprehensive Jain wisdom library. The path of Ahimsa (non-violence) and the teachings of the 24 Tirthankaras guide us toward liberation. How may I share Jain wisdom with you?",
    all: "Welcome to the Universal Wisdom Library \uD83C\uDF0D All the world's great spiritual traditions unite here. From the Vedas to the Bible, from the Quran to the teachings of Buddha and Mahavira — ask anything and receive wisdom drawn from all faiths. How may universal wisdom guide you today?",
  };

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

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
