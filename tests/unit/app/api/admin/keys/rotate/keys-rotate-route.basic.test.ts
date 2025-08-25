import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() to properly handle mock variables
const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

// Mock modules
vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}));

vi.mock('next/server', () => ({
  NextResponse: class NextResponse {
    constructor(body: any, init?: any) {
      this.body = body;
      this.init = init;
      this.status = init?.status ?? 200;
      this.headers = new Map();
    }
    body: any;
    init: any;
    status: number;
    headers: Map<string, string>;
    json() {
      return Promise.resolve(this.body);
    }
    text() {
      return Promise.resolve(this.body);
    }
    static json(data: any, init?: any) {
      return new NextResponse(data, init);
    }
  },
}));

import { POST } from '@/app/api/admin/keys/rotate/route';

describe('Admin Keys Rotate API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rotates keys successfully when user is authenticated', async () => {
    const mockUserId = 'user123';

    mockAuth.mockResolvedValue({ userId: mockUserId });

    const response = await POST();

    expect(mockAuth).toHaveBeenCalled();
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Key rotation completed successfully',
      timestamp: expect.any(String),
      rotated_keys: ['encryption_key_1', 'encryption_key_2'],
    });
  });

  it('returns proper response structure', async () => {
    const mockUserId = 'user123';

    mockAuth.mockResolvedValue({ userId: mockUserId });

    const response = await POST();

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('Key rotation completed successfully');
    expect(responseData.rotated_keys).toEqual(['encryption_key_1', 'encryption_key_2']);
    expect(responseData.timestamp).toBeDefined();
  });

  // New tests to improve branch coverage
  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const response = await POST();

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 when auth returns undefined userId', async () => {
    mockAuth.mockResolvedValue({ userId: undefined });

    const response = await POST();

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('handles auth errors gracefully', async () => {
    mockAuth.mockRejectedValue(new Error('Auth error'));

    const response = await POST();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });

  it('handles general errors gracefully', async () => {
    mockAuth.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await POST();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });

  it('validates timestamp format in response', async () => {
    const mockUserId = 'user123';
    mockAuth.mockResolvedValue({ userId: mockUserId });

    const response = await POST();

    expect(response.status).toBe(200);
    const responseData = await response.json();
    const timestamp = responseData.timestamp;
    expect(timestamp).toBeDefined();
    expect(typeof timestamp).toBe('string');
    expect(new Date(timestamp).toISOString()).toBe(timestamp); // Validates ISO format
  });

  it('validates rotated keys array structure', async () => {
    const mockUserId = 'user123';
    mockAuth.mockResolvedValue({ userId: mockUserId });

    const response = await POST();

    expect(response.status).toBe(200);
    const responseData = await response.json();
    const rotatedKeys = responseData.rotated_keys;
    expect(Array.isArray(rotatedKeys)).toBe(true);
    expect(rotatedKeys.length).toBe(2);
    expect(rotatedKeys.every((key: string) => typeof key === 'string')).toBe(true);
  });
});
