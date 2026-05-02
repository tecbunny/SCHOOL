-- APPEND-ONLY EVENT SOURCING FOUNDATION (2026-05-02)
-- Canonical offline-first writes land here before projection tables are updated.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.offline_device_clocks (
    device_id TEXT PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    last_lamport_version BIGINT NOT NULL DEFAULT 0 CHECK (last_lamport_version >= 0),
    last_event_id UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    device_id TEXT NOT NULL,
    stream_type TEXT NOT NULL CHECK (stream_type IN (
        'attendance',
        'grade',
        'competency',
        'behavior',
        'material',
        'announcement',
        'exam',
        'device',
        'system'
    )),
    stream_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action ~ '^[a-z][a-z0-9_]*$'),
    lamport_version BIGINT NOT NULL CHECK (lamport_version > 0),
    observed_event_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version > 0),
    client_recorded_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    applied_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'applied', 'rejected')),
    rejection_reason TEXT,
    event_hash TEXT NOT NULL,
    previous_event_id UUID,
    CONSTRAINT offline_events_device_lamport_unique UNIQUE (device_id, lamport_version),
    CONSTRAINT offline_events_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX IF NOT EXISTS offline_events_school_lamport_idx
    ON public.offline_events (school_id, lamport_version, received_at);

CREATE INDEX IF NOT EXISTS offline_events_stream_idx
    ON public.offline_events (stream_type, stream_id, lamport_version);

CREATE INDEX IF NOT EXISTS offline_events_pending_projection_idx
    ON public.offline_events (school_id, status, lamport_version)
    WHERE status = 'accepted';

CREATE OR REPLACE VIEW public.offline_event_current_state AS
SELECT DISTINCT ON (school_id, stream_type, stream_id)
    school_id,
    stream_type,
    stream_id,
    action,
    actor_id,
    device_id,
    lamport_version,
    payload,
    event_id,
    received_at
FROM public.offline_events
WHERE status IN ('accepted', 'applied')
ORDER BY
    school_id,
    stream_type,
    stream_id,
    lamport_version DESC,
    device_id DESC,
    event_id DESC;

ALTER VIEW public.offline_event_current_state SET (security_invoker = true);

CREATE OR REPLACE VIEW public.current_attendance_events AS
SELECT
    school_id,
    (payload->>'student_id')::uuid AS student_id,
    payload->>'attendance_date' AS attendance_date,
    payload->>'status' AS status,
    actor_id AS recorded_by,
    device_id,
    lamport_version,
    event_id
FROM public.offline_event_current_state
WHERE stream_type = 'attendance';

ALTER VIEW public.current_attendance_events SET (security_invoker = true);

CREATE OR REPLACE VIEW public.current_grade_events AS
SELECT
    school_id,
    (payload->>'student_id')::uuid AS student_id,
    payload->>'subject' AS subject,
    payload->>'assessment_type' AS assessment_type,
    NULLIF(payload->>'marks_obtained', '')::numeric AS marks_obtained,
    NULLIF(payload->>'max_marks', '')::numeric AS max_marks,
    payload->>'cbse_grade' AS cbse_grade,
    actor_id AS teacher_id,
    device_id,
    lamport_version,
    event_id
FROM public.offline_event_current_state
WHERE stream_type = 'grade';

ALTER VIEW public.current_grade_events SET (security_invoker = true);

ALTER TABLE public.offline_device_clocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff view school device clocks" ON public.offline_device_clocks;
CREATE POLICY "Staff view school device clocks" ON public.offline_device_clocks
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
    );

DROP POLICY IF EXISTS "Staff view school offline events" ON public.offline_events;
CREATE POLICY "Staff view school offline events" ON public.offline_events
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
        OR actor_id = (select auth.uid())
    );

DROP POLICY IF EXISTS "Staff append own school offline events" ON public.offline_events;
CREATE POLICY "Staff append own school offline events" ON public.offline_events
    FOR INSERT WITH CHECK (
        actor_id = (select auth.uid())
        AND school_id = auth_helpers.get_my_school_id()
        AND auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator', 'student')
    );

CREATE OR REPLACE FUNCTION public.compute_offline_event_hash(
    p_event_id UUID,
    p_school_id UUID,
    p_actor_id UUID,
    p_device_id TEXT,
    p_stream_type TEXT,
    p_stream_id TEXT,
    p_action TEXT,
    p_lamport_version BIGINT,
    p_payload JSONB,
    p_previous_event_id UUID
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT encode(
        digest(
            concat_ws(
                ':',
                p_event_id::text,
                p_school_id::text,
                COALESCE(p_actor_id::text, ''),
                p_device_id,
                p_stream_type,
                p_stream_id,
                p_action,
                p_lamport_version::text,
                p_payload::text,
                COALESCE(p_previous_event_id::text, '')
            ),
            'sha256'
        ),
        'hex'
    );
$$;

CREATE OR REPLACE FUNCTION public.append_offline_event(
    p_event_id UUID,
    p_school_id UUID,
    p_actor_id UUID,
    p_device_id TEXT,
    p_stream_type TEXT,
    p_stream_id TEXT,
    p_action TEXT,
    p_lamport_version BIGINT,
    p_payload JSONB DEFAULT '{}'::jsonb,
    p_schema_version INTEGER DEFAULT 1,
    p_client_recorded_at TIMESTAMPTZ DEFAULT NULL,
    p_observed_event_ids UUID[] DEFAULT '{}'::uuid[]
)
RETURNS public.offline_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing public.offline_events;
    v_clock public.offline_device_clocks;
    v_event public.offline_events;
    v_actor_school UUID;
    v_role user_role;
    v_hash TEXT;
BEGIN
    SELECT * INTO v_existing
    FROM public.offline_events
    WHERE event_id = p_event_id;

    IF FOUND THEN
        RETURN v_existing;
    END IF;

    IF p_lamport_version IS NULL OR p_lamport_version <= 0 THEN
        RAISE EXCEPTION 'Lamport version must be greater than zero';
    END IF;

    IF p_device_id IS NULL OR length(trim(p_device_id)) < 3 THEN
        RAISE EXCEPTION 'Device id is required';
    END IF;

    IF jsonb_typeof(COALESCE(p_payload, '{}'::jsonb)) <> 'object' THEN
        RAISE EXCEPTION 'Event payload must be a JSON object';
    END IF;

    IF auth.role() <> 'service_role' THEN
        IF p_actor_id <> (select auth.uid()) THEN
            RAISE EXCEPTION 'Actor must match the authenticated user';
        END IF;

        SELECT school_id, role INTO v_actor_school, v_role
        FROM public.profiles
        WHERE id = (select auth.uid());

        IF v_actor_school IS DISTINCT FROM p_school_id AND v_role <> 'admin' THEN
            RAISE EXCEPTION 'Actor cannot append events for another school';
        END IF;
    END IF;

    SELECT * INTO v_clock
    FROM public.offline_device_clocks
    WHERE device_id = p_device_id
    FOR UPDATE;

    IF FOUND THEN
        IF v_clock.school_id IS DISTINCT FROM p_school_id THEN
            RAISE EXCEPTION 'Device belongs to another school';
        END IF;

        IF p_lamport_version <= v_clock.last_lamport_version THEN
            RAISE EXCEPTION 'Lamport version % is not greater than device clock %',
                p_lamport_version,
                v_clock.last_lamport_version;
        END IF;
    END IF;

    v_hash := public.compute_offline_event_hash(
        p_event_id,
        p_school_id,
        p_actor_id,
        p_device_id,
        p_stream_type,
        p_stream_id,
        p_action,
        p_lamport_version,
        COALESCE(p_payload, '{}'::jsonb),
        v_clock.last_event_id
    );

    INSERT INTO public.offline_events (
        event_id,
        school_id,
        actor_id,
        device_id,
        stream_type,
        stream_id,
        action,
        lamport_version,
        observed_event_ids,
        payload,
        schema_version,
        client_recorded_at,
        event_hash,
        previous_event_id
    )
    VALUES (
        p_event_id,
        p_school_id,
        p_actor_id,
        p_device_id,
        p_stream_type,
        p_stream_id,
        p_action,
        p_lamport_version,
        COALESCE(p_observed_event_ids, '{}'::uuid[]),
        COALESCE(p_payload, '{}'::jsonb),
        COALESCE(p_schema_version, 1),
        p_client_recorded_at,
        v_hash,
        v_clock.last_event_id
    )
    RETURNING * INTO v_event;

    INSERT INTO public.offline_device_clocks (
        device_id,
        school_id,
        last_lamport_version,
        last_event_id,
        updated_at
    )
    VALUES (
        p_device_id,
        p_school_id,
        p_lamport_version,
        p_event_id,
        NOW()
    )
    ON CONFLICT (device_id) DO UPDATE SET
        last_lamport_version = EXCLUDED.last_lamport_version,
        last_event_id = EXCLUDED.last_event_id,
        updated_at = NOW();

    RETURN v_event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.append_offline_event(
    UUID,
    UUID,
    UUID,
    TEXT,
    TEXT,
    TEXT,
    TEXT,
    BIGINT,
    JSONB,
    INTEGER,
    TIMESTAMPTZ,
    UUID[]
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.append_offline_event(
    UUID,
    UUID,
    UUID,
    TEXT,
    TEXT,
    TEXT,
    TEXT,
    BIGINT,
    JSONB,
    INTEGER,
    TIMESTAMPTZ,
    UUID[]
) TO service_role;
