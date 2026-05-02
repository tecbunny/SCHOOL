import { NextResponse } from "next/server";

import { requireClassStation } from "@/lib/device-context";
import { verifyLocalQrSession } from "@/lib/local-station-qr";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (isRateLimited(req, "local-qr-verify", { limit: 60, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many local QR verification requests." }, { status: 429 });
  }

  const deviceError = requireClassStation(req);
  if (deviceError) return deviceError;

  const body = await req.json().catch(() => ({})) as {
    qrPayload?: { payload?: Record<string, unknown>; signature?: string };
    studentId?: unknown;
    faceVerified?: unknown;
  };

  if (!body.qrPayload || typeof body.studentId !== "string") {
    return NextResponse.json({ error: "QR payload and student ID are required." }, { status: 400 });
  }

  const result = await verifyLocalQrSession({
    qrPayload: body.qrPayload,
    studentId: body.studentId,
    faceVerified: body.faceVerified === true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    sessionId: result.session.sessionId,
    deviceId: result.session.deviceId,
    studentId: result.session.studentId,
    verifiedAt: result.session.verifiedAt,
    receipt: result.receipt,
  });
}
