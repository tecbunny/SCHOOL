import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServiceClient, requireUser } from '@/lib/api-auth';
import { AppError } from "@/lib/errors";

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

    // 4. Generate sequential credentials.
    // Format: TC00001 for teachers, MD00001 for moderators
    const prefix = role === 'teacher' ? 'TC' : 'MD';
    const { data: existingStaffCodes, error: codeLookupError } = await supabaseAdmin
      .from('profiles')
      .select('user_code')
      .eq('role', role)
      .like('user_code', `${prefix}%`);

    if (codeLookupError) throw codeLookupError;

    const lastSequence = (existingStaffCodes || []).reduce((max, staff) => {
      const match = staff.user_code?.match(new RegExp(`^${prefix}(\\d{5})$`));
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    const loginId = `${prefix}${String(lastSequence + 1).padStart(5, '0')}`;
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

    // 7. Return only non-secret account metadata.
    return NextResponse.json({
      success: true,
      credentials: {
        loginId,
        email,
        fullName,
        role,
        deliveryStatus: 'secure_delivery_pending'
      },
      message: 'Account created. Temporary credentials must be delivered through the configured secure channel.'
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
