-- ABC/APAAR PORTABLE STUDENT IDENTITY FOUNDATION (2026-05-02)
-- Students are global people; enrollments attach them to schools by year/grade.

DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('active', 'promoted', 'transferred', 'completed', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.schools
    ADD COLUMN IF NOT EXISTS udise_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS schools_udise_code_unique_idx
    ON public.schools (udise_code)
    WHERE udise_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.global_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abc_apaar_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    date_of_birth DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT global_students_abc_apaar_format CHECK (abc_apaar_id ~ '^[A-Z0-9][A-Z0-9-]{5,31}$')
);

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.global_students(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    academic_year TEXT NOT NULL CHECK (academic_year ~ '^[0-9]{4}-[0-9]{4}$'),
    grade_level TEXT NOT NULL,
    class_id TEXT,
    status enrollment_status NOT NULL DEFAULT 'active',
    enrolled_on DATE NOT NULL DEFAULT CURRENT_DATE,
    exited_on DATE,
    exit_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT enrollments_exit_after_entry CHECK (exited_on IS NULL OR exited_on >= enrolled_on)
);

CREATE UNIQUE INDEX IF NOT EXISTS enrollments_one_active_year_idx
    ON public.enrollments (student_id, academic_year)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS enrollments_student_history_idx
    ON public.enrollments (student_id, academic_year, enrolled_on);

CREATE INDEX IF NOT EXISTS enrollments_school_active_idx
    ON public.enrollments (school_id, status, academic_year, grade_level, class_id);

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS global_student_id UUID REFERENCES public.global_students(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_global_student_idx
    ON public.profiles (global_student_id)
    WHERE global_student_id IS NOT NULL;

ALTER TABLE public.global_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own global identity" ON public.global_students;
CREATE POLICY "Students view own global identity" ON public.global_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (select auth.uid())
              AND p.global_student_id = public.global_students.id
        )
        OR auth_helpers.get_my_role() IN ('admin', 'auditor')
        OR EXISTS (
            SELECT 1
            FROM public.enrollments e
            WHERE e.student_id = public.global_students.id
              AND e.school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admins manage global students" ON public.global_students;
CREATE POLICY "Admins manage global students" ON public.global_students
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "View own or school enrollments" ON public.enrollments;
CREATE POLICY "View own or school enrollments" ON public.enrollments
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('admin', 'auditor')
        OR school_id = auth_helpers.get_my_school_id()
        OR profile_id = (select auth.uid())
    );

DROP POLICY IF EXISTS "School leaders manage enrollments" ON public.enrollments;
CREATE POLICY "School leaders manage enrollments" ON public.enrollments
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() = 'principal'
            AND school_id = auth_helpers.get_my_school_id()
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() = 'principal'
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

CREATE OR REPLACE VIEW public.current_student_enrollments AS
SELECT DISTINCT ON (e.student_id)
    e.id AS enrollment_id,
    e.student_id,
    gs.abc_apaar_id,
    gs.first_name,
    gs.last_name,
    gs.date_of_birth,
    e.school_id,
    s.school_name,
    s.school_code,
    s.udise_code,
    e.profile_id,
    e.academic_year,
    e.grade_level,
    e.class_id,
    e.status,
    e.enrolled_on
FROM public.enrollments e
JOIN public.global_students gs ON gs.id = e.student_id
JOIN public.schools s ON s.id = e.school_id
WHERE e.status = 'active'
ORDER BY e.student_id, e.academic_year DESC, e.enrolled_on DESC, e.created_at DESC;

ALTER VIEW public.current_student_enrollments SET (security_invoker = true);

CREATE OR REPLACE VIEW public.student_lifelong_hpc_context AS
SELECT
    gs.id AS global_student_id,
    gs.abc_apaar_id,
    gs.first_name,
    gs.last_name,
    e.id AS enrollment_id,
    e.school_id,
    s.school_name,
    s.udise_code,
    e.academic_year,
    e.grade_level,
    e.class_id,
    e.status,
    e.enrolled_on,
    e.exited_on
FROM public.global_students gs
JOIN public.enrollments e ON e.student_id = gs.id
JOIN public.schools s ON s.id = e.school_id
ORDER BY gs.abc_apaar_id, e.academic_year, e.enrolled_on;

ALTER VIEW public.student_lifelong_hpc_context SET (security_invoker = true);

CREATE OR REPLACE FUNCTION public.link_student_profile_to_apaar(
    p_profile_id UUID,
    p_abc_apaar_id TEXT,
    p_first_name TEXT,
    p_last_name TEXT DEFAULT NULL,
    p_date_of_birth DATE DEFAULT NULL,
    p_academic_year TEXT DEFAULT NULL,
    p_grade_level TEXT DEFAULT NULL,
    p_class_id TEXT DEFAULT NULL
)
RETURNS public.enrollments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile public.profiles;
    v_student public.global_students;
    v_enrollment public.enrollments;
    v_academic_year TEXT;
    v_grade_level TEXT;
BEGIN
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = p_profile_id
    FOR UPDATE;

    IF NOT FOUND OR v_profile.role <> 'student' THEN
        RAISE EXCEPTION 'Student profile not found';
    END IF;

    IF v_profile.school_id IS NULL THEN
        RAISE EXCEPTION 'Student profile must belong to a school before enrollment can be created';
    END IF;

    IF auth.role() <> 'service_role' THEN
        IF auth_helpers.get_my_role() NOT IN ('admin', 'principal') THEN
            RAISE EXCEPTION 'Only admins and principals can link APAAR IDs';
        END IF;

        IF auth_helpers.get_my_role() = 'principal'
           AND v_profile.school_id IS DISTINCT FROM auth_helpers.get_my_school_id() THEN
            RAISE EXCEPTION 'Cannot link a student outside your school';
        END IF;
    END IF;

    v_academic_year := COALESCE(p_academic_year, CASE
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4
            THEN EXTRACT(YEAR FROM CURRENT_DATE)::int || '-' || (EXTRACT(YEAR FROM CURRENT_DATE)::int + 1)
        ELSE (EXTRACT(YEAR FROM CURRENT_DATE)::int - 1) || '-' || EXTRACT(YEAR FROM CURRENT_DATE)::int
    END);
    v_grade_level := COALESCE(p_grade_level, v_profile.class_id, 'unassigned');

    INSERT INTO public.global_students (abc_apaar_id, first_name, last_name, date_of_birth)
    VALUES (upper(trim(p_abc_apaar_id)), trim(p_first_name), nullif(trim(COALESCE(p_last_name, '')), ''), p_date_of_birth)
    ON CONFLICT (abc_apaar_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = COALESCE(EXCLUDED.last_name, public.global_students.last_name),
        date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.global_students.date_of_birth),
        updated_at = NOW()
    RETURNING * INTO v_student;

    UPDATE public.profiles
    SET global_student_id = v_student.id
    WHERE id = p_profile_id;

    INSERT INTO public.enrollments (
        student_id,
        school_id,
        profile_id,
        academic_year,
        grade_level,
        class_id,
        status
    )
    VALUES (
        v_student.id,
        v_profile.school_id,
        p_profile_id,
        v_academic_year,
        v_grade_level,
        COALESCE(p_class_id, v_profile.class_id),
        'active'
    )
    ON CONFLICT DO NOTHING;

    SELECT * INTO v_enrollment
    FROM public.enrollments
    WHERE student_id = v_student.id
      AND school_id = v_profile.school_id
      AND academic_year = v_academic_year
      AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN v_enrollment;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_student_profile_to_apaar(
    UUID,
    TEXT,
    TEXT,
    TEXT,
    DATE,
    TEXT,
    TEXT,
    TEXT
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.link_student_profile_to_apaar(
    UUID,
    TEXT,
    TEXT,
    TEXT,
    DATE,
    TEXT,
    TEXT,
    TEXT
) TO service_role;

-- Backfill demo/R&D student rows so current pilot data has an enrollment spine.
DO $$
DECLARE
    v_profile RECORD;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    FOR v_profile IN
        SELECT id, user_code, full_name, school_id, class_id
        FROM public.profiles
        WHERE role = 'student'
          AND school_id IS NOT NULL
          AND global_student_id IS NULL
    LOOP
        v_first_name := split_part(COALESCE(v_profile.full_name, v_profile.user_code), ' ', 1);
        v_last_name := NULLIF(regexp_replace(COALESCE(v_profile.full_name, ''), '^\S+\s*', ''), '');

        PERFORM public.link_student_profile_to_apaar(
            v_profile.id,
            'PENDING-' || v_profile.user_code,
            v_first_name,
            v_last_name,
            NULL,
            NULL,
            COALESCE(v_profile.class_id, 'unassigned'),
            v_profile.class_id
        );
    END LOOP;
END $$;
