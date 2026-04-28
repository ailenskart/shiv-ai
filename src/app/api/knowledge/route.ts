import { NextResponse } from "next/server";

export const runtime = "edge";

// Backend upload endpoint to dynamically expand knowledge base
// POST /api/knowledge — Add new knowledge entry
// GET /api/knowledge?source=shiv — List entries for a source
// DELETE /api/knowledge?id=123 — Remove an entry

const UPLOAD_SECRET = process.env.KNOWLEDGE_UPLOAD_SECRET;

const VALID_SOURCES = [
  "shiv", "gita", "veda", "buddha", "christ", "quran",
  "jain", "sikh", "torah", "tao", "all",
] as const;

function isAuthorized(request: Request): boolean {
  // Require KNOWLEDGE_UPLOAD_SECRET to be set in env. Reject all requests if not.
  if (!UPLOAD_SECRET) return false;
  const header = request.headers.get("x-upload-secret") || "";
  return header === UPLOAD_SECRET;
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase not configured");
  }
  return { supabaseUrl, supabaseKey };
}

function supabaseHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

// POST: Add a knowledge entry
export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { source, title, content, category = "general" } = body;

    if (!source || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: source, title, content" },
        { status: 400 }
      );
    }

    if (!VALID_SOURCES.includes(source)) {
      return NextResponse.json(
        { error: `source must be one of: ${VALID_SOURCES.join(", ")}` },
        { status: 400 }
      );
    }

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();

    const res = await fetch(`${supabaseUrl}/rest/v1/knowledge_entries`, {
      method: "POST",
      headers: {
        ...supabaseHeaders(supabaseKey),
        Prefer: "return=representation",
      },
      body: JSON.stringify({ source, title, content, category }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Failed to insert", details: err }, { status: 500 });
    }

    const inserted = await res.json();
    return NextResponse.json({ success: true, entry: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error("Knowledge upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: List knowledge entries
export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();

    let url = `${supabaseUrl}/rest/v1/knowledge_entries?select=id,source,title,category,created_at&order=created_at.desc&limit=200`;
    if (source && (VALID_SOURCES as readonly string[]).includes(source)) {
      url += `&source=eq.${source}`;
    }

    const res = await fetch(url, {
      headers: supabaseHeaders(supabaseKey),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    const entries = await res.json();
    return NextResponse.json({ entries, count: entries.length });
  } catch (error) {
    console.error("Knowledge list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove a knowledge entry
export async function DELETE(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();

    const res = await fetch(`${supabaseUrl}/rest/v1/knowledge_entries?id=eq.${id}`, {
      method: "DELETE",
      headers: supabaseHeaders(supabaseKey),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted_id: id });
  } catch (error) {
    console.error("Knowledge delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
