import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';

const routeFiles = [
  path.join(process.cwd(), 'src/app/api/admin/staff/reset-password/route.ts'),
  path.join(process.cwd(), 'src/app/api/admin/principal/reset-password/route.ts'),
  path.join(process.cwd(), 'src/app/api/school/provision/route.ts'),
];

describe('credential response hardening', () => {
  it('does not expose temporary passwords in API response payloads', () => {
    for (const file of routeFiles) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/temporaryPassword\s*:/);
    }
  });
});
