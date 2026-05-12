import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { errorMessage, requireUser } from "@/lib/api-auth";
import { requireClassStation } from "@/lib/device-context";
import { isRateLimited } from "@/lib/rate-limit";
import { parseDataImage } from "@/lib/data-image";

const MAX_IMAGE_CHARS = 5_000_000;

export async function POST(req: Request) {
  try {
    if (isRateLimited(req, "ai-ocr", { limit: 20, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many OCR requests." }, { status: 429 });
    }

    const auth = await requireUser(["teacher", "principal", "moderator", "admin"]);
    if (!auth.ok) return auth.response;
    const stationError = requireClassStation(req);
    if (stationError) return stationError;

    const { image } = await req.json();
    const parsedImage = parseDataImage(image, MAX_IMAGE_CHARS);

    if (!parsedImage) {
      return NextResponse.json({ error: "A valid worksheet image under 5MB is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI Service configuration missing" }, { status: 500 });
    }

    // Convert base64 to parts for Gemini
    const base64Data = parsedImage.data;
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: parsedImage.mimeType,
      },
    };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a specialized Handwriting OCR and Academic Assessor. LIMITATION: Focus exclusively on text extraction from school worksheets. If the content is non-academic or inappropriate, do not process. Output format: strictly valid JSON without markdown wrapping."
    });
    const prompt = `
      You are an expert Handwriting OCR and Academic Assessor for the EduPortal platform.
      Extract all handwritten text from this school worksheet AND provide a scoring suggestion.
      
      Return a structured JSON object:
      {
        "studentName": "Extracted name if found",
        "answers": [
          { "questionNumber": 1, "text": "Extracted answer text" },
          ...
        ],
        "suggestedScores": {
          "conceptual": 8,
          "grammar": 7,
          "presentation": 9
        },
        "feedback": "A concise summary of the student's performance."
      }
      
      Only return the JSON. No markdown formatting.
    `;

    let text = "";

    try {
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      text = response.text();
    } catch (error: any) {
      console.warn("Cloud AI OCR failed, attempting local fallback:", error.message);
      try {
        const localRes = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llava", // using llava for vision tasks locally
            prompt: prompt,
            images: [parsedImage.data],
            stream: false,
            format: "json"
          }),
          signal: AbortSignal.timeout(120000)
        });
        
        if (!localRes.ok) throw new Error("Local model returned error");
        const localData = await localRes.json();
        text = localData.response;
      } catch (localError: any) {
        console.error("Local AI OCR Fallback Error:", localError);
        return NextResponse.json({ error: "AI OCR Service unavailable (both cloud and local failed)" }, { status: 503 });
      }
    }
    
    // Clean JSON response (handle potential markdown blocks)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error("AI OCR Error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
