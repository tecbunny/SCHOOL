import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { udiseCode, adminName, adminPassword } = await req.json();

    if (!udiseCode || udiseCode.length !== 11) {
      return NextResponse.json({ error: "Invalid 11-digit U-DISE code." }, { status: 400 });
    }

    const supabase = await createClient();

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
    
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password: adminPassword,
    });

    if (authError) throw authError;

    // 4. Create Principal Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user!.id,
        user_code: principalCode,
        full_name: adminName,
        role: 'principal',
        school_id: school.id
      });

    if (profileError) throw profileError;

    return NextResponse.json({ 
      success: true, 
      schoolName, 
      principalCode,
      message: "School provisioned successfully. Please use the principal code to login."
    });

  } catch (error: any) {
    console.error("Provisioning Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
