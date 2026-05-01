import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { errorMessage, requireUser } from "@/lib/api-auth";
import { requireClassStation } from "@/lib/device-context";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MAX_IMAGE_CHARS = 5_000_000;

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["teacher", "principal", "moderator", "admin"]);
    if (!auth.ok) return auth.response;
    const stationError = requireClassStation(req);
    if (stationError) return stationError;

    const { image } = await req.json();

    if (typeof image !== "string" || !image.startsWith("data:image/") || image.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: "A valid worksheet image under 5MB is required." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI Service configuration missing" }, { status: 500 });
    }

    // Convert base64 to parts for Gemini
    const base64Data = image.split(",")[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    };

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

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response (handle potential markdown blocks)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error("AI OCR Error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
