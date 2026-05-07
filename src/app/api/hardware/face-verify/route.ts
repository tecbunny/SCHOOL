import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getServiceClient } from "@/lib/api-auth";
import { verifySignedHardwareRequest } from "@/lib/hardware-auth";
import { AppError } from "@/lib/errors";

type FaceTemplate = {
  student_id: string;
  school_id: string;
  embedding: number[];
  embedding_model: string;
};

function cosineSimilarity(left: number[], right: number[]) {
  if (left.length !== right.length || left.length === 0) return 0;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += right[index] ** 2;
  }

  const denominator = Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude);
  return denominator === 0 ? 0 : dot / denominator;
}

function isValidEmbedding(value: unknown): value is number[] {
  return Array.isArray(value)
    && value.length >= 64
    && value.length <= 1024
    && value.every(item => typeof item === "number" && Number.isFinite(item));
}

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const body = JSON.parse(bodyText) as {
      studentId?: string;
      embedding?: unknown;
      embeddingModel?: string;
      threshold?: number;
    };

    if (!body.studentId || !body.embeddingModel || !isValidEmbedding(body.embedding)) {
      return NextResponse.json({ error: "studentId, embeddingModel, and a numeric embedding are required." }, { status: 400 });
    }

    const threshold = typeof body.threshold === "number" ? body.threshold : 0.82;
    if (threshold < 0.5 || threshold > 0.99) {
      return NextResponse.json({ error: "threshold must be between 0.50 and 0.99." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const auth = await verifySignedHardwareRequest(supabase, req, bodyText);
    if (!auth.ok) return auth.response;

    const { data: template, error: templateError } = await supabase
      .from("student_face_templates")
      .select("student_id, school_id, embedding, embedding_model")
      .eq("student_id", body.studentId)
      .eq("embedding_model", body.embeddingModel)
      .eq("active", true)
      .single<FaceTemplate>();

    if (templateError || !template) {
      return NextResponse.json({ verified: false, error: "No active face template found." }, { status: 404 });
    }

    if (auth.node.school_id && template.school_id !== auth.node.school_id) {
      return NextResponse.json({ error: "Node cannot verify students outside its school." }, { status: 403 });
    }

    const similarity = cosineSimilarity(body.embedding, template.embedding);
    const verified = similarity >= threshold;

    await supabase.from("face_verification_attempts").insert({
      student_id: template.student_id,
      school_id: template.school_id,
      node_id: auth.node.id,
      embedding_model: body.embeddingModel,
      similarity,
      threshold,
      verified,
    });

    return NextResponse.json({ verified, similarity, threshold });
  } catch (error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  console.error("[POST] Unhandled Error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}
