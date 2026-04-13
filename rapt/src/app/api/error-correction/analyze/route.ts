import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  const { sentences, userComments, totalErrors } = await req.json();
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a generous, lenient learning analyst. 
A student played an error correction game. 
Here are the original sentences from the text (some have errors, some don't):
${JSON.stringify(sentences)}

Here are the sentences the student flagged as errors, and their reasoning:
${JSON.stringify(userComments)}

CRITICAL INSTRUCTIONS:
- Be LENIENT. If the student flagged the correct sentence and their reasoning is somewhat on the right track conceptually, mark it correct.
- If they flagged a correct sentence as an error, explain why they are mistaken.

Output ONLY a JSON object with this exact shape:
{
  "score": 2, 
  "totalErrors": ${totalErrors},
  "troublePoints": ["1-2 sentence summary of a concept they are struggling with based on their mistakes"],
  "feedback": [
    {
      "sentenceId": "s1",
      "isCorrect": true,
      "aiFeedback": "Brief encouraging explanation of why their reasoning was good, or a gentle correction if they were wrong."
    }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to grade game" }, { status: 500 });
  }
}