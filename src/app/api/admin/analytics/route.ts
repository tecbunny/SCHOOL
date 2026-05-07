import { NextResponse } from "next/server";
import { errorMessage, requireUser } from "@/lib/api-auth";
import { analyticsService } from "@/services/analytics.service";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;

    const stats = await analyticsService.getGlobalStats();

    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error("Error in admin analytics route:", error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: errorMessage(error), code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
