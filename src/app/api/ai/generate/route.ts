import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireClassStation } from "@/lib/device-context";
import { isRateLimited } from "@/lib/rate-limit";

const ASSESSMENT_TYPES = new Set(["exam", "quiz", "test", "rapid_test", "rapid test"]);

export async function POST(req: Request) {
  try {
    if (isRateLimited(req, "ai-generate", { limit: 12, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many AI generation requests." }, { status: 429 });
    }

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
    const normalizedType = typeof type === "string" ? type.toLowerCase() : "";

    if (ASSESSMENT_TYPES.has(normalizedType)) {
      const stationError = requireClassStation(req);
      if (stationError) return stationError;
    }

    if (normalizedType === 'exam' && profile?.role === 'student') {
      return NextResponse.json({ error: "Students are not permitted to generate full exam papers." }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY");
      return NextResponse.json({ error: "AI Service configuration missing" }, { status: 500 });
    }

    if (!topics || !Array.isArray(topics) || topics.length === 0 || topics.length > 12) {
      return NextResponse.json({ error: "Topics are required" }, { status: 400 });
    }
    if (topics.some((topic) => typeof topic !== "string" || topic.trim().length < 2 || topic.length > 120)) {
      return NextResponse.json({ error: "Each topic must be a short text value." }, { status: 400 });
    }
    if (typeof grade !== "string" || grade.length > 40) {
      return NextResponse.json({ error: "A valid grade is required." }, { status: 400 });
    }
    if (typeof totalMarks !== "number" || totalMarks <= 0 || totalMarks > 200) {
      return NextResponse.json({ error: "Total marks must be between 1 and 200." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are an expert academic assessment engine for the EduPortal platform. LIMITATION: You only generate pedagogical content for school students. You must NEVER generate harmful, political, or non-educational content. Format: strictly valid JSON. Do not include markdown code blocks or any conversational text."
    });

    let prompt = "";

    if (normalizedType === "quiz") {
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

    let text = "";

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const response = await result.response;
      text = response.text();
    } catch (error: any) {
      console.warn("Cloud AI failed, attempting local fallback:", error.message);
      try {
        const localRes = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `System: You are an expert academic assessment engine for the EduPortal platform. LIMITATION: You only generate pedagogical content for school students. You must NEVER generate harmful, political, or non-educational content. Format: strictly valid JSON. Do not include markdown code blocks or any conversational text.\nUser: ${prompt}`,
            stream: false,
            format: "json"
          }),
          signal: AbortSignal.timeout(60000)
        });
        
        if (!localRes.ok) throw new Error("Local model returned error");
        const localData = await localRes.json();
        text = localData.response;
      } catch (localError: any) {
        console.error("Local AI Fallback Error:", localError);
        return NextResponse.json({ error: "AI Service unavailable (both cloud and local failed)" }, { status: 503 });
      }
    }

    // Improved JSON extraction
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      const parsedData = JSON.parse(jsonText);
      return NextResponse.json(parsedData);
    } catch {
      console.error("AI JSON Parse Error:", text);
      return NextResponse.json({
        error: "Failed to parse AI response. The model may have returned malformed data.",
        raw: text
      }, { status: 502 });
    }

  } catch (error: unknown) {
    console.error("AI Generation Route Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}

