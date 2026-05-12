import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { errorMessage, getServiceClient, requireUser } from "@/lib/api-auth";

type ApaarLinkRequest = {
  profileId?: string;
  abcApaarId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  academicYear?: string;
  gradeLevel?: string;
  classId?: string;
};

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["admin", "principal"]);
    if (!auth.ok) return auth.response;

    const body = (await req.json()) as ApaarLinkRequest;
    if (!body.profileId || !body.abcApaarId || !body.firstName) {
      return NextResponse.json(
        { error: "profileId, abcApaarId, and firstName are required." },
        { status: 400 }
      );
    }

    const { data: targetProfile, error: targetProfileError } = await auth.context.supabase
      .from("profiles")
      .select("id, role, school_id")
      .eq("id", body.profileId)
      .single();

    if (targetProfileError || !targetProfile || targetProfile.role !== "student") {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    if (
      auth.context.profile.role === "principal" &&
      targetProfile.school_id !== auth.context.profile.school_id
    ) {
      return NextResponse.json({ error: "Cannot link a student outside your school." }, { status: 403 });
    }

    const service = getServiceClient();
    const serviceSupabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await serviceSupabase.rpc("link_student_profile_to_apaar", {
      p_profile_id: body.profileId,
      p_abc_apaar_id: body.abcApaarId,
      p_first_name: body.firstName,
      p_last_name: body.lastName ?? null,
      p_date_of_birth: body.dateOfBirth ?? null,
      p_academic_year: body.academicYear ?? null,
      p_grade_level: body.gradeLevel ?? null,
      p_class_id: body.classId ?? null,
    });

    if (error) throw error;
    return NextResponse.json({ enrollment: data });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
