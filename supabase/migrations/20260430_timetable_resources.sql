-- Institutional Resource & Timetable Management
CREATE TABLE public.school_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 40,
    room_type TEXT DEFAULT 'classroom', -- e.g., 'lab', 'library', 'sports'
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.timetables (
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
CREATE INDEX idx_timetable_conflict ON public.timetables(teacher_id, day_of_week, start_time);
CREATE INDEX idx_timetable_room ON public.timetables(room_id, day_of_week, start_time);
