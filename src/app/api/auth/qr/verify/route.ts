import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await req.body?.cancel();
  return NextResponse.json(
    { error: "Cloud QR verification is disabled. Use the local Class Station QR authority." },
    { status: 410 }
  );
}
