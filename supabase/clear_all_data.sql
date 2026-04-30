-- RESILIENT SUPABASE DATA WIPE SCRIPT (PUBLIC TABLES ONLY)
-- This script removes all data from public tables safely.
-- It skips the 'auth' schema to avoid permission errors.

DO $$ 
DECLARE
    tab_name TEXT;
    tables_to_clear TEXT[] := ARRAY[
        'device_commands', 'student_sessions', 'qr_sessions', 
        'student_wellbeing', 'smc_minutes', 'fln_milestones', 
        'vocational_skills', 'parent_feedback', 'exam_papers', 
        'materials', 'cpd_logs', 'hpc_grades', 'attendance', 
        'chat_participants', 'chat_messages', 'chat_rooms', 
        'profiles', 'schools'
    ];
BEGIN
    -- 1. Elevate session to bypass RLS and triggers
    SET session_replication_role = 'replica';

    -- 2. Loop through and truncate only existing public tables
    FOREACH tab_name IN ARRAY tables_to_clear
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tab_name) THEN
            EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', tab_name);
        END IF;
    END LOOP;

    -- 3. Restore session behavior
    SET session_replication_role = 'origin';
END $$;

SELECT 'Resilient wipe of public tables completed.' as status;
