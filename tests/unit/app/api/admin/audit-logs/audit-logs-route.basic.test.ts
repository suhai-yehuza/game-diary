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
    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.body = init?.body;
    }
    url: string;
    method: string;
    body: any;
    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
  },
  NextResponse: class NextResponse {
    constructor(body: any, init?: any) {
      this.body = body;
      this.init = init;
      this.status = init?.status ?? 200;
      this.headers = new Map();
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string);
        });
      }
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

      const response = await GET(request);

      expect(mockAuth).toHaveBeenCalled();
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(20);
      expect(mockDb.offset).toHaveBeenCalledWith(0);
      expect(response.status).toBe(200);
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

    // New tests to improve branch coverage
    it('returns 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost/api/admin/audit-logs');

      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('handles database errors gracefully', async () => {
      const mockUserId = 'user123';
      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/admin/audit-logs');

      const response = await GET(request);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });

    it('handles logs with null values correctly', async () => {
      const mockUserId = 'user123';
      const mockLogs = [
        {
          id: '1',
          timestamp: null,
          category: null,
          action: null,
          severity: null,
          user_id: null,
          description: null,
          success: null,
          error_message: null,
          endpoint: null,
          method: null,
          details: null,
        },
      ];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost/api/admin/audit-logs');

      const response = await GET(request);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData.logs[0].timestamp).toBeDefined();
      expect(responseData.logs[0].category).toBe('unknown');
      expect(responseData.logs[0].action).toBe('unknown');
      expect(responseData.logs[0].severity).toBe('low');
      expect(responseData.logs[0].user_id).toBe('unknown');
      expect(responseData.logs[0].description).toBe('No description');
      expect(responseData.logs[0].success).toBe(true);
      expect(responseData.logs[0].error_message).toBe(null);
      expect(responseData.logs[0].endpoint).toBe(null);
      expect(responseData.logs[0].method).toBe(null);
      expect(responseData.logs[0].details).toEqual({});
    });

    it('handles empty results array', async () => {
      const mockUserId = 'user123';
      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.offset.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/admin/audit-logs');

      const response = await GET(request);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData.logs).toEqual([]);
    });
  });

  describe('POST', () => {
    it('exports audit logs as CSV with filters', async () => {
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
        },
      ];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.orderBy.mockResolvedValue(mockLogs);

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
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
    });

    // New tests to improve branch coverage
    it('returns 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost/api/admin/audit-logs', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('handles database errors gracefully', async () => {
      const mockUserId = 'user123';
      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.orderBy.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/admin/audit-logs', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });

    it('handles logs with null values in CSV export', async () => {
      const mockUserId = 'user123';
      const mockLogs = [
        {
          id: '1',
          timestamp: null,
          category: null,
          action: null,
          severity: null,
          user_id: null,
          description: null,
          success: null,
          error_message: null,
          endpoint: null,
          method: null,
        },
      ];

      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.orderBy.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost/api/admin/audit-logs', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const csvContent = await response.text();
      expect(csvContent).toContain('N/A');
    });

    it('handles empty results in CSV export', async () => {
      const mockUserId = 'user123';
      mockAuth.mockResolvedValue({ userId: mockUserId });
      mockDb.orderBy.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/admin/audit-logs', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const csvContent = await response.text();
      expect(csvContent).toContain(
        'Timestamp,Category,Action,Severity,User ID,Description,Success,Error Message,Endpoint,Method'
      );
    });

    it('handles JSON parsing errors', async () => {
      const mockUserId = 'user123';
      mockAuth.mockResolvedValue({ userId: mockUserId });

      const request = new NextRequest('http://localhost/api/admin/audit-logs', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });
});
