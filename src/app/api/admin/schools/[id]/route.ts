import { NextResponse } from "next/server";
import { errorMessage, pickAllowed, requireUser } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;
    const { id } = await params;

    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const [
      students,
      staff,
      principals,
      materials,
      papers,
      nodes,
      activity
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', id).eq('role', 'student'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', id).neq('role', 'student'),
      supabase.from('profiles').select('id, full_name, user_code').eq('school_id', id).eq('role', 'principal').limit(1),
      supabase.from('materials').select('*', { count: 'exact', head: true }).eq('school_id', id),
      supabase.from('exam_papers').select('*', { count: 'exact', head: true }).eq('school_id', id),
      supabase.from('hardware_nodes').select('*', { count: 'exact', head: true }).eq('school_id', id),
      supabase.from('system_logs').select('id, event_type, severity, message, created_at, metadata').eq('tenant_id', id).order('created_at', { ascending: false }).limit(20)
    ]);

    const schoolWithMetrics = {
      ...data,
      principal: principals.data?.[0] || null,
      metrics: {
        students: students.count || 0,
        staff: staff.count || 0,
        materials: materials.count || 0,
        examPapers: papers.count || 0,
        hardwareNodes: nodes.count || 0
      },
      activity: activity.data || []
    };

    return NextResponse.json(schoolWithMetrics);
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;
    const { supabase } = auth.context;
    const { id } = await params;
    const body = await req.json();
    const updates = pickAllowed(body, ["school_name", "status", "plan_type"]);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid school fields provided." }, { status: 400 });
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
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
