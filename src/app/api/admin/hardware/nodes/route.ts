import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

import { errorMessage, getServiceClient, requireUser } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({})) as {
      schoolId?: unknown;
      nodeName?: unknown;
      nodeType?: unknown;
      stationCode?: unknown;
      macAddress?: unknown;
      version?: unknown;
    };

    const nodeName = typeof body.nodeName === "string" ? body.nodeName.trim() : "";
    const stationCode = typeof body.stationCode === "string" ? body.stationCode.trim().toUpperCase() : "";
    const nodeType = typeof body.nodeType === "string" ? body.nodeType : "student-hub";

    if (!nodeName || nodeName.length < 3) {
      return NextResponse.json({ error: "Node name is required." }, { status: 400 });
    }
    if (!["student-hub", "class-station", "admin-kiosk"].includes(nodeType)) {
      return NextResponse.json({ error: "Unsupported node type." }, { status: 400 });
    }
    if (!stationCode || !/^[A-Z0-9-]{8,64}$/.test(stationCode)) {
      return NextResponse.json({ error: "Station code must use letters, numbers, and hyphens." }, { status: 400 });
    }
    if (typeof body.schoolId !== "string" || !body.schoolId) {
      return NextResponse.json({ error: "School is required." }, { status: 400 });
    }

    const rawSecret = randomBytes(32).toString("hex");
    const nodeSecretHash = createHash("sha256").update(rawSecret).digest("hex");
    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .from("hardware_nodes")
      .insert({
        school_id: body.schoolId,
        node_name: nodeName,
        node_type: nodeType,
        station_code: stationCode,
        mac_address: typeof body.macAddress === "string" && body.macAddress.trim() ? body.macAddress.trim() : null,
        version: typeof body.version === "string" && body.version.trim() ? body.version.trim() : "1.0.0",
        status: "pending",
        node_secret_hash: nodeSecretHash,
      })
      .select("id, school_id, node_name, node_type, station_code, status, version")
      .single();

    if (error) throw error;

    return NextResponse.json({
      node: data,
      provisioning: {
        stationCode,
        nodeSecret: rawSecret,
      },
    });
  } catch (error: unknown) {
    console.error("Error in admin hardware nodes route:", error);
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
