import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabasePublishableKey, getSupabaseUrl } from './supabase-env'

export async function createClient() {
  const cookieStore = await cookies()

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  return createServerClient(
    url || 'http://127.0.0.1',
    key || 'missing-supabase-publishable-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
