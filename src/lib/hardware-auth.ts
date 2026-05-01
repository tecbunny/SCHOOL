import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

type HardwareNode = {
  id: string;
  school_id: string | null;
  node_secret_hash: string | null;
};

type HardwareAuthResult =
  | { ok: true; node: HardwareNode }
  | { ok: false; response: NextResponse };

type HardwareSupabaseClient = {
  from: (table: string) => unknown;
};

type HardwareNodeQuery = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      single: () => PromiseLike<{ data: HardwareNode | null; error: unknown }>;
    };
  };
};

function sha256Hex(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function constantTimeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function verifyHardwareNode(
  supabase: HardwareSupabaseClient,
  nodeId: string,
  nodeSecret: string | null
): Promise<HardwareAuthResult> {
  if (!nodeId || !nodeSecret) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Node id and node secret are required." }, { status: 400 }),
    };
  }

  const query = supabase.from("hardware_nodes") as HardwareNodeQuery;
  const { data: node, error } = await query
    .select("id, school_id, node_secret_hash")
    .eq("id", nodeId)
    .single();

  if (error || !node) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unknown hardware node." }, { status: 404 }),
    };
  }

  if (!node.node_secret_hash || !constantTimeEqualHex(sha256Hex(nodeSecret), node.node_secret_hash)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized node." }, { status: 401 }),
    };
  }

  return { ok: true, node };
}
