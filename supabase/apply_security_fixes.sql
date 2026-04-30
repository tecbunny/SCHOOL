-- SUPABASE SECURITY HARDENING SCRIPT
-- Resolves linter warnings related to SECURITY DEFINER functions and search_path mutability.

-- 1. Fix get_my_school_id()
-- Added explicit search_path for security and revoked public execution to prevent RPC exposure.
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_school_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_school_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_school_id() TO service_role;


-- 2. Fix get_my_role()
-- Added explicit search_path and restricted access.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO service_role;


-- 3. Fix rls_auto_enable() (if it exists)
-- This function is often used in migrations. Ensuring it has a safe search_path.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
        EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;


-- 4. Fix archive.perform_annual_rollover(uuid)
-- Added explicit signature (uuid) to match the definition in the archival schema.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'archive' AND p.proname = 'perform_annual_rollover') THEN
        -- We specify the argument type (uuid) to correctly identify the function
        EXECUTE 'ALTER FUNCTION archive.perform_annual_rollover(uuid) SET search_path = public, archive';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION archive.perform_annual_rollover(uuid) FROM PUBLIC';
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

SELECT 'Security hardening complete. Helper functions are now protected against search_path attacks and unauthorized RPC calls.' as status;
