-- HIGH-SPEED STUDENT HUB DISTRIBUTION MODE (2026-05-02)
-- Teacher pairs recognized students to physical Hub QR codes, then soft-returns by session command.

DO $$ BEGIN
    CREATE TYPE hub_checkout_status AS ENUM ('checked_out', 'locked', 'returned', 'missing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.student_hub_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    class_id TEXT,
    hub_device_id TEXT NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status hub_checkout_status NOT NULL DEFAULT 'checked_out',
    checked_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    notes TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS student_hub_checkouts_active_hub_idx
    ON public.student_hub_checkouts (hub_device_id)
    WHERE status IN ('checked_out', 'locked');

CREATE UNIQUE INDEX IF NOT EXISTS student_hub_checkouts_active_student_idx
    ON public.student_hub_checkouts (student_id)
    WHERE status IN ('checked_out', 'locked');

CREATE INDEX IF NOT EXISTS student_hub_checkouts_session_idx
    ON public.student_hub_checkouts (session_id, status, checked_out_at);

ALTER TABLE public.student_hub_checkouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff view school hub checkouts" ON public.student_hub_checkouts;
CREATE POLICY "Staff view school hub checkouts" ON public.student_hub_checkouts
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
        OR student_id = (select auth.uid())
    );

DROP POLICY IF EXISTS "Teachers manage hub checkouts" ON public.student_hub_checkouts;
CREATE POLICY "Teachers manage hub checkouts" ON public.student_hub_checkouts
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator')
            AND school_id = auth_helpers.get_my_school_id()
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator')
            AND school_id = auth_helpers.get_my_school_id()
            AND teacher_id = (select auth.uid())
        )
    );
