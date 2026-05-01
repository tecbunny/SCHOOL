import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { navigateByRole, type UserRole } from './constants';
import { DEVICE_COOKIE } from './device-context';
import { getSupabasePublishableKey, getSupabaseUrl } from './supabase-env';

type ProfileGate = {
  role: UserRole;
  is_teaching_staff: boolean | null;
};

const isAdminPath = (pathname: string) => pathname.startsWith('/admin/');
const isAuditorPath = (pathname: string) => pathname === '/auditor/dashboard' || pathname.startsWith('/auditor/dashboard/');
const isSchoolDashboardPath = (pathname: string) => pathname === '/school/dashboard' || pathname.startsWith('/school/dashboard/');
const isProtectedPath = (pathname: string) => isAdminPath(pathname) || isAuditorPath(pathname) || isSchoolDashboardPath(pathname);

const isAuthEntryPath = (pathname: string) =>
  pathname === '/admin' ||
  pathname === '/auditor' ||
  pathname === '/school' ||
  pathname === '/school/staff' ||
  pathname === '/school/student';

const getLoginPath = (pathname: string) => {
  if (pathname.startsWith('/admin')) return '/admin';
  if (pathname.startsWith('/auditor')) return '/auditor';
  return '/school';
};

const isAllowedForPath = (pathname: string, profile: ProfileGate) => {
  if (isAdminPath(pathname)) return profile.role === 'admin';
  if (isAuditorPath(pathname)) return profile.role === 'auditor';

  if (!isSchoolDashboardPath(pathname)) return true;
  if (pathname.startsWith('/school/dashboard/student')) return profile.role === 'student';
  if (pathname.startsWith('/school/dashboard/teacher')) {
    return profile.role === 'teacher' || (profile.role === 'principal' && profile.is_teaching_staff === true);
  }
  if (pathname.startsWith('/school/dashboard/hod')) return profile.role === 'principal';
  if (pathname.startsWith('/school/dashboard/moderator')) return profile.role === 'moderator';
  if (pathname.startsWith('/school/dashboard/alumni')) return profile.role === 'alumni';

  return ['principal', 'teacher', 'moderator', 'student', 'alumni'].includes(profile.role);
};

const applyDeviceCookies = (request: NextRequest, response: NextResponse) => {
  if (request.headers.get('x-eduos') === 'true') {
    response.cookies.set(DEVICE_COOKIE.studentHub, 'true', { path: '/', sameSite: 'lax' });
  }

  if (request.headers.get('x-class-station') === 'true') {
    response.cookies.set(DEVICE_COOKIE.classStation, 'true', { path: '/', sameSite: 'lax' });
  }

  return response;
};

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = new URL(request.url);
  const pathname = url.pathname;
  const protectedPath = isProtectedPath(pathname);
  
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabaseKey) {
    if (protectedPath) {
      return NextResponse.redirect(new URL(getLoginPath(pathname), request.url));
    }
    return applyDeviceCookies(request, response);
  }

  try {
    const supabase = createServerClient(
      supabaseUrl, 
      supabaseKey, 
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;
    
    if ((claimsError || !userId) && protectedPath) {
      return NextResponse.redirect(new URL(getLoginPath(pathname), request.url));
    }

    if (userId && (protectedPath || isAuthEntryPath(pathname))) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_teaching_staff')
        .eq('id', userId)
        .single();

      const role = profile?.role as UserRole | undefined;

      if (role && isAuthEntryPath(pathname)) {
        return NextResponse.redirect(new URL(navigateByRole(role), request.url));
      }

      if (protectedPath && (!role || !isAllowedForPath(pathname, profile as ProfileGate))) {
        return NextResponse.redirect(new URL(role ? navigateByRole(role) : getLoginPath(pathname), request.url));
      }
    }

    // 2. Standalone Security: Block admin/auditor routes on student hardware
    if (process.env.EDUOS_STANDALONE === 'true') {
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/auditor')) {
        return NextResponse.redirect(new URL('/school/dashboard/student', request.url));
      }
    }
    
    return applyDeviceCookies(request, response);
  } catch (error) {
    console.error("Middleware Proxy Error:", error);
    if (protectedPath) {
      return NextResponse.redirect(new URL(getLoginPath(pathname), request.url));
    }
    return applyDeviceCookies(request, response);
  }
}
