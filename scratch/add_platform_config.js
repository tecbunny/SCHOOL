const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../../eduportal-web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = `
CREATE TABLE IF NOT EXISTS public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed global flags
INSERT INTO public.platform_config (key, value)
VALUES 
('global_features', '{"ai_enabled": true, "registrations_open": true, "maintenance_mode": false}'),
('gemini_config', '{"model": "gemini-1.5-pro", "temperature": 0.7}')
ON CONFLICT (key) DO NOTHING;

-- Policies
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage config" ON public.platform_config FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "Public read config" ON public.platform_config FOR SELECT USING (true);
`;

console.log("SQL to run:");
console.log(sql);
