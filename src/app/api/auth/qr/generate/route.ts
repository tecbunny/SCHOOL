import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export async function POST(req: Request) {
    try {
    await req.body?.cancel();
    return NextResponse.json(
        { error: "Cloud QR generation is disabled. Use the local Class Station QR authority." },
        { status: 410 }
      );
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
