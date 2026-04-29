-- SEED DATA FOR EDUPORTAL (v1.1)
-- Fixed email mapping to match APP_CONFIG.AUTH_DOMAIN

DO $$
DECLARE
    v_school_id UUID;
    v_i INTEGER;
    v_user_id UUID;
    v_domain TEXT := '@auth.ssph01.eduportal.internal';
    v_pass TEXT := '$2a$10$7Z2tYh.XpC.NfI2uQo3X.eLhK8mB0O.G7.L7.I.P.O.G7.L7.I.P.O.'; -- Placeholder
BEGIN
    -- 1. Ensure the school exists
    INSERT INTO public.schools (school_code, school_name, plan_type)
    VALUES ('SCH7878', 'St. Mary''s High', 'premium')
    ON CONFLICT (school_code) DO UPDATE SET school_name = EXCLUDED.school_name
    RETURNING id INTO v_school_id;

    -- 2. Super Admin (Global)
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
    VALUES (v_user_id, 'ad00001' || v_domain, v_pass, NOW(), 'authenticated', 'authenticated') ON CONFLICT DO NOTHING;
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'AD00001', 'Super Admin', 'admin', NULL) ON CONFLICT DO NOTHING;

    -- 3. Principal
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
    VALUES (v_user_id, 'pr00001' || v_domain, v_pass, NOW(), 'authenticated', 'authenticated') ON CONFLICT DO NOTHING;
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'PR00001', 'Dr. Anita Sharma', 'principal', v_school_id) ON CONFLICT DO NOTHING;

    -- 3. Moderator
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
    VALUES (v_user_id, 'md00001' || v_domain, v_pass, NOW(), 'authenticated', 'authenticated') ON CONFLICT DO NOTHING;
    INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
    VALUES (v_user_id, 'MD00001', 'David Costa', 'moderator', v_school_id) ON CONFLICT DO NOTHING;

    -- 4. Teachers
    FOR v_i IN 1..3 LOOP
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
        VALUES (v_user_id, 't00000' || v_i || v_domain, v_pass, NOW(), 'authenticated', 'authenticated') ON CONFLICT DO NOTHING;
        INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
        VALUES (v_user_id, 'T00000' || v_i, 'Teacher ' || v_i, 'teacher', v_school_id) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 5. Students
    FOR v_i IN 1..15 LOOP
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role)
        VALUES (v_user_id, '787826090' || LPAD(v_i::text, 2, '0') || v_domain, v_pass, NOW(), 'authenticated', 'authenticated') ON CONFLICT DO NOTHING;
        INSERT INTO public.profiles (id, user_code, full_name, role, school_id)
        VALUES (v_user_id, '787826090' || LPAD(v_i::text, 2, '0'), 'Student ' || v_i, 'student', v_school_id) ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
