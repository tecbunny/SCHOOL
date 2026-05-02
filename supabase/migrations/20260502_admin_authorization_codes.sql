-- ADMIN-GENERATED TEMPORARY AUTHORIZATION CODES (2026-05-02)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_hash TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('principal_password_reset', 'staff_password_reset')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS admin_authorization_codes_lookup_idx
    ON public.admin_authorization_codes (admin_id, purpose, code_hash, expires_at)
    WHERE consumed_at IS NULL;

ALTER TABLE public.admin_authorization_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view own authorization codes" ON public.admin_authorization_codes;
CREATE POLICY "Admins view own authorization codes" ON public.admin_authorization_codes
    FOR SELECT USING (
        admin_id = (select auth.uid())
        AND auth_helpers.get_my_role() = 'admin'
    );
