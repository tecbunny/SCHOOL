import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { NextResponse } from 'next/server';
import type { requireUser as requireUserType } from '@/lib/api-auth';

jest.mock('@/lib/api-auth', () => ({
  requireUser: jest.fn(),
}));

const { requireUser } = jest.requireMock('@/lib/api-auth') as {
  requireUser: jest.MockedFunction<typeof requireUserType>;
};
const { HEAD, POST } = jest.requireActual('./route') as typeof import('./route');
const mockRequireUser = requireUser as jest.MockedFunction<typeof requireUser>;

function mockAuthorizedUser() {
  mockRequireUser.mockResolvedValue({
    ok: true,
    context: {
      supabase: {},
      user: { id: 'user-1' },
      profile: { id: 'user-1', role: 'student', school_id: 'school-1', full_name: 'Student One' },
    },
  } as Awaited<ReturnType<typeof requireUser>>);
}

describe('/api/upload/resumable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks unauthenticated upload initialization', async () => {
    mockRequireUser.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });

    const response = await POST(new Request('http://localhost/api/upload/resumable', {
      method: 'POST',
      headers: { 'Upload-Length': '1024' },
    }) as never);

    expect(response.status).toBe(401);
  });

  it('rejects oversized upload initialization', async () => {
    mockAuthorizedUser();

    const response = await POST(new Request('http://localhost/api/upload/resumable', {
      method: 'POST',
      headers: { 'Upload-Length': String(10 * 1024 * 1024 + 1) },
    }) as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Upload-Length must be a positive integer up to 10MB',
    });
  });

  it('rejects malformed upload ids before reading metadata', async () => {
    mockAuthorizedUser();

    const response = await HEAD(new Request('http://localhost/api/upload/resumable?uploadId=../bad') as never);

    expect(response.status).toBe(400);
  });
});
