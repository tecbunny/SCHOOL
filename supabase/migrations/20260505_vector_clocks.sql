-- VECTOR CLOCKS / HLC MIGRATION (2026-05-05)
-- Adds vector clocks and HLC to syncable tables for CRDT conflict resolution.

ALTER TABLE public.assignments
    ADD COLUMN IF NOT EXISTS _version_vector JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS _version_vector JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.attendance
    ADD COLUMN IF NOT EXISTS _version_vector JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.hpc_grades
    ADD COLUMN IF NOT EXISTS _version_vector JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.materials
    ADD COLUMN IF NOT EXISTS _version_vector JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.exam_papers
    ADD COLUMN IF NOT EXISTS _version_vector JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.certifications
    ADD COLUMN IF NOT EXISTS _version_vector JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
