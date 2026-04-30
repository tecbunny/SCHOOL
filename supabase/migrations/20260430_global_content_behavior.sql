-- Global Institutional Content Repository
CREATE TABLE public.global_materials (
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
CREATE TABLE public.behavioral_logs (
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
CREATE INDEX idx_behavioral_student ON public.behavioral_logs(student_id);
