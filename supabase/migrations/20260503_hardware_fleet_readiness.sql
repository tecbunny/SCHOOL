-- Hardware fleet readiness: enrollable nodes, release manifests, and OTA deployments.

CREATE TABLE IF NOT EXISTS public.hardware_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    node_name TEXT NOT NULL,
    node_type TEXT NOT NULL DEFAULT 'student-hub' CHECK (node_type IN ('student-hub', 'class-station', 'admin-kiosk')),
    mac_address TEXT UNIQUE,
    station_code TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'online', 'warning', 'offline')),
    temp NUMERIC,
    disk_usage NUMERIC,
    memory_usage NUMERIC,
    uptime NUMERIC,
    version TEXT NOT NULL DEFAULT '1.0.0',
    last_heartbeat TIMESTAMPTZ,
    public_key_pem TEXT,
    key_algorithm TEXT NOT NULL DEFAULT 'ed25519',
    key_registered_at TIMESTAMPTZ,
    node_secret_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.hardware_nodes
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS node_name TEXT,
    ADD COLUMN IF NOT EXISTS node_type TEXT NOT NULL DEFAULT 'student-hub',
    ADD COLUMN IF NOT EXISTS mac_address TEXT,
    ADD COLUMN IF NOT EXISTS station_code TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS temp NUMERIC,
    ADD COLUMN IF NOT EXISTS disk_usage NUMERIC,
    ADD COLUMN IF NOT EXISTS memory_usage NUMERIC,
    ADD COLUMN IF NOT EXISTS uptime NUMERIC,
    ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT '1.0.0',
    ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS public_key_pem TEXT,
    ADD COLUMN IF NOT EXISTS key_algorithm TEXT NOT NULL DEFAULT 'ed25519',
    ADD COLUMN IF NOT EXISTS key_registered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS node_secret_hash TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS hardware_nodes_mac_unique_idx
    ON public.hardware_nodes (mac_address)
    WHERE mac_address IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS hardware_nodes_station_unique_idx
    ON public.hardware_nodes (station_code)
    WHERE station_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.fleet_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_type TEXT NOT NULL CHECK (release_type IN ('os', 'pwa')),
    version_code TEXT NOT NULL,
    download_url TEXT NOT NULL,
    checksum TEXT NOT NULL,
    signature TEXT,
    changelog TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(release_type, version_code)
);

CREATE TABLE IF NOT EXISTS public.fleet_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES public.hardware_nodes(id) ON DELETE CASCADE NOT NULL,
    release_id UUID REFERENCES public.fleet_releases(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'installed', 'failed', 'deferred')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(node_id, release_id)
);

ALTER TABLE public.hardware_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_deployments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and auditors view hardware nodes" ON public.hardware_nodes;
CREATE POLICY "Admins and auditors view hardware nodes" ON public.hardware_nodes
    FOR SELECT USING (
        auth_helpers.get_my_role() IN ('admin', 'auditor') OR
        school_id = auth_helpers.get_my_school_id()
    );

DROP POLICY IF EXISTS "Admins manage hardware nodes" ON public.hardware_nodes;
CREATE POLICY "Admins manage hardware nodes" ON public.hardware_nodes
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins view fleet releases" ON public.fleet_releases;
CREATE POLICY "Admins view fleet releases" ON public.fleet_releases
    FOR SELECT USING (auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Admins manage fleet releases" ON public.fleet_releases;
CREATE POLICY "Admins manage fleet releases" ON public.fleet_releases
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins view fleet deployments" ON public.fleet_deployments;
CREATE POLICY "Admins view fleet deployments" ON public.fleet_deployments
    FOR SELECT USING (auth_helpers.get_my_role() IN ('admin', 'auditor'));

DROP POLICY IF EXISTS "Admins manage fleet deployments" ON public.fleet_deployments;
CREATE POLICY "Admins manage fleet deployments" ON public.fleet_deployments
    FOR ALL USING (auth_helpers.get_my_role() = 'admin')
    WITH CHECK (auth_helpers.get_my_role() = 'admin');
