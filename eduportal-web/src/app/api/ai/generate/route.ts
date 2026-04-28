import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { type, topics, grade, difficulty, totalMarks } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    if (type === "quiz") {
      prompt = `Generate a Multiple Choice Quiz for ${grade} students on the following topics: ${topics.join(", ")}. 
      Difficulty: ${difficulty}. 
      Total Marks: ${totalMarks}. 
      Provide exactly 5 questions.
      Format the response as a JSON array of objects with keys: question, options (array of strings), and correctAnswer (index).`;
    } else {
      prompt = `Generate a Subjective Exam Paper for ${grade} students on the following topics: ${topics.join(", ")}. 
      Difficulty: ${difficulty}. 
      Total Marks: ${totalMarks}. 
      Include a mix of short and long answer questions.
      Format the response as a JSON object with sections (e.g., Section A, Section B) and questions.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the markdown-formatted response if necessary
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    return NextResponse.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
