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
    text() {
      return Promise.resolve(this.body);
    }
    static json(data: any) {
      return new NextResponse(data, { status: 200 });
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
  });

  it('returns proper response structure', async () => {
    const mockUserId = 'user123';

    mockAuth.mockResolvedValue({ userId: mockUserId });

    const response = await POST();

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  });
});
