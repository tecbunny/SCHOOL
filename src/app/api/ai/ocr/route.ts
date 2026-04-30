import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
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

  } catch (error: any) {
    console.error("AI OCR Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
