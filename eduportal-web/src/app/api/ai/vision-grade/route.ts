import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { image, rubric, context } = await req.json();

    // 1. Initialize Gemini 1.5 Flash for vision tasks
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    
    return NextResponse.json(JSON.parse(jsonString));

  } catch (error: any) {
    console.error("Vision AI Error:", error);
    return NextResponse.json({ error: "Failed to process worksheet." }, { status: 500 });
  }
}
