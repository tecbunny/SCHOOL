import { readFileSync } from 'node:fs';
import path from 'node:path';

const migration = readFileSync(
  path.join(process.cwd(), 'supabase/migrations/20260512_fix_security_advisors.sql'),
  'utf8'
);

const requiredPatterns = [
  /ALTER FUNCTION public\.compute_offline_event_hash[\s\S]*SET search_path/i,
  /REVOKE EXECUTE ON FUNCTION public\.append_offline_event[\s\S]*FROM anon, authenticated/i,
  /REVOKE EXECUTE ON FUNCTION public\.apply_grade_edge_version[\s\S]*FROM anon, authenticated/i,
  /REVOKE EXECUTE ON FUNCTION public\.link_student_profile_to_apaar[\s\S]*FROM anon, authenticated/i,
  /DROP POLICY IF EXISTS "Authenticated users can read school files" ON storage\.objects/i,
];

const missing = requiredPatterns.filter((pattern) => !pattern.test(migration));

if (missing.length) {
  console.error(`Security advisor migration check failed: ${missing.length} expected fix(es) missing.`);
  process.exit(1);
}

console.log('Security advisor migration check OK.');
