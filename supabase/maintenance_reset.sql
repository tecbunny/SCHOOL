-- EDUPORTAL MAINTENANCE / RESET SCRIPT
-- Use only when you intentionally want to clear local/dev data.
-- This combines the old clear_all_data.sql and auth_del.sql helpers into one file.


-- ============================================================
-- From clear_all_data.sql
-- ============================================================

-- EDUPORTAL DATA CLEAR SCRIPT
-- Clears application data only. It intentionally skips auth.users.
-- Run supabase/system.sql for schema/setup, and this file only when data must be wiped.

DO $$ 
DECLARE
    tab_name TEXT;
    public_tables_to_clear TEXT[] := ARRAY[
        'fleet_deployments', 'fleet_releases', 'hardware_nodes',
        'system_logs', 'behavioral_logs', 'global_materials',
        'timetables', 'school_rooms', 'school_profiles',
        'hpc_competencies', 'registration_requests', 'study_materials',
        'announcements', 'platform_config', 'promotion_history',
        'device_commands', 'student_sessions', 'qr_sessions', 
        'student_wellbeing', 'smc_minutes', 'fln_milestones', 
        'vocational_skills', 'parent_feedback', 'exam_papers', 
        'materials', 'cpd_logs', 'hpc_grades', 'attendance', 
        'chat_participants', 'chat_messages', 'chat_rooms', 
        'profiles', 'schools'
    ];
    archive_tables_to_clear TEXT[] := ARRAY[
        'messages', 'attendance', 'hardware_heartbeats'
    ];
BEGIN
    -- 1. Elevate session to bypass RLS and triggers.
    SET session_replication_role = 'replica';

    -- 2. Truncate only existing public tables.
    FOREACH tab_name IN ARRAY public_tables_to_clear
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tab_name) THEN
            EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', tab_name);
        END IF;
    END LOOP;

    -- 3. Truncate only existing archive tables.
    FOREACH tab_name IN ARRAY archive_tables_to_clear
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'archive' AND table_name = tab_name) THEN
            EXECUTE format('TRUNCATE TABLE archive.%I RESTART IDENTITY CASCADE', tab_name);
        END IF;
    END LOOP;

    -- 4. Restore session behavior.
    SET session_replication_role = 'origin';
END $$;

SELECT 'EduPortal application data cleared. auth.users was not touched.' as status;

-- ============================================================
-- From auth_del.sql
-- ============================================================

-- Deletes all Supabase Auth users without resetting auth-owned sequences.
-- This avoids "must be owner of sequence refresh_tokens_id_seq" errors that
-- can happen with TRUNCATE ... RESTART IDENTITY in hosted Supabase.
--
-- WARNING: public.profiles references auth.users ON DELETE CASCADE in this app,
-- so deleting auth.users also deletes linked profiles and dependent rows.

BEGIN;

DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.identities;
DELETE FROM auth.users;

COMMIT;
