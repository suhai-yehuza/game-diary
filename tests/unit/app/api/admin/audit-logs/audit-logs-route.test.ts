import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() to properly handle mock variables
const { mockDb, mockAuth } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
  },
  mockAuth: vi.fn(),
}));

// Mock modules
vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}));

vi.mock('@/lib/db', () => ({
  db: () => mockDb,
}));

vi.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(url: string) {
      this.url = url;
    }
    url: string;
  },
  NextResponse: class NextResponse {
    constructor(body: any, init?: any) {
      this.body = body;
      this.init = init;
      this.status = init?.status || 200;
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

// Mock API config
vi.mock('@/lib/config/app.config', () => ({
  API_CONFIG: {
    pagination: {
      DEFAULT_PAGE_SIZE: 20,
    },
  },
}));

import { GET, POST } from '@/app/api/admin/audit-logs/route';

describe('Admin Audit Logs API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock chain
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.orderBy.mockReturnValue(mockDb);
    mockDb.limit.mockReturnValue(mockDb);
    mockDb.offset.mockResolvedValue([]);
  });

  describe('GET', () => {
    it('returns audit logs with default pagination', async () => {
      const mockUserId = 'user123';
      const mockLogs = [
        {
          id: '1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          category: 'auth',
          action: 'login',
          severity: 'low',
          user_id: 'user123',
          description: 'User logged in',
          success: true,
          error_message: null,
          endpoint: '/api/auth/login',
          method: 'POST',
          details: {},
        },
      ];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost/api/admin/audit-logs');

      await GET(request);

      expect(mockAuth).toHaveBeenCalled();
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(20);
      expect(mockDb.offset).toHaveBeenCalledWith(0);
    });

    it('handles custom pagination parameters', async () => {
      const mockUserId = 'user123';
      const mockLogs: any[] = [];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost/api/admin/audit-logs?limit=10&offset=20');

      await GET(request);

      expect(mockDb.limit).toHaveBeenCalledWith(10);
      expect(mockDb.offset).toHaveBeenCalledWith(20);
    });

    it('filters by category', async () => {
      const mockUserId = 'user123';
      const mockLogs: any[] = [];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost/api/admin/audit-logs?category=auth');

      await GET(request);

      expect(mockDb.where).toHaveBeenCalled();
    });

    it('filters by severity', async () => {
      const mockUserId = 'user123';
      const mockLogs: any[] = [];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost/api/admin/audit-logs?severity=high');

      await GET(request);

      expect(mockDb.where).toHaveBeenCalled();
    });

    it('filters by user ID', async () => {
      const mockUserId = 'user123';
      const mockLogs: any[] = [];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost/api/admin/audit-logs?userId=user456');

      await GET(request);

      expect(mockDb.where).toHaveBeenCalled();
    });

    it('filters by date range', async () => {
      const mockUserId = 'user123';
      const mockLogs: any[] = [];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockResolvedValue(mockLogs);

      const request = new NextRequest(
        'http://localhost/api/admin/audit-logs?startDate=2024-01-01&endDate=2024-01-31'
      );

      await GET(request);

      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('POST', () => {
    it('exports audit logs as CSV with filters', async () => {
      const mockUserId = 'user123';

      mockAuth.mockResolvedValue({ userId: mockUserId });

      const request = new NextRequest('http://localhost/api/admin/audit-logs', {
        method: 'POST',
        body: JSON.stringify({
          category: 'auth',
          severity: 'low',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        }),
      });

      const response = await POST(request);

      expect(mockAuth).toHaveBeenCalled();
      expect(response).toBeDefined();
    });
  });
});
