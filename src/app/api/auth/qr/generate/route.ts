import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { errorMessage } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID required for hardware handshake." }, { status: 400 });
    }

    const supabase = await createClient();
    const sessionToken = uuidv4();

    const { data, error } = await supabase
      .from('qr_sessions')
      .insert({
        device_id: deviceId,
        session_token: sessionToken,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      sessionToken, 
      qrPayload: JSON.stringify({ token: sessionToken, dev: deviceId }),
      expiresAt: data.expires_at 
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
