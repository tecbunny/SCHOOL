-- SQL Migration: Add is_teaching_staff to profiles and ensure academic tables exist

-- 1. Update Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_teaching_staff BOOLEAN DEFAULT FALSE;

-- 2. Ensure Academic Tables Exist (from DB.sql master schema)
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
