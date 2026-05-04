import { createHash, createPublicKey, timingSafeEqual, verify } from "crypto";
import { NextResponse } from "next/server";

type HardwareNode = {
  id: string;
  school_id: string | null;
  node_type?: string | null;
  node_secret_hash: string | null;
  public_key_pem: string | null;
  key_algorithm: string | null;
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

type NonceInsertQuery = {
  insert: (value: Record<string, unknown>) => PromiseLike<{ error: { code?: string } | null }>;
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

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

export function canonicalHardwarePayload(params: {
  method: string;
  pathname: string;
  body: string;
  timestamp: string;
  nonce: string;
}) {
  return [
    params.method.toUpperCase(),
    params.pathname,
    sha256Hex(params.body),
    params.timestamp,
    params.nonce,
  ].join("\n");
}

async function getHardwareNode(supabase: HardwareSupabaseClient, nodeId: string) {
  const query = supabase.from("hardware_nodes") as HardwareNodeQuery;
  return query
    .select("id, school_id, node_type, node_secret_hash, public_key_pem, key_algorithm")
    .eq("id", nodeId)
    .single();
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

  const { data: node, error } = await getHardwareNode(supabase, nodeId);
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

export async function verifySignedHardwareRequest(
  supabase: HardwareSupabaseClient,
  req: Request,
  body: string
): Promise<HardwareAuthResult> {
  const nodeId = req.headers.get("x-node-id");
  const timestamp = req.headers.get("x-node-timestamp");
  const nonce = req.headers.get("x-node-nonce");
  const signature = req.headers.get("x-node-signature");

  if (!nodeId || !timestamp || !nonce || !signature) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Signed hardware headers are required." }, { status: 400 }),
    };
  }

  const { data: node, error } = await getHardwareNode(supabase, nodeId);
  if (error || !node) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unknown hardware node." }, { status: 404 }),
    };
  }

  if (!node.public_key_pem || (node.key_algorithm ?? "ed25519").toLowerCase() !== "ed25519") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Hardware public key is not registered." }, { status: 401 }),
    };
  }

  const pathname = new URL(req.url).pathname;
  const canonical = canonicalHardwarePayload({
    method: req.method,
    pathname,
    body,
    timestamp,
    nonce,
  });

  const validSignature = verify(
    null,
    Buffer.from(canonical, "utf8"),
    createPublicKey(node.public_key_pem),
    fromBase64Url(signature)
  );

  if (!validSignature) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid hardware signature." }, { status: 401 }),
    };
  }

  const nonceQuery = supabase.from("hardware_request_nonces") as NonceInsertQuery;
  const { error: nonceError } = await nonceQuery.insert({
    nonce,
    node_id: node.id,
    signed_at: timestamp,
    request_hash: sha256Hex(canonical),
  });

  if (nonceError) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Replay detected for signed hardware request." }, { status: 401 }),
    };
  }

  return { ok: true, node };
}
