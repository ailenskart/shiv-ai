# Shiv.ai

**The Universal Spiritual Wisdom Library — AI answers grounded in 11 traditions.**

Shiv.ai is an open, multi-faith AI assistant that lets anyone ask deep questions
about the world's great spiritual traditions and receive answers drawn from their
sacred texts. It is built as a single Next.js app with a tab for each tradition,
each with its own dedicated system prompt, suggested questions, and theme.

Live: [shiv.ai](https://shiv.ai)

---

## Traditions covered

| Tab     | Sources                                                              |
| ------- | -------------------------------------------------------------------- |
| Shiv    | Shiv Purana, Linga Purana, Shaiva Agamas, Vedic texts                |
| Gita    | Bhagavad Gita — all 18 chapters / 700 verses                         |
| Veda    | Rig Veda, Yajur Veda, Sama Veda, Atharva Veda, Upanishads            |
| Buddha  | Tripitaka, Dhammapada, Heart Sutra, Lotus Sutra                      |
| Christ  | Holy Bible — Old & New Testament, church teachings                   |
| Quran   | Holy Quran, Hadith, Sunnah, Islamic scholarship                      |
| Jain    | Agamas, Tattvartha Sutra, teachings of the Tirthankaras              |
| Sikh    | Guru Granth Sahib, the Ten Gurus, Sikh history & philosophy          |
| Torah   | Torah, Talmud, Kabbalah, Jewish philosophy                           |
| Tao     | Tao Te Ching, Zhuangzi, Analects, I Ching                            |
| All     | Universal mode — combines wisdom from every tradition above          |

---

## Stack

- **Framework**: Next.js 16 (App Router, Edge runtime for `/api/chat`)
- **UI**: React 19 + Tailwind CSS 4
- **Language**: TypeScript
- **Models**: Anthropic Claude (preferred) or OpenAI GPT, with a built-in
  text fallback when no key is configured
- **Optional persistence**: Supabase (REST) for crowd-sourced knowledge entries
  and a query log

---

## Getting started

### Prerequisites

- Node.js 20+
- An Anthropic or OpenAI API key (the app runs without one, but answers are
  short fallbacks).

### Install & run

```bash
npm install
cp .env.example .env.local   # then fill in keys (see below)
npm run dev
```

Open <http://localhost:3000>.

### Build & deploy

```bash
npm run build
npm start
```

The app deploys cleanly to **Vercel**, **Netlify**, or any platform that supports
Next.js Edge runtimes.

---

## Environment variables

Create `.env.local` in the project root:

```bash
# Pick at least one. If both are present, Anthropic is used.
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Optional — enables crowd-sourced knowledge expansion + query logs.
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...

# Required if you use the /api/knowledge endpoint.
KNOWLEDGE_UPLOAD_SECRET=some-long-random-string
```

> **Security note:** in older versions, `KNOWLEDGE_UPLOAD_SECRET` had a hardcoded
> fallback. That is no longer the case — if the env var is missing, the upload
> endpoint refuses every request.

### Supabase schema

If you want to use `/api/knowledge`, create two tables:

```sql
create table knowledge_entries (
  id bigserial primary key,
  source text not null,
  title text not null,
  content text not null,
  category text default 'general',
  created_at timestamptz default now()
);

create table queries (
  id bigserial primary key,
  question text,
  source text,
  response_provider text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);
```

---

## Project layout

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # streaming chat endpoint (Claude/OpenAI/fallback)
│   │   └── knowledge/route.ts   # auth-protected CRUD for knowledge entries
│   ├── chat/page.tsx            # chat UI (client component)
│   ├── page.tsx                 # landing page with tradition tabs
│   ├── layout.tsx               # root layout + global SEO
│   └── globals.css              # Tailwind theme + per-tradition color tokens
└── lib/
    ├── tab-config.ts            # name, symbol, taglines, color per tradition
    ├── format.ts                # safe markdown-ish renderer
    ├── storage.ts               # localStorage chat persistence
    ├── shiva-knowledge.ts       # system prompts + suggested Qs per tradition
    ├── gita-knowledge.ts
    ├── veda-knowledge.ts
    └── …                         # one file per tradition
```

---

## How responses are generated

1. The user picks a tradition (or "All Wisdom").
2. The browser POSTs `{ messages, tab }` to `/api/chat`.
3. The route loads the system prompt for that tab (`SHIVA_SYSTEM_PROMPT`,
   `GITA_SYSTEM_PROMPT`, …), and optionally appends crowd-sourced entries from
   Supabase.
4. The route streams a response back from Claude or GPT, or — if no key is
   configured — replies with a short tradition-specific fallback so the app is
   still useful in demos.
5. Conversations are persisted in `localStorage` per tab so users can come back
   and pick up where they left off.

---

## Adding a new tradition

1. Create `src/lib/<name>-knowledge.ts` exporting:
   - `<NAME>_SYSTEM_PROMPT` (string)
   - `<NAME>_SUGGESTED_QUESTIONS` (string[])
   - `<NAME>_KNOWLEDGE_STATS` (`{ number, label }[]`) — used on the landing page
2. Add the tab to `TabId` and `TABS` in `src/lib/tab-config.ts`.
3. Add a `[data-tab="<id>"] { … }` color block in `src/app/globals.css`.
4. Wire the new prompt into `getSystemPrompt` in `src/app/api/chat/route.ts`.
5. Wire the new questions/stats into the `getQuestions` / `getStats` switches
   in `src/app/page.tsx` and `src/app/chat/page.tsx`.

---

## Contributing

Issues and PRs welcome. The repo is intentionally small and approachable —
most changes touch one of:
- A `*-knowledge.ts` file (content)
- `tab-config.ts` (metadata)
- `chat/page.tsx` or `page.tsx` (UX)

Please keep system prompts respectful of every tradition; avoid sectarian or
disparaging framings.

---

## License

Open knowledge is the lifeblood of every tradition this project draws from.
The code is provided as-is for personal and educational use. If you plan to
ship it commercially, please open an issue and we'll figure out a license that
makes sense.

---

🕉️ *Wisdom is one. Paths are many.*
