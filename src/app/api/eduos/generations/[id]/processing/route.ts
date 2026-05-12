import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getServiceClient, requireUser } from "@/lib/api-auth";
import { requireClassStation } from "@/lib/device-context";
import { markGenerationProcessing } from "@/lib/generation-queue";
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
    return { ok: true as const, supabase, classStationId: auth.node.id };
  }

  const stationError = requireClassStation(req);
  if (stationError) return { ok: false as const, response: stationError };
  const auth = await requireUser(["teacher", "principal"]);
  if (!auth.ok) return { ok: false as const, response: auth.response };
  return { ok: true as const, supabase: auth.context.supabase, classStationId: null };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bodyText = await req.text();
    const context = await getStationContext(req, bodyText);
    if (!context.ok) return context.response;

    const { id } = await params;
    const generation = await markGenerationProcessing(context.supabase, {
      generationId: id,
      classStationId: context.classStationId,
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
