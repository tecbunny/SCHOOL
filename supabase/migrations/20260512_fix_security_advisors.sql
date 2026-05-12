-- Production hardening for Supabase security advisor findings.

-- 1) Pin search_path for functions used by privileged RPCs.
ALTER FUNCTION public.compute_offline_event_hash(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, JSONB, UUID
) SET search_path = public, pg_temp;

ALTER FUNCTION public.append_offline_event(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, JSONB, INTEGER, TIMESTAMPTZ, UUID[]
) SET search_path = public, auth_helpers, pg_temp;

ALTER FUNCTION public.apply_grade_edge_version(
  UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, UUID, INTEGER, TIMESTAMPTZ, TEXT, UUID
) SET search_path = public, auth_helpers, pg_temp;

ALTER FUNCTION public.link_student_profile_to_apaar(
  UUID, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT
) SET search_path = public, auth_helpers, pg_temp;

-- 2) SECURITY DEFINER RPCs should only be callable by trusted server code.
REVOKE EXECUTE ON FUNCTION public.append_offline_event(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, JSONB, INTEGER, TIMESTAMPTZ, UUID[]
) FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.apply_grade_edge_version(
  UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, UUID, INTEGER, TIMESTAMPTZ, TEXT, UUID
) FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.link_student_profile_to_apaar(
  UUID, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT
) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.append_offline_event(
  UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, BIGINT, JSONB, INTEGER, TIMESTAMPTZ, UUID[]
) TO service_role;

GRANT EXECUTE ON FUNCTION public.apply_grade_edge_version(
  UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT, UUID, INTEGER, TIMESTAMPTZ, TEXT, UUID
) TO service_role;

GRANT EXECUTE ON FUNCTION public.link_student_profile_to_apaar(
  UUID, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT
) TO service_role;

-- 3) Public bucket object URLs do not require broad object listing.
DROP POLICY IF EXISTS "Authenticated users can read school files" ON storage.objects;
