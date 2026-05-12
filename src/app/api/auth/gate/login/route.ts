import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { GateJwtPayload } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { getRequiredSecret } from "@/lib/secrets";

export async function POST(req: Request) {
  try {
    const gateSecret = getRequiredSecret("GATE_AUTH_SECRET");
    const body = await req.json();
    const { token, deviceId } = body;

    if (!token) {
      return NextResponse.json({ error: "No handshake token provided." }, { status: 400 });
    }

    // 1. Verify the JWT
    let decoded: GateJwtPayload;
    try {
      decoded = jwt.verify(token, gateSecret) as GateJwtPayload;
    } catch {
      return NextResponse.json({ error: "Token expired or tampered with." }, { status: 401 });
    }

    const supabase = await createClient();

    // 2. Fetch the user's secure credentials
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
    return NextResponse.json({ 
      success: true, 
      userCode: profile.user_code,
      message: "Handshake successful. Logging in..." 
    });

  } catch (error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  console.error("[POST] Unhandled Error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}
