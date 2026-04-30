import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import type { Profile, UserRole } from "@/lib/constants";

export type AuthorizedContext = {
  supabase: Awaited<ReturnType<typeof createServerClient>>;
  user: { id: string };
  profile: Pick<Profile, "id" | "role" | "school_id" | "full_name">;
};

export type AuthResult =
  | { ok: true; context: AuthorizedContext }
  | { ok: false; response: NextResponse };

export async function requireUser(allowedRoles?: UserRole[]): Promise<AuthResult> {
  const supabase = await createServerClient();
  if (!supabase) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Server configuration error" }, { status: 500 }),
    };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, school_id, full_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Profile not found" }, { status: 403 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, context: { supabase, user: { id: user.id }, profile } };
}

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Service role client is not configured.");
  }

  return { url, key };
}

export function pickAllowed<T extends Record<string, unknown>, K extends keyof T>(source: T, keys: K[]) {
  return keys.reduce<Partial<T>>((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal Server Error";
}
