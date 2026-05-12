import { createClient } from "@supabase/supabase-js";
import { createPublicKey } from "crypto";
import { NextResponse } from "next/server";

import { getServiceClient } from "@/lib/api-auth";
import { AppError } from "@/lib/errors";
import { safeSecretEquals } from "@/lib/secrets";

export async function POST(req: Request) {
  try {
    const { nodeId, publicKeyPem, secretKey } = await req.json();

    if (!safeSecretEquals(secretKey, process.env.HARDWARE_PROVISIONING_SECRET)) {
      return NextResponse.json({ error: "Invalid provisioning secret." }, { status: 401 });
    }

    if (!nodeId || !publicKeyPem) {
      return NextResponse.json({ error: "nodeId and publicKeyPem are required." }, { status: 400 });
    }

    const key = createPublicKey(publicKeyPem);
    if (key.asymmetricKeyType !== "ed25519") {
      return NextResponse.json({ error: "Only Ed25519 hardware keys are supported." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await supabase
      .from("hardware_nodes")
      .update({
        public_key_pem: publicKeyPem,
        key_algorithm: "ed25519",
        key_registered_at: new Date().toISOString(),
      })
      .eq("id", nodeId)
      .select("id, school_id, key_algorithm, key_registered_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ node: data });
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
