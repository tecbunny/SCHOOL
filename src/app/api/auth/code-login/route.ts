import { createServerClient } from '@supabase/ssr';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase-env';
import { type UserRole } from '@/lib/constants';
import { isRateLimited } from '@/lib/rate-limit';
import { AppError } from "@/lib/errors";

type LoginBody = {
  code?: string;
  password?: string;
  allowedRoles?: UserRole[];
  schoolCode?: string;
};

const normalizeCode = (code: string) => code.trim().toUpperCase();

export async function POST(req: Request) {
    try {
    if (isRateLimited(req, "code-login", { limit: 10, windowMs: 60_000 })) {
        return NextResponse.json({ error: 'Too many login attempts. Please wait and try again.' }, { status: 429 });
      }
    const supabaseUrl = getSupabaseUrl();
    const publishableKey = getSupabasePublishableKey();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
        return NextResponse.json({ error: 'Supabase authentication is not configured.' }, { status: 500 });
      }
    const body = (await req.json()) as LoginBody;
    const code = body.code ? normalizeCode(body.code) : '';
    const password = body.password ?? '';
    if (!code || !password) {
        return NextResponse.json({ error: 'System Identifier and Security Key are required.' }, { status: 400 });
      }
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    const { data: profile, error: profileError } = await serviceClient
        .from('profiles')
        .select('id, user_code, role, school_id, schools(school_code)')
        .eq('user_code', code)
        .single();
    if (profileError || !profile) {
        return NextResponse.json({ error: 'Invalid User Code or Password.' }, { status: 401 });
      }
    const role = profile.role as UserRole;
    if (body.allowedRoles?.length && !body.allowedRoles.includes(role)) {
        return NextResponse.json({ error: 'Access denied for this login portal.' }, { status: 403 });
      }
    const schoolCode = body.schoolCode?.trim().toUpperCase();
    const profileSchool = Array.isArray(profile.schools) ? profile.schools[0] : profile.schools;
    if (schoolCode && role !== 'admin' && profileSchool?.school_code !== schoolCode) {
        return NextResponse.json({ error: 'This account does not belong to the selected school.' }, { status: 403 });
      }
    const { data: userData, error: userError } = await serviceClient.auth.admin.getUserById(profile.id);
    const email = userData.user?.email;
    if (userError || !email) {
        return NextResponse.json({ error: 'Invalid User Code or Password.' }, { status: 401 });
      }
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, publishableKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      });
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !authData.user) {
        return NextResponse.json({ error: 'Invalid User Code or Password.' }, { status: 401 });
      }
    return NextResponse.json({
        session: authData.session,
        profile: {
          id: profile.id,
          role,
          school_id: profile.school_id,
        },
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
