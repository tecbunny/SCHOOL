import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { getServiceClient as getServiceClientType } from '@/lib/api-auth';

jest.mock('@/lib/api-auth', () => ({
  getServiceClient: jest.fn(),
}));

const { getServiceClient } = jest.requireMock('@/lib/api-auth') as {
  getServiceClient: jest.MockedFunction<typeof getServiceClientType>;
};
const { POST } = jest.requireActual('./route') as typeof import('./route');

describe('/api/ai/studio/process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.STUDIO_PROCESS_SECRET;
  });

  it('rejects requests when the server process secret is not configured', async () => {
    const response = await POST(new Request('http://localhost/api/ai/studio/process', {
      method: 'POST',
      body: JSON.stringify({ generation_id: 'generation-1' }),
    }));

    expect(response.status).toBe(401);
    expect(getServiceClient).not.toHaveBeenCalled();
  });

  it('rejects requests with an invalid process secret', async () => {
    process.env.STUDIO_PROCESS_SECRET = 'server-secret';

    const response = await POST(new Request('http://localhost/api/ai/studio/process', {
      method: 'POST',
      headers: { 'x-studio-process-secret': 'wrong-secret' },
      body: JSON.stringify({ generation_id: 'generation-1' }),
    }));

    expect(response.status).toBe(401);
    expect(getServiceClient).not.toHaveBeenCalled();
  });
});
