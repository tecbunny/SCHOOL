import { NextResponse } from "next/server";
import { errorMessage, requireUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;

    // 1. Total Schools
    const { count: schoolCount, error: sErr } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });

    // 2. Total Students (Profiles with role 'student')
    const { count: studentCount, error: stErr } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    // 3. Active Sessions (Profiles with status 'active' in student_sessions - if exists)
    // For now, let's just use the student count as a placeholder for "Total Users"
    
    // 4. AI Papers generated
    const { count: paperCount, error: pErr } = await supabase
      .from('exam_papers')
      .select('*', { count: 'exact', head: true });

    if (sErr || stErr || pErr) {
        console.warn("Some analytics data could not be fetched:", { sErr, stErr, pErr });
    }

    return NextResponse.json({
      totalSchools: schoolCount || 0,
      totalStudents: studentCount || 0,
      totalPapers: paperCount || 0,
      planDistribution: {
        premium: 0, // Would need aggregate query
        standard: 0
      }
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
