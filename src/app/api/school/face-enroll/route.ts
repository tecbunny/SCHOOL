import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/api-auth";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase-server";

function isValidEmbedding(value: unknown): value is number[] {
  return Array.isArray(value)
    && value.length >= 64
    && value.length <= 1024
    && value.every(item => typeof item === "number" && Number.isFinite(item));
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, school_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !['admin', 'principal', 'teacher', 'moderator'].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden: Only staff can enroll faces" }, { status: 403 });
    }

    const body = await req.json();
    const { studentId, embedding, embeddingModel } = body;

    if (!studentId || !embeddingModel || !isValidEmbedding(embedding)) {
      return NextResponse.json({ error: "studentId, embeddingModel, and a numeric embedding are required." }, { status: 400 });
    }

    // Verify student belongs to staff's school (if not global admin)
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", studentId)
      .eq("role", "student")
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    if (profile.role !== 'admin' && student.school_id !== profile.school_id) {
      return NextResponse.json({ error: "Cannot enroll student from another school." }, { status: 403 });
    }

    // Use service role to bypass RLS for insertion/updating if needed, or stick to RLS if policies allow.
    // We'll use service client since we verified everything manually above.
    const service = getServiceClient();
    const adminSupabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Inactivate existing templates for the same student
    await adminSupabase
      .from("student_face_templates")
      .update({ active: false })
      .eq("student_id", studentId)
      .eq("active", true);

    // Insert new template
    const { data: newTemplate, error: insertError } = await adminSupabase
      .from("student_face_templates")
      .insert({
        student_id: studentId,
        school_id: student.school_id,
        embedding: embedding,
        embedding_model: embeddingModel,
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
  } catch (error) {
    console.error("Face enrollment failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
