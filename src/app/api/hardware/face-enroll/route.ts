import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getServiceClient } from "@/lib/api-auth";
import { verifySignedHardwareRequest } from "@/lib/hardware-auth";
import { AppError } from "@/lib/errors";

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
    };

    if (!body.studentId || !body.embeddingModel || !isValidEmbedding(body.embedding)) {
      return NextResponse.json({ error: "studentId, embeddingModel, and a numeric embedding are required." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const auth = await verifySignedHardwareRequest(supabase, req, bodyText);
    if (!auth.ok) return auth.response;

    // Check student school
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", body.studentId)
      .eq("role", "student")
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    if (auth.node.school_id && student.school_id !== auth.node.school_id) {
      return NextResponse.json({ error: "Node cannot enroll students outside its school." }, { status: 403 });
    }

    // First deactivate any currently active templates for this student to maintain the unique index constraint:
    // CREATE UNIQUE INDEX student_face_templates_active_student_idx ON public.student_face_templates (student_id) WHERE active = TRUE;
    await supabase
      .from("student_face_templates")
      .update({ active: false })
      .eq("student_id", body.studentId)
      .eq("active", true);

    // Insert new template
    const { data: newTemplate, error: insertError } = await supabase
      .from("student_face_templates")
      .insert({
        student_id: body.studentId,
        school_id: student.school_id,
        embedding: body.embedding,
        embedding_model: body.embeddingModel,
        captured_by_node_id: auth.node.id,
        active: true,
        version_count: 1
      })
      .select()
      .single();

    if (insertError) {
      console.error("Face enrollment DB error:", insertError);
      return NextResponse.json({ error: "Database error during enrollment" }, { status: 500 });
    }

    return NextResponse.json({ success: true, templateId: newTemplate.id });
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
