import { NextResponse } from "next/server";

import { requireStudentHub } from "@/lib/device-context";
import { createLocalQrSession } from "@/lib/local-station-qr";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (isRateLimited(req, "local-qr-session", { limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many local QR session requests." }, { status: 429 });
  }

  const deviceError = requireStudentHub(req);
  if (deviceError) return deviceError;

  const body = await req.json().catch(() => ({})) as { deviceId?: unknown };
  if (typeof body.deviceId !== "string" || body.deviceId.length < 6 || body.deviceId.length > 128) {
    return NextResponse.json({ error: "Device ID required for local QR session." }, { status: 400 });
  }

  const { session, qrPayload } = await createLocalQrSession(body.deviceId);

  return NextResponse.json({
    sessionId: session.sessionId,
    qrPayload,
    expiresAt: session.expiresAt,
    localAuthority: session.stationId,
  });
}
