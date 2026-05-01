import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { errorMessage, getServiceClient } from "@/lib/api-auth";
import { requireStudentHub } from "@/lib/device-context";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (isRateLimited(req, "qr-generate", { limit: 20, windowMs: 60_000 })) {
      return NextResponse.json({ error: "Too many QR session requests." }, { status: 429 });
    }

    const deviceError = requireStudentHub(req);
    if (deviceError) return deviceError;

    const { deviceId } = await req.json();

    if (typeof deviceId !== "string" || deviceId.length < 6 || deviceId.length > 128) {
      return NextResponse.json({ error: "Device ID required for hardware handshake." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
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
