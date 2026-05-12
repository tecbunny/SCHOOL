import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/lib/rate-limit', () => ({
  isRateLimited: jest.fn(() => false),
}));

jest.mock('@/lib/supabase-env', () => ({
  getSupabaseUrl: jest.fn(() => 'https://example.supabase.co'),
  getSupabasePublishableKey: jest.fn(() => 'publishable-key'),
}));

const { POST } = jest.requireActual('./route') as typeof import('./route');
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe('/api/auth/code-login validation', () => {
  beforeEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  afterEach(() => {
    if (originalServiceRoleKey === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
    }
  });

  it('rejects invalid requested portal roles before querying Supabase', async () => {
    const response = await POST(new Request('http://localhost/api/auth/code-login', {
      method: 'POST',
      body: JSON.stringify({
        code: 'STU001',
        password: 'password',
        allowedRoles: ['superadmin'],
      }),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid login portal role request.',
    });
  });

  it('rejects malformed school codes before querying Supabase', async () => {
    const response = await POST(new Request('http://localhost/api/auth/code-login', {
      method: 'POST',
      body: JSON.stringify({
        code: 'STU001',
        password: 'password',
        allowedRoles: ['student'],
        schoolCode: '../school',
      }),
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid school code.',
    });
  });
});
