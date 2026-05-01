import { createBrowserClient } from '@supabase/ssr'
import { getSupabasePublishableKey, getSupabaseUrl } from './supabase-env';

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  // Build-time safety: If variables are missing and we are on the server (e.g., during build)
  // use inert placeholders. This prevents '@supabase/ssr' from throwing an error.
  if (!url || !key) {
    if (typeof window === 'undefined') {
      return createBrowserClient('http://127.0.0.1', 'missing-supabase-publishable-key');
    }
    throw new Error('Supabase public environment variables are not configured.');
  }

  return createBrowserClient(
    url,
    key
  );
}


