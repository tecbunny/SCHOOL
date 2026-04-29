-- Create Archival Schema
CREATE SCHEMA IF NOT EXISTS archive;

-- Archive Table: Historical Chat Messages
CREATE TABLE archive.messages (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    sender_id UUID,
    room_id TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive Table: Historical Attendance
CREATE TABLE archive.attendance (
    id UUID PRIMARY KEY,
    student_id UUID,
    status TEXT,
    date DATE,
    tenant_id UUID,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive Table: Kiosk Heartbeats
CREATE TABLE archive.hardware_heartbeats (
    id UUID PRIMARY KEY,
    node_id UUID,
    telemetry JSONB,
    created_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to archive old data (Draft)
CREATE OR REPLACE FUNCTION archive.perform_annual_rollover(target_school_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Move Messages
    INSERT INTO archive.messages (id, tenant_id, sender_id, room_id, content, created_at)
    SELECT id, tenant_id, sender_id, room_id, content, created_at
    FROM public.messages
    WHERE tenant_id = target_school_id;
    
    DELETE FROM public.messages WHERE tenant_id = target_school_id;

    -- Move Attendance
    INSERT INTO archive.attendance (id, student_id, status, date, tenant_id)
    SELECT id, student_id, status, date, tenant_id
    FROM public.attendance
    WHERE tenant_id = target_school_id;

    DELETE FROM public.attendance WHERE tenant_id = target_school_id;
END;
$$ LANGUAGE plpgsql;
