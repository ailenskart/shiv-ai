import { SHIVA_SYSTEM_PROMPT } from "@/lib/shiva-knowledge";

export const runtime = "edge";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await request.json();

    // Try Anthropic API first, then OpenAI as fallback
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (anthropicKey) {
      return streamFromAnthropic(messages, anthropicKey);
    } else if (openaiKey) {
      return streamFromOpenAI(messages, openaiKey);
    } else {
      // Return a rich fallback response using the knowledge base
      return generateFallbackResponse(messages);
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

async function streamFromAnthropic(messages: ChatMessage[], apiKey: string) {
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
      system: SHIVA_SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
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
                if (
                  parsed.type === "content_block_delta" &&
                  parsed.delta?.type === "text_delta"
                ) {
                  controller.enqueue(encoder.encode(parsed.delta.text));
                }
              } catch {
                // skip invalid JSON
              }
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

async function streamFromOpenAI(messages: ChatMessage[], apiKey: string) {
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
        { role: "system", content: SHIVA_SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
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
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // skip
              }
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

// Comprehensive fallback knowledge base for when no API key is set
function generateFallbackResponse(messages: ChatMessage[]): Response {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";

  const knowledge: Record<string, string> = {
    "who is": `## Lord Shiva â Mahadev, The Great God

Lord Shiva, known as **Mahadev** (The Great God), is one of the principal deities of Hinduism and the Supreme Being within **Shaivism**, one of the oldest and most widespread traditions in Hindu philosophy.

### The Infinite Dimensions of Shiva

Shiva is not simply a "god" in the Western sense â He is understood as the **ultimate reality (Brahman)** in Shaivite traditions, the consciousness that pervades all existence. The **Shvetashvatara Upanishad** (one of the most important Shaivite scriptures) declares: *"He is the one God, hidden in all beings, all-pervading, the Self within all beings."*

**As Destroyer in the Trimurti:** In the popular understanding, Shiva is the Destroyer in the Hindu Trinity (Trimurti) alongside Brahma (Creator) and Vishnu (Preserver). But this "destruction" is not annihilation â it is **transformation**, the dissolution that makes new creation possible.

**As Adi Yogi:** Shiva is considered the **first yogi (Adi Yogi)** â the originator of yoga and meditation. According to tradition, He first transmitted yogic knowledge to the **Saptarishis (Seven Sages)** at Kantisarovar near Kedarnath, approximately 15,000 years ago.

**As Nataraja:** His cosmic dance (Ananda Tandava) represents the five divine acts â **creation, preservation, destruction, concealment, and grace** â the eternal cycle of the universe.

**As Ardhanarishvara:** The half-male, half-female form represents the inseparable union of **Shiva (consciousness) and Shakti (energy)**, demonstrating that the masculine and feminine are two aspects of one reality.

The name "Shiva" itself means **"The Auspicious One"** â paradoxically, He who appears fierce and terrifying is, at his core, the most benevolent force in existence.

Om Namah Shivaya ð`,

    "jyotirlinga": `## The 12 Jyotirlingas â Pillars of Infinite Light

The **Jyotirlingas** are twelve sacred shrines of Lord Shiva considered the most holy Shaivite temples in India. The word "Jyotirlinga" means **"pillar of light"** â each represents a location where Shiva appeared as an infinite column of radiance.

### The Origin Story (Lingodbhava)

According to the **Shiva Purana**, once Brahma and Vishnu debated who was supreme. Shiva appeared as an **endless pillar of blazing light** and challenged them to find its ends. Brahma flew upward as a swan; Vishnu dove downward as a boar. Neither could find the limit â proving Shiva's infinity.

### The Sacred Twelve

1. **Somnath** (Gujarat) â "Lord of the Moon." Destroyed and rebuilt multiple times, symbolizing the eternal resilience of faith.
2. **Mallikarjuna** (Andhra Pradesh) â On Shri Shaila mountain. Associated with Shiva and Parvati's love story.
3. **Mahakaleshwar** (Ujjain, MP) â "Lord of Time." The only south-facing Jyotirlinga. Associated with Shiva as Mahakala.
4. **Omkareshwar** (MP) â On an island shaped like the Om symbol in the Narmada River.
5. **Kedarnath** (Uttarakhand) â In the Himalayas at 11,755 ft. One of the Panch Kedar. Connected to the Pandavas' quest for Shiva's forgiveness.
6. **Bhimashankar** (Maharashtra) â Associated with Shiva's defeat of the demon Bhima.
7. **Kashi Vishwanath** (Varanasi) â In the holiest city. Shiva as "Lord of the Universe." Moksha-granting.
8. **Trimbakeshwar** (Maharashtra) â Source of the Godavari River. The only Lingam with three faces representing Brahma, Vishnu, and Shiva.
9. **Vaidyanath** (Jharkhand) â "Lord of Physicians." Connected to Ravana's devotion.
10. **Nageshwar** (Gujarat) â "Lord of Serpents." Shiva's protection of devotee Supriya from demon Daaruka.
11. **Rameshwaram** (Tamil Nadu) â Established by Lord Rama before crossing to Lanka. Bridge between Shaivism and Vaishnavism.
12. **Grishneshwar** (Maharashtra) â Near Ellora Caves. "Lord of Compassion."

Pilgrimage to all twelve Jyotirlingas is considered one of the most sacred spiritual journeys in Hinduism.

Om Namah Shivaya ð`,

    "nataraja": `## Nataraja â The Cosmic Dancer

**Nataraja** (Sanskrit: à¤¨à¤à¤°à¤¾à¤, "Lord of Dance") is perhaps the most iconic and philosophically profound representation of Shiva. The image of Shiva performing the **Ananda Tandava** â the Dance of Bliss â encodes an entire cosmology in a single visual form.

### The Symbolism

Every element of the Nataraja image carries deep meaning:

**The Dance (Ananda Tandava):** This is not mere performance â it is the **pulsation of the cosmos itself**. The dance represents the eternal cycle of creation and dissolution that keeps the universe alive.

**The Five Acts (Pancha Kritya):**
- **Srishti** (Creation) â symbolized by the drum (damaru)
- **Sthiti** (Preservation) â symbolized by the Abhaya Mudra (fear-not gesture)
- **Samhara** (Destruction) â symbolized by the fire
- **Tirobhava** (Concealment/Illusion) â symbolized by the foot pressing on the dwarf Apasmara
- **Anugraha** (Grace/Liberation) â symbolized by the raised left foot

**The Damaru (Drum):** Held in the upper right hand, it represents the **primordial sound (Nada Brahman)** â the cosmic vibration from which all creation emerges. According to tradition, the **14 Maheshwara Sutras** â the foundational phonemes of Sanskrit grammar â originated from the beats of Shiva's damaru.

**The Fire:** In the upper left hand, it represents **transformation and dissolution** â the energy that dissolves the old to make way for the new.

**Apasmara (The Dwarf):** Shiva dances upon the demon of **ignorance and forgetfulness**. This represents the triumph of awareness over unconsciousness.

**The Ring of Fire (Prabha Mandala):** The cosmic fire circle represents **Samsara** â the cycle of birth and death â and simultaneously the fire of transformation.

### Science & Nataraja

Physicist **Fritjof Capra** in *The Tao of Physics* (1975) drew profound parallels between Nataraja's dance and quantum field theory â both describe reality as a dynamic, ever-changing dance of energy. A statue of Nataraja stands at **CERN**, the European Center for Nuclear Research, symbolizing the cosmic dance of subatomic particles.

### Chidambaram â The Hall of Consciousness

The greatest Nataraja temple is at **Chidambaram, Tamil Nadu** â where Shiva performs the cosmic dance in the **Chit Sabha (Hall of Consciousness)**. The temple's inner sanctum contains the famous **Chidambara Rahasyam** â "the secret of Chidambaram" â an empty space behind a curtain, representing Shiva as **formless consciousness**.

Om Namah Shivaya ð`,

    "namah shivaya": `## Om Namah Shivaya â The Panchakshari Mantra

**Om Namah Shivaya** (à¥ à¤¨à¤®à¤ à¤¶à¤¿à¤µà¤¾à¤¯) is the most sacred and widely chanted mantra in Shaivism, known as the **Panchakshari** (Five-Syllable) mantra. It is considered the supreme mantra that contains within it the essence of all spiritual knowledge.

### Meaning

**Om** â The primordial sound, the vibration of the cosmos
**Namah** â "I bow to" / "Salutations to" / "I surrender to"
**Shivaya** â "To Shiva" / "To the Auspicious One" / "To the Supreme Consciousness"

Complete meaning: **"I bow to Shiva"** or, more profoundly, **"I bow to the divine consciousness that is my true Self."**

### The Five Sacred Syllables (Na-Ma-Shi-Va-Ya)

Each of the five syllables corresponds to one of the **five elements** and one of the **five faces of Shiva (Pancha Brahma)**:

- **Na** â Earth (Prithvi) â Sadyojata face (West)
- **Ma** â Water (Jala) â Vamadeva face (North)
- **Shi** â Fire (Agni) â Aghora face (South)
- **Va** â Air (Vayu) â Tatpurusha face (East)
- **Ya** â Ether/Space (Akasha) â Ishana face (Upward)

### Scriptural Source

The mantra appears in the **Shri Rudram** (Yajurveda), in the passage: *"Namah Shivaya cha, Shivataraya cha"* â "Salutations to Shiva and to the most auspicious One." The **Shiva Purana** declares it to be the king of all mantras (Mantra Raja).

### How to Practice

The mantra can be chanted audibly (Vaikhari), whispered (Upamshu), or silently in the mind (Manasika). Traditional practice involves chanting 108 repetitions using a **Rudraksha mala**. It can be chanted at any time, in any state â there are no restrictions on who may chant it or when.

In **Kashmir Shaivism**, the mantra is understood as the soul's recognition of its own identity with Shiva â not a prayer to an external deity, but an awakening to one's own divine nature.

Om Namah Shivaya ð`,

    "meditation": `## The 112 Meditation Techniques of the Vijnana Bhairava Tantra

The **Vijnana Bhairava Tantra** is one of the most remarkable meditation manuals ever composed â a conversation between **Shiva (as Bhairava)** and **Shakti (as Bhairavi)** in which Shiva reveals **112 dharanas (meditation techniques)** for realizing the ultimate reality.

### Context

Shakti asks Bhairava: *"What is your true nature? What is this wonder-filled universe? What constitutes the seed of this wheel of existence? How can I enter it fully?"*

In response, Shiva gives 112 practical methods â not philosophical arguments, but **direct experiential techniques** covering every possible doorway into expanded consciousness.

### Categories of Techniques

**Breath-Based (Dharanas 1-6):** Focus on the breath â the junction points between inhalation and exhalation, the pause at the top and bottom of the breath, the subtle prana flow.

**Awareness of Inner Space (7-15):** Meditation on the void, inner space, the space between thoughts, the heart center as infinite sky.

**Sound/Nada (16-25):** Listening to inner sounds (Anahata Nada), chanting mantras, meditating on the resonance of Om, the unstruck sound.

**Sensation & Body (26-40):** Using pleasure, pain, touch, sexual energy, eating, physical sensations as doorways to presence.

**Visual/Light (41-55):** Gazing at the sky, sunlight, darkness, the space between objects, visualizing light in various chakras.

**Contemplation of Elements (56-70):** Meditating on earth, water, fire, air, and space as they manifest within one's own body.

**Mind & Thought (71-90):** Observing the gap between thoughts, the origin of desire, the nature of "I", the dissolution of identity.

**Devotional/Bhakti (91-100):** Intense devotion, gratitude, wonder, the feeling of being completely satisfied, seeing the divine in everything.

**Beyond Techniques (101-112):** Paradoxical methods â meditating on nothingness, on the impossibility of meditation itself, on pure being without any object.

### Why This Text Matters

The Vijnana Bhairava Tantra demonstrates Shiva's teaching that **every moment of human experience** can become a doorway to enlightenment. You don't need to withdraw from life â you need to be **fully present** in it.

This text has deeply influenced modern meditation movements worldwide, including the work of **Osho**, who gave extensive commentaries on it, and many contemporary mindfulness teachers.

Om Namah Shivaya ð`,

    "kashmir": `## Kashmir Shaivism â The Crown Jewel of Non-Dual Philosophy

**Kashmir Shaivism** (also called **Trika Shaivism**) is one of the most sophisticated and profound philosophical systems ever developed â a non-dual tradition that flowered in the Kashmir Valley between the 8th and 12th centuries CE.

### Core Teaching

The fundamental teaching is breathtakingly simple yet infinitely deep: **You are Shiva.** Not metaphorically, not after some future attainment, but right now, in this very moment. The only "problem" is that you have forgotten â and the path is one of **recognition (Pratyabhijna)**, not achievement.

### Key Concepts

**Prakasha and Vimarsha:** Reality has two inseparable aspects â **Prakasha** (the light of pure consciousness / Shiva) and **Vimarsha** (self-reflective awareness / Shakti). Consciousness is not static â it is a living, pulsating, self-aware light.

**The 36 Tattvas:** Kashmir Shaivism maps reality through 36 categories of existence (tattvas), from Shiva Tattva (pure consciousness) down through increasingly contracted levels to Prithvi (earth). This is a more detailed map than Samkhya's 25 tattvas.

**Spanda (Vibration):** All of reality is a **vibration (spanda)** of Shiva's consciousness. The universe is not separate from Shiva â it is Shiva's creative pulsation. As the **Spanda Karikas** state: *"Shiva is the vibration of consciousness."*

**Five Acts:** Shiva continuously performs five acts â creation, maintenance, dissolution, concealment (Maya), and grace (revelation). These aren't sequential â they happen simultaneously in every moment.

### Great Masters

- **Vasugupta** (c. 875 CE) â Received the **Shiva Sutras** inscribed on a rock, revealed in a dream by Shiva himself
- **Somananda** â Wrote the **Shivadrishti**, establishing the Recognition school
- **Utpaladeva** â Student of Somananda, wrote **Ishvara Pratyabhijna Karikas**
- **Abhinavagupta** (c. 950-1016 CE) â The towering genius of the tradition. Author of the **Tantraloka** (encyclopedic masterwork), **Paratrishika Vivarana**, and many other works. Synthesized all Shaivite traditions into a coherent whole
- **Kshemaraja** â Abhinavagupta's chief disciple, wrote the **Pratyabhijna Hridayam** ("Heart of Recognition") â the best entry point into this philosophy

### How It Differs from Advaita Vedanta

While both are non-dual, Kashmir Shaivism differs from Shankara's Advaita Vedanta in a crucial way: **the world is not Maya (illusion) â it is real.** The universe is Shiva's creative expression, His art, His play (Lila). The goal is not to negate the world but to **see it as it truly is â an expression of divine consciousness.**

Om Namah Shivaya ð`,

    "default": `## Welcome to Shiv.ai â The World's Largest Shiva Knowledge Library

Thank you for your question! I am **Shiv.ai**, and I hold within me the vast ocean of knowledge about **Lord Shiva â Mahadev**, drawn from thousands of years of scriptures, philosophy, mythology, art, and living traditions.

I can help you explore:

**Sacred Scriptures** â The Vedas, Upanishads, Shiva Purana, Linga Purana, Shaiva Agamas, Kashmir Shaivite texts like the Shiva Sutras and Tantraloka, Tamil Shaivite canon (Tirumurai), and many more.

**Philosophy** â Kashmir Shaivism, Shaiva Siddhanta, Lingayatism, Pashupata, Nath tradition, Aghori path, and the profound non-dual teachings of masters like Abhinavagupta.

**Forms of Shiva** â Nataraja, Ardhanarishvara, Dakshinamurti, Bhairava, Rudra, Pashupati, Mahakala, Sadashiva, Neelakantha, and many more manifestations.

**Sacred Places** â The 12 Jyotirlingas, Pancha Bhuta Sthalas, Kailash, Varanasi, Chidambaram, Amarnath, and temples across India, Nepal, and Southeast Asia.

**Mantras & Practices** â Om Namah Shivaya, Maha Mrityunjaya Mantra, Rudram, 112 techniques of Vijnana Bhairava Tantra, yoga, meditation, and devotional practices.

**Mythology** â The churning of the ocean, Sati and Daksha's fire, marriage with Parvati, birth of Ganesha and Kartikeya, the cosmic dance, and countless other narratives.

**Arts & Culture** â Shiva in classical dance, music, sculpture, literature, and contemporary culture.

Please ask me anything specific and I will share the deepest knowledge available on your topic.

Om Namah Shivaya ð`,
  };

  // Find best matching response
  let response = knowledge["default"];
  for (const [key, value] of Object.entries(knowledge)) {
    if (key !== "default" && lastMessage.includes(key)) {
      response = value;
      break;
    }
  }

  // Simulate streaming with a readable stream
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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
