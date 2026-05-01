import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { errorMessage, getServiceClient, requireUser } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const { sessionToken, studentId } = await req.json();

    const auth = await requireUser(["teacher", "principal", "moderator"]);
    if (!auth.ok) return auth.response;
    const { supabase, profile: teacherProfile } = auth.context;

    if (!sessionToken || !studentId) {
      return NextResponse.json({ error: "Session token and student id are required." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabaseAdmin = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 2. Verify Session exists and is pending
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('qr_sessions')
      .select('session_token, device_id, expires_at')
      .eq('session_token', sessionToken)
      .eq('status', 'pending')
      .single();

    if (sessionError || !session) return NextResponse.json({ error: "Invalid or expired session." }, { status: 404 });
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      await supabaseAdmin.from('qr_sessions').update({ status: 'expired' }).eq('session_token', sessionToken);
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 404 });
    }

    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, role, school_id, is_hardware_bound, mac_address')
      .eq('id', studentId)
      .eq('role', 'student')
      .single();

    if (studentError || !student || student.school_id !== teacherProfile.school_id) {
      return NextResponse.json({ error: "Student does not belong to this school." }, { status: 403 });
    }
    if (student.is_hardware_bound && student.mac_address !== session.device_id) {
      return NextResponse.json({ error: "This QR session is not from the student's assigned device." }, { status: 403 });
    }

    // 3. Mark session as verified and link to student
    // In a real biometric flow, the teacher's app would confirm the biometric match here
    const { error: updateError } = await supabaseAdmin
      .from('qr_sessions')
      .update({
        status: 'verified',
        authenticated_user_id: studentId
      })
      .eq('session_token', sessionToken)
      .eq('status', 'pending');

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Handshake verified. Student is now logging in." });

  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
