import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { image, subject } = await req.json();

    if (!image) return NextResponse.json({ error: "No image data provided" }, { status: 400 });

    // 1. Simulate NPU Pre-processing
    // In a real EduOS environment, the Luckfox NPU would handle the first layer of 
    // noise reduction and edge detection before sending to the cloud.


    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Vision API Call (Gemini handles the heavy OCR/Correction)
    const prompt = `You are an AI Education Assistant. Analyze this handwritten student notebook scan for the subject: ${subject}.
    1. Extract the text accurately.
    2. Correct any conceptual or grammatical errors.
    3. Provide a short encouraging feedback comment.
    Format the response as JSON: { "extractedText": "...", "corrections": "...", "feedback": "..." }`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image.split(',')[1], // Strip base64 prefix
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)![0]);
      return NextResponse.json(parsed);
    } catch (e) {
      return NextResponse.json({ raw: text });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
