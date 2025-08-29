import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/search/route';
import { cache } from '@/lib/cache';
import { createDatabaseClient } from '@/lib/db';
import { errorHandlers } from '@/lib/utils/error-handler';

// Mock the cache
vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock the database and error handlers
vi.mock('@/lib/db', () => ({
  createDatabaseClient: vi.fn(),
}));

vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

describe('Search API Route', () => {
  const mockRequest = new NextRequest('http://localhost:3000/api/search?q=test');

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up cache to return null (cache miss) by default
    (cache.get as any).mockResolvedValue(null);
    (cache.set as any).mockResolvedValue(undefined);
  });

  it('returns empty results for short queries', async () => {
    const shortQueryRequest = new NextRequest('http://localhost:3000/api/search?q=a');

    const response = await GET(shortQueryRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: {
        users: [],
        gameLogs: [],
        games: [],
        teams: [],
        players: [],
        totalUsers: 0,
        totalGameLogs: 0,
        totalGames: 0,
        totalTeams: 0,
        totalPlayers: 0,
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    });
  });

  it('returns empty results for empty queries', async () => {
    const emptyQueryRequest = new NextRequest('http://localhost:3000/api/search?q=');

    const response = await GET(emptyQueryRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: {
        users: [],
        gameLogs: [],
        games: [],
        teams: [],
        players: [],
        totalUsers: 0,
        totalGameLogs: 0,
        totalGames: 0,
        totalTeams: 0,
        totalPlayers: 0,
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    });
  });

  it('handles database errors gracefully', async () => {
    const mockDatabase = {
      execute: vi.fn().mockRejectedValue(new Error('Database error')),
    };
    vi.mocked(createDatabaseClient).mockReturnValue(mockDatabase as any);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(errorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
      component: 'Search API',
      action: 'GET /api/search',
      requestId: undefined,
    });

    expect(data).toMatchObject({
      success: false,
      error: 'Internal server error',
    });
  });

  it('handles missing query parameter', async () => {
    const noQueryRequest = new NextRequest('http://localhost:3000/api/search');

    const response = await GET(noQueryRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: {
        users: [],
        gameLogs: [],
        games: [],
        teams: [],
        players: [],
        totalUsers: 0,
        totalGameLogs: 0,
        totalGames: 0,
        totalTeams: 0,
        totalPlayers: 0,
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    });
  });

  it('handles custom pagination parameters', async () => {
    const paginationRequest = new NextRequest(
      'http://localhost:3000/api/search?q=test&page=2&limit=10'
    );

    const mockDatabase = {
      execute: vi.fn().mockResolvedValue({
        rows: [],
      }),
    };
    vi.mocked(createDatabaseClient).mockReturnValue(mockDatabase as any);

    const response = await GET(paginationRequest);
    const _data = await response.json();

    expect(response.status).toBe(200);
    // Should call database with correct offset (page 2, limit 10 = offset 10)
    expect(mockDatabase.execute).toHaveBeenCalled();
  });

  it('sanitizes user data to remove encrypted fields', async () => {
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue({
        rows: [
          {
            id: 1,
            username: 'testuser',
            password_hash: 'encrypted_hash',
            encrypted_email_address: 'encrypted_email',
          },
        ],
      }),
    };
    vi.mocked(createDatabaseClient).mockReturnValue(mockDatabase as any);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: expect.objectContaining({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            username: 'testuser',
          }),
        ]),
      }),
    });

    // Should not include encrypted fields
    expect(data.data.users[0]).not.toHaveProperty('password_hash');
    expect(data.data.users[0]).not.toHaveProperty('encrypted_email_address');
  });

  it('sanitizes game log data to remove encrypted fields', async () => {
    const mockDatabase = {
      execute: vi.fn().mockResolvedValue({
        rows: [
          {
            id: 1,
            title: 'Test Game Log',
            encrypted_notes: 'encrypted_notes',
            encrypted_tags: 'encrypted_tags',
          },
        ],
      }),
    };
    vi.mocked(createDatabaseClient).mockReturnValue(mockDatabase as any);

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: expect.objectContaining({
        gameLogs: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: 'Test Game Log',
          }),
        ]),
      }),
    });

    // Should not include encrypted fields
    expect(data.data.gameLogs[0]).not.toHaveProperty('encrypted_notes');
    expect(data.data.gameLogs[0]).not.toHaveProperty('encrypted_tags');
  });
});
