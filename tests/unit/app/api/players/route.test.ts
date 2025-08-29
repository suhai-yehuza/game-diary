import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GET } from '@/app/api/players/route';
import { cache } from '@/lib/cache';
import {
  getPlayers,
  getUniqueColleges,
  getUniqueCountries,
  getUniquePositions,
} from '@/lib/db/services/players.service';
import { errorHandlers } from '@/lib/utils/error-handler';

// Mock the cache
vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock the players service
vi.mock('@/lib/db/services/players.service', () => ({
  getPlayers: vi.fn(),
  getUniqueColleges: vi.fn(),
  getUniqueCountries: vi.fn(),
  getUniquePositions: vi.fn(),
}));

vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

describe('GET /api/players', () => {
  const mockRequest = new NextRequest('http://localhost:3000/api/players');

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up cache to return null (cache miss) by default
    (cache.get as any).mockResolvedValue(null);
    (cache.set as any).mockResolvedValue(undefined);
  });

  it('should return players with default parameters', async () => {
    const mockPlayers = [
      {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        team: 'Lakers',
        college: 'Kentucky',
        affiliation: 'NBA',
      },
      {
        id: 2,
        firstname: 'Jane',
        lastname: 'Smith',
        team: 'Celtics',
        college: 'Duke',
        affiliation: 'NBA',
      },
    ];
    const mockTotal = 2;

    vi.mocked(getPlayers).mockResolvedValue({
      players: mockPlayers,
      total: mockTotal,
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(getPlayers).toHaveBeenCalledWith({
      searchTerm: undefined,
      positionFilter: undefined,
      teamFilter: undefined,
      collegeFilter: undefined,
      countryFilter: undefined,
      sortBy: 'name',
      sortDirection: 'asc',
      limit: 50,
      offset: 0,
    });

    expect(data).toMatchObject({
      get: 'players',
      parameters: {
        league: 'standard',
        season: '2024',
      },
      errors: [],
      results: mockTotal,
      response: mockPlayers,
    });
  });

  it('should handle search parameter', async () => {
    const searchRequest = new NextRequest('http://localhost:3000/api/players?search=lebron');

    vi.mocked(getPlayers).mockResolvedValue({
      players: [],
      total: 0,
    });

    const response = await GET(searchRequest);
    const data = await response.json();

    expect(getPlayers).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerm: 'lebron',
      })
    );

    expect(data).toMatchObject({
      parameters: expect.objectContaining({
        search: 'lebron',
      }),
    });
  });

  it('should handle filter parameters', async () => {
    const filterRequest = new NextRequest(
      'http://localhost:3000/api/players?position=PG&team=Lakers&college=Kentucky&country=USA'
    );

    vi.mocked(getPlayers).mockResolvedValue({
      players: [],
      total: 0,
    });

    const response = await GET(filterRequest);
    const data = await response.json();

    expect(getPlayers).toHaveBeenCalledWith(
      expect.objectContaining({
        positionFilter: 'PG',
        teamFilter: 'Lakers',
        collegeFilter: 'Kentucky',
        countryFilter: 'USA',
      })
    );

    expect(data).toMatchObject({
      parameters: expect.objectContaining({
        position: 'PG',
        team: 'Lakers',
        college: 'Kentucky',
      }),
    });
  });

  it('should handle pagination parameters', async () => {
    const paginationRequest = new NextRequest('http://localhost:3000/api/players?page=2&limit=10');

    vi.mocked(getPlayers).mockResolvedValue({
      players: [],
      total: 0,
    });

    const response = await GET(paginationRequest);
    const _data = await response.json();

    expect(getPlayers).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        offset: 10, // (page 2 - 1) * limit 10
      })
    );
  });

  it('should handle invalid pagination parameters gracefully', async () => {
    const invalidRequest = new NextRequest(
      'http://localhost:3000/api/players?page=invalid&limit=invalid'
    );

    vi.mocked(getPlayers).mockResolvedValue({
      players: [],
      total: 0,
    });

    const response = await GET(invalidRequest);
    const _data = await response.json();

    expect(getPlayers).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 50, // Default value
        offset: 0, // Default value
      })
    );
  });

  it('should handle sort parameters', async () => {
    const sortRequest = new NextRequest(
      'http://localhost:3000/api/players?sortBy=team&sortDirection=desc'
    );

    vi.mocked(getPlayers).mockResolvedValue({
      players: [],
      total: 0,
    });

    const response = await GET(sortRequest);
    const _data = await response.json();

    expect(getPlayers).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'team',
        sortDirection: 'desc',
      })
    );
  });

  it('should return filter options when options=true', async () => {
    const optionsRequest = new NextRequest('http://localhost:3000/api/players?options=true');

    const mockColleges = ['Kentucky', 'Duke', 'UNC'];
    const mockCountries = ['USA', 'Canada', 'Australia'];
    const mockPositions = ['PG', 'SG', 'SF', 'PF', 'C'];

    vi.mocked(getUniqueColleges).mockResolvedValue(mockColleges);
    vi.mocked(getUniqueCountries).mockResolvedValue(mockCountries);
    vi.mocked(getUniquePositions).mockResolvedValue(mockPositions);

    const response = await GET(optionsRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(getUniqueColleges).toHaveBeenCalled();
    expect(getUniqueCountries).toHaveBeenCalled();
    expect(getUniquePositions).toHaveBeenCalled();

    expect(data).toMatchObject({
      colleges: mockColleges,
      countries: mockCountries,
      positions: mockPositions,
    });
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(getPlayers).mockRejectedValue(new Error('Database error'));

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(errorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
      component: 'Players API',
      action: 'GET /api/players',
      requestId: undefined,
    });

    expect(data).toMatchObject({
      get: 'players',
      parameters: {},
      errors: ['Internal server error'],
      results: 0,
      response: [],
    });
  });

  it('should include request ID in error handling when available', async () => {
    const requestWithId = new NextRequest('http://localhost:3000/api/players', {
      headers: {
        'x-request-id': 'test-request-id',
      },
    });

    vi.mocked(getPlayers).mockRejectedValue(new Error('Database error'));

    await GET(requestWithId);

    expect(errorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
      component: 'Players API',
      action: 'GET /api/players',
      requestId: 'test-request-id',
    });
  });
});
