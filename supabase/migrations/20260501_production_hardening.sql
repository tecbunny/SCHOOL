-- PRODUCTION HARDENING MIGRATION (2026-05-01)
-- This migration ensures all tables have RLS enabled and proper multi-tenant policies.

-- 1. Helper Functions (if not already exists)
-- Note: These might already exist in DB.sql, using CREATE OR REPLACE to be safe.
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Define Missing Tables (Ensuring existence)
CREATE TABLE IF NOT EXISTS public.school_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    attendance_mode TEXT DEFAULT 'morning',
    grading_system TEXT DEFAULT 'cbse_2020',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hpc_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- academic, socio_emotional, physical
    competency_name TEXT NOT NULL,
    score NUMERIC DEFAULT 0,
    teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.schools(id)
);

CREATE TABLE IF NOT EXISTS public.registration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name TEXT NOT NULL,
    udise_code TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    contact_email TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.registration_requests
    ADD COLUMN IF NOT EXISTS udise_code TEXT,
    ADD COLUMN IF NOT EXISTS applicant_name TEXT,
    ADD COLUMN IF NOT EXISTS applicant_email TEXT,
    ADD COLUMN IF NOT EXISTS contact_email TEXT;

CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    material_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    audience TEXT DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platform_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_features JSONB DEFAULT '{"is_promotion_open": false}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promotion_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id TEXT NOT NULL,
    principal_id UUID REFERENCES public.profiles(id),
    student_count INTEGER,
    from_grade TEXT,
    to_grade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on all public tables
ALTER TABLE IF EXISTS public.school_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hardware_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fleet_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fleet_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.global_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.promotion_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hpc_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registration_requests ENABLE ROW LEVEL SECURITY;

-- 4. Multi-Tenant Policies (Tenant Isolation)

-- Announcements: Viewable by anyone in the same school
DROP POLICY IF EXISTS "Announcements viewable by school members" ON public.announcements;
CREATE POLICY "Announcements viewable by school members" ON public.announcements
    FOR SELECT USING (school_id = get_my_school_id());

-- Announcements: Only Principal/Admin can manage
DROP POLICY IF EXISTS "Principals manage announcements" ON public.announcements;
CREATE POLICY "Principals manage announcements" ON public.announcements
    FOR ALL USING (get_my_role() IN ('principal', 'admin'));

-- Timetables: Viewable by school members
DROP POLICY IF EXISTS "Timetables viewable by school members" ON public.timetables;
CREATE POLICY "Timetables viewable by school members" ON public.timetables
    FOR SELECT USING (school_id = get_my_school_id());

-- Hardware Nodes: Only Admins can see/manage
DROP POLICY IF EXISTS "Admins manage hardware nodes" ON public.hardware_nodes;
CREATE POLICY "Admins manage hardware nodes" ON public.hardware_nodes
    FOR ALL USING (get_my_role() = 'admin');

-- System Logs: Only Admins can see
DROP POLICY IF EXISTS "Admins view system logs" ON public.system_logs;
CREATE POLICY "Admins view system logs" ON public.system_logs
    FOR SELECT USING (get_my_role() = 'admin');

-- System Logs: Users can insert their own logs
DROP POLICY IF EXISTS "Users can insert own logs" ON public.system_logs;
CREATE POLICY "Users can insert own logs" ON public.system_logs
    FOR INSERT WITH CHECK (user_id = auth.uid() OR tenant_id = get_my_school_id());

-- Global Materials: Viewable by all authenticated users
DROP POLICY IF EXISTS "Global materials viewable by all" ON public.global_materials;
CREATE POLICY "Global materials viewable by all" ON public.global_materials
    FOR SELECT USING (auth.role() = 'authenticated');

-- Study Materials: Viewable by same school
DROP POLICY IF EXISTS "View materials in same school" ON public.study_materials;
CREATE POLICY "View materials in same school" ON public.study_materials
    FOR SELECT USING (school_id = get_my_school_id());

-- Registration Requests: public intake, admin review
DROP POLICY IF EXISTS "Anyone can submit registration requests" ON public.registration_requests;
CREATE POLICY "Anyone can submit registration requests" ON public.registration_requests
    FOR INSERT WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "Admins manage registration requests" ON public.registration_requests;
CREATE POLICY "Admins manage registration requests" ON public.registration_requests
    FOR ALL USING (get_my_role() = 'admin')
    WITH CHECK (get_my_role() = 'admin');

-- 5. Indexing for Performance
CREATE INDEX IF NOT EXISTS idx_announcements_school ON public.announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_timetables_school ON public.timetables(school_id);
CREATE INDEX IF NOT EXISTS idx_hpc_tenant ON public.hpc_competencies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materials_school ON public.study_materials(school_id);
