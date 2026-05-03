-- EDUPORTAL CORE EXTENSIONS (2026-05-03)
-- Adds persistent tables for assignments, submissions, peer reviews, audit logs, and certifications.

-- 1. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    class_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    exam_paper_id UUID REFERENCES public.exam_papers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT, -- Content or URL to storage
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded')),
    grade NUMERIC,
    feedback TEXT,
    UNIQUE(assignment_id, student_id)
);

-- 3. PEER REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.peer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 10),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(submission_id, reviewer_id)
);

-- 4. INSTITUTIONAL AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Optional: school-wide certs
    certification_name TEXT NOT NULL,
    issued_by TEXT NOT NULL,
    issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_at DATE,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENABLE RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES

-- Assignments: Viewable by school members, manageable by teachers/principals
DROP POLICY IF EXISTS "Viewable by school" ON public.assignments;
CREATE POLICY "Viewable by school" ON public.assignments
    FOR SELECT USING (school_id = auth_helpers.get_my_school_id() OR auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Manageable by staff" ON public.assignments;
CREATE POLICY "Manageable by staff" ON public.assignments
    FOR ALL USING (
        auth_helpers.get_my_role() IN ('teacher', 'principal') AND 
        school_id = auth_helpers.get_my_school_id()
    );

-- Submissions: Students view/manage own, teachers view school
DROP POLICY IF EXISTS "Students manage own submissions" ON public.submissions;
CREATE POLICY "Students manage own submissions" ON public.submissions
    FOR ALL USING (student_id = (select auth.uid()));

DROP POLICY IF EXISTS "Staff view school submissions" ON public.submissions;
CREATE POLICY "Staff view school submissions" ON public.submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = public.submissions.assignment_id
              AND a.school_id = auth_helpers.get_my_school_id()
              AND auth_helpers.get_my_role() IN ('teacher', 'principal')
        )
    );

-- Peer Reviews: Reviewers manage own, students view own submission's reviews
DROP POLICY IF EXISTS "Reviewers manage own" ON public.peer_reviews;
CREATE POLICY "Reviewers manage own" ON public.peer_reviews
    FOR ALL USING (reviewer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Students view reviews of own submissions" ON public.peer_reviews;
CREATE POLICY "Students view reviews of own submissions" ON public.peer_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.submissions s
            WHERE s.id = public.peer_reviews.submission_id
              AND s.student_id = (select auth.uid())
        )
    );

-- Audit Logs: Viewable by admins/auditors and school principals
DROP POLICY IF EXISTS "Oversight view audit logs" ON public.audit_logs;
CREATE POLICY "Oversight view audit logs" ON public.audit_logs
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        (auth_helpers.get_my_role() = 'principal' AND school_id = auth_helpers.get_my_school_id())
    );

-- Certifications: Viewable by student/school staff
DROP POLICY IF EXISTS "View certifications" ON public.certifications;
CREATE POLICY "View certifications" ON public.certifications
    FOR SELECT USING (
        student_id = (select auth.uid()) OR
        (auth_helpers.get_my_role() IN ('teacher', 'principal') AND school_id = auth_helpers.get_my_school_id()) OR
        auth_helpers.get_my_role() IN ('admin', 'auditor')
    );

DROP POLICY IF EXISTS "Staff manage certifications" ON public.certifications;
CREATE POLICY "Staff manage certifications" ON public.certifications
    FOR ALL USING (
        auth_helpers.get_my_role() IN ('teacher', 'principal') AND 
        school_id = auth_helpers.get_my_school_id()
    );
