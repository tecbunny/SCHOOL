import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { errorMessage, getServiceClient, requireUser } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;

    const { principalCode } = await req.json();
    const code = typeof principalCode === "string" ? principalCode.trim().toUpperCase() : "";

    if (!code || !code.startsWith("PR")) {
      return NextResponse.json({ error: "A valid principal PR code is required." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

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
