import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { LiveGamesBanner } from '@src/app/components/live-games-banner';
import { MOCK_LIVE_GAMES } from '@src/lib/mock/liveGamesMock';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the API config
vi.mock('@/lib/config/api.config', () => ({
  INTERNAL_PROXY_ENDPOINTS: {
    GAMES: '/api/proxy/games',
  },
}));

// Mock the mock data
vi.mock('@/lib/mock/liveGamesMock', () => ({
  MOCK_LIVE_GAMES: {
    results: 2,
    response: [
      {
        id: 1,
        teams: {
          visitors: { code: 'LAL', name: 'Lakers', nickname: 'Lakers' },
          home: { code: 'BOS', name: 'Celtics', nickname: 'Celtics' },
        },
        scores: {
          visitors: { points: 105 },
          home: { points: 98 },
        },
        status: {
          clock: '2:30',
          halftime: false,
          long: '2nd Quarter',
        },
      },
      {
        id: 2,
        teams: {
          visitors: { code: 'GSW', name: 'Warriors', nickname: 'Warriors' },
          home: { code: 'MIA', name: 'Heat', nickname: 'Heat' },
        },
        scores: {
          visitors: { points: 89 },
          home: { points: 92 },
        },
        status: {
          clock: null,
          halftime: true,
          long: 'Halftime',
        },
      },
    ],
  },
}));

describe('LiveGamesBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders live games banner with mock data when API fails', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<LiveGamesBanner />);

    // Should show loading initially, then mock data
    await waitFor(() => {
      expect(screen.getByText('LIVE')).toBeInTheDocument();
    });

    expect(screen.getByText('2 Games Live')).toBeInTheDocument();
    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('BOS')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
    expect(screen.getByText('98')).toBeInTheDocument();
    expect(screen.getByText('2:30')).toBeInTheDocument();
    expect(screen.getByText('HALFTIME')).toBeInTheDocument();
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('renders live games banner with API data when successful', async () => {
    const mockApiResponse = {
      results: 1,
      response: [
        {
          id: 3,
          teams: {
            visitors: { code: 'CHI', name: 'Bulls', nickname: 'Bulls' },
            home: { code: 'NYK', name: 'Knicks', nickname: 'Knicks' },
          },
          scores: {
            visitors: { points: 78 },
            home: { points: 82 },
          },
          status: {
            clock: '1:45',
            halftime: false,
            long: '3rd Quarter',
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(<LiveGamesBanner />);

    await waitFor(() => {
      expect(screen.getByText('1 Game Live')).toBeInTheDocument();
    });

    expect(screen.getByText('CHI')).toBeInTheDocument();
    expect(screen.getByText('NYK')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('1:45')).toBeInTheDocument();
  });

  it('uses mock data when API returns empty results', async () => {
    const emptyApiResponse = {
      results: 0,
      response: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(emptyApiResponse),
    });

    render(<LiveGamesBanner />);

    await waitFor(() => {
      expect(screen.getByText('2 Games Live')).toBeInTheDocument();
    });

    // Should show mock data
    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('BOS')).toBeInTheDocument();
  });

  it('handles API response with invalid data structure', async () => {
    const invalidResponse = { invalid: 'data' };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(invalidResponse),
    });

    render(<LiveGamesBanner />);

    await waitFor(() => {
      expect(screen.getByText('2 Games Live')).toBeInTheDocument();
    });

    // Should fall back to mock data
    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('BOS')).toBeInTheDocument();
  });

  it('handles API error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(<LiveGamesBanner />);

    await waitFor(() => {
      expect(screen.getByText('2 Games Live')).toBeInTheDocument();
    });

    // Should fall back to mock data
    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('BOS')).toBeInTheDocument();
  });

  it('shows correct game count for single game', async () => {
    const singleGameResponse = {
      results: 1,
      response: [
        {
          id: 1,
          teams: {
            visitors: { code: 'LAL', name: 'Lakers', nickname: 'Lakers' },
            home: { code: 'BOS', name: 'Celtics', nickname: 'Celtics' },
          },
          scores: {
            visitors: { points: 105 },
            home: { points: 98 },
          },
          status: {
            clock: '2:30',
            halftime: false,
            long: '2nd Quarter',
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(singleGameResponse),
    });

    render(<LiveGamesBanner />);

    await waitFor(() => {
      expect(screen.getByText('1 Game Live')).toBeInTheDocument();
    });
  });

  it('limits displayed games to maximum of 3', async () => {
    const manyGamesResponse = {
      results: 5,
      response: [
        {
          id: 1,
          teams: { visitors: { code: 'LAL' }, home: { code: 'BOS' } },
          scores: { visitors: { points: 100 }, home: { points: 95 } },
          status: { clock: '2:30', halftime: false, long: '2nd Quarter' },
        },
        {
          id: 2,
          teams: { visitors: { code: 'GSW' }, home: { code: 'MIA' } },
          scores: { visitors: { points: 89 }, home: { points: 92 } },
          status: { clock: null, halftime: true, long: 'Halftime' },
        },
        {
          id: 3,
          teams: { visitors: { code: 'CHI' }, home: { code: 'NYK' } },
          scores: { visitors: { points: 78 }, home: { points: 82 } },
          status: { clock: '1:45', halftime: false, long: '3rd Quarter' },
        },
        {
          id: 4,
          teams: { visitors: { code: 'PHX' }, home: { code: 'DAL' } },
          scores: { visitors: { points: 110 }, home: { points: 108 } },
          status: { clock: '0:30', halftime: false, long: '4th Quarter' },
        },
        {
          id: 5,
          teams: { visitors: { code: 'LAC' }, home: { code: 'POR' } },
          scores: { visitors: { points: 85 }, home: { points: 87 } },
          status: { clock: '5:15', halftime: false, long: '2nd Quarter' },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(manyGamesResponse),
    });

    render(<LiveGamesBanner />);

    await waitFor(() => {
      expect(screen.getByText('5 Games Live')).toBeInTheDocument();
    });

    // Should show "+2 more" indicator
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('includes View All link with correct href', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<LiveGamesBanner />);

    await waitFor(() => {
      const viewAllLink = screen.getByText('View All');
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest('a')).toHaveAttribute('href', '/sports/live');
    });
  });

  it('calls API with correct endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_LIVE_GAMES),
    });

    render(<LiveGamesBanner />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/proxy/games?live=all');
    });
  });
});
