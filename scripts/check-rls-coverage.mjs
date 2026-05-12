import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sources = [
  path.join(root, 'combined_setup.sql'),
  ...readdirSync(path.join(root, 'supabase/migrations'))
    .filter((file) => file.endsWith('.sql'))
    .map((file) => path.join(root, 'supabase/migrations', file)),
];

const created = new Set();
const rlsEnabled = new Set();

for (const sourcePath of sources) {
  const sql = readFileSync(sourcePath, 'utf8');
  for (const match of sql.matchAll(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.([a-zA-Z0-9_]+)/gi)) {
    created.add(match[1]);
  }
  for (const match of sql.matchAll(/ALTER\s+TABLE(?:\s+IF\s+EXISTS)?\s+public\.([a-zA-Z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi)) {
    rlsEnabled.add(match[1]);
  }
}

const allowedWithoutRls = new Set([]);
const missing = [...created]
  .filter((table) => !allowedWithoutRls.has(table))
  .filter((table) => !rlsEnabled.has(table))
  .sort();

if (missing.length) {
  console.error(`Tables missing RLS: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`RLS coverage OK for ${created.size} public tables.`);
