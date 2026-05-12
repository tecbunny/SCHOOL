import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServiceClient, requireUser } from "@/lib/api-auth";
import { AppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const auth = await requireUser(["admin"]);
    if (!auth.ok) return auth.response;

    const { udiseCode, adminName } = await req.json();

    if (!udiseCode || udiseCode.length !== 11) {
      return NextResponse.json({ error: "Invalid 11-digit U-DISE code." }, { status: 400 });
    }
    if (!adminName || typeof adminName !== "string" || adminName.trim().length < 2) {
      return NextResponse.json({ error: "Principal name is required." }, { status: 400 });
    }

    const service = getServiceClient();
    const supabase = createClient(service.url, service.key, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. Check if school already exists
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id')
      .eq('school_code', `SCH${udiseCode.substring(0, 4)}`) // Simple mapping for the prototype
      .single();

    if (existingSchool) {
      return NextResponse.json({ error: "School already provisioned." }, { status: 409 });
    }

    // 2. Create the School (U-DISE Auto-population mock)
    // In production, we would fetch from the National School Directory API
    const schoolName = `U-DISE School (${udiseCode})`; 
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        school_code: `SCH${udiseCode.substring(7)}`,
        school_name: schoolName,
        plan_type: 'premium'
      })
      .select()
      .single();

    if (schoolError) throw schoolError;

    // 3. Provision the Principal Account
    const principalCode = `PR${udiseCode.substring(7)}01`;
    const email = `${principalCode.toLowerCase()}@auth.ssph01.eduportal.internal`;
    const generatedPassword = `Edu@${crypto.randomUUID().replace(/-/g, '').substring(0, 18)}`;
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true,
    });

    if (authError) {
      await supabase.from('schools').delete().eq('id', school.id);
      throw authError;
    }

    // 4. Create Principal Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        user_code: principalCode,
        full_name: adminName,
        role: 'principal',
        school_id: school.id
      });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from('schools').delete().eq('id', school.id);
      throw profileError;
    }

    await supabase
      .from('credential_delivery_jobs')
      .insert({
        user_id: authUser.user.id,
        school_id: school.id,
        delivery_channel: 'principal_verified_contact',
        delivery_status: 'pending',
        metadata: {
          user_code: principalCode,
          recipient_name: adminName,
          purpose: 'principal_initial_access'
        }
      });

    return NextResponse.json({ 
      success: true, 
      schoolName, 
      principalCode,
      credentialDelivery: "pending",
      message: "School provisioned successfully. Principal credentials are queued for secure delivery."
    });

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
