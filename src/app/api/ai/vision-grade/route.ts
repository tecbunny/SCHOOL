import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { requireClassStation } from "@/lib/device-context";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MAX_IMAGE_CHARS = 5_000_000;

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["teacher", "principal", "moderator", "admin"]);
    if (!auth.ok) return auth.response;
    const stationError = requireClassStation(req);
    if (stationError) return stationError;

    const { image, rubric, context } = await req.json();

    if (typeof image !== "string" || !image.startsWith("data:image/") || image.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: "A valid worksheet image under 5MB is required." }, { status: 400 });
    }

    if (!rubric || typeof rubric !== "object") {
      return NextResponse.json({ error: "Rubric is required." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI Service configuration missing" }, { status: 500 });
    }

    // 1. Initialize Gemini 1.5 Flash for vision tasks with limitations
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are an expert educator providing objective grading. LIMITATION: You must strictly adhere to the provided rubric. If student answers are illegible or missing, penalize accordingly as per rubric rules. Output: strictly valid JSON. Do not include markdown code blocks."
    });

    // 2. Prepare the Prompt for Pedagogical Evaluation
    const prompt = `
      Act as an expert educator. Analyze this scanned student worksheet.
      
      CONTEXT: ${context}
      RUBRIC: ${JSON.stringify(rubric)}

      TASKS:
      1. Extract all handwritten text from the worksheet.
      2. Match each answer to the corresponding rubric criteria.
      3. Provide a suggested score and specific feedback for each point.
      4. Flag any areas where the handwriting is illegible.

      OUTPUT FORMAT: Return strictly valid JSON with the following structure:
      {
        "extractedText": "string",
        "evaluations": [
          { "criteria": "string", "suggestedScore": number, "feedback": "string" }
        ],
        "overallConfidence": number
      }
      
      Only return the JSON. No markdown formatting.
    `;

    // 3. Process the Base64 Image
    const imageData = {
      inlineData: {
        data: image.split(",")[1], // Strip the data:image/jpeg;base64 prefix
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response (remove markdown blocks if present)
    const jsonString = text.replace(/```json|```/g, "").trim();
    
    const parsedResult = JSON.parse(jsonString);

    // 5. Log the AI Event for Accountability
    const { logger } = await import("@/services/logger.service");
    await logger.log({
      eventType: 'AI_GRADING',
      severity: 'info',
      message: `AI Assessment performed for worksheet scan.`,
      metadata: {
        confidence: parsedResult.overallConfidence,
        extracted_length: parsedResult.extractedText?.length,
        rubric: rubric
      }
    });

    return NextResponse.json(parsedResult);

  } catch (error: unknown) {
    console.error("Vision AI Error:", error);
    return NextResponse.json({ error: "Failed to process worksheet." }, { status: 500 });
  }
}
