-- EDUPORTAL SYSTEM DATABASE SETUP
-- Single setup script for Supabase SQL Editor.
-- Run this once for schema, policies, realtime setup, hardening, and demo seed data.
-- Use supabase/clear_all_data.sql separately when you only need to clear data.

-- ============================================================
-- Base schema, RLS, realtime, and core seed
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

-- 11. SEED INITIAL DATA
INSERT INTO public.schools (school_code, school_name)
VALUES ('SCH7878', 'St. Mary''s Convent')
ON CONFLICT (school_code) DO NOTHING;

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

CREATE POLICY "Viewable by all authenticated" ON public.platform_config FOR SELECT USING (true);
CREATE POLICY "Viewable by same school" ON public.student_sessions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = student_id AND p.school_id = auth_helpers.get_my_school_id()));
CREATE POLICY "Manage own school sessions" ON public.student_sessions FOR ALL USING (auth_helpers.get_my_role() IN ('teacher', 'principal', 'admin'));
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
CREATE POLICY "Viewable by school staff" ON public.support_tickets FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.school_id = school_id));
CREATE POLICY "Create by staff" ON public.support_tickets FOR INSERT WITH CHECK (auth_helpers.get_my_role() IN ('teacher', 'principal', 'admin'));

-- 20. SEED DATA (v1.4)
INSERT INTO public.platform_config (global_features) VALUES ('{"is_promotion_open": true}'::jsonb) ON CONFLICT DO NOTHING;

DO $$
DECLARE
    v_school_id UUID;
    v_user_id UUID;
    v_i INTEGER;
    v_domain TEXT := '@auth.ssph01.eduportal.internal';
    v_pass TEXT := '$2a$10$7Z2tYh.XpC.NfI2uQo3X.eLhK8mB0O.G7.L7.I.P.O.G7.L7.I.P.O.';
BEGIN
    INSERT INTO public.schools (school_code, school_name)
    VALUES ('SCH7878', 'St. Mary''s High')
    ON CONFLICT (school_code) DO UPDATE SET school_name = EXCLUDED.school_name
    RETURNING id INTO v_school_id;

    -- Super Admin
    v_user_id := '00000000-0000-0000-0000-000000000001';
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'AD00001', 'Super Admin', 'admin', NULL)
    ON CONFLICT (id) DO NOTHING;

    -- Principal
    v_user_id := '00000000-0000-0000-0000-000000000002';
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id, is_teaching_staff)
    VALUES (v_user_id, 'PR00001', 'Dr. Anita Sharma', 'principal', v_school_id, true)
    ON CONFLICT (id) DO NOTHING;

    -- Teacher
    v_user_id := '00000000-0000-0000-0000-000000000003';
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'T000001', 'John Doe', 'teacher', v_school_id)
    ON CONFLICT (id) DO NOTHING;

    -- Student
    v_user_id := '00000000-0000-0000-0000-000000000004';
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, '78782609001', 'Arjun Sharma', 'student', v_school_id)
    ON CONFLICT (id) DO NOTHING;
END $$;
