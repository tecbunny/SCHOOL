-- Test accounts for every EduPortal login surface.
-- Run in the Supabase SQL editor or with psql against your dev database.
--
-- Shared password for every account below:
--   Test@12345
--
-- User code -> login email mapping follows APP_CONFIG.AUTH_DOMAIN:
--   lower(user_code) || '@auth.ssph01.eduportal.internal'
--
-- This covers the roles currently present in the database user_role enum:
-- admin, auditor, principal, teacher, moderator, student.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_hardware_bound BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_teaching_staff BOOLEAN DEFAULT FALSE;

DO $$
DECLARE
  v_account RECORD;
  v_school_id UUID;
  v_user_id UUID;
  v_email TEXT;
  v_domain TEXT := '@auth.ssph01.eduportal.internal';
  v_password TEXT := 'Test@12345';
  v_identity_id_type TEXT;
BEGIN
  SELECT data_type
  INTO v_identity_id_type
  FROM information_schema.columns
  WHERE table_schema = 'auth'
    AND table_name = 'identities'
    AND column_name = 'id';

  INSERT INTO public.schools (school_code, school_name, plan_type, status)
  VALUES ('SCH7878', 'St. Mary''s Test School', 'premium', 'active')
  ON CONFLICT (school_code) DO UPDATE
    SET school_name = EXCLUDED.school_name,
        plan_type = EXCLUDED.plan_type,
        status = EXCLUDED.status
  RETURNING id INTO v_school_id;

  FOR v_account IN
    SELECT
      user_code,
      full_name,
      user_role,
      school_id,
      is_teaching_staff
    FROM (
      VALUES
        ('AD00001', 'Test Super Admin', 'admin'::user_role, NULL::UUID, FALSE),
        ('AU00001', 'Test Compliance Auditor', 'auditor'::user_role, NULL::UUID, FALSE),
        ('PR00001', 'Test Principal', 'principal'::user_role, v_school_id, TRUE),
        ('T000001', 'Test Teacher', 'teacher'::user_role, v_school_id, TRUE),
        ('MD00001', 'Test Moderator', 'moderator'::user_role, v_school_id, FALSE),
        ('78782609001', 'Test Student', 'student'::user_role, v_school_id, FALSE)
    ) AS accounts(user_code, full_name, user_role, school_id, is_teaching_staff)
  LOOP
    v_email := lower(v_account.user_code) || v_domain;

    SELECT id
    INTO v_user_id
    FROM auth.users
    WHERE email = v_email
    LIMIT 1;

    IF v_user_id IS NULL THEN
      v_user_id := gen_random_uuid();
    END IF;

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf', 10)),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_account.full_name, 'user_code', v_account.user_code),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          encrypted_password = EXCLUDED.encrypted_password,
          email_confirmed_at = EXCLUDED.email_confirmed_at,
          raw_app_meta_data = EXCLUDED.raw_app_meta_data,
          raw_user_meta_data = EXCLUDED.raw_user_meta_data,
          updated_at = NOW();

    IF v_identity_id_type = 'uuid' THEN
      INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        v_user_id,
        v_user_id::text,
        jsonb_build_object(
          'sub', v_user_id::text,
          'email', v_email,
          'email_verified', true,
          'phone_verified', false
        ),
        'email',
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid()::text,
        v_user_id,
        v_user_id::text,
        jsonb_build_object(
          'sub', v_user_id::text,
          'email', v_email,
          'email_verified', true,
          'phone_verified', false
        ),
        'email',
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING;
    END IF;

    INSERT INTO public.profiles (
      id,
      user_code,
      full_name,
      role,
      school_id,
      is_hardware_bound,
      is_teaching_staff
    )
    VALUES (
      v_user_id,
      v_account.user_code,
      v_account.full_name,
      v_account.user_role,
      v_account.school_id,
      FALSE,
      v_account.is_teaching_staff
    )
    ON CONFLICT (id) DO UPDATE
      SET user_code = EXCLUDED.user_code,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          school_id = EXCLUDED.school_id,
          is_hardware_bound = EXCLUDED.is_hardware_bound,
          is_teaching_staff = EXCLUDED.is_teaching_staff;
  END LOOP;
END $$;

SELECT
  p.user_code,
  lower(p.user_code) || '@auth.ssph01.eduportal.internal' AS email,
  p.full_name,
  p.role,
  COALESCE(s.school_code, 'GLOBAL') AS school_code,
  'Test@12345' AS password
FROM public.profiles p
LEFT JOIN public.schools s ON s.id = p.school_id
WHERE p.user_code IN ('AD00001', 'AU00001', 'PR00001', 'T000001', 'MD00001', '78782609001')
ORDER BY
  CASE p.role
    WHEN 'admin' THEN 1
    WHEN 'auditor' THEN 2
    WHEN 'principal' THEN 3
    WHEN 'teacher' THEN 4
    WHEN 'moderator' THEN 5
    WHEN 'student' THEN 6
  END;
