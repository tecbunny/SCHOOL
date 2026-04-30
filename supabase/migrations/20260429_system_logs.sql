-- Centralized System Event Logs
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID, -- Optional: link to school
    user_id UUID,   -- Optional: who did it
    event_type TEXT NOT NULL, -- e.g., 'AUTH', 'HARDWARE', 'AI_GRADING', 'PROMOTION', 'SYSTEM'
    severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB, -- Store full JSON payloads (AI responses, hardware telemetry)
    client_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indices
CREATE INDEX idx_logs_event_type ON public.system_logs(event_type);
CREATE INDEX idx_logs_tenant_id ON public.system_logs(tenant_id);
CREATE INDEX idx_logs_created_at ON public.system_logs(created_at DESC);
