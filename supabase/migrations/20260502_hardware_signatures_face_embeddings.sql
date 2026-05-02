-- HARDWARE SIGNATURE TRUST + LOW-BANDWIDTH FACE EMBEDDINGS (2026-05-02)

ALTER TABLE IF EXISTS public.hardware_nodes
    ADD COLUMN IF NOT EXISTS public_key_pem TEXT,
    ADD COLUMN IF NOT EXISTS key_algorithm TEXT NOT NULL DEFAULT 'ed25519',
    ADD COLUMN IF NOT EXISTS key_registered_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.hardware_request_nonces (
    nonce TEXT PRIMARY KEY,
    node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE CASCADE NOT NULL,
    signed_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS hardware_request_nonces_node_received_idx
    ON public.hardware_request_nonces (node_id, received_at DESC);

CREATE TABLE IF NOT EXISTS public.student_face_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    embedding REAL[] NOT NULL,
    embedding_model TEXT NOT NULL,
    version_count INTEGER NOT NULL DEFAULT 1 CHECK (version_count > 0),
    captured_by_node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT student_face_templates_embedding_size CHECK (array_length(embedding, 1) BETWEEN 64 AND 1024)
);

CREATE UNIQUE INDEX IF NOT EXISTS student_face_templates_active_student_idx
    ON public.student_face_templates (student_id)
    WHERE active = TRUE;

CREATE TABLE IF NOT EXISTS public.face_verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE SET NULL,
    embedding_model TEXT NOT NULL,
    similarity NUMERIC,
    threshold NUMERIC NOT NULL DEFAULT 0.82,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS face_verification_attempts_student_created_idx
    ON public.face_verification_attempts (student_id, created_at DESC);

ALTER TABLE public.hardware_request_nonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_face_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_verification_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view hardware nonces" ON public.hardware_request_nonces;
CREATE POLICY "Admins view hardware nonces" ON public.hardware_request_nonces
    FOR SELECT USING (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Staff view school face templates" ON public.student_face_templates;
CREATE POLICY "Staff view school face templates" ON public.student_face_templates
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
        OR student_id = (select auth.uid())
    );

DROP POLICY IF EXISTS "Staff view school face attempts" ON public.face_verification_attempts;
CREATE POLICY "Staff view school face attempts" ON public.face_verification_attempts
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
        OR student_id = (select auth.uid())
    );
