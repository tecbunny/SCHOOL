import { NextResponse } from "next/server";
import { errorMessage, requireUser } from "@/lib/api-auth";

export async function GET() {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;

    const { data: schools, error: sErr } = await supabase
      .from('schools')
      .select('id, plan_type, status');

    const { count: studentCount, error: stErr } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    const { count: paperCount, error: pErr } = await supabase
      .from('exam_papers')
      .select('*', { count: 'exact', head: true });

    const { count: requestCount, error: rErr } = await supabase
      .from('registration_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (sErr || stErr || pErr || rErr) {
        console.warn("Some analytics data could not be fetched:", { sErr, stErr, pErr, rErr });
    }

    const schoolRows = schools || [];
    const planDistribution = schoolRows.reduce<Record<string, number>>((acc, school) => {
      const plan = String(school.plan_type || 'unknown');
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});
    const statusDistribution = schoolRows.reduce<Record<string, number>>((acc, school) => {
      const status = String(school.status || 'unknown');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      totalSchools: schoolRows.length,
      activeSchools: statusDistribution.active || 0,
      totalStudents: studentCount || 0,
      totalPapers: paperCount || 0,
      totalRequests: requestCount || 0,
      planDistribution,
      statusDistribution
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
