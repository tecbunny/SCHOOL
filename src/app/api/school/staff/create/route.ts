import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    // 1. Verify the requester is a Principal
    const supabaseServer = await createServerClient();
    const { data: { user: requester }, error: authError } = await supabaseServer.auth.getUser();
    
    if (authError || !requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: requesterProfile } = await supabaseServer
      .from('profiles')
      .select('role, school_id')
      .eq('id', requester.id)
      .single();

    if (requesterProfile?.role !== 'principal') {
      return NextResponse.json({ error: 'Only Principals can add staff' }, { status: 403 });
    }

    // 2. Parse request data
    const { fullName, role } = await req.json();
    if (!fullName || !role) {
      return NextResponse.json({ error: 'Name and Role are required' }, { status: 400 });
    }

    // 3. Initialize Supabase Admin Client (using Service Role Key)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 4. Generate Credentials
    // Format: TCH-SCHOOLID-RANDOM (e.g. TCH-SCH7878-A1B2)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const loginId = `${role === 'teacher' ? 'TCH' : 'MOD'}-${requesterProfile.school_id.substring(0, 8)}-${randomSuffix}`;
    const email = `${loginId.toLowerCase()}@eduportal.internal`;
    const tempPassword = `Edu@${Math.random().toString(36).substring(2, 10)}`;

    // 5. Create Auth User silently
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, role, school_id: requesterProfile.school_id }
    });

    if (createError) throw createError;

    // 6. Create Profile Entry
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: fullName,
        role: role,
        school_id: requesterProfile.school_id,
        is_teaching_staff: role === 'teacher'
      });

    if (profileError) throw profileError;

    // 7. Return credentials for the Principal to hand over
    return NextResponse.json({
      success: true,
      credentials: {
        loginId,
        email,
        password: tempPassword,
        fullName,
        role
      }
    });

  } catch (error: any) {
    console.error('Staff Creation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
