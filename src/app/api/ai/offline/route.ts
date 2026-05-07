import { NextResponse } from 'next/server';
import { requireClassStation } from '@/lib/device-context';

export async function POST(req: Request) {
  // Validate that this request is processed by a Class Station
  const stationError = requireClassStation(req);
  if (stationError) return stationError;

  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // In a real implementation, this would interface with a local LLM
    // e.g. via Ollama, Llama.cpp, or an ONNX model running locally
    // For this architecture stub, we simulate the Offline AI response
    
    // Simulate processing delay of local LLM
    await new Promise(resolve => setTimeout(resolve, 1500));

    const response = {
      text: `[Offline AI Reply]: I processed your request "${prompt}" locally on the Class Station without internet.`,
      model: 'local-offline-llama-3-8b-quantized'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Offline AI Error:', error);
    return NextResponse.json({ error: 'Failed to process offline AI request' }, { status: 500 });
  }
}
