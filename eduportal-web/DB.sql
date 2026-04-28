-- SUPABASE DATABASE SCHEMA FOR EDUPORTAL

-- 1. CLEANUP (Optional: Only use if you want to reset everything)
-- DROP TABLE IF EXISTS public.chat_participants;
-- DROP TABLE IF EXISTS public.chat_messages;
-- DROP TABLE IF EXISTS public.chat_rooms;
-- DROP TABLE IF EXISTS public.profiles;
-- DROP TABLE IF EXISTS public.schools;
-- DROP TYPE IF EXISTS user_role;

-- 2. CREATE CUSTOM ROLES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'auditor', 'principal', 'teacher', 'moderator', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
        role = 'admin' OR role = 'auditor' OR school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
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
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students view own grades" ON public.hpc_grades FOR SELECT USING (student_id = auth.uid());

-- Teachers can view/insert for their school
CREATE POLICY "Teachers manage school attendance" ON public.attendance 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND school_id = public.attendance.school_id AND role = 'teacher'));

CREATE POLICY "Teachers manage school grades" ON public.hpc_grades 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Auditors have read-only access to everything
CREATE POLICY "Auditors read-only attendance" ON public.attendance FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'auditor'));
CREATE POLICY "Auditors read-only grades" ON public.hpc_grades FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'auditor'));

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
CREATE POLICY "Student/Parent view own feedback" ON public.parent_feedback FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Student view own vocational" ON public.vocational_skills FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Student view own FLN" ON public.fln_milestones FOR SELECT USING (student_id = auth.uid());

-- HOD/Principals manage SMC
CREATE POLICY "Principals manage SMC" ON public.smc_minutes FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'principal'));

-- Auditors see all for compliance auditing
CREATE POLICY "Auditors see all advanced" ON public.smc_minutes FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'auditor'));
CREATE POLICY "Auditors see vocational" ON public.vocational_skills FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'auditor'));


