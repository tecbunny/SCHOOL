-- CREDENTIAL DELIVERY + REALTIME TEST AUTHORIZATION (2026-05-02)
-- Removes API-visible temporary passwords and restricts live-test broadcasts to private channels.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.credential_delivery_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    delivery_channel TEXT NOT NULL CHECK (delivery_channel IN ('principal_verified_contact', 'email', 'sms')),
    delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'cancelled')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    CONSTRAINT credential_delivery_jobs_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS credential_delivery_jobs_status_idx
    ON public.credential_delivery_jobs (delivery_status, created_at);

ALTER TABLE public.credential_delivery_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view credential delivery jobs" ON public.credential_delivery_jobs;
CREATE POLICY "Admins view credential delivery jobs" ON public.credential_delivery_jobs
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() = 'principal'
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

-- Supabase Realtime private channels for live tests.
-- Topic shape: private:school:<school_uuid>:class:<class_id>:student:<student_uuid>
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students receive own private live tests" ON realtime.messages;
CREATE POLICY "Students receive own private live tests"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
    realtime.messages.extension = 'broadcast'
    AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = (select auth.uid())
          AND p.role = 'student'
          AND (select realtime.topic()) = (
              'private:school:' || p.school_id::text ||
              ':class:' || COALESCE(p.class_id, 'unassigned') ||
              ':student:' || p.id::text
          )
    )
);

DROP POLICY IF EXISTS "Teaching staff publish private live tests" ON realtime.messages;
CREATE POLICY "Teaching staff publish private live tests"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
    realtime.messages.extension = 'broadcast'
    AND auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator')
    AND (select realtime.topic()) LIKE (
        'private:school:' || auth_helpers.get_my_school_id()::text || ':class:%'
    )
);
