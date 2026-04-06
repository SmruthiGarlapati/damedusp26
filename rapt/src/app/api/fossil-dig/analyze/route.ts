import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { presenterNotes, scribeRecall, topic, presentationMinutes } = await req.json();

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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

    const data = await response.json();
    console.log("STATUS:", response.status);
    console.log("BODY:", JSON.stringify(data));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json({
        foundConcepts: [],
        missedConcepts: ["API error"],
        matchScore: 0,
        gapExplanation: JSON.stringify(data),
        reDigPrompt: "Please try again.",
      }, { status: 500 });
    }

    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch (e) {
    console.error("ERROR:", e);
    return NextResponse.json({
      foundConcepts: [],
      missedConcepts: ["Error analyzing"],
      matchScore: 0,
      gapExplanation: "Something went wrong.",
      reDigPrompt: "Please try again.",
    }, { status: 500 });
  }
}