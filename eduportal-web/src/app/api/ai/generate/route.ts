import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Role-Based Access Control (Security Fix for SSPH-01)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const { type, topics, grade, difficulty, totalMarks } = await req.json();

    if (type === 'exam' && profile?.role === 'student') {
      return NextResponse.json({ error: "Students are not permitted to generate full exam papers." }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY");
      return NextResponse.json({ error: "AI Service configuration missing" }, { status: 500 });
    }

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: "Topics are required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";

    if (type === "quiz") {
      prompt = `Generate a Multiple Choice Quiz for ${grade} students on the following topics: ${topics.join(", ")}. 
      Difficulty: ${difficulty}. 
      Total Marks: ${totalMarks}. 
      Provide exactly 5 questions.
      Format the response as a JSON array of objects with keys: question (string), options (array of strings), and correctAnswer (index of correct option).
      Return ONLY the raw JSON array. Do not include markdown formatting or extra text.`;
    } else {
      prompt = `Generate a Subjective Exam Paper for ${grade} students on the following topics: ${topics.join(", ")}. 
      Difficulty: ${difficulty}. 
      Total Marks: ${totalMarks}. 
      Include a mix of short and long answer questions.
      Format the response as a JSON object with sections (e.g., Section A, Section B) and questions.
      Return ONLY the raw JSON. Do not include markdown formatting or extra text.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Improved JSON extraction
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      const parsedData = JSON.parse(jsonText);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", text);
      return NextResponse.json({ 
        error: "Failed to parse AI response. The model may have returned malformed data.",
        raw: text 
      }, { status: 502 });
    }

  } catch (error: any) {
    console.error("AI Generation Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

