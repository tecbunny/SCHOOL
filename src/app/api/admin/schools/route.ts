import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch schools with profiles count (students)
    const { data: schools, error: schoolError } = await supabase
      .from('schools')
      .select(`
        *,
        profiles(count)
      `);

    if (schoolError) throw schoolError;

    // Transform data to match UI expectations
    const transformedSchools = (schools || []).map((school: any) => ({
      id: school.id,
      name: school.school_name,
      code: school.school_code,
      plan: school.plan_type,
      status: school.status,
      students: (school.profiles as any)?.[0]?.count || 0,
      createdAt: school.created_at
    }));

    return NextResponse.json(transformedSchools);
  } catch (error: any) {
    console.error("Admin Schools API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { id, status, plan_type } = await req.json();

    const { data, error } = await supabase
      .from('schools')
      .update({ status, plan_type })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
