import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const envFiles = ['.env.production', '.env.local', '.env']
  .map((file) => path.join(root, file))
  .filter(existsSync);

const values = { ...process.env };

for (const file of envFiles) {
  const content = readFileSync(file, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in values)) values[key] = value;
  }
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'GATE_AUTH_SECRET',
  'GATE_STATION_SECRET',
  'HARDWARE_PROVISIONING_SECRET',
  'STUDIO_PROCESS_SECRET',
  'OFFLINE_AUTH_SECRET',
];

const placeholderPattern = /^(your-|missing-|default-|changeme|replace-me)/i;
const failures = [];

for (const key of required) {
  const value = values[key];
  if (!value) {
    failures.push(`${key} is missing`);
  } else if (placeholderPattern.test(value) || value.length < 16) {
    failures.push(`${key} looks like a placeholder or weak value`);
  }
}

if (failures.length) {
  console.error('Production environment check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Production environment check OK (${required.length} required values).`);
