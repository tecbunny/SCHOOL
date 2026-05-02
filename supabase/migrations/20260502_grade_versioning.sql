-- TEACHER-EDGE GRADE VERSIONING (2026-05-02)
-- Hardware timestamps are advisory; grade acceptance is based on monotonically increasing versions.

ALTER TABLE public.hpc_grades
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS version_count INTEGER NOT NULL DEFAULT 1 CHECK (version_count > 0),
    ADD COLUMN IF NOT EXISTS origin_device_id TEXT,
    ADD COLUMN IF NOT EXISTS edit_event_id UUID REFERENCES public.offline_events(event_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS hpc_grades_student_subject_version_idx
    ON public.hpc_grades (student_id, subject, assessment_type, version_count DESC);

CREATE INDEX IF NOT EXISTS hpc_grades_edit_event_idx
    ON public.hpc_grades (edit_event_id)
    WHERE edit_event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.apply_grade_edge_version(
    p_grade_id UUID,
    p_student_id UUID,
    p_subject TEXT,
    p_assessment_type TEXT,
    p_marks_obtained NUMERIC,
    p_max_marks NUMERIC,
    p_cbse_grade TEXT,
    p_teacher_id UUID,
    p_version_count INTEGER,
    p_edited_at TIMESTAMPTZ DEFAULT NULL,
    p_origin_device_id TEXT DEFAULT NULL,
    p_edit_event_id UUID DEFAULT NULL
)
RETURNS public.hpc_grades
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing public.hpc_grades;
    v_result public.hpc_grades;
BEGIN
    IF p_version_count IS NULL OR p_version_count <= 0 THEN
        RAISE EXCEPTION 'Grade version_count must be greater than zero';
    END IF;

    IF auth.role() <> 'service_role' THEN
        IF p_teacher_id <> (select auth.uid()) THEN
            RAISE EXCEPTION 'Teachers can only apply their own grade edits';
        END IF;

        IF auth_helpers.get_my_role() NOT IN ('teacher', 'principal') THEN
            RAISE EXCEPTION 'Only teaching staff can apply grade edits';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM public.profiles staff
            JOIN public.profiles student ON student.id = p_student_id
            WHERE staff.id = (select auth.uid())
              AND staff.school_id = student.school_id
              AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
        ) THEN
            RAISE EXCEPTION 'Teacher cannot grade a student outside their school';
        END IF;
    END IF;

    SELECT * INTO v_existing
    FROM public.hpc_grades
    WHERE id = p_grade_id
    FOR UPDATE;

    IF FOUND THEN
        IF p_version_count <= v_existing.version_count THEN
            RETURN v_existing;
        END IF;

        UPDATE public.hpc_grades
        SET
            student_id = p_student_id,
            subject = p_subject,
            assessment_type = p_assessment_type,
            marks_obtained = p_marks_obtained,
            max_marks = p_max_marks,
            cbse_grade = p_cbse_grade,
            teacher_id = p_teacher_id,
            version_count = p_version_count,
            edited_at = p_edited_at,
            uploaded_at = NOW(),
            origin_device_id = p_origin_device_id,
            edit_event_id = p_edit_event_id
        WHERE id = p_grade_id
        RETURNING * INTO v_result;

        RETURN v_result;
    END IF;

    INSERT INTO public.hpc_grades (
        id,
        student_id,
        subject,
        assessment_type,
        marks_obtained,
        max_marks,
        cbse_grade,
        teacher_id,
        version_count,
        edited_at,
        uploaded_at,
        origin_device_id,
        edit_event_id
    )
    VALUES (
        p_grade_id,
        p_student_id,
        p_subject,
        p_assessment_type,
        p_marks_obtained,
        p_max_marks,
        p_cbse_grade,
        p_teacher_id,
        p_version_count,
        p_edited_at,
        NOW(),
        p_origin_device_id,
        p_edit_event_id
    )
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_grade_edge_version(
    UUID,
    UUID,
    TEXT,
    TEXT,
    NUMERIC,
    NUMERIC,
    TEXT,
    UUID,
    INTEGER,
    TIMESTAMPTZ,
    TEXT,
    UUID
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.apply_grade_edge_version(
    UUID,
    UUID,
    TEXT,
    TEXT,
    NUMERIC,
    NUMERIC,
    TEXT,
    UUID,
    INTEGER,
    TIMESTAMPTZ,
    TEXT,
    UUID
) TO service_role;
