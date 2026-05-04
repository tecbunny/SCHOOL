-- Studio generation queue and edge cache manifest for EduPortal/EduOS.
-- The Student Hub can request learning assets while offline; the Class Station
-- claims pending jobs, calls configured AI providers, caches outputs, and marks
-- rows completed for realtime delivery back to the student.

CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    class_station_id UUID REFERENCES public.hardware_nodes(id) ON DELETE SET NULL,
    source_material_id UUID,
    generation_type TEXT NOT NULL CHECK (generation_type IN (
        'audio_overview',
        'flashcards',
        'quiz',
        'slide_deck',
        'worksheet',
        'exam_paper',
        'grading_report'
    )),
    prompt TEXT NOT NULL,
    input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'claimed',
        'processing',
        'completed',
        'failed',
        'cancelled'
    )),
    provider TEXT NOT NULL DEFAULT 'gemini',
    provider_model TEXT,
    idempotency_key TEXT,
    priority SMALLINT NOT NULL DEFAULT 5 CHECK (priority BETWEEN 0 AND 10),
    attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    max_attempts INTEGER NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
    error_code TEXT,
    error_message TEXT,
    claimed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT generations_idempotency_per_school UNIQUE (school_id, idempotency_key),
    CONSTRAINT generations_attempt_limit CHECK (attempt_count <= max_attempts)
);

CREATE TABLE IF NOT EXISTS public.generation_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    class_station_id UUID REFERENCES public.hardware_nodes(id) ON DELETE SET NULL,
    asset_kind TEXT NOT NULL CHECK (asset_kind IN (
        'json',
        'audio',
        'image',
        'pdf',
        'slides',
        'worksheet',
        'answer_key',
        'report'
    )),
    storage_scope TEXT NOT NULL DEFAULT 'edge-cache' CHECK (storage_scope IN ('edge-cache', 'supabase-storage', 'external')),
    local_path TEXT,
    storage_bucket TEXT,
    storage_object_path TEXT,
    content_type TEXT,
    byte_size BIGINT CHECK (byte_size IS NULL OR byte_size >= 0),
    checksum_sha256 TEXT,
    manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
    cached_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.edge_storage_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    total_bytes BIGINT NOT NULL CHECK (total_bytes >= 0),
    used_bytes BIGINT NOT NULL CHECK (used_bytes >= 0),
    free_bytes BIGINT NOT NULL CHECK (free_bytes >= 0),
    oldest_cached_day DATE,
    newest_cached_day DATE,
    fifo_cleanup_required BOOLEAN NOT NULL DEFAULT FALSE,
    cleanup_started_at TIMESTAMPTZ,
    cleanup_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generations_pending_queue_idx
    ON public.generations (school_id, status, priority, created_at)
    WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS generations_requester_status_idx
    ON public.generations (requester_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS generations_station_status_idx
    ON public.generations (class_station_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS generation_assets_generation_idx
    ON public.generation_assets (generation_id, created_at);

CREATE INDEX IF NOT EXISTS edge_storage_snapshots_node_created_idx
    ON public.edge_storage_snapshots (node_id, created_at DESC);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_storage_snapshots ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_generations_updated_at ON public.generations;
CREATE TRIGGER set_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Students create own generation requests" ON public.generations;
CREATE POLICY "Students create own generation requests" ON public.generations
    FOR INSERT WITH CHECK (
        requester_id = (select auth.uid())
        AND school_id = auth_helpers.get_my_school_id()
        AND auth_helpers.get_my_role() IN ('student', 'teacher', 'principal')
    );

DROP POLICY IF EXISTS "School members view generation requests" ON public.generations;
CREATE POLICY "School members view generation requests" ON public.generations
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR requester_id = (select auth.uid())
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal', 'moderator', 'auditor')
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Students cancel own pending generations" ON public.generations;
CREATE POLICY "Students cancel own pending generations" ON public.generations
    FOR UPDATE USING (
        requester_id = (select auth.uid())
        AND status = 'pending'
    )
    WITH CHECK (
        requester_id = (select auth.uid())
        AND status = 'cancelled'
    );

DROP POLICY IF EXISTS "Staff manage school generations" ON public.generations;
CREATE POLICY "Staff manage school generations" ON public.generations
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal')
            AND school_id = auth_helpers.get_my_school_id()
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal')
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "School members view generation assets" ON public.generation_assets;
CREATE POLICY "School members view generation assets" ON public.generation_assets
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR school_id = auth_helpers.get_my_school_id()
        OR EXISTS (
            SELECT 1
            FROM public.generations g
            WHERE g.id = public.generation_assets.generation_id
              AND g.requester_id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Staff manage generation assets" ON public.generation_assets;
CREATE POLICY "Staff manage generation assets" ON public.generation_assets
    FOR ALL USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal')
            AND school_id = auth_helpers.get_my_school_id()
        )
    )
    WITH CHECK (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('teacher', 'principal')
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admins and school leaders view edge storage snapshots" ON public.edge_storage_snapshots;
CREATE POLICY "Admins and school leaders view edge storage snapshots" ON public.edge_storage_snapshots
    FOR SELECT USING (
        auth_helpers.get_my_role() = 'admin'
        OR (
            auth_helpers.get_my_role() IN ('principal', 'auditor')
            AND school_id = auth_helpers.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admins manage edge storage snapshots" ON public.edge_storage_snapshots;
CREATE POLICY "Admins manage edge storage snapshots" ON public.edge_storage_snapshots
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.generations;
EXCEPTION
    WHEN others THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_assets;
EXCEPTION
    WHEN others THEN null;
END $$;
