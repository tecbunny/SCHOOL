-- ADMIN-GENERATED TEMPORARY AUTHORIZATION CODES (2026-05-02)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_hash TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('principal_password_reset', 'staff_password_reset')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS admin_authorization_codes_lookup_idx
    ON public.admin_authorization_codes (admin_id, purpose, code_hash, expires_at)
    WHERE consumed_at IS NULL;

ALTER TABLE public.admin_authorization_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view own authorization codes" ON public.admin_authorization_codes;
CREATE POLICY "Admins view own authorization codes" ON public.admin_authorization_codes
    FOR SELECT USING (
        admin_id = (select auth.uid())
        AND auth_helpers.get_my_role() = 'admin'
    );
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
-- Hardware fleet readiness: enrollable nodes, release manifests, and OTA deployments.

CREATE TABLE IF NOT EXISTS public.hardware_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    node_name TEXT NOT NULL,
    node_type TEXT NOT NULL DEFAULT 'student-hub' CHECK (node_type IN ('student-hub', 'class-station', 'admin-kiosk')),
    mac_address TEXT UNIQUE,
    station_code TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'online', 'warning', 'offline')),
    temp NUMERIC,
    disk_usage NUMERIC,
    memory_usage NUMERIC,
    uptime NUMERIC,
    version TEXT NOT NULL DEFAULT '1.0.0',
    last_heartbeat TIMESTAMPTZ,
    public_key_pem TEXT,
    key_algorithm TEXT NOT NULL DEFAULT 'ed25519',
    key_registered_at TIMESTAMPTZ,
    node_secret_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.hardware_nodes
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS node_name TEXT,
    ADD COLUMN IF NOT EXISTS node_type TEXT NOT NULL DEFAULT 'student-hub',
    ADD COLUMN IF NOT EXISTS mac_address TEXT,
    ADD COLUMN IF NOT EXISTS station_code TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS temp NUMERIC,
    ADD COLUMN IF NOT EXISTS disk_usage NUMERIC,
    ADD COLUMN IF NOT EXISTS memory_usage NUMERIC,
    ADD COLUMN IF NOT EXISTS uptime NUMERIC,
    ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT '1.0.0',
    ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS public_key_pem TEXT,
    ADD COLUMN IF NOT EXISTS key_algorithm TEXT NOT NULL DEFAULT 'ed25519',
    ADD COLUMN IF NOT EXISTS key_registered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS node_secret_hash TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS hardware_nodes_mac_unique_idx
    ON public.hardware_nodes (mac_address)
    WHERE mac_address IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS hardware_nodes_station_unique_idx
    ON public.hardware_nodes (station_code)
    WHERE station_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.fleet_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_type TEXT NOT NULL CHECK (release_type IN ('os', 'pwa')),
    version_code TEXT NOT NULL,
    download_url TEXT NOT NULL,
    checksum TEXT NOT NULL,
    signature TEXT,
    changelog TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(release_type, version_code)
);

CREATE TABLE IF NOT EXISTS public.fleet_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE CASCADE NOT NULL,
    release_id UUID REFERENCES public.fleet_releases(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'installed', 'failed', 'deferred')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(node_id, release_id)
);

ALTER TABLE public.hardware_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_deployments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and auditors view hardware nodes" ON public.hardware_nodes;
CREATE POLICY "Admins and auditors view hardware nodes" ON public.hardware_nodes
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        school_id = auth_helpers.get_my_school_id()
    );

DROP POLICY IF EXISTS "Admins manage hardware nodes" ON public.hardware_nodes;
CREATE POLICY "Admins manage hardware nodes" ON public.hardware_nodes
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins view fleet releases" ON public.fleet_releases;
CREATE POLICY "Admins view fleet releases" ON public.fleet_releases
    FOR SELECT USING (auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Admins manage fleet releases" ON public.fleet_releases;
CREATE POLICY "Admins manage fleet releases" ON public.fleet_releases
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins view fleet deployments" ON public.fleet_deployments;
CREATE POLICY "Admins view fleet deployments" ON public.fleet_deployments
    FOR SELECT USING (auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Admins manage fleet deployments" ON public.fleet_deployments;
CREATE POLICY "Admins manage fleet deployments" ON public.fleet_deployments
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');
-- Studio generation queue and edge cache manifest for EduPortal/EduOS.
-- The Student Hub can request learning assets while offline; the Class Station
-- claims pending jobs, calls configured AI providers, caches outputs, and marks
-- rows completed for realtime delivery back to the student.

CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    class_station_id UUID REFERENCES public.hardware_nodes(id) ON DELETE SET NULL,
    source_material_id UUID,
    generation_type TEXT NOT NULL CHECK (generation_type IN (
        'audio_overview',
        'flashcards',
        'quiz',
        'slide_deck',
        'worksheet',
        'exam_paper',
        'grading_report'
    )),
    prompt TEXT NOT NULL,
    input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'claimed',
        'processing',
        'completed',
        'failed',
        'cancelled'
    )),
    provider TEXT NOT NULL DEFAULT 'gemini',
    provider_model TEXT,
    idempotency_key TEXT,
    priority SMALLINT NOT NULL DEFAULT 5 CHECK (priority BETWEEN 0 AND 10),
    attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    max_attempts INTEGER NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
    error_code TEXT,
    error_message TEXT,
    claimed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT generations_idempotency_per_school UNIQUE (school_id, idempotency_key),
    CONSTRAINT generations_attempt_limit CHECK (attempt_count <= max_attempts)
);

CREATE TABLE IF NOT EXISTS public.generation_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    class_station_id UUID REFERENCES public.hardware_nodes(id) ON DELETE SET NULL,
    asset_kind TEXT NOT NULL CHECK (asset_kind IN (
        'json',
        'audio',
        'image',
        'pdf',
        'slides',
        'worksheet',
        'answer_key',
        'report'
    )),
    storage_scope TEXT NOT NULL DEFAULT 'edge-cache' CHECK (storage_scope IN ('edge-cache', 'supabase-storage', 'external')),
    local_path TEXT,
    storage_bucket TEXT,
    storage_object_path TEXT,
    content_type TEXT,
    byte_size BIGINT CHECK (byte_size IS NULL OR byte_size >= 0),
    checksum_sha256 TEXT,
    manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
    cached_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.edge_storage_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    total_bytes BIGINT NOT NULL CHECK (total_bytes >= 0),
    used_bytes BIGINT NOT NULL CHECK (used_bytes >= 0),
    free_bytes BIGINT NOT NULL CHECK (free_bytes >= 0),
    oldest_cached_day DATE,
    newest_cached_day DATE,
    fifo_cleanup_required BOOLEAN NOT NULL DEFAULT FALSE,
    cleanup_started_at TIMESTAMPTZ,
    cleanup_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generations_pending_queue_idx
    ON public.generations (school_id, status, priority, created_at)
    WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS generations_requester_status_idx
    ON public.generations (requester_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS generations_station_status_idx
    ON public.generations (class_station_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS generation_assets_generation_idx
    ON public.generation_assets (generation_id, created_at);

CREATE INDEX IF NOT EXISTS edge_storage_snapshots_node_created_idx
    ON public.edge_storage_snapshots (node_id, created_at DESC);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_storage_snapshots ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_generations_updated_at ON public.generations;
CREATE TRIGGER set_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Students create own generation requests" ON public.generations;
CREATE POLICY "Students create own generation requests" ON public.generations
    FOR INSERT WITH CHECK (
        requester_id = (select auth.uid())
        AND school_id = auth_helpers.get_my_school_id()
        AND auth_helpers.get_my_role() IN ('student', 'teacher', 'principal')
    );

DROP POLICY IF EXISTS "School members view generation requests" ON public.generations;
CREATE POLICY "School members view generation requests" ON public.generations
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR requester_id = (select auth.uid())
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator', 'auditor')
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Students cancel own pending generations" ON public.generations;
CREATE POLICY "Students cancel own pending generations" ON public.generations
    FOR UPDATE USING (
        requester_id = (select auth.uid())
        AND status = 'pending'
    )
    WITH CHECK (
        requester_id = (select auth.uid())
        AND status = 'cancelled'
    );

DROP POLICY IF EXISTS "Staff manage school generations" ON public.generations;
CREATE POLICY "Staff manage school generations" ON public.generations
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal')
            AND school_id = auth_helpers.get_my_school_id()
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal')
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "School members view generation assets" ON public.generation_assets;
CREATE POLICY "School members view generation assets" ON public.generation_assets
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
        OR EXISTS (
            SELECT 1
            FROM public.generations g
            WHERE g.id = public.generation_assets.generation_id
              AND g.requester_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Staff manage generation assets" ON public.generation_assets;
CREATE POLICY "Staff manage generation assets" ON public.generation_assets
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal')
            AND school_id = auth_helpers.get_my_school_id()
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal')
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admins and school leaders view edge storage snapshots" ON public.edge_storage_snapshots;
CREATE POLICY "Admins and school leaders view edge storage snapshots" ON public.edge_storage_snapshots
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('principal', 'auditor')
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admins manage edge storage snapshots" ON public.edge_storage_snapshots;
CREATE POLICY "Admins manage edge storage snapshots" ON public.edge_storage_snapshots
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.generations;
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_assets;
EXCEPTION
    WHEN others THEN null;
END $$;
-- EDUPORTAL CONSOLIDATED SUPABASE SETUP
-- Run this from the Supabase SQL editor or psql for a fresh or already-partially-applied database.
-- This file intentionally uses CREATE IF NOT EXISTS, ALTER ... ADD COLUMN IF NOT EXISTS,
-- CREATE OR REPLACE, and DROP POLICY/TRIGGER IF EXISTS patterns so it can be rerun safely.
-- Consolidated on 2026-05-02.


-- ============================================================
-- Consolidated EduPortal setup script
-- Source: supabase\system.sql
-- ============================================================

-- EDUPORTAL SYSTEM DATABASE SETUP
-- Single setup script for Supabase SQL Editor.
-- Run this once for schema, policies, realtime setup, and hardening.
-- Use supabase/maintenance_reset.sql separately when you intentionally need to clear data.

-- ============================================================
-- Base schema, RLS, and realtime
-- ============================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'auditor', 'principal', 'teacher', 'moderator', 'student', 'alumni');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. CREATE SECURITY SCHEMAS
CREATE SCHEMA IF NOT EXISTS auth_helpers;
REVOKE ALL ON SCHEMA auth_helpers FROM PUBLIC;
GRANT USAGE ON SCHEMA auth_helpers TO authenticated;
GRANT USAGE ON SCHEMA auth_helpers TO service_role;

-- 2.1 Helper functions for RLS
CREATE OR REPLACE FUNCTION auth_helpers.get_my_school_id()
RETURNS UUID 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = (select auth.uid());
$$;

CREATE OR REPLACE FUNCTION auth_helpers.get_my_role()
RETURNS user_role 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = (select auth.uid());
$$;

GRANT EXECUTE ON FUNCTION auth_helpers.get_my_school_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_helpers.get_my_school_id() TO service_role;
GRANT EXECUTE ON FUNCTION auth_helpers.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_helpers.get_my_role() TO service_role;

-- 3. CREATE SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_code TEXT UNIQUE NOT NULL,
    school_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    plan_type TEXT DEFAULT 'standard',
    attendance_mode TEXT DEFAULT 'morning' CHECK (attendance_mode IN ('morning', 'subject')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CREATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    user_code TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    class_id TEXT, -- e.g., '10-A'
    mac_address TEXT UNIQUE,
    is_hardware_bound BOOLEAN DEFAULT FALSE,
    is_teaching_staff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS class_id TEXT,
    ADD COLUMN IF NOT EXISTS mac_address TEXT,
    ADD COLUMN IF NOT EXISTS is_hardware_bound BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_teaching_staff BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_mac_address_unique_idx
    ON public.profiles (mac_address)
    WHERE mac_address IS NOT NULL;

-- 4.1 CREATE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4.2 CREATE TIMETABLE TABLE
CREATE TABLE IF NOT EXISTS public.timetable (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id TEXT NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    day_of_week TEXT NOT NULL, -- 'Monday', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT,
    teacher_id UUID REFERENCES public.profiles(id)
);

-- 5. CREATE CHAT ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_name TEXT NOT NULL,
    room_type TEXT NOT NULL,
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

-- 8. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES
DROP POLICY IF EXISTS "Viewable by same school or higher" ON public.profiles;
CREATE POLICY "Viewable by same school or higher" ON public.profiles
    FOR SELECT USING (
        id = (select auth.uid()) OR
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR 
        school_id = auth_helpers.get_my_school_id()
    );

DROP POLICY IF EXISTS "View messages if participant" ON public.chat_messages;
CREATE POLICY "View messages if participant" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.chat_participants WHERE room_id = public.chat_messages.room_id AND profile_id = (select auth.uid()))
    );

DROP POLICY IF EXISTS "Send messages if participant" ON public.chat_messages;
CREATE POLICY "Send messages if participant" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.chat_participants WHERE room_id = public.chat_messages.room_id AND profile_id = (select auth.uid()))
    );

DROP POLICY IF EXISTS "View participants in own rooms" ON public.chat_participants;
CREATE POLICY "View participants in own rooms" ON public.chat_participants
    FOR SELECT USING (
        profile_id = (select auth.uid()) OR
        EXISTS (SELECT 1 FROM public.chat_participants p2 WHERE p2.room_id = public.chat_participants.room_id AND p2.profile_id = (select auth.uid()))
    );

DROP POLICY IF EXISTS "Self-join rooms in same school" ON public.chat_participants;
CREATE POLICY "Self-join rooms in same school" ON public.chat_participants
    FOR INSERT WITH CHECK (
        profile_id = (select auth.uid()) AND
        EXISTS (SELECT 1 FROM public.chat_rooms r WHERE r.id = room_id AND r.school_id = auth_helpers.get_my_school_id())
    );

-- 10. ENABLE REALTIME
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
    WHEN others THEN null;
END $$;

-- 12. ACADEMIC ENGINE TABLES
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

CREATE TABLE IF NOT EXISTS public.cpd_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_name TEXT NOT NULL,
    hours_logged NUMERIC NOT NULL,
    date_completed DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    subject TEXT NOT NULL,
    material_type TEXT NOT NULL,
    is_ai_indexed BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES public.profiles(id),
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

-- 13. RLS FOR ACADEMICS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hpc_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own attendance" ON public.attendance;
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (student_id = (select auth.uid()));

DROP POLICY IF EXISTS "Students view own grades" ON public.hpc_grades;
CREATE POLICY "Students view own grades" ON public.hpc_grades FOR SELECT USING (student_id = (select auth.uid()));

DROP POLICY IF EXISTS "Teachers manage school attendance" ON public.attendance;
CREATE POLICY "Teachers manage school attendance" ON public.attendance 
    FOR ALL USING (auth_helpers.get_my_role() IN ('teacher', 'principal') AND school_id = auth_helpers.get_my_school_id());

DROP POLICY IF EXISTS "Teachers manage school grades" ON public.hpc_grades;
CREATE POLICY "Teachers manage school grades" ON public.hpc_grades 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles staff
            JOIN public.profiles student ON student.id = public.hpc_grades.student_id
            WHERE staff.id = (select auth.uid())
              AND staff.role IN ('teacher', 'principal')
              AND staff.school_id = student.school_id
        )
    );

-- 14. ADVANCED NEP 2020 MODULES
CREATE TABLE IF NOT EXISTS public.hpc_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    competency_name TEXT NOT NULL,
    score NUMERIC DEFAULT 0,
    teacher_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID REFERENCES public.schools(id)
);

-- 15. PLATFORM & INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.platform_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_features JSONB DEFAULT '{"is_promotion_open": false}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_sessions (
    student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_activity TEXT,
    status TEXT DEFAULT 'online',
    last_ping TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.device_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    issuer_id UUID REFERENCES public.profiles(id),
    command_type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. ACADEMIC OPERATIONS
CREATE TABLE IF NOT EXISTS public.promotion_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id TEXT NOT NULL,
    principal_id UUID REFERENCES public.profiles(id),
    student_count INTEGER,
    from_grade TEXT,
    to_grade TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.syllabus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    completed_at DATE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE
);

-- 17. RLS POLICIES (CONTINUED)
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Viewable by all authenticated" ON public.platform_config;
CREATE POLICY "Viewable by all authenticated" ON public.platform_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Viewable by same school" ON public.student_sessions;
CREATE POLICY "Viewable by same school" ON public.student_sessions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = student_id AND p.school_id = auth_helpers.get_my_school_id()));
DROP POLICY IF EXISTS "Manage own school sessions" ON public.student_sessions;
CREATE POLICY "Manage own school sessions" ON public.student_sessions FOR ALL USING (auth_helpers.get_my_role() IN ('teacher', 'principal', 'admin'));
DROP POLICY IF EXISTS "Manage commands" ON public.device_commands;
CREATE POLICY "Manage commands" ON public.device_commands FOR ALL USING (auth_helpers.get_my_role() IN ('teacher', 'principal', 'admin'));

-- 19. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    creator_id UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Viewable by school staff" ON public.support_tickets;
CREATE POLICY "Viewable by school staff" ON public.support_tickets FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.school_id = school_id));
DROP POLICY IF EXISTS "Create by staff" ON public.support_tickets;
CREATE POLICY "Create by staff" ON public.support_tickets FOR INSERT WITH CHECK (auth_helpers.get_my_role() IN ('teacher', 'principal', 'admin'));

-- ============================================================
-- Report fixes
-- Source: supabase\migrations\20260501_report_fixes.sql
-- ============================================================

-- REPORT FIXES (2026-05-01)
-- Aligns schema with the current application code paths reviewed in WEB_APP_REPORT.md.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'alumni';

ALTER TABLE IF EXISTS public.schools
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS attendance_mode TEXT DEFAULT 'morning' CHECK (attendance_mode IN ('morning', 'subject'));


-- ============================================================
-- Security loophole fixes
-- Source: supabase\migrations\20260501_security_loophole_fixes.sql
-- ============================================================

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
  SELECT school_id FROM public.profiles WHERE id = (select auth.uid());
$$;

CREATE OR REPLACE FUNCTION auth_helpers.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = (select auth.uid());
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
            WHERE staff.id = (select auth.uid())
              AND staff.role IN ('teacher', 'principal')
              AND staff.school_id = student.school_id
        )
    )
    WITH CHECK (
        teacher_id = (select auth.uid())
        AND EXISTS (
            SELECT 1
            FROM public.profiles staff
            JOIN public.profiles student ON student.id = public.hpc_grades.student_id
            WHERE staff.id = (select auth.uid())
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
        WHERE staff.id = (select auth.uid())
        AND staff.school_id = student.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
      )
    )
    WITH CHECK (
      teacher_id = (select auth.uid()) AND
      EXISTS (
        SELECT 1
        FROM public.profiles staff
        JOIN public.profiles student ON student.id = public.hpc_grades.student_id
        WHERE staff.id = (select auth.uid())
        AND staff.school_id = student.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
      )
    );

DROP POLICY IF EXISTS "Principals manage exam papers" ON public.exam_papers;
CREATE POLICY "Principals manage exam papers" ON public.exam_papers
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles staff
        WHERE staff.id = (select auth.uid())
        AND staff.school_id = public.exam_papers.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
      )
    )
    WITH CHECK (
      teacher_id = (select auth.uid()) AND
      EXISTS (
        SELECT 1 FROM public.profiles staff
        WHERE staff.id = (select auth.uid())
        AND staff.school_id = public.exam_papers.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true))
      )
    );

DROP POLICY IF EXISTS "Staff manage student wellbeing" ON public.student_wellbeing;
CREATE POLICY "Staff manage student wellbeing" ON public.student_wellbeing
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin' OR (
            auth_helpers.get_my_role() IN ('principal', 'teacher', 'moderator') AND
            recorded_by = (select auth.uid()) AND
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
            recorded_by = (select auth.uid()) AND
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
            teacher_id = (select auth.uid()) AND
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
    FOR SELECT USING (authenticated_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Teachers verify QR sessions" ON public.qr_sessions;
CREATE POLICY "Teachers verify QR sessions" ON public.qr_sessions
    FOR UPDATE USING (false);

-- Tenant-scoped live monitoring
DROP POLICY IF EXISTS "Students manage own session" ON public.student_sessions;
CREATE POLICY "Students manage own session" ON public.student_sessions
    FOR ALL USING (student_id = (select auth.uid()))
    WITH CHECK (student_id = (select auth.uid()));

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
        WHERE staff.id = (select auth.uid())
        AND staff.school_id = student.school_id
        AND (staff.role = 'teacher' OR (staff.role = 'principal' AND staff.is_teaching_staff = true) OR staff.role = 'moderator')
      )
    );

-- Tenant-scoped remote commands
DROP POLICY IF EXISTS "Students listen for commands" ON public.device_commands;
CREATE POLICY "Students listen for commands" ON public.device_commands
    FOR SELECT USING (target_student_id = (select auth.uid()));

DROP POLICY IF EXISTS "Students acknowledge own commands" ON public.device_commands;
CREATE POLICY "Students acknowledge own commands" ON public.device_commands
    FOR UPDATE USING (target_student_id = (select auth.uid()))
    WITH CHECK (target_student_id = (select auth.uid()));

DROP POLICY IF EXISTS "Teachers issue commands" ON public.device_commands;
CREATE POLICY "Teachers issue commands" ON public.device_commands
    FOR INSERT WITH CHECK (
        issuer_id = (select auth.uid())
        AND auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator')
        AND EXISTS (
            SELECT 1 FROM public.profiles target
            WHERE target.id = public.device_commands.target_student_id
              AND target.role = 'student'
              AND target.school_id = auth_helpers.get_my_school_id()
        )
    );

-- ============================================================
-- ABC APAAR enrollments
-- Source: supabase\migrations\20260502_abc_apaar_enrollments.sql
-- ============================================================

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

-- ============================================================
-- Append-only events
-- Source: supabase\migrations\20260502_append_only_events.sql
-- ============================================================

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

-- ============================================================
-- Credential delivery and realtime RLS
-- Source: supabase\migrations\20260502_credential_delivery_and_realtime_rls.sql
-- ============================================================

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

CREATE TABLE IF NOT EXISTS public.admin_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_hash TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('principal_password_reset', 'staff_password_reset')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS admin_authorization_codes_lookup_idx
    ON public.admin_authorization_codes (admin_id, purpose, code_hash, expires_at)
    WHERE consumed_at IS NULL;

ALTER TABLE public.admin_authorization_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view own authorization codes" ON public.admin_authorization_codes;
CREATE POLICY "Admins view own authorization codes" ON public.admin_authorization_codes
    FOR SELECT USING (
        admin_id = (select auth.uid())
        AND auth_helpers.get_my_role() = 'admin'
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

-- ============================================================
-- Grade versioning
-- Source: supabase\migrations\20260502_grade_versioning.sql
-- ============================================================

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

-- ============================================================
-- Hardware signatures and face embeddings
-- Source: supabase\migrations\20260502_hardware_signatures_face_embeddings.sql
-- ============================================================

-- HARDWARE SIGNATURE TRUST + LOW-BANDWIDTH FACE EMBEDDINGS (2026-05-02)

ALTER TABLE IF EXISTS public.hardware_nodes
    ADD COLUMN IF NOT EXISTS public_key_pem TEXT,
    ADD COLUMN IF NOT EXISTS key_algorithm TEXT NOT NULL DEFAULT 'ed25519',
    ADD COLUMN IF NOT EXISTS key_registered_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.hardware_request_nonces (
    nonce TEXT PRIMARY KEY,
    node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE CASCADE NOT NULL,
    signed_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS hardware_request_nonces_node_received_idx
    ON public.hardware_request_nonces (node_id, received_at DESC);

CREATE TABLE IF NOT EXISTS public.student_face_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    embedding REAL[] NOT NULL,
    embedding_model TEXT NOT NULL,
    version_count INTEGER NOT NULL DEFAULT 1 CHECK (version_count > 0),
    captured_by_node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT student_face_templates_embedding_size CHECK (array_length(embedding, 1) BETWEEN 64 AND 1024)
);

CREATE UNIQUE INDEX IF NOT EXISTS student_face_templates_active_student_idx
    ON public.student_face_templates (student_id)
    WHERE active = TRUE;

CREATE TABLE IF NOT EXISTS public.face_verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE SET NULL,
    embedding_model TEXT NOT NULL,
    similarity NUMERIC,
    threshold NUMERIC NOT NULL DEFAULT 0.82,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS face_verification_attempts_student_created_idx
    ON public.face_verification_attempts (student_id, created_at DESC);

ALTER TABLE public.hardware_request_nonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_face_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_verification_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view hardware nonces" ON public.hardware_request_nonces;
CREATE POLICY "Admins view hardware nonces" ON public.hardware_request_nonces
    FOR SELECT USING (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Staff view school face templates" ON public.student_face_templates;
CREATE POLICY "Staff view school face templates" ON public.student_face_templates
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
        OR student_id = (select auth.uid())
    );

DROP POLICY IF EXISTS "Staff view school face attempts" ON public.face_verification_attempts;
CREATE POLICY "Staff view school face attempts" ON public.face_verification_attempts
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
        OR student_id = (select auth.uid())
    );

-- ============================================================
-- Hub distribution mode
-- Source: supabase\migrations\20260502_hub_distribution_mode.sql
-- ============================================================

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
-- Supabase Storage bucket setup
-- Bucket name: school-files
-- Set public to false if you want a private bucket.
insert into storage.buckets (id, name, public)
values ('school-files', 'school-files', true)
on conflict (id) do update
  set public = excluded.public;

drop policy if exists "Authenticated users can read school files" on storage.objects;
drop policy if exists "Authenticated users can upload school files" on storage.objects;
drop policy if exists "Authenticated users can update school files" on storage.objects;
drop policy if exists "Authenticated users can delete school files" on storage.objects;

-- Allow authenticated users to read files from this bucket.
create policy "Authenticated users can read school files"
on storage.objects
for select
to authenticated
using (bucket_id = 'school-files');

-- Allow authenticated users to upload files to this bucket.
create policy "Authenticated users can upload school files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'school-files');

-- Allow authenticated users to update files in this bucket.
create policy "Authenticated users can update school files"
on storage.objects
for update
to authenticated
using (bucket_id = 'school-files')
with check (bucket_id = 'school-files');

-- Allow authenticated users to delete files from this bucket.
create policy "Authenticated users can delete school files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'school-files');
