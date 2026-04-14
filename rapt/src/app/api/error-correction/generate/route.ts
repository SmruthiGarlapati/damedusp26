import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { parseModelJson } from "@/lib/ai/parseModelJson";

export async function POST(req: NextRequest) {
  const { topic, notes } = await req.json();
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are an expert tutor. Create a summary of the following notes on "${topic}".

Source notes:
${notes?.trim() ? notes.trim() : "No notes provided. Infer a realistic study passage from the topic only."}
  
1. Write a cohesive 6-8 sentence summary of the core concepts.
2. Carefully inject exactly 3 to 5 errors into the summary. 
3. Errors should be realistic: swap definitions, alter key numbers/dates, or introduce logical fallacies that a student might actually make.
4. Keep the remaining sentences completely factual and correct.

Output ONLY a JSON object with this exact shape:
{
  "totalErrors": 3,
  "sentences": [
    {
      "id": "s1",
      "text": "The sentence as it should appear to the user (with or without an error).",
      "isError": true,
      "correctText": "If isError is true, put the corrected, factual version of the sentence here. Otherwise, leave empty."
    }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    const data = parseModelJson(completion.choices[0]?.message?.content ?? "{}");
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error correction generate error:", err);
    return NextResponse.json({ error: "Failed to generate game" }, { status: 500 });
  }
}
