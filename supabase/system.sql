-- EDUPORTAL SYSTEM DATABASE SETUP
-- Single setup script for Supabase SQL Editor.
-- Run this once for schema, policies, realtime setup, hardening, and demo seed data.
-- Use supabase/clear_all_data.sql separately when you only need to clear data.

-- ============================================================
-- Base schema, RLS, realtime, and core seed
-- ============================================================

-- SUPABASE DATABASE SCHEMA FOR EDUPORTAL

-- 1. CLEANUP (Optional: Only use if you want to reset everything)
-- DROP TABLE IF EXISTS public.chat_participants;
-- DROP TABLE IF EXISTS public.chat_messages;
-- DROP TABLE IF EXISTS public.chat_rooms;
-- DROP TABLE IF EXISTS public.profiles;
-- DROP TABLE IF EXISTS public.schools;
-- DROP TYPE IF EXISTS user_role;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'auditor', 'principal', 'teacher', 'moderator', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CREATE SECURITY SCHEMAS
CREATE SCHEMA IF NOT EXISTS auth_helpers;
REVOKE ALL ON SCHEMA auth_helpers FROM PUBLIC;
GRANT USAGE ON SCHEMA auth_helpers TO authenticated;
GRANT USAGE ON SCHEMA auth_helpers TO service_role;

-- 2.1 Helper functions for RLS (Moved to auth_helpers to prevent RPC exposure)
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

-- 3. CREATE SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_code TEXT UNIQUE NOT NULL, -- Format: SCHXXXX
    school_name TEXT NOT NULL,
    plan_type TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CREATE PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    user_code TEXT UNIQUE NOT NULL, -- Format: ADXXXXX, AUXXXXX, PRXXXXX, TXXXXXX, MDXXXXX, or 11-digit Student Code
    full_name TEXT,
    role user_role NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    mac_address TEXT UNIQUE, -- Hardware binding for SSPH-01 devices
    is_hardware_bound BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. CREATE CHAT ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_name TEXT NOT NULL,
    room_type TEXT NOT NULL, -- 'classroom', 'school', 'departmental', 'custom'
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. CREATE CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. CREATE CHAT PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(room_id, profile_id)
);

-- 8. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES
-- Profiles: Users can see profiles in their school, or if they are admins/auditors
DROP POLICY IF EXISTS "Viewable by same school or higher" ON public.profiles;
CREATE POLICY "Viewable by same school or higher" ON public.profiles
    FOR SELECT USING (
        id = auth.uid() OR
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR 
        school_id = auth_helpers.get_my_school_id()
    );

-- Messages: Only participants can read messages
DROP POLICY IF EXISTS "View messages if participant" ON public.chat_messages;
CREATE POLICY "View messages if participant" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.chat_participants WHERE room_id = public.chat_messages.room_id AND profile_id = auth.uid())
    );

-- Messages: Only participants can send messages
DROP POLICY IF EXISTS "Send messages if participant" ON public.chat_messages;
CREATE POLICY "Send messages if participant" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.chat_participants WHERE room_id = public.chat_messages.room_id AND profile_id = auth.uid())
    );

-- Participants: Users can only see participants in rooms they belong to
DROP POLICY IF EXISTS "View participants in own rooms" ON public.chat_participants;
CREATE POLICY "View participants in own rooms" ON public.chat_participants
    FOR SELECT USING (
        profile_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.chat_participants p2 WHERE p2.room_id = public.chat_participants.room_id AND p2.profile_id = auth.uid())
    );

-- Participants: Users can only add themselves to rooms if they belong to the school
DROP POLICY IF EXISTS "Self-join rooms in same school" ON public.chat_participants;
CREATE POLICY "Self-join rooms in same school" ON public.chat_participants
    FOR INSERT WITH CHECK (
        profile_id = auth.uid() AND
        EXISTS (SELECT 1 FROM public.chat_rooms r WHERE r.id = room_id AND r.school_id = auth_helpers.get_my_school_id())
    );

-- 10. ENABLE REALTIME
-- Try to add to publication, handle if already exists
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
    WHEN others THEN null;
END $$;

-- 11. SEED INITIAL DATA
INSERT INTO public.schools (school_code, school_name, plan_type)
VALUES ('SCH7878', 'St. Mary''s Convent', 'premium')
ON CONFLICT (school_code) DO NOTHING;

-- 12. ACADEMIC ENGINE TABLES

-- Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT NOT NULL, -- 'present', 'absent', 'late'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, date)
);

-- HPC Grades Table (Academic Engine)
CREATE TABLE IF NOT EXISTS public.hpc_grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    assessment_type TEXT NOT NULL, -- 'formative', 'summative'
    marks_obtained NUMERIC NOT NULL,
    max_marks NUMERIC NOT NULL,
    cbse_grade TEXT, -- A1, A2, B1, etc.
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- CPD Logs (Teacher Professional Development)
CREATE TABLE IF NOT EXISTS public.cpd_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_name TEXT NOT NULL,
    hours_logged NUMERIC NOT NULL,
    date_completed DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Materials & Syllabus (Content Hub)
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    subject TEXT NOT NULL,
    material_type TEXT NOT NULL, -- 'syllabus', 'video', 'notes'
    is_ai_indexed BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Exam Papers (AI Generated or Manual)
CREATE TABLE IF NOT EXISTS public.exam_papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    content JSONB NOT NULL, -- Stores the JSON generated by Gemini
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. ADDITIONAL RLS POLICIES FOR ACADEMICS

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hpc_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;

-- Students can view their own attendance and grades
DROP POLICY IF EXISTS "Students view own attendance" ON public.attendance;
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students view own grades" ON public.hpc_grades;
CREATE POLICY "Students view own grades" ON public.hpc_grades FOR SELECT USING (student_id = auth.uid());

-- Teachers can view/insert for their school
DROP POLICY IF EXISTS "Teachers manage school attendance" ON public.attendance;
CREATE POLICY "Teachers manage school attendance" ON public.attendance 
    FOR ALL USING (auth_helpers.get_my_role() = 'teacher' AND school_id = auth_helpers.get_my_school_id());

DROP POLICY IF EXISTS "Teachers manage school grades" ON public.hpc_grades;
CREATE POLICY "Teachers manage school grades" ON public.hpc_grades 
    FOR ALL USING (auth_helpers.get_my_role() = 'teacher');

-- Auditors have read-only access to everything
DROP POLICY IF EXISTS "Auditors read-only attendance" ON public.attendance;
CREATE POLICY "Auditors read-only attendance" ON public.attendance 
    FOR SELECT USING (auth_helpers.get_my_role() = 'auditor');

DROP POLICY IF EXISTS "Auditors read-only grades" ON public.hpc_grades;
CREATE POLICY "Auditors read-only grades" ON public.hpc_grades 
    FOR SELECT USING (auth_helpers.get_my_role() = 'auditor');

-- 14. ADVANCED NEP 2020 MODULES

-- Parent Feedback (Part of 360-degree HPC)
CREATE TABLE IF NOT EXISTS public.parent_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_comment TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Vocational Skills & Bagless Days
CREATE TABLE IF NOT EXISTS public.vocational_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL, -- e.g., 'Pottery', 'Coding', 'Gardening'
    hours_spent NUMERIC DEFAULT 0,
    proficiency_level TEXT, -- 'Beginner', 'Intermediate', 'Advanced'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Foundational Literacy & Numeracy (FLN) Tracking
CREATE TABLE IF NOT EXISTS public.fln_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    milestone_name TEXT NOT NULL, -- e.g., 'Reading 3-letter words', 'Addition up to 20'
    is_achieved BOOLEAN DEFAULT FALSE,
    date_achieved DATE,
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- SMC (School Management Committee) Minutes
CREATE TABLE IF NOT EXISTS public.smc_minutes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    meeting_date DATE DEFAULT CURRENT_DATE NOT NULL,
    summary TEXT NOT NULL,
    action_items TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Student Wellbeing & Socio-Emotional Tracking
CREATE TABLE IF NOT EXISTS public.student_wellbeing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    emotional_state TEXT, -- 'Happy', 'Anxious', 'Confident', 'Neutral'
    observation_notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 15. RLS FOR ADVANCED MODULES
ALTER TABLE public.parent_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocational_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fln_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smc_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_wellbeing ENABLE ROW LEVEL SECURITY;

-- General rule: Students/Parents view their own; Teachers/Principals view their school; Auditors view all.
DROP POLICY IF EXISTS "Student/Parent view own feedback" ON public.parent_feedback;
CREATE POLICY "Student/Parent view own feedback" ON public.parent_feedback FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Student view own vocational" ON public.vocational_skills;
CREATE POLICY "Student view own vocational" ON public.vocational_skills FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Student view own FLN" ON public.fln_milestones;
CREATE POLICY "Student view own FLN" ON public.fln_milestones FOR SELECT USING (student_id = auth.uid());

-- HOD/Principals manage SMC
DROP POLICY IF EXISTS "Principals manage SMC" ON public.smc_minutes;
CREATE POLICY "Principals manage SMC" ON public.smc_minutes 
    FOR ALL USING (auth_helpers.get_my_role() = 'principal' AND school_id = auth_helpers.get_my_school_id());

-- Auditors see all for compliance auditing
DROP POLICY IF EXISTS "Auditors see all advanced" ON public.smc_minutes;
CREATE POLICY "Auditors see all advanced" ON public.smc_minutes 
    FOR SELECT USING (auth_helpers.get_my_role() = 'auditor');

DROP POLICY IF EXISTS "Auditors see vocational" ON public.vocational_skills;
CREATE POLICY "Auditors see vocational" ON public.vocational_skills 
    FOR SELECT USING (auth_helpers.get_my_role() = 'auditor');
-- 16. REVERSE QR AUTHENTICATION HANDSHAKE
CREATE TABLE IF NOT EXISTS public.qr_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL, -- The MAC/Fingerprint of the student device
    session_token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'expired'
    authenticated_user_id UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;

-- Students can read their own pending session
DROP POLICY IF EXISTS "View own pending QR session" ON public.qr_sessions;
CREATE POLICY "View own pending QR session" ON public.qr_sessions 
    FOR SELECT USING (status = 'pending');

-- Teachers/Principals can verify sessions in their school
DROP POLICY IF EXISTS "Teachers verify QR sessions" ON public.qr_sessions;
CREATE POLICY "Teachers verify QR sessions" ON public.qr_sessions 
    FOR UPDATE USING (auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator'));

-- 17. REAL-TIME MONITORING (Teacher God-Mode)
CREATE TABLE IF NOT EXISTS public.student_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    current_activity TEXT, -- e.g., 'Math Quiz', 'Syllabus Review'
    status TEXT DEFAULT 'active', -- 'active', 'idle', 'offline'
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id)
);

ALTER TABLE public.student_sessions ENABLE ROW LEVEL SECURITY;

-- Students update their own heartbeat
DROP POLICY IF EXISTS "Students manage own session" ON public.student_sessions;
CREATE POLICY "Students manage own session" ON public.student_sessions 
    FOR ALL USING (student_id = auth.uid());

-- Teachers view all sessions in their school
DROP POLICY IF EXISTS "Teachers monitor school sessions" ON public.student_sessions;
CREATE POLICY "Teachers monitor school sessions" ON public.student_sessions 
    FOR SELECT USING (auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator'));

-- 18. REMOTE OVERRIDE (Command System)
CREATE TABLE IF NOT EXISTS public.device_commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    target_student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    issuer_id UUID REFERENCES public.profiles(id) NOT NULL,
    command_type TEXT NOT NULL, -- 'PUSH_URL', 'LOCK_SCREEN', 'SHOW_HINT', 'RESET'
    payload JSONB,
    is_executed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.device_commands ENABLE ROW LEVEL SECURITY;

-- Students listen for commands
DROP POLICY IF EXISTS "Students listen for commands" ON public.device_commands;
CREATE POLICY "Students listen for commands" ON public.device_commands 
    FOR SELECT USING (target_student_id = auth.uid());

-- Teachers issue commands
DROP POLICY IF EXISTS "Teachers issue commands" ON public.device_commands;
CREATE POLICY "Teachers issue commands" ON public.device_commands 
    FOR INSERT WITH CHECK (auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator'));

-- Enable Realtime for Monitoring and Commands
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_sessions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.device_commands;
EXCEPTION
    WHEN others THEN null;
END $$;

-- ============================================================
-- Archival schema
-- ============================================================

-- Create Archival Schema
CREATE SCHEMA IF NOT EXISTS archive;

-- Archive Table: Historical Chat Messages
CREATE TABLE IF NOT EXISTS archive.messages (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    sender_id UUID,
    room_id TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive Table: Historical Attendance
CREATE TABLE IF NOT EXISTS archive.attendance (
    id UUID PRIMARY KEY,
    student_id UUID,
    status TEXT,
    date DATE,
    tenant_id UUID,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive Table: Kiosk Heartbeats
CREATE TABLE IF NOT EXISTS archive.hardware_heartbeats (
    id UUID PRIMARY KEY,
    node_id UUID,
    telemetry JSONB,
    created_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to archive old data (Draft)
CREATE OR REPLACE FUNCTION archive.perform_annual_rollover(target_school_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Move Messages
    INSERT INTO archive.messages (id, tenant_id, sender_id, room_id, content, created_at)
    SELECT id, tenant_id, sender_id, room_id, content, created_at
    FROM public.messages
    WHERE tenant_id = target_school_id;
    
    DELETE FROM public.messages WHERE tenant_id = target_school_id;

    -- Move Attendance
    INSERT INTO archive.attendance (id, student_id, status, date, tenant_id)
    SELECT id, student_id, status, date, tenant_id
    FROM public.attendance
    WHERE tenant_id = target_school_id;

    DELETE FROM public.attendance WHERE tenant_id = target_school_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Fleet MDM
-- ============================================================

-- Core Hardware Infrastructure
CREATE TABLE IF NOT EXISTS public.hardware_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    node_name TEXT NOT NULL,
    mac_address TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'offline',
    temp NUMERIC DEFAULT 0,
    version TEXT DEFAULT '1.0.0',
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fleet Management: Software Release Tracking
CREATE TABLE IF NOT EXISTS public.fleet_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_code TEXT NOT NULL,
    release_type TEXT CHECK (release_type IN ('os', 'pwa')),
    download_url TEXT NOT NULL,
    checksum TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    changelog TEXT
);

-- Fleet Management: Deployment Status
CREATE TABLE IF NOT EXISTS public.fleet_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.fleet_releases(id),
    node_id UUID REFERENCES public.hardware_nodes(id),
    status TEXT CHECK (status IN ('pending', 'downloading', 'installed', 'failed')),
    error_log TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast version checking
CREATE INDEX IF NOT EXISTS idx_fleet_releases_version ON public.fleet_releases(version_code);

-- ============================================================
-- System logs
-- ============================================================

-- Centralized System Event Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID, -- Optional: link to school
    user_id UUID,   -- Optional: who did it
    event_type TEXT NOT NULL, -- e.g., 'AUTH', 'HARDWARE', 'AI_GRADING', 'PROMOTION', 'SYSTEM'
    severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB, -- Store full JSON payloads (AI responses, hardware telemetry)
    client_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_logs_event_type ON public.system_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_logs_tenant_id ON public.system_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.system_logs(created_at DESC);

-- ============================================================
-- Global content and behavior
-- ============================================================

-- Global Institutional Content Repository
CREATE TABLE IF NOT EXISTS public.global_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT CHECK (category IN ('textbook', 'video', 'worksheet', 'syllabus')),
    version_code TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Behavioral & Disciplinary Logs (HPC Integration)
CREATE TABLE IF NOT EXISTS public.behavioral_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id),
    teacher_id UUID REFERENCES public.profiles(id),
    incident_type TEXT NOT NULL, -- e.g., 'merit', 'demerit', 'disciplinary'
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.schools(id)
);

-- Index for Student HPC Viewer
CREATE INDEX IF NOT EXISTS idx_behavioral_student ON public.behavioral_logs(student_id);

-- ============================================================
-- Timetable resources
-- ============================================================

-- Institutional Resource & Timetable Management
CREATE TABLE IF NOT EXISTS public.school_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 40,
    room_type TEXT DEFAULT 'classroom', -- e.g., 'lab', 'library', 'sports'
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    class_id TEXT NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id),
    room_id UUID REFERENCES public.school_rooms(id),
    subject TEXT NOT NULL,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    academic_year TEXT NOT NULL
);

-- Index for Conflict Detection
CREATE INDEX IF NOT EXISTS idx_timetable_conflict ON public.timetables(teacher_id, day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_timetable_room ON public.timetables(room_id, day_of_week, start_time);

-- ============================================================
-- Production hardening
-- ============================================================

-- PRODUCTION HARDENING MIGRATION (2026-05-01)
-- This migration ensures all tables have RLS enabled and proper multi-tenant policies.

-- 1. Remove legacy public helper functions.
-- Existing policies are recreated below to use auth_helpers.* instead.
-- The old public functions are dropped in the final security hardening block.

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
    contact_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    FOR SELECT USING (school_id = auth_helpers.get_my_school_id());

-- Announcements: Only Principal/Admin can manage
DROP POLICY IF EXISTS "Principals manage announcements" ON public.announcements;
CREATE POLICY "Principals manage announcements" ON public.announcements
    FOR ALL USING (auth_helpers.get_my_role() IN ('principal', 'admin'));

-- Timetables: Viewable by school members
DROP POLICY IF EXISTS "Timetables viewable by school members" ON public.timetables;
CREATE POLICY "Timetables viewable by school members" ON public.timetables
    FOR SELECT USING (school_id = auth_helpers.get_my_school_id());

-- Hardware Nodes: Only Admins can see/manage
DROP POLICY IF EXISTS "Admins manage hardware nodes" ON public.hardware_nodes;
CREATE POLICY "Admins manage hardware nodes" ON public.hardware_nodes
    FOR ALL USING (auth_helpers.get_my_role() = 'admin');

-- System Logs: Only Admins can see
DROP POLICY IF EXISTS "Admins view system logs" ON public.system_logs;
CREATE POLICY "Admins view system logs" ON public.system_logs
    FOR SELECT USING (auth_helpers.get_my_role() = 'admin');

-- System Logs: Users can insert their own logs
DROP POLICY IF EXISTS "Users can insert own logs" ON public.system_logs;
CREATE POLICY "Users can insert own logs" ON public.system_logs
    FOR INSERT WITH CHECK (user_id = auth.uid() OR tenant_id = auth_helpers.get_my_school_id());

-- Global Materials: Viewable by all authenticated users
DROP POLICY IF EXISTS "Global materials viewable by all" ON public.global_materials;
CREATE POLICY "Global materials viewable by all" ON public.global_materials
    FOR SELECT USING (auth.role() = 'authenticated');

-- Study Materials: Viewable by same school
DROP POLICY IF EXISTS "View materials in same school" ON public.study_materials;
CREATE POLICY "View materials in same school" ON public.study_materials
    FOR SELECT USING (school_id = auth_helpers.get_my_school_id());

-- 5. Indexing for Performance
CREATE INDEX IF NOT EXISTS idx_announcements_school ON public.announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_timetables_school ON public.timetables(school_id);
CREATE INDEX IF NOT EXISTS idx_hpc_tenant ON public.hpc_competencies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materials_school ON public.study_materials(school_id);

-- 6. RLS Policy Coverage
-- These policies ensure every RLS-enabled table has an explicit access rule.
-- Service-role backend jobs still bypass RLS; browser clients only get scoped access.

DROP POLICY IF EXISTS "Schools viewable by members" ON public.schools;
CREATE POLICY "Schools viewable by members" ON public.schools
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        id = auth_helpers.get_my_school_id()
    );

DROP POLICY IF EXISTS "Admins manage schools" ON public.schools;
CREATE POLICY "Admins manage schools" ON public.schools
    FOR ALL USING (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Chat rooms viewable by school members" ON public.chat_rooms;
CREATE POLICY "Chat rooms viewable by school members" ON public.chat_rooms
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        school_id = auth_helpers.get_my_school_id()
    );

DROP POLICY IF EXISTS "Staff manage school chat rooms" ON public.chat_rooms;
CREATE POLICY "Staff manage school chat rooms" ON public.chat_rooms
    FOR ALL USING (
        auth_helpers.get_my_role() IN ('admin', 'principal', 'moderator') AND
        (auth_helpers.get_my_role() = 'admin' OR school_id = auth_helpers.get_my_school_id())
    );

DROP POLICY IF EXISTS "Teachers manage own CPD logs" ON public.cpd_logs;
CREATE POLICY "Teachers manage own CPD logs" ON public.cpd_logs
    FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins and auditors view CPD logs" ON public.cpd_logs;
CREATE POLICY "Admins and auditors view CPD logs" ON public.cpd_logs
    FOR SELECT USING (auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Materials viewable by school members" ON public.materials;
CREATE POLICY "Materials viewable by school members" ON public.materials
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        school_id = auth_helpers.get_my_school_id()
    );

DROP POLICY IF EXISTS "Staff manage school materials" ON public.materials;
CREATE POLICY "Staff manage school materials" ON public.materials
    FOR ALL USING (
        auth_helpers.get_my_role() IN ('admin', 'principal', 'teacher', 'moderator') AND
        (auth_helpers.get_my_role() = 'admin' OR school_id = auth_helpers.get_my_school_id())
    );

DROP POLICY IF EXISTS "Student wellbeing viewable by student or staff" ON public.student_wellbeing;
CREATE POLICY "Student wellbeing viewable by student or staff" ON public.student_wellbeing
    FOR SELECT USING (
        student_id = auth.uid() OR
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = public.student_wellbeing.student_id
            AND p.school_id = auth_helpers.get_my_school_id()
            AND auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Staff manage student wellbeing" ON public.student_wellbeing;
CREATE POLICY "Staff manage student wellbeing" ON public.student_wellbeing
    FOR ALL USING (
        auth_helpers.get_my_role() IN ('admin', 'principal', 'teacher', 'moderator') AND
        (recorded_by = auth.uid() OR auth_helpers.get_my_role() = 'admin')
    );

DROP POLICY IF EXISTS "Behavioral logs viewable by student or staff" ON public.behavioral_logs;
CREATE POLICY "Behavioral logs viewable by student or staff" ON public.behavioral_logs
    FOR SELECT USING (
        student_id = auth.uid() OR
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        (
            tenant_id = auth_helpers.get_my_school_id() AND
            auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Staff manage behavioral logs" ON public.behavioral_logs;
CREATE POLICY "Staff manage behavioral logs" ON public.behavioral_logs
    FOR ALL USING (
        auth_helpers.get_my_role() IN ('admin', 'principal', 'teacher', 'moderator') AND
        (auth_helpers.get_my_role() = 'admin' OR tenant_id = auth_helpers.get_my_school_id())
    );

DROP POLICY IF EXISTS "Admins manage fleet releases" ON public.fleet_releases;
CREATE POLICY "Admins manage fleet releases" ON public.fleet_releases
    FOR ALL USING (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins manage fleet deployments" ON public.fleet_deployments;
CREATE POLICY "Admins manage fleet deployments" ON public.fleet_deployments
    FOR ALL USING (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "HPC competencies viewable by student or staff" ON public.hpc_competencies;
CREATE POLICY "HPC competencies viewable by student or staff" ON public.hpc_competencies
    FOR SELECT USING (
        student_id = auth.uid() OR
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        (
            tenant_id = auth_helpers.get_my_school_id() AND
            auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator')
        )
    );

DROP POLICY IF EXISTS "Staff manage HPC competencies" ON public.hpc_competencies;
CREATE POLICY "Staff manage HPC competencies" ON public.hpc_competencies
    FOR ALL USING (
        auth_helpers.get_my_role() IN ('admin', 'principal', 'teacher') AND
        (auth_helpers.get_my_role() = 'admin' OR tenant_id = auth_helpers.get_my_school_id())
    );

DROP POLICY IF EXISTS "Platform config viewable by authenticated users" ON public.platform_config;
CREATE POLICY "Platform config viewable by authenticated users" ON public.platform_config
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage platform config" ON public.platform_config;
CREATE POLICY "Admins manage platform config" ON public.platform_config
    FOR ALL USING (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Promotion history viewable by owner or admin" ON public.promotion_history;
CREATE POLICY "Promotion history viewable by owner or admin" ON public.promotion_history
    FOR SELECT USING (principal_id = auth.uid() OR auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Principals create promotion history" ON public.promotion_history;
CREATE POLICY "Principals create promotion history" ON public.promotion_history
    FOR INSERT WITH CHECK (
        principal_id = auth.uid() AND
        auth_helpers.get_my_role() IN ('principal', 'admin')
    );

DROP POLICY IF EXISTS "Anyone can submit registration requests" ON public.registration_requests;
CREATE POLICY "Anyone can submit registration requests" ON public.registration_requests
    FOR INSERT WITH CHECK (
        length(trim(school_name)) >= 2 AND
        contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' AND
        status = 'pending'
    );

DROP POLICY IF EXISTS "Admins manage registration requests" ON public.registration_requests;
CREATE POLICY "Admins manage registration requests" ON public.registration_requests
    FOR ALL USING (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "School profiles viewable by owner or admin" ON public.school_profiles;
CREATE POLICY "School profiles viewable by owner or admin" ON public.school_profiles
    FOR SELECT USING (id = auth.uid() OR auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Admins manage school profiles" ON public.school_profiles;
CREATE POLICY "Admins manage school profiles" ON public.school_profiles
    FOR ALL USING (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "School rooms viewable by school members" ON public.school_rooms;
CREATE POLICY "School rooms viewable by school members" ON public.school_rooms
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        school_id = auth_helpers.get_my_school_id()
    );

DROP POLICY IF EXISTS "Staff manage school rooms" ON public.school_rooms;
CREATE POLICY "Staff manage school rooms" ON public.school_rooms
    FOR ALL USING (
        auth_helpers.get_my_role() IN ('admin', 'principal', 'moderator') AND
        (auth_helpers.get_my_role() = 'admin' OR school_id = auth_helpers.get_my_school_id())
    );

ALTER TABLE IF EXISTS archive.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS archive.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS archive.hardware_heartbeats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view archived messages" ON archive.messages;
CREATE POLICY "Admins view archived messages" ON archive.messages
    FOR SELECT USING (auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Admins view archived attendance" ON archive.attendance;
CREATE POLICY "Admins view archived attendance" ON archive.attendance
    FOR SELECT USING (auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Admins view archived hardware heartbeats" ON archive.hardware_heartbeats;
CREATE POLICY "Admins view archived hardware heartbeats" ON archive.hardware_heartbeats
    FOR SELECT USING (auth_helpers.get_my_role() IN ('admin', 'auditor'));

-- ============================================================
-- Hybrid principal academic access
-- ============================================================

-- SQL Migration: Add is_teaching_staff to profiles and ensure academic tables exist

-- 1. Update Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_teaching_staff BOOLEAN DEFAULT FALSE;

-- 2. Ensure Academic Tables Exist (from the master system schema)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS public.hpc_grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    assessment_type TEXT NOT NULL,
    marks_obtained NUMERIC NOT NULL,
    max_marks NUMERIC NOT NULL,
    cbse_grade TEXT,
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.exam_papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    current_activity TEXT,
    status TEXT DEFAULT 'active',
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id)
);

-- 3. Update RLS policies to allow Principals with teaching flag to access teacher data

-- Attendance access
DROP POLICY IF EXISTS "Principals manage school attendance" ON public.attendance;
CREATE POLICY "Principals manage school attendance" ON public.attendance 
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND school_id = public.attendance.school_id 
        AND (role = 'teacher' OR (role = 'principal' AND is_teaching_staff = true))
      )
    );

-- Grades access
DROP POLICY IF EXISTS "Principals manage school grades" ON public.hpc_grades;
CREATE POLICY "Principals manage school grades" ON public.hpc_grades 
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'teacher' OR (role = 'principal' AND is_teaching_staff = true))
      )
    );

-- Exam Papers access
DROP POLICY IF EXISTS "Principals manage exam papers" ON public.exam_papers;
CREATE POLICY "Principals manage exam papers" ON public.exam_papers 
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'teacher' OR (role = 'principal' AND is_teaching_staff = true))
      )
    );

-- Real-time Monitoring access
DROP POLICY IF EXISTS "Principals monitor school sessions" ON public.student_sessions;
CREATE POLICY "Principals monitor school sessions" ON public.student_sessions 
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (role = 'teacher' OR (role = 'principal' AND is_teaching_staff = true) OR role = 'moderator')
      )
    );

-- ============================================================
-- Security hardening compatibility
-- ============================================================

-- SUPABASE SECURITY HARDENING SCRIPT
-- Removes SECURITY DEFINER functions from the exposed public RPC surface.

-- 1. Remove legacy public helper functions.
-- RLS policies use auth_helpers.get_my_school_id() and auth_helpers.get_my_role().
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'get_my_school_id' AND p.pronargs = 0) THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_my_school_id() FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_my_school_id() FROM anon';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_my_school_id() FROM authenticated';
        BEGIN
            EXECUTE 'DROP FUNCTION public.get_my_school_id()';
        EXCEPTION
            WHEN dependent_objects_still_exist THEN NULL;
        END;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'get_my_role' AND p.pronargs = 0) THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM anon';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM authenticated';
        BEGIN
            EXECUTE 'DROP FUNCTION public.get_my_role()';
        EXCEPTION
            WHEN dependent_objects_still_exist THEN NULL;
        END;
    END IF;
END $$;

-- 2. Restrict rls_auto_enable() if it exists.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable') THEN
        EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated';
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;


-- 3. Fix archive.perform_annual_rollover(uuid)
-- Added explicit signature (uuid) to match the definition in the archival schema.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'archive' AND p.proname = 'perform_annual_rollover') THEN
        -- We specify the argument type (uuid) to correctly identify the function
        EXECUTE 'ALTER FUNCTION archive.perform_annual_rollover(uuid) SET search_path = public, archive';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION archive.perform_annual_rollover(uuid) FROM PUBLIC';
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

SELECT 'Security hardening complete. Public SECURITY DEFINER RPC helpers are removed/restricted.' as status;

-- ============================================================
-- Demo seed users and school data
-- ============================================================

-- SEED DATA FOR EDUPORTAL (v1.1)
-- Fixed email mapping to match APP_CONFIG.AUTH_DOMAIN

DO $$
DECLARE
    v_school_id UUID;
    v_i INTEGER;
    v_user_id UUID;
    v_email TEXT;
    v_domain TEXT := '@auth.ssph01.eduportal.internal';
    v_pass TEXT := '$2a$10$7Z2tYh.XpC.NfI2uQo3X.eLhK8mB0O.G7.L7.I.P.O.G7.L7.I.P.O.'; -- Placeholder
BEGIN
    -- 1. Ensure the school exists
    INSERT INTO public.schools (school_code, school_name, plan_type)
    VALUES ('SCH7878', 'St. Mary''s High', 'premium')
    ON CONFLICT (school_code) DO UPDATE SET school_name = EXCLUDED.school_name
    RETURNING id INTO v_school_id;

    -- 2. Super Admin (Global)
    v_email := 'ad00001' || v_domain;
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
        VALUES (v_user_id, v_email, v_pass, NOW(), 'authenticated', 'authenticated');
    END IF;
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'AD00001', 'Super Admin', 'admin', NULL)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, school_id = EXCLUDED.school_id;

    -- 3. Auditor
    v_email := 'au00001' || v_domain;
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
        VALUES (v_user_id, v_email, v_pass, NOW(), 'authenticated', 'authenticated');
    END IF;
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'AU00001', 'Compliance Auditor', 'auditor', NULL)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, school_id = EXCLUDED.school_id;

    -- 4. Principal
    v_email := 'pr00001' || v_domain;
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
        VALUES (v_user_id, v_email, v_pass, NOW(), 'authenticated', 'authenticated');
    END IF;
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'PR00001', 'Dr. Anita Sharma', 'principal', v_school_id)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, school_id = EXCLUDED.school_id;

    -- 5. Moderator
    v_email := 'md00001' || v_domain;
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
        VALUES (v_user_id, v_email, v_pass, NOW(), 'authenticated', 'authenticated');
    END IF;
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'MD00001', 'David Costa', 'moderator', v_school_id)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, school_id = EXCLUDED.school_id;

    -- 6. Teachers
    FOR v_i IN 1..3 LOOP
        v_email := 't00000' || v_i || v_domain;
        SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
        IF v_user_id IS NULL THEN
            v_user_id := gen_random_uuid();
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
            VALUES (v_user_id, v_email, v_pass, NOW(), 'authenticated', 'authenticated');
        END IF;
        INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
        VALUES (v_user_id, 'T00000' || v_i, 'Teacher ' || v_i, 'teacher', v_school_id)
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, school_id = EXCLUDED.school_id;
    END LOOP;

    -- 7. Students
    FOR v_i IN 1..15 LOOP
        v_email := '787826090' || LPAD(v_i::text, 2, '0') || v_domain;
        SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
        IF v_user_id IS NULL THEN
            v_user_id := gen_random_uuid();
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
            VALUES (v_user_id, v_email, v_pass, NOW(), 'authenticated', 'authenticated');
        END IF;
        INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
        VALUES (v_user_id, '787826090' || LPAD(v_i::text, 2, '0'), 'Student ' || v_i, 'student', v_school_id)
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, school_id = EXCLUDED.school_id;
    END LOOP;
END $$;


