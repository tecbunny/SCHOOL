import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Build-time safety: If variables are missing and we are on the server (e.g., during build)
  // return null. This prevents '@supabase/ssr' from throwing an error.
  if (!url || !key) {
    if (typeof window === 'undefined') {
      return null as any;
    }
  }

  return createBrowserClient(url!, key!);
}


