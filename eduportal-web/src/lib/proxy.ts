import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 2. SSPH-01 Hardware Binding & Security
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, is_hardware_bound, mac_address')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const isEduOS = request.headers.get('x-eduos') === 'true'
  const deviceId = request.headers.get('x-eduos-device-id')

  if (isEduOS) {
    response.cookies.set('is-eduos', 'true')
  }

  // Strict Hardware Check
  if (profile?.is_hardware_bound && profile.mac_address) {
    if (deviceId !== profile.mac_address) {
      // Hardware mismatch! Logout and block.
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/school?error=hardware_mismatch', request.url))
    }
  }

  // Protection Logic
  const url = new URL(request.url)

  // 1. Standalone Security: Block admin/auditor routes on student hardware
  if (process.env.EDUOS_STANDALONE === 'true') {
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/auditor')) {
      return NextResponse.redirect(new URL('/school/dashboard/student', request.url))
    }
  }
  
  // 2. If trying to access any dashboard without being logged in -> Redirect to Login
  if (!user && (url.pathname.includes('/dashboard') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/auditor'))) {
    if (url.pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/admin', request.url))
    if (url.pathname.startsWith('/auditor')) return NextResponse.redirect(new URL('/auditor', request.url))
    return NextResponse.redirect(new URL('/school', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
