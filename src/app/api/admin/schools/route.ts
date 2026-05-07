import { NextResponse } from "next/server";
import { errorMessage, pickAllowed, requireUser } from "@/lib/api-auth";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;

    // Fetch schools with profiles count (students)
    const { data: schools, error: schoolError } = await supabase
      .from('schools')
      .select(`
        *,
        profiles(count)
      `);

    if (schoolError) throw schoolError;

    // Transform data to match UI expectations
    type SchoolData = {
      id: string;
      school_name: string;
      school_code: string;
      plan_type: string;
      status: string;
      profiles?: { count: number }[];
      created_at: string;
    };

    const transformedSchools = (schools || []).map((school: SchoolData) => ({
      id: school.id,
      name: school.school_name,
      code: school.school_code,
      plan: school.plan_type,
      status: school.status,
      students: school.profiles?.[0]?.count || 0,
      createdAt: school.created_at
    }));

    return NextResponse.json(transformedSchools);
  } catch (error: unknown) {
    console.error("Error in admin schools GET route:", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: errorMessage(error), code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;
    const { id, ...body } = await req.json();
    const updates = pickAllowed(body, ["status", "plan_type"]);

    if (!id || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "School id and valid updates are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error in admin schools PATCH route:", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: errorMessage(error), code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
