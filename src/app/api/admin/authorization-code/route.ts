import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { errorMessage, getServiceClient, requireUser } from "@/lib/api-auth";

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

const generateCode = () => {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const value = Array.from(bytes).reduce((acc, byte) => (acc << 8) + byte, 0);
  return String(value % 1_000_000).padStart(6, "0");
};

export async function POST() {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("admin_authorization_codes")
      .insert({
        admin_id: auth.context.user.id,
        code_hash: hashCode(code),
        purpose: "principal_password_reset",
        expires_at: expiresAt,
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      authorizationCode: code,
      expiresAt,
      expiresInMinutes: 10,
      message: "Temporary authorization code generated.",
    });
  } catch (error: unknown) {
    console.error("Admin Authorization Code Error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
