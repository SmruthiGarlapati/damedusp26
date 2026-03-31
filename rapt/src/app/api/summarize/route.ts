import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  const { course, notes, partnerName } = await req.json();

  const key = process.env.GROQ_API_KEY;
  if (!key || key === "your_groq_api_key_here") {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 503 });
  }

  const groq = new Groq({ apiKey: key });

  const prompt = `You are an expert CS tutor. A student is in a live study session for "${course}" with ${partnerName ?? "a partner"}.
${notes?.trim() ? `Their session notes so far:\n"""\n${notes.trim()}\n"""` : "No notes taken yet."}

Generate a concise, structured AI study summary for this session. Output JSON with this exact shape:
{
  "headline": "one sentence describing the focus of this session",
  "concepts": [
    { "term": "string", "def": "1–2 sentence explanation with big-O if relevant", "color": "blue|green|purple|amber" }
  ],
  "complexity": [
    { "op": "string", "ll": "string", "bst_avg": "string", "bst_worst": "string" }
  ],
  "tip": "2–3 sentence exam/study tip personalized to the course and notes"
}
Return exactly 4 concepts. Return exactly 4 complexity rows. Output only the JSON object, no markdown fences.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    // Strip markdown fences if model wraps output
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const data = JSON.parse(clean);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Groq summarize error:", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
