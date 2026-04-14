import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { parseModelJson } from "@/lib/ai/parseModelJson";

export async function POST(req: NextRequest) {
  const { course, notes, partnerName } = await req.json();

  const key = process.env.GROQ_API_KEY;
  if (!key || key === "your_groq_api_key_here") {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 503 });
  }

  const groq = new Groq({ apiKey: key });

  const context = notes?.trim()
    ? `Session notes:\n"""\n${notes.trim()}\n"""`
    : `No notes yet — generate questions based on the course "${course}".`;

  const prompt = `You are a creative study-game designer. A student is in a live study session for "${course}" with ${partnerName ?? "a partner"}.

${context}

Generate highly engaging, tailored game content based on exactly what they are studying. Be specific to their notes — not generic. Make questions tricky but fair.

Also pick the 2 most relevant game types for this session from: "logic", "match", "fill", "speed", "fix".

Output ONLY a JSON object with this exact shape (no markdown fences):
{
  "recommended": ["gameId1", "gameId2"],
  "logic": [
    { "prompt": "1-2 sentence scenario or problem drawn from their notes", "options": ["option A", "option B", "option C", "option D"], "answer": 0, "explain": "brief explanation why" }
  ],
  "pairs": [
    { "term": "key term from their notes", "def": "precise definition, 1 sentence" }
  ],
  "fill": [
    { "sentence": "sentence using a concept from notes with ___ for the blank", "answer": "exact answer word/phrase", "options": ["answer","distractor1","distractor2","distractor3"] }
  ],
  "drill": [
    { "q": "statement about concepts in their notes — true or false?", "a": true }
  ],
  "fix": [
    { "scenario": "a common misconception or flawed reasoning about a concept in their notes", "issue": "what is actually wrong — be specific", "fix": "the correct understanding in 1-2 sentences" }
  ]
}

Rules:
- "logic": exactly 4 items. Options shuffled — answer index (0-3) must match the correct option's position.
- "pairs": exactly 5 items. Terms must be specific to what they studied.
- "fill": exactly 4 items. The ___ blank must have exactly one right answer. Include the answer in the options array (shuffled).
- "drill": exactly 8 items. Mix of true and false. No duplicates.
- "fix": exactly 3 items. Use real misconceptions students make about the specific topic.
- "recommended": exactly 2 game IDs from ["logic","match","fill","speed","fix"].
- Make everything feel alive and specific to THEIR session — not generic textbook questions.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 1800,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const data = parseModelJson(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Groq games error:", err);
    return NextResponse.json({ error: "Failed to generate games" }, { status: 500 });
  }
}
