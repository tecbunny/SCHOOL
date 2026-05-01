import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { navigateByRole, type UserRole } from './constants';
import { DEVICE_COOKIE } from './device-context';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl, 
      supabaseKey, 
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({ request: { headers: request.headers } });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            response = NextResponse.next({ request: { headers: request.headers } });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const url = new URL(request.url);
    
    // 1. Determine if the path is protected
    const isProtectedPath = 
      url.pathname.startsWith('/school/dashboard') || 
      url.pathname.startsWith('/admin/dashboard') || 
      url.pathname.startsWith('/auditor/dashboard') ||
      url.pathname.startsWith('/admin/provision') ||
      url.pathname.startsWith('/admin/schools') ||
      url.pathname.startsWith('/admin/users') ||
      url.pathname.startsWith('/admin/analytics');
    
    if (!user && isProtectedPath) {
      let redirectUrl = '/school';
      if (url.pathname.includes('/admin')) redirectUrl = '/admin';
      if (url.pathname.includes('/auditor')) redirectUrl = '/auditor';
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (user && isProtectedPath) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role as UserRole | undefined;
      const isAllowed =
        (url.pathname.startsWith('/admin') && role === 'admin') ||
        (url.pathname.startsWith('/auditor') && role === 'auditor') ||
        (url.pathname.startsWith('/school/dashboard/student') && role === 'student') ||
        (url.pathname.startsWith('/school/dashboard/teacher') && role === 'teacher') ||
        (url.pathname.startsWith('/school/dashboard/hod') && role === 'principal') ||
        (url.pathname.startsWith('/school/dashboard/moderator') && role === 'moderator') ||
        (url.pathname.startsWith('/school/dashboard/alumni') && role === 'alumni');

      if (!role || !isAllowed) {
        return NextResponse.redirect(new URL(role ? navigateByRole(role) : '/school', request.url));
      }
    }

    // 2. Standalone Security: Block admin/auditor routes on student hardware
    if (process.env.EDUOS_STANDALONE === 'true') {
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/auditor')) {
        return NextResponse.redirect(new URL('/school/dashboard/student', request.url));
      }
    }

    // Device trust markers are set by kiosk/station launchers through request headers.
    if (request.headers.get('x-eduos') === 'true') {
      response.cookies.set(DEVICE_COOKIE.studentHub, 'true', { path: '/', sameSite: 'lax' });
    }

    if (request.headers.get('x-class-station') === 'true') {
      response.cookies.set(DEVICE_COOKIE.classStation, 'true', { path: '/', sameSite: 'lax' });
    }
    
    return response;
  } catch (error) {
    console.error("Middleware Proxy Error:", error);
    return response; 
  }
}
