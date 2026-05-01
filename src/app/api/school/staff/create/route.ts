import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { errorMessage, getServiceClient, requireUser } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    // 1. Verify the requester is a Principal
    const auth = await requireUser(["principal"]);
    if (!auth.ok) return auth.response;
    const requesterProfile = auth.context.profile;

    // 2. Parse request data
    const { fullName, role } = await req.json();
    const allowedRoles = new Set(["teacher", "moderator"]);
    if (!fullName || !role) {
      return NextResponse.json({ error: 'Name and Role are required' }, { status: 400 });
    }
    if (!allowedRoles.has(role)) {
      return NextResponse.json({ error: 'Principals can only create teacher or moderator accounts.' }, { status: 400 });
    }

    // 3. Initialize Supabase Admin Client (using Service Role Key)
    const service = getServiceClient();
    const supabaseAdmin = createClient(
      service.url,
      service.key,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 4. Generate Credentials
    // Format: TCH-SCHOOLID-RANDOM (e.g. TCH-SCH7878-A1B2)
    const randomSuffix = crypto.randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase();
    const loginId = `${role === 'teacher' ? 'TCH' : 'MOD'}-${requesterProfile.school_id.substring(0, 8)}-${randomSuffix}`;
    const email = `${loginId.toLowerCase()}@eduportal.internal`;
    const tempPassword = `Edu@${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;

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
        user_code: loginId,
        role: role,
        school_id: requesterProfile.school_id,
        is_teaching_staff: role === 'teacher'
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw profileError;
    }

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

  } catch (error: unknown) {
    console.error('Staff Creation Error:', error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
