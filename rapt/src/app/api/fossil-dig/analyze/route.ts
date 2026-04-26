import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { parseModelJson } from "@/lib/ai/parseModelJson";

export async function POST(req: NextRequest) {
  const { presenterNotes, scribeRecall, topic, presentationMinutes } = await req.json();

  const key = process.env.GROQ_API_KEY;
  if (!key || key === "your_groq_api_key_here") {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 503 });
  }

  const groq = new Groq({ apiKey: key });

  const prompt = `You are a generous and semantically-aware learning analyst for a study app called RAPT.

Topic: ${topic}
Presentation length: ${presentationMinutes} minutes

PRESENTER'S NOTES (the master material):
${presenterNotes}

SCRIBE'S BRAIN DUMP (recalled from memory after listening):
${scribeRecall}

CRITICAL INSTRUCTIONS:
- Use FUZZY SEMANTIC matching. If the scribe expresses the same idea in different words, that COUNTS as a match.
- Do NOT require exact terminology. "learning patterns from data" matches "Machine Learning definition". "y = wx + b" matches "Linear Regression model".
- Be GENEROUS. If the scribe clearly understood a concept even if they didn't use the exact words, mark it as found.
- Only mark a concept as missed if there is genuinely NO mention or implication of it anywhere in the scribe's dump.
- The matchScore should reflect true conceptual understanding, not keyword matching.

Extract 6-12 key concepts from the presenter's notes. For each concept, carefully read the ENTIRE scribe dump before deciding if it was recalled.

Return ONLY this JSON with no extra text:

{
  "foundConcepts": ["concept1", "concept2"],
  "missedConcepts": ["concept3"],
  "matchScore": 75,
  "gapExplanation": "2-3 sentences about what was genuinely missed",
  "reDigPrompt": "One sentence prompting re-explanation of only the truly missed concepts"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 900,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return NextResponse.json({
        foundConcepts: [],
        missedConcepts: ["API error"],
        matchScore: 0,
        gapExplanation: "Groq returned an empty response.",
        reDigPrompt: "Please try again.",
      }, { status: 500 });
    }

    const result = parseModelJson(text);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Groq fossil dig error:", e);
    return NextResponse.json({
      foundConcepts: [],
      missedConcepts: ["Error analyzing"],
      matchScore: 0,
      gapExplanation: "Something went wrong.",
      reDigPrompt: "Please try again.",
    }, { status: 500 });
  }
}
