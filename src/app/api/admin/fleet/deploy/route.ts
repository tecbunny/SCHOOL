import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

import { errorMessage, getServiceClient, requireUser } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({})) as {
      releaseType?: unknown;
      nodeIds?: unknown;
    };
    const releaseType = body.releaseType === "os" ? "os" : "pwa";
    const nodeIds = Array.isArray(body.nodeIds)
      ? body.nodeIds.filter((value): value is string => typeof value === "string")
      : [];

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: release, error: releaseError } = await supabase
      .from("fleet_releases")
      .select("id, version_code, release_type")
      .eq("release_type", releaseType)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (releaseError || !release) {
      return NextResponse.json({ error: `No ${releaseType} release is available.` }, { status: 404 });
    }

    const nodeQuery = supabase.from("hardware_nodes").select("id").neq("status", "offline");
    if (nodeIds.length > 0) nodeQuery.in("id", nodeIds);
    const { data: nodes, error: nodeError } = await nodeQuery;
    if (nodeError) throw nodeError;

    const rows = (nodes || []).map((node: { id: string }) => ({
      node_id: node.id,
      release_id: release.id,
      status: "pending",
      updated_at: new Date().toISOString(),
    }));

    if (rows.length === 0) {
      return NextResponse.json({ error: "No eligible nodes found." }, { status: 400 });
    }

    const { error } = await supabase.from("fleet_deployments").upsert(rows, {
      onConflict: "node_id,release_id",
    });
    if (error) throw error;

    return NextResponse.json({
      queued: rows.length,
      release,
    });
  } catch (error: unknown) {
    console.error("Error in admin fleet deploy route:", error);
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
