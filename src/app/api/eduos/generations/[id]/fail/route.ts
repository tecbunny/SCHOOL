import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { errorMessage, getServiceClient, requireUser } from "@/lib/api-auth";
import { requireClassStation } from "@/lib/device-context";
import { failGeneration } from "@/lib/generation-queue";
import { verifySignedHardwareRequest } from "@/lib/hardware-auth";
import { AppError } from "@/lib/errors";

async function getStationContext(req: Request, bodyText: string) {
  if (req.headers.has("x-node-signature")) {
    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const auth = await verifySignedHardwareRequest(supabase, req, bodyText);
    if (!auth.ok) return { ok: false as const, response: auth.response };
    if (auth.node.node_type !== "class-station") {
      return {
        ok: false as const,
        response: NextResponse.json({ error: "Class Station hardware node required." }, { status: 403 }),
      };
    }
    if (!auth.node.school_id) {
      return {
        ok: false as const,
        response: NextResponse.json({ error: "Hardware node is not assigned to a school." }, { status: 400 }),
      };
    }
    return { ok: true as const, supabase, schoolId: auth.node.school_id, classStationId: auth.node.id };
  }

  const stationError = requireClassStation(req);
  if (stationError) return { ok: false as const, response: stationError };
  const auth = await requireUser(["teacher", "principal"]);
  if (!auth.ok) return { ok: false as const, response: auth.response };
  return { ok: true as const, supabase: auth.context.supabase, schoolId: auth.context.profile.school_id, classStationId: null };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bodyText = await req.text();
    const context = await getStationContext(req, bodyText);
    if (!context.ok) return context.response;

    const body = bodyText ? JSON.parse(bodyText) : {};
    const errorMessageText = typeof body.errorMessage === "string"
      ? body.errorMessage
      : typeof body.error_message === "string"
        ? body.error_message
        : "Generation failed on the Class Station.";

    const { id } = await params;
    const generation = await failGeneration(context.supabase, {
      generationId: id,
      schoolId: context.schoolId,
      classStationId: context.classStationId,
      errorCode: typeof body.errorCode === "string" ? body.errorCode : body.error_code,
      errorMessage: errorMessageText.slice(0, 1_000),
    });

    return NextResponse.json({ generation });
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
