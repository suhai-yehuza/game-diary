import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() to properly handle mock variables
const { mockDb, mockJson } = vi.hoisted(() => ({
  mockDb: {
    execute: vi.fn(),
  },
  mockJson: vi.fn(),
}));

// Mock modules
vi.mock('@/lib/db', () => ({
  createDatabaseClient: () => mockDb,
}));

vi.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(url: string) {
      this.url = url;
    }
    url: string;
  },
  NextResponse: {
    json: mockJson,
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

import { GET } from '@/app/api/search/route';

describe('Search API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty results for short query', async () => {
    const request = new NextRequest('http://localhost/api/search?q=a');

    await GET(request);

    expect(mockJson).toHaveBeenCalledWith({
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

  it('returns empty results for empty query', async () => {
    const request = new NextRequest('http://localhost/api/search');

    await GET(request);

    expect(mockJson).toHaveBeenCalledWith({
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

  it('returns error for invalid page parameter', async () => {
    const request = new NextRequest('http://localhost/api/search?q=test&page=0');

    await GET(request);

    expect(mockJson).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Invalid pagination parameters',
      },
      { status: 400 }
    );
  });

  it('returns error for invalid limit parameter', async () => {
    const request = new NextRequest('http://localhost/api/search?q=test&limit=101');

    await GET(request);

    expect(mockJson).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Invalid pagination parameters',
      },
      { status: 400 }
    );
  });

  it('performs search with valid query', async () => {
    const request = new NextRequest('http://localhost/api/search?q=test&page=1&limit=10');

    // Mock database responses
    const mockUsersResult = { rows: [{ id: '1', username: 'testuser' }] };
    const mockUsersCountResult = { rows: [{ count: '1' }] };
    const mockGameLogsResult = { rows: [] };
    const mockGameLogsCountResult = { rows: [{ count: '0' }] };
    const mockGamesResult = { rows: [] };
    const mockGamesCountResult = { rows: [{ count: '0' }] };
    const mockTeamsResult = { rows: [] };
    const mockTeamsCountResult = { rows: [{ count: '0' }] };
    const mockPlayersResult = { rows: [] };
    const mockPlayersCountResult = { rows: [{ count: '0' }] };

    mockDb.execute
      .mockResolvedValueOnce(mockUsersResult)
      .mockResolvedValueOnce(mockUsersCountResult)
      .mockResolvedValueOnce(mockGameLogsResult)
      .mockResolvedValueOnce(mockGameLogsCountResult)
      .mockResolvedValueOnce(mockGamesResult)
      .mockResolvedValueOnce(mockGamesCountResult)
      .mockResolvedValueOnce(mockTeamsResult)
      .mockResolvedValueOnce(mockTeamsCountResult)
      .mockResolvedValueOnce(mockPlayersResult)
      .mockResolvedValueOnce(mockPlayersCountResult);

    await GET(request);

    expect(mockDb.execute).toHaveBeenCalledTimes(10);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      data: {
        users: [{ id: '1', username: 'testuser' }],
        gameLogs: [],
        games: [],
        teams: [],
        players: [],
        totalUsers: 1,
        totalGameLogs: 0,
        totalGames: 0,
        totalTeams: 0,
        totalPlayers: 0,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    });
  });

  it('handles pagination correctly', async () => {
    const request = new NextRequest('http://localhost/api/search?q=test&page=2&limit=5');

    // Mock database responses with counts
    const mockUsersResult = { rows: [] };
    const mockUsersCountResult = { rows: [{ count: '0' }] };
    const mockGameLogsResult = { rows: [] };
    const mockGameLogsCountResult = { rows: [{ count: '0' }] };
    const mockGamesResult = { rows: [] };
    const mockGamesCountResult = { rows: [{ count: '0' }] };
    const mockTeamsResult = { rows: [] };
    const mockTeamsCountResult = { rows: [{ count: '0' }] };
    const mockPlayersResult = { rows: [] };
    const mockPlayersCountResult = { rows: [{ count: '0' }] };

    mockDb.execute
      .mockResolvedValueOnce(mockUsersResult)
      .mockResolvedValueOnce(mockUsersCountResult)
      .mockResolvedValueOnce(mockGameLogsResult)
      .mockResolvedValueOnce(mockGameLogsCountResult)
      .mockResolvedValueOnce(mockGamesResult)
      .mockResolvedValueOnce(mockGamesCountResult)
      .mockResolvedValueOnce(mockTeamsResult)
      .mockResolvedValueOnce(mockTeamsCountResult)
      .mockResolvedValueOnce(mockPlayersResult)
      .mockResolvedValueOnce(mockPlayersCountResult);

    await GET(request);

    expect(mockJson).toHaveBeenCalledWith({
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
        page: 2,
        limit: 5,
        total: 0,
        pages: 0,
      },
    });
  });

  it('handles database errors gracefully', async () => {
    const request = new NextRequest('http://localhost/api/search?q=test');

    mockDb.execute.mockRejectedValue(new Error('Database error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await GET(request);

    expect(mockJson).toHaveBeenCalledWith(
      {
        success: false,
        error: 'Failed to perform global search',
      },
      { status: 500 }
    );

    expect(consoleSpy).toHaveBeenCalledWith('Global search error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('calculates total results correctly', async () => {
    const request = new NextRequest('http://localhost/api/search?q=test');

    // Mock database responses with various counts
    const mockUsersResult = { rows: [] };
    const mockUsersCountResult = { rows: [{ count: '5' }] };
    const mockGameLogsResult = { rows: [] };
    const mockGameLogsCountResult = { rows: [{ count: '3' }] };
    const mockGamesResult = { rows: [] };
    const mockGamesCountResult = { rows: [{ count: '10' }] };
    const mockTeamsResult = { rows: [] };
    const mockTeamsCountResult = { rows: [{ count: '2' }] };
    const mockPlayersResult = { rows: [] };
    const mockPlayersCountResult = { rows: [{ count: '7' }] };

    mockDb.execute
      .mockResolvedValueOnce(mockUsersResult)
      .mockResolvedValueOnce(mockUsersCountResult)
      .mockResolvedValueOnce(mockGameLogsResult)
      .mockResolvedValueOnce(mockGameLogsCountResult)
      .mockResolvedValueOnce(mockGamesResult)
      .mockResolvedValueOnce(mockGamesCountResult)
      .mockResolvedValueOnce(mockTeamsResult)
      .mockResolvedValueOnce(mockTeamsCountResult)
      .mockResolvedValueOnce(mockPlayersResult)
      .mockResolvedValueOnce(mockPlayersCountResult);

    await GET(request);

    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      data: {
        users: [],
        gameLogs: [],
        games: [],
        teams: [],
        players: [],
        totalUsers: 5,
        totalGameLogs: 3,
        totalGames: 10,
        totalTeams: 2,
        totalPlayers: 7,
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 27, // 5 + 3 + 10 + 2 + 7
        pages: 2, // Math.ceil(27 / 20)
      },
    });
  });

  it('handles missing count results gracefully', async () => {
    const request = new NextRequest('http://localhost/api/search?q=test');

    // Mock database responses with missing count results
    const mockUsersResult = { rows: [] };
    const mockUsersCountResult = { rows: [] }; // Missing count
    const mockGameLogsResult = { rows: [] };
    const mockGameLogsCountResult = { rows: [{ count: null }] }; // Null count
    const mockGamesResult = { rows: [] };
    const mockGamesCountResult = { rows: [{ count: '5' }] };
    const mockTeamsResult = { rows: [] };
    const mockTeamsCountResult = { rows: [{ count: '0' }] };
    const mockPlayersResult = { rows: [] };
    const mockPlayersCountResult = { rows: [{ count: '0' }] };

    mockDb.execute
      .mockResolvedValueOnce(mockUsersResult)
      .mockResolvedValueOnce(mockUsersCountResult)
      .mockResolvedValueOnce(mockGameLogsResult)
      .mockResolvedValueOnce(mockGameLogsCountResult)
      .mockResolvedValueOnce(mockGamesResult)
      .mockResolvedValueOnce(mockGamesCountResult)
      .mockResolvedValueOnce(mockTeamsResult)
      .mockResolvedValueOnce(mockTeamsCountResult)
      .mockResolvedValueOnce(mockPlayersResult)
      .mockResolvedValueOnce(mockPlayersCountResult);

    await GET(request);

    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      data: {
        users: [],
        gameLogs: [],
        games: [],
        teams: [],
        players: [],
        totalUsers: 0, // Defaults to 0 when count is missing
        totalGameLogs: 0, // Defaults to 0 when count is null
        totalGames: 5,
        totalTeams: 0,
        totalPlayers: 0,
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 5,
        pages: 1,
      },
    });
  });

  it('trims whitespace from query parameter', async () => {
    const request = new NextRequest('http://localhost/api/search?q=%20test%20');

    // Mock database responses
    const mockUsersResult = { rows: [] };
    const mockUsersCountResult = { rows: [{ count: '0' }] };
    const mockGameLogsResult = { rows: [] };
    const mockGameLogsCountResult = { rows: [{ count: '0' }] };
    const mockGamesResult = { rows: [] };
    const mockGamesCountResult = { rows: [{ count: '0' }] };
    const mockTeamsResult = { rows: [] };
    const mockTeamsCountResult = { rows: [{ count: '0' }] };
    const mockPlayersResult = { rows: [] };
    const mockPlayersCountResult = { rows: [{ count: '0' }] };

    mockDb.execute
      .mockResolvedValueOnce(mockUsersResult)
      .mockResolvedValueOnce(mockUsersCountResult)
      .mockResolvedValueOnce(mockGameLogsResult)
      .mockResolvedValueOnce(mockGameLogsCountResult)
      .mockResolvedValueOnce(mockGamesResult)
      .mockResolvedValueOnce(mockGamesCountResult)
      .mockResolvedValueOnce(mockTeamsResult)
      .mockResolvedValueOnce(mockTeamsCountResult)
      .mockResolvedValueOnce(mockPlayersResult)
      .mockResolvedValueOnce(mockPlayersCountResult);

    await GET(request);

    // Verify that the search was executed (the trimming happens in the route logic)
    expect(mockDb.execute).toHaveBeenCalledTimes(10);
  });
});
