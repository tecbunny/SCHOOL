-- REPORT FIXES (2026-05-01)
-- Aligns schema with the current application code paths reviewed in WEB_APP_REPORT.md.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'alumni';

ALTER TABLE IF EXISTS public.schools
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS attendance_mode TEXT DEFAULT 'morning' CHECK (attendance_mode IN ('morning', 'subject'));

