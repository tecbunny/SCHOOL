import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { errorMessage, getServiceClient, requireUser } from "@/lib/api-auth";

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;

    const { principalCode, adminAuthorizationCode } = await req.json();
    const code = typeof principalCode === "string" ? principalCode.trim().toUpperCase() : "";
    const submittedAuthCode = typeof adminAuthorizationCode === "string" ? adminAuthorizationCode.trim() : "";

    if (!code || !code.startsWith("PR")) {
      return NextResponse.json({ error: "A valid principal PR code is required." }, { status: 400 });
    }
    if (!submittedAuthCode) {
      return NextResponse.json({ error: "Admin authorization code is required." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authCode, error: authCodeError } = await supabase
      .from("admin_authorization_codes")
      .select("id")
      .eq("admin_id", auth.context.user.id)
      .eq("purpose", "principal_password_reset")
      .eq("code_hash", hashCode(submittedAuthCode))
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (authCodeError || !authCode) {
      return NextResponse.json({ error: "Invalid or expired admin authorization code." }, { status: 403 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, user_code, role")
      .eq("user_code", code)
      .eq("role", "principal")
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Principal account not found for this PR code." }, { status: 404 });
    }

    const temporaryPassword = `Edu@${crypto.randomUUID().replace(/-/g, "").substring(0, 18)}`;
    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      password: temporaryPassword,
    });

    if (updateError) throw updateError;

    await supabase
      .from("admin_authorization_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", authCode.id);

    return NextResponse.json({
      success: true,
      principalCode: profile.user_code,
      principalName: profile.full_name,
      temporaryPassword,
      message: "Temporary password generated. Ask the principal to change it after login.",
    });
  } catch (error: unknown) {
    console.error("Principal Password Reset Error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
