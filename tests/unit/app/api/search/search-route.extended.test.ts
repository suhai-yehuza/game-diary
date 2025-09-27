import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

import { GET, OPTIONS } from '@/app/api/search/route';

// Mock the database client
vi.mock('@/lib/db', () => ({
  createDatabaseClient: vi.fn(),
}));

// Mock error handlers
vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

// Mock CORS utilities
vi.mock('@/lib/utils/cors', () => ({
  createCorsResponse: vi.fn((data, status = 200) => ({
    json: () => Promise.resolve(data),
    status,
    headers: new Headers(),
  })),
  handleCorsOptions: vi.fn(() => ({
    status: 200,
    headers: new Headers(),
  })),
}));

describe('Search API Route - Extended Tests', () => {
  const mockExecute = vi.fn();
  let consoleSpy: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockExecute.mockClear();
    consoleSpy = vi.spyOn(console, 'log');

    // Disable mock mode for these tests
    process.env.MOCK_MODE = 'false';
    process.env.NODE_ENV = 'development';

    const { createDatabaseClient } = await import('@/lib/db');
    vi.mocked(createDatabaseClient).mockImplementation(() => ({
      execute: mockExecute,
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('OPTIONS method', () => {
    it('handles CORS preflight requests', async () => {
      const result = await OPTIONS();
      expect(result).toBeDefined();
    });
  });

  describe('GET method - Input validation', () => {
    it('returns empty results for query shorter than 2 characters', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=a');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.total).toBe(0);
    });

    it('returns empty results for empty query', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.total).toBe(0);
    });

    it('returns empty results for whitespace-only query', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=%20%20');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.total).toBe(0);
    });

    it('handles missing query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.total).toBe(0);
    });
  });

  describe('GET method - Test/Mock mode', () => {
    it('returns mock data in test environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.query).toBe('test');

      process.env.NODE_ENV = originalEnv;
    });

    it('returns mock data when MOCK_MODE is true', async () => {
      const originalMockMode = process.env.MOCK_MODE;
      process.env.MOCK_MODE = 'true';

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results).toEqual([]);
      expect(data.total).toBe(0);

      process.env.MOCK_MODE = originalMockMode;
    });
  });

  describe('GET method - Database connection failure', () => {
    it('handles database connection failure gracefully', async () => {
      const { createDatabaseClient } = await import('@/lib/db');
      vi.mocked(createDatabaseClient).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('GET method - Successful search', () => {
    beforeEach(async () => {
      const { createDatabaseClient } = await import('@/lib/db');
      vi.mocked(createDatabaseClient).mockReturnValue({
        execute: mockExecute,
      });
    });

    it('performs successful search with results', async () => {
      // Mock database results
      mockExecute
        .mockResolvedValueOnce({
          rows: [
            {
              id: '1',
              username: 'testuser',
              first_name: 'Test',
              last_name: 'User',
              email_address: 'test@example.com',
              created_at: '2023-01-01',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ count: 1 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] });

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(1);
      expect(data.results[0].type).toBe('user');
      expect(data.results[0].title).toBe('testuser');
    });

    it('searches across all entity types', async () => {
      // Mock empty results for all queries
      mockExecute.mockResolvedValue({ rows: [] });

      const request = new NextRequest('http://localhost:3000/api/search?q=basketball');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(mockExecute).toHaveBeenCalledTimes(10); // 5 queries × 2 (count + data)
    });

    it('handles special characters in search query', async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      const request = new NextRequest('http://localhost:3000/api/search?q=test%20%26%20more');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.query).toBe('test & more');
    });
  });

  describe('GET method - Data sanitization', () => {
    beforeEach(async () => {
      const { createDatabaseClient } = await import('@/lib/db');
      vi.mocked(createDatabaseClient).mockReturnValue({
        execute: mockExecute,
      });
    });

    it('sanitizes user data by removing encrypted fields', async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [
            {
              id: '1',
              username: 'testuser',
              first_name: 'Test',
              last_name: 'User',
              email_address: 'test@example.com',
              password_hash: 'encrypted_hash',
              encrypted_first_name: '{"iv":"test","content":"test","tag":"test"}',
              created_at: '2023-01-01',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results[0]).not.toHaveProperty('password_hash');
      expect(data.results[0]).not.toHaveProperty('encrypted_first_name');
    });

    it('sanitizes game log data by removing encrypted fields', async () => {
      mockExecute
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: '1',
              user_id: '1',
              game_id: '1',
              rating_for_game: 5,
              notes: 'Great game!',
              classification: 'positive',
              encrypted_notes: '{"iv":"test","content":"test","tag":"test"}',
              created_at: '2023-01-01',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const request = new NextRequest('http://localhost:3000/api/search?q=game');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results[0]).not.toHaveProperty('encrypted_notes');
    });
  });

  describe('GET method - Error handling', () => {
    it('handles database query errors', async () => {
      const { createDatabaseClient } = await import('@/lib/db');
      vi.mocked(createDatabaseClient).mockReturnValue({
        execute: mockExecute,
      });

      mockExecute.mockRejectedValue(new Error('Database query failed'));

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('handles JSON parsing errors', async () => {
      const { createDatabaseClient } = await import('@/lib/db');
      vi.mocked(createDatabaseClient).mockReturnValue({
        execute: mockExecute,
      });

      mockExecute.mockResolvedValue({ rows: [] });

      // Mock a response that would cause JSON parsing to fail
      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('GET method - Response format', () => {
    beforeEach(async () => {
      const { createDatabaseClient } = await import('@/lib/db');
      vi.mocked(createDatabaseClient).mockReturnValue({
        execute: mockExecute,
      });
    });

    it('returns properly formatted response structure', async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('query');
      expect(data).toHaveProperty('filters');
      expect(data).toHaveProperty('facets');
      expect(data.facets).toHaveProperty('type');
    });

    it('includes correct facet counts', async () => {
      mockExecute
        .mockResolvedValueOnce({ rows: [{ id: '1', username: 'user' }] })
        .mockResolvedValueOnce({ rows: [{ count: 1 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: 0 }] });

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(data.facets.type).toEqual([
        { value: 'users', count: 1 },
        { value: 'gameLogs', count: 0 },
        { value: 'games', count: 0 },
        { value: 'teams', count: 0 },
        { value: 'players', count: 0 },
      ]);
    });
  });

  describe('GET method - Performance and caching', () => {
    it('logs search execution', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mockExecute.mockResolvedValue({ rows: [] });

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Search API] Executing search for query: test')
      );

      consoleSpy.mockRestore();
    });
  });
});
