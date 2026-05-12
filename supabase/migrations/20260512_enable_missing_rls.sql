-- Production hardening: ensure tenant-scoped tables enforce RLS.

ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hpc_competencies ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.announcements FROM anon;
REVOKE ALL ON TABLE public.timetable FROM anon;
REVOKE ALL ON TABLE public.hpc_competencies FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.announcements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.timetable TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hpc_competencies TO authenticated;

DROP POLICY IF EXISTS "School members view announcements" ON public.announcements;
CREATE POLICY "School members view announcements" ON public.announcements
  FOR SELECT
  USING (
    auth_helpers.get_my_role() = 'admin'
    OR school_id = auth_helpers.get_my_school_id()
  );

DROP POLICY IF EXISTS "School staff manage announcements" ON public.announcements;
CREATE POLICY "School staff manage announcements" ON public.announcements
  FOR ALL
  USING (
    auth_helpers.get_my_role() = 'admin'
    OR (
      auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator')
      AND school_id = auth_helpers.get_my_school_id()
    )
  )
  WITH CHECK (
    auth_helpers.get_my_role() = 'admin'
    OR (
      auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator')
      AND school_id = auth_helpers.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "School members view timetable" ON public.timetable;
CREATE POLICY "School members view timetable" ON public.timetable
  FOR SELECT
  USING (
    auth_helpers.get_my_role() = 'admin'
    OR school_id = auth_helpers.get_my_school_id()
  );

DROP POLICY IF EXISTS "School staff manage timetable" ON public.timetable;
CREATE POLICY "School staff manage timetable" ON public.timetable
  FOR ALL
  USING (
    auth_helpers.get_my_role() = 'admin'
    OR (
      auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator')
      AND school_id = auth_helpers.get_my_school_id()
    )
  )
  WITH CHECK (
    auth_helpers.get_my_role() = 'admin'
    OR (
      auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator')
      AND school_id = auth_helpers.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Students view own HPC competencies" ON public.hpc_competencies;
CREATE POLICY "Students view own HPC competencies" ON public.hpc_competencies
  FOR SELECT
  USING (
    student_id = auth.uid()
    OR auth_helpers.get_my_role() = 'admin'
    OR (
      auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator')
      AND tenant_id = auth_helpers.get_my_school_id()
    )
  );
