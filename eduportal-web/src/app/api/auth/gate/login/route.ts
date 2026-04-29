import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const GATE_SECRET = process.env.GATE_AUTH_SECRET || "ssph-01-gate-secure-key";

export async function POST(req: Request) {
  try {
    const { token, deviceId } = await req.json();

    if (!token) return NextResponse.json({ error: "No handshake token provided." }, { status: 400 });

    // 1. Verify the JWT
    const decoded: any = jwt.verify(token, GATE_SECRET);

    const supabase = await createClient();

    // 2. Fetch the user's secure credentials (using the obfuscated internal email)
    // In a real flow, we would use Supabase's `admin.generateLink` or similar, 
    // but for the SSPH-01 handshake, we verify the token and return the student profile.
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, schools(*)')
      .eq('id', decoded.sub)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Invalid identity link." }, { status: 401 });
    }

    // 3. Hardware Binding Check (Security Layer)
    if (profile.is_hardware_bound && profile.mac_address !== deviceId) {
      return NextResponse.json({ error: "Hardware mismatch. Use your assigned device." }, { status: 403 });
    }

    // 4. Return the session/user data for client-side login
    // Note: For full Supabase auth, the client would then call signInWithPassword 
    // using the secure internal mapping.
    return NextResponse.json({ 
      success: true, 
      userCode: profile.user_code,
      message: "Handshake successful. Logging in..." 
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Token expired or tampered with." }, { status: 401 });
  }
}
