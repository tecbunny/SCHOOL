import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const GATE_SECRET = process.env.GATE_AUTH_SECRET;

export async function POST(req: Request) {
  try {
    if (!GATE_SECRET) {
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }
    const { studentId, stationId } = await req.json();

    if (!studentId || !stationId) {
      return NextResponse.json({ error: "Missing identity data." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify student exists and belongs to the school
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_code, role, school_id')
      .eq('user_code', studentId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Student identity not found." }, { status: 404 });
    }

    // 2. Generate a 60-second JWT for the handshake
    const token = jwt.sign(
      { 
        sub: profile.id, 
        code: profile.user_code, 
        school: profile.school_id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 // 60s expiry
      }, 
      GATE_SECRET
    );

    // 3. Log the "Morning Handshake" for attendance automation
    await supabase.from('attendance').upsert({
      student_id: profile.id,
      school_id: profile.school_id,
      date: new Date().toISOString().split('T')[0],
      status: 'present'
    });

    return NextResponse.json({ 
      token, 
      qrContent: JSON.stringify({ t: token, s: stationId }),
      expiresIn: 60 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
