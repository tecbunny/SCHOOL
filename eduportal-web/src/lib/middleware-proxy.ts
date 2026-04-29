import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
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
  
  // FIX: Determine if we need to redirect first
  const isProtectedPath = url.pathname.includes('/dashboard') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/auditor');
  
  if (!user && isProtectedPath) {
    let redirectUrl = '/school';
    if (url.pathname.startsWith('/admin')) redirectUrl = '/admin';
    if (url.pathname.startsWith('/auditor')) redirectUrl = '/auditor';
    
    // Create the redirect response instead of NEXT
    response = NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // FIX: Apply EduOS cookie to whatever response object we finalized above
  if (request.headers.get('x-eduos') === 'true') {
    response.cookies.set('is-eduos', 'true');
  }
  
  return response;
}
