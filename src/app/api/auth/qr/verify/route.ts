import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionToken, studentId } = await req.json();

    const supabase = await createClient();

    // 1. Authenticate Teacher
    const { data: { user: teacher }, error: teacherError } = await supabase.auth.getUser();
    if (teacherError || !teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Verify Session exists and is pending
    const { data: session, error: sessionError } = await supabase
      .from('qr_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('status', 'pending')
      .single();

    if (sessionError || !session) return NextResponse.json({ error: "Invalid or expired session." }, { status: 404 });

    // 3. Mark session as verified and link to student
    // In a real biometric flow, the teacher's app would confirm the biometric match here
    const { error: updateError } = await supabase
      .from('qr_sessions')
      .update({
        status: 'verified',
        authenticated_user_id: studentId
      })
      .eq('session_token', sessionToken);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Handshake verified. Student is now logging in." });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
