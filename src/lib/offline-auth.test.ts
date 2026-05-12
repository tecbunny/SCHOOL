import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';

const originalNodeEnv = process.env.NODE_ENV;
const originalOfflineSecret = process.env.OFFLINE_AUTH_SECRET;

function setNodeEnv(value: string) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe('offline auth secrets', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.OFFLINE_AUTH_SECRET;
  });

  afterEach(() => {
    setNodeEnv(originalNodeEnv);
    if (originalOfflineSecret === undefined) {
      delete process.env.OFFLINE_AUTH_SECRET;
    } else {
      process.env.OFFLINE_AUTH_SECRET = originalOfflineSecret;
    }
  });

  it('requires OFFLINE_AUTH_SECRET in production', async () => {
    setNodeEnv('production');
    const { generateOfflineToken } = await import('./offline-auth');

    expect(() => generateOfflineToken({
      id: 'user-1',
      role: 'student',
      school_id: 'school-1',
    })).toThrow('OFFLINE_AUTH_SECRET is not configured.');
  });

  it('uses configured secret when present', async () => {
    setNodeEnv('production');
    process.env.OFFLINE_AUTH_SECRET = 'configured-secret';
    const { generateOfflineToken, validateOfflineToken } = await import('./offline-auth');

    const token = generateOfflineToken({
      id: 'user-1',
      role: 'student',
      school_id: 'school-1',
    });

    expect(validateOfflineToken(token)?.sub).toBe('user-1');
  });
});
