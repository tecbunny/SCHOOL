-- Core Hardware Infrastructure
CREATE TABLE IF NOT EXISTS public.hardware_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id),
    node_name TEXT NOT NULL,
    mac_address TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'offline',
    temp NUMERIC DEFAULT 0,
    version TEXT DEFAULT '1.0.0',
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fleet Management: Software Release Tracking
CREATE TABLE public.fleet_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_code TEXT NOT NULL,
    release_type TEXT CHECK (release_type IN ('os', 'pwa')),
    download_url TEXT NOT NULL,
    checksum TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    changelog TEXT
);

-- Fleet Management: Deployment Status
CREATE TABLE public.fleet_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID REFERENCES public.fleet_releases(id),
    node_id UUID REFERENCES public.hardware_nodes(id),
    status TEXT CHECK (status IN ('pending', 'downloading', 'installed', 'failed')),
    error_log TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast version checking
CREATE INDEX idx_fleet_releases_version ON public.fleet_releases(version_code);
