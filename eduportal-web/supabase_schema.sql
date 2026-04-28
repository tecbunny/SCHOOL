-- SUPABASE DATABASE SCHEMA FOR EDUPORTAL

-- 1. Create User Roles Type
CREATE TYPE user_role AS ENUM ('admin', 'auditor', 'principal', 'teacher', 'moderator', 'student');

-- 2. Profiles Table (Linked to Auth.Users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    user_code TEXT UNIQUE NOT NULL, -- e.g., AD00001, SCH78782609341
    full_name TEXT,
    role user_role NOT NULL,
    school_id UUID REFERENCES public.schools(id), -- Null for super admins/auditors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Schools Table
CREATE TABLE public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_code TEXT UNIQUE NOT NULL, -- SCHXXXX
    school_name TEXT NOT NULL,
    plan_type TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Chat Rooms Table
CREATE TABLE public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_name TEXT NOT NULL,
    room_type TEXT NOT NULL, -- 'classroom', 'school', 'departmental', 'custom'
    school_id UUID REFERENCES public.schools(id), -- Null for global/departmental chats
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Chat Messages Table
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Chat Participants Table
CREATE TABLE public.chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(room_id, profile_id)
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: Users can read all profiles in their school, but only update their own.
CREATE POLICY "Profiles are viewable by everyone in same school" ON public.profiles
    FOR SELECT USING (
        role = 'admin' OR 
        role = 'auditor' OR 
        school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    );

-- Chat Messages: Users can only read messages in rooms they are participants in.
CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE room_id = public.chat_messages.room_id 
            AND profile_id = auth.uid()
        )
    );

-- Chat Messages: Users can insert messages in rooms they are participants in.
CREATE POLICY "Users can send messages to their rooms" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_participants 
            WHERE room_id = public.chat_messages.room_id 
            AND profile_id = auth.uid()
        )
    );

-- Enable Realtime for Chat Messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
