-- SECURITY LOOPHOLE FIXES (2026-05-01)
-- Applies tenant isolation and per-node credential hardening to existing databases.

CREATE SCHEMA IF NOT EXISTS auth_helpers;
REVOKE ALL ON SCHEMA auth_helpers FROM PUBLIC;
GRANT USAGE ON SCHEMA auth_helpers TO authenticated;
GRANT USAGE ON SCHEMA auth_helpers TO service_role;

CREATE OR REPLACE FUNCTION auth_helpers.get_my_school_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION auth_helpers.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION auth_helpers.get_my_school_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_helpers.get_my_school_id() TO service_role;
GRANT EXECUTE ON FUNCTION auth_helpers.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_helpers.get_my_role() TO service_role;

-- Registration request shape and policies
ALTER TABLE IF EXISTS public.registration_requests
    ADD COLUMN IF NOT EXISTS udise_code TEXT,
    ADD COLUMN IF NOT EXISTS applicant_name TEXT,
    ADD COLUMN IF NOT EXISTS applicant_email TEXT,
    ADD COLUMN IF NOT EXISTS contact_email TEXT;

UPDATE public.registration_requests
SET
    applicant_email = COALESCE(applicant_email, contact_email),
    contact_email = COALESCE(contact_email, applicant_email)
WHERE applicant_email IS NULL OR contact_email IS NULL;

DROP POLICY IF EXISTS "Anyone can submit registration requests" ON public.registration_requests;
CREATE POLICY "Anyone can submit registration requests" ON public.registration_requests
    FOR INSERT WITH CHECK (
        length(trim(school_name)) >= 2 AND
        udise_code ~ '^[0-9]{11}$' AND
        length(trim(applicant_name)) >= 2 AND
        applicant_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' AND
        contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' AND
        status = 'pending'
    );

DROP POLICY IF EXISTS "Admins manage registration requests" ON public.registration_requests;
CREATE POLICY "Admins manage registration requests" ON public.registration_requests
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');

-- Per-node hardware credentials. Store SHA-256 hex in node_secret_hash.
ALTER TABLE IF EXISTS public.hardware_nodes
    ADD COLUMN IF NOT EXISTS node_secret_hash TEXT;

-- Tenant-scoped announcements
DROP POLICY IF EXISTS "Principals manage announcements" ON public.announcements;
CREATE POLICY "Principals manage announcements" ON public.announcements
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin' OR
        (auth_helpers.get_my_role() = 'principal' AND school_id = auth_helpers.get_my_school_id())
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin' OR
        (auth_helpers.get_my_role() = 'principal' AND school_id = auth_helpers.get_my_school_id())
    );

-- Tenant-scoped grades
DROP POLICY IF EXISTS "Teachers manage school grades" ON public.hpc_grades;
CREATE POLICY "Teachers manage school grades" ON public.hpc_grades
    FOR ALL USING (
        EXISTS (
            SELECT 1
            FROM public.profiles staff
            JOIN public.profiles student ON student.id = public.hpc_grades.student_id
            WHERE staff.id = auth.uid()
              AND staff.role IN ('teacher', 'principal')
              AND staff.school_id = student.school_id
        )
    )
    WITH CHECK (
        teacher_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.profiles staff
            JOIN public.profiles student ON student.id = public.hpc_grades.student_id
            WHERE staff.id = auth.uid()
              AND staff.role IN ('teacher', 'principal')
              AND staff.school_id = student.school_id
        )
    );

DROP POLICY IF EXISTS "Principals manage school grades" ON public.hpc_grades;
CREATE POLICY "Principals manage school grades" ON public.hpc_grades
    FOR ALL USING (
      EXISTS (
        SELECT 1
        FROM public.profiles staff
        JOIN public.profiles student ON student.id = public.hpc_grades.student_id
        WHERE staff.id = auth.uid()
        AND staff.school_id = student.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
      )
    )
    WITH CHECK (
      teacher_id = auth.uid() AND
      EXISTS (
        SELECT 1
        FROM public.profiles staff
        JOIN public.profiles student ON student.id = public.hpc_grades.student_id
        WHERE staff.id = auth.uid()
        AND staff.school_id = student.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
      )
    );

DROP POLICY IF EXISTS "Principals manage exam papers" ON public.exam_papers;
CREATE POLICY "Principals manage exam papers" ON public.exam_papers
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles staff
        WHERE staff.id = auth.uid()
        AND staff.school_id = public.exam_papers.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
      )
    )
    WITH CHECK (
      teacher_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM public.profiles staff
        WHERE staff.id = auth.uid()
        AND staff.school_id = public.exam_papers.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
      )
    );

DROP POLICY IF EXISTS "Staff manage student wellbeing" ON public.student_wellbeing;
CREATE POLICY "Staff manage student wellbeing" ON public.student_wellbeing
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin' OR (
            auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator') AND
            recorded_by = auth.uid() AND
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = public.student_wellbeing.student_id
                  AND p.school_id = auth_helpers.get_my_school_id()
            )
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin' OR (
            auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator') AND
            recorded_by = auth.uid() AND
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = public.student_wellbeing.student_id
                  AND p.school_id = auth_helpers.get_my_school_id()
            )
        )
    );

DROP POLICY IF EXISTS "Staff manage HPC competencies" ON public.hpc_competencies;
CREATE POLICY "Staff manage HPC competencies" ON public.hpc_competencies
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin' OR (
            auth_helpers.get_my_role() IN ('principal', 'teacher') AND
            tenant_id = auth_helpers.get_my_school_id() AND
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = public.hpc_competencies.student_id
                  AND p.school_id = auth_helpers.get_my_school_id()
            )
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin' OR (
            auth_helpers.get_my_role() IN ('principal', 'teacher') AND
            tenant_id = auth_helpers.get_my_school_id() AND
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = public.hpc_competencies.student_id
                  AND p.school_id = auth_helpers.get_my_school_id()
            )
        )
    );

DROP POLICY IF EXISTS "Staff manage behavioral logs" ON public.behavioral_logs;
CREATE POLICY "Staff manage behavioral logs" ON public.behavioral_logs
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin' OR (
            auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator') AND
            tenant_id = auth_helpers.get_my_school_id() AND
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = public.behavioral_logs.student_id
                  AND p.school_id = auth_helpers.get_my_school_id()
            )
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin' OR (
            auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator') AND
            tenant_id = auth_helpers.get_my_school_id() AND
            teacher_id = auth.uid() AND
            EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = public.behavioral_logs.student_id
                  AND p.school_id = auth_helpers.get_my_school_id()
            )
        )
    );

-- QR sessions are handled by server routes; do not expose all pending tokens via RLS.
DROP POLICY IF EXISTS "View own pending QR session" ON public.qr_sessions;
CREATE POLICY "View own pending QR session" ON public.qr_sessions
    FOR SELECT USING (authenticated_user_id = auth.uid());

DROP POLICY IF EXISTS "Teachers verify QR sessions" ON public.qr_sessions;
CREATE POLICY "Teachers verify QR sessions" ON public.qr_sessions
    FOR UPDATE USING (false);

-- Tenant-scoped live monitoring
DROP POLICY IF EXISTS "Students manage own session" ON public.student_sessions;
CREATE POLICY "Students manage own session" ON public.student_sessions
    FOR ALL USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers monitor school sessions" ON public.student_sessions;
CREATE POLICY "Teachers monitor school sessions" ON public.student_sessions
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator')
        AND EXISTS (
            SELECT 1 FROM public.profiles student
            WHERE student.id = public.student_sessions.student_id
              AND student.school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Principals monitor school sessions" ON public.student_sessions;
CREATE POLICY "Principals monitor school sessions" ON public.student_sessions
    FOR SELECT USING (
      EXISTS (
        SELECT 1
        FROM public.profiles staff
        JOIN public.profiles student ON student.id = public.student_sessions.student_id
        WHERE staff.id = auth.uid()
        AND staff.school_id = student.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true) OR staff.role = 'moderator')
      )
    );

-- Tenant-scoped remote commands
DROP POLICY IF EXISTS "Students listen for commands" ON public.device_commands;
CREATE POLICY "Students listen for commands" ON public.device_commands
    FOR SELECT USING (target_student_id = auth.uid());

DROP POLICY IF EXISTS "Students acknowledge own commands" ON public.device_commands;
CREATE POLICY "Students acknowledge own commands" ON public.device_commands
    FOR UPDATE USING (target_student_id = auth.uid())
    WITH CHECK (target_student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers issue commands" ON public.device_commands;
CREATE POLICY "Teachers issue commands" ON public.device_commands
    FOR INSERT WITH CHECK (
        issuer_id = auth.uid()
        AND auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator')
        AND EXISTS (
            SELECT 1 FROM public.profiles target
            WHERE target.id = public.device_commands.target_student_id
              AND target.role = 'student'
              AND target.school_id = auth_helpers.get_my_school_id()
        )
    );
