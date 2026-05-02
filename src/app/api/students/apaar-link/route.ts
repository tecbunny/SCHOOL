import { NextResponse } from "next/server";

import { errorMessage, requireUser } from "@/lib/api-auth";

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

    const { data, error } = await auth.context.supabase.rpc("link_student_profile_to_apaar", {
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
