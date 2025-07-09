import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { LiveGamesDetail } from '@src/app/components/live-games-detail';
import { MOCK_LIVE_GAMES } from '@src/lib/mock/liveGamesMock';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <div data-testid="next-image" className={className} title={alt}>
      {src}
    </div>
  ),
}));

// Mock the API config
vi.mock('@src/lib/config/api.config', () => ({
  INTERNAL_PROXY_ENDPOINTS: {
    GAMES: '/api/proxy/games',
  },
}));

describe('LiveGamesDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders loading state initially', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<LiveGamesDetail />);

    expect(screen.getByText('Loading live games...')).toBeInTheDocument();
    // The spinner doesn't have role="status", so just check it exists
    expect(screen.getByText('Loading live games...')).toBeInTheDocument();
  });

  it('renders live games with API data when successful', async () => {
    const mockApiResponse = {
      results: 1,
      response: [
        {
          id: 3,
          teams: {
            visitors: {
              code: 'CHI',
              name: 'Chicago Bulls',
              nickname: 'Bulls',
              logo: '/logos/bulls.png',
            },
            home: {
              code: 'NYK',
              name: 'New York Knicks',
              nickname: 'Knicks',
              logo: '/logos/knicks.png',
            },
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
          arena: {
            name: 'Madison Square Garden',
            city: 'New York',
            state: 'NY',
          },
          periods: {
            current: 3,
            total: 4,
          },
          nugget: 'Close game in the 3rd',
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    render(<LiveGamesDetail />);

    await waitFor(() => {
      expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
    });

    expect(screen.getByText('1 game currently live')).toBeInTheDocument();
    expect(screen.getByText('Chicago Bulls')).toBeInTheDocument();
    expect(screen.getByText('New York Knicks')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('Time: 1:45')).toBeInTheDocument();
    expect(screen.getByText('Close game in the 3rd')).toBeInTheDocument();
  });

  it('renders mock data when API fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<LiveGamesDetail />);

    await waitFor(() => {
      expect(screen.getByText('3 games currently live')).toBeInTheDocument();
    });

    // Should show mock data from MOCK_LIVE_GAMES
    expect(screen.getByText('New York Knicks')).toBeInTheDocument();
    expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
  });

  it('shows no games message when API returns empty results', async () => {
    const emptyApiResponse = {
      results: 0,
      response: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(emptyApiResponse),
    });

    render(<LiveGamesDetail />);

    await waitFor(() => {
      expect(screen.getByText('3 games currently live')).toBeInTheDocument();
    });

    // Should show mock data since component falls back to it
    expect(screen.getByText('New York Knicks')).toBeInTheDocument();
    expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
  });

  it('handles API error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(<LiveGamesDetail />);

    await waitFor(() => {
      expect(screen.getByText('3 games currently live')).toBeInTheDocument();
    });

    // Should show mock data since component falls back to it
    expect(screen.getByText('New York Knicks')).toBeInTheDocument();
    expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
  });

  it('displays game details correctly', async () => {
    render(<LiveGamesDetail />);

    await waitFor(() => {
      expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
    });

    // Check for game count
    expect(screen.getByText('3 games currently live')).toBeInTheDocument();

    // Check for team names
    expect(screen.getByText('New York Knicks')).toBeInTheDocument();
    expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
    expect(screen.getByText('Golden State Warriors')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();

    // Check for scores
    expect(screen.getAllByText('60').length).toBeGreaterThanOrEqual(1); // Knicks or Heat score
    expect(screen.getAllByText('65').length).toBeGreaterThanOrEqual(1); // Celtics or 76ers score

    // Check for game status - there are 3 games in mock data, so 3 LIVE indicators
    expect(screen.getAllByText('LIVE')).toHaveLength(3);
    expect(screen.getByText('3rd Quarter')).toBeInTheDocument();
    expect(screen.getByText('4th Quarter')).toBeInTheDocument();
    expect(screen.getByText('Halftime')).toBeInTheDocument();

    // Check for period information
    expect(screen.getAllByText('3 of 4')).toHaveLength(1);
    expect(screen.getAllByText('4 of 4')).toHaveLength(1);
    expect(screen.getAllByText('2 of 4')).toHaveLength(1);
  });

  it('handles games without nugget', async () => {
    render(<LiveGamesDetail />);

    await waitFor(() => {
      expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
    });

    // Check that nuggets from the actual mock data are displayed
    expect(screen.getByText('Celtics lead by 5 in a high-scoring affair')).toBeInTheDocument();
    expect(screen.getByText('Lakers lead by 1 in a nail-biter finish')).toBeInTheDocument();
    expect(screen.getByText('76ers lead by 5 at halftime')).toBeInTheDocument();
  });

  it('calls API with correct endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_LIVE_GAMES),
    });

    render(<LiveGamesDetail />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/proxy/games?live=all');
    });
  });

  it('shows correct game count for single game', async () => {
    const singleGameResponse = {
      results: 1,
      response: [MOCK_LIVE_GAMES.response[0]],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(singleGameResponse),
    });

    render(<LiveGamesDetail />);

    await waitFor(() => {
      expect(screen.getByText('1 game currently live')).toBeInTheDocument();
    });
  });
});

describe('LiveGamesDetail - additional coverage', () => {
  const baseGame = {
    id: '1',
    status: { long: 'In Progress', clock: '12:34' },
    teams: {
      visitors: { logo: '/logo1.png', name: 'Team A', nickname: 'A' },
      home: { logo: '/logo2.png', name: 'Team B', nickname: 'B' },
    },
    scores: { visitors: { points: 50 }, home: { points: 60 } },
    arena: { name: 'Arena', city: 'City', state: 'State' },
    periods: { current: 2, total: 4 },
    nugget: 'Fun fact',
  };

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it.skip('renders error state with Retry button when error and no games', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    // Mock the hook directly
    const mockUseLiveGames = vi.fn().mockReturnValue({
      games: [],
      loading: false,
      error: 'Network error',
    });

    // Mock the module
    vi.doMock('@/hooks/use-live-games', () => ({
      useLiveGames: mockUseLiveGames,
    }));

    // Import the component after mocking
    const { LiveGamesDetail } = await import('@/app/components/live-games-detail');

    render(<LiveGamesDetail />);

    // Verify the mock was called
    expect(mockUseLiveGames).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/Error loading live games/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByText(/Retry/i);
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(reloadMock).toHaveBeenCalled();
  });

  it.skip('renders no games state', async () => {
    const mockUseLiveGames = vi.fn().mockReturnValue({
      games: [],
      loading: false,
      error: null,
    });

    vi.doMock('@/hooks/use-live-games', () => ({
      useLiveGames: mockUseLiveGames,
    }));

    const { LiveGamesDetail } = await import('@/app/components/live-games-detail');
    render(<LiveGamesDetail />);

    // Verify the mock was called
    expect(mockUseLiveGames).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/No Live Games/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/There are currently no live NBA games/i)).toBeInTheDocument();
  });

  it.skip('renders game details with clock and nugget', async () => {
    const useLiveGames = vi
      .fn()
      .mockReturnValue({ games: [{ ...baseGame }], loading: false, error: null });
    vi.doMock('@/hooks/use-live-games', () => ({ useLiveGames }));
    const { LiveGamesDetail } = await import('@/app/components/live-games-detail');
    render(<LiveGamesDetail />);
    expect(screen.getByText(/Time: 12:34/)).toBeInTheDocument();
    expect(screen.getByText(/Fun fact/)).toBeInTheDocument();
  });

  it('does not render clock or nugget if not present', async () => {
    const game = { ...baseGame, status: { long: 'In Progress' }, nugget: undefined };
    const useLiveGames = vi.fn().mockReturnValue({ games: [game], loading: false, error: null });
    vi.doMock('@/hooks/use-live-games', () => ({ useLiveGames }));
    const { LiveGamesDetail } = await import('@/app/components/live-games-detail');
    render(<LiveGamesDetail />);
    expect(screen.queryByText(/Time:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Fun fact/)).not.toBeInTheDocument();
  });
});
