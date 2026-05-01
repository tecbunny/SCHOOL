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
