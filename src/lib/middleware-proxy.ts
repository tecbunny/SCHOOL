import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', 
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

  // 1. Standalone Security: Block admin/auditor routes on student hardware
  if (process.env.EDUOS_STANDALONE === 'true') {
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/auditor')) {
      return NextResponse.redirect(new URL('/school/dashboard/student', request.url));
    }
  }

  // FIX: Apply EduOS cookie to whatever response object we finalized above
  if (request.headers.get('x-eduos') === 'true') {
    response.cookies.set('is-eduos', 'true');
  }
  
  return response;
}
