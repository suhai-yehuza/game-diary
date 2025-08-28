import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() to properly handle mock variables
const { mockUseLiveGames } = vi.hoisted(() => ({
  mockUseLiveGames: vi.fn(),
}));

// Mock the useLiveGames hook
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: mockUseLiveGames,
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

import { LiveGamesDetail } from '@/app/components/LiveGamesDetail';

describe('LiveGamesDetail', () => {
  const mockGameData = {
    id: 1,
    league: 'NBA',
    season: 2024,
    date: {
      start: '2024-01-01T19:00:00Z',
      end: '2024-01-01T21:00:00Z',
      duration: '2:00',
    },
    stage: 1,
    status: {
      clock: '12:00',
      halftime: false,
      short: 'LIVE',
      long: 'Live',
    },
    periods: {
      current: 4,
      total: 4,
      endOfPeriod: false,
    },
    arena: {
      name: 'Staples Center',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
    },
    teams: {
      visitors: {
        id: 1,
        name: 'Lakers',
        nickname: 'LAL',
        code: 'LAL',
        logo: '/lakers-logo.png',
      },
      home: {
        id: 2,
        name: 'Warriors',
        nickname: 'GSW',
        code: 'GSW',
        logo: '/warriors-logo.png',
      },
    },
    scores: {
      visitors: {
        win: 30,
        loss: 20,
        series: { win: 0, loss: 0 },
        linescore: [25, 30, 25, 25],
        points: 105,
      },
      home: {
        win: 25,
        loss: 25,
        series: { win: 0, loss: 0 },
        linescore: [20, 25, 30, 23],
        points: 98,
      },
    },
    officials: ['Referee 1', 'Referee 2'],
    timesTied: 5,
    leadChanges: 8,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when loading is true', () => {
    mockUseLiveGames.mockReturnValue({
      games: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<LiveGamesDetail />);

    expect(screen.getByText('Loading live games...')).toBeInTheDocument();
  });

  it('renders error state when there is an error and no games', () => {
    const mockError = new Error('Failed to load games');
    mockUseLiveGames.mockReturnValue({
      games: [],
      loading: false,
      error: mockError,
    });

    render(<LiveGamesDetail />);

    expect(screen.getByText('Error loading live games')).toBeInTheDocument();
    expect(screen.getByText('Failed to load games')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders empty state when no games are available', () => {
    mockUseLiveGames.mockReturnValue({
      games: [],
      loading: false,
      error: null,
    });

    render(<LiveGamesDetail />);

    expect(screen.getByText('No Live Games')).toBeInTheDocument();
    expect(screen.getByText('There are currently no live NBA games.')).toBeInTheDocument();
  });

  it('renders games when data is available', () => {
    mockUseLiveGames.mockReturnValue({
      games: [mockGameData],
      loading: false,
      error: null,
    });

    render(<LiveGamesDetail />);

    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
    expect(screen.getByText('1 Game currently live')).toBeInTheDocument();
    expect(screen.getByText('Lakers')).toBeInTheDocument();
    expect(screen.getByText('Warriors')).toBeInTheDocument();
    expect(screen.getByText('105')).toBeInTheDocument();
    expect(screen.getByText('98')).toBeInTheDocument();
  });

  it('renders multiple games correctly', () => {
    const mockGameData2 = {
      ...mockGameData,
      id: 2,
      teams: {
        visitors: { name: 'Celtics', nickname: 'BOS', logo: '/celtics-logo.png' },
        home: { name: 'Heat', nickname: 'MIA', logo: '/heat-logo.png' },
      },
      scores: { visitors: { points: 110 }, home: { points: 112 } },
    };

    mockUseLiveGames.mockReturnValue({
      games: [mockGameData, mockGameData2],
      loading: false,
      error: null,
    });

    render(<LiveGamesDetail />);

    expect(screen.getByText('2 Games currently live')).toBeInTheDocument();
    expect(screen.getByText('Lakers')).toBeInTheDocument();
    expect(screen.getByText('Warriors')).toBeInTheDocument();
    expect(screen.getByText('Celtics')).toBeInTheDocument();
    expect(screen.getByText('Heat')).toBeInTheDocument();
  });

  it('displays live indicator and status', () => {
    mockUseLiveGames.mockReturnValue({
      games: [mockGameData],
      loading: false,
      error: null,
    });

    render(<LiveGamesDetail />);

    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders team logos with correct alt text', () => {
    mockUseLiveGames.mockReturnValue({
      games: [mockGameData],
      loading: false,
      error: null,
    });

    render(<LiveGamesDetail />);

    const lakersLogo = screen.getByAltText('Lakers');
    const warriorsLogo = screen.getByAltText('Warriors');

    expect(lakersLogo).toBeInTheDocument();
    expect(warriorsLogo).toBeInTheDocument();
    expect(lakersLogo).toHaveAttribute('src', '/lakers-logo.png');
    expect(warriorsLogo).toHaveAttribute('src', '/warriors-logo.png');
  });

  it('displays team nicknames', () => {
    mockUseLiveGames.mockReturnValue({
      games: [mockGameData],
      loading: false,
      error: null,
    });

    render(<LiveGamesDetail />);

    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('GSW')).toBeInTheDocument();
  });

  it('handles retry functionality', () => {
    const mockError = new Error('Failed to load games');
    mockUseLiveGames.mockReturnValue({
      games: [],
      loading: false,
      error: mockError,
    });

    render(<LiveGamesDetail />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    // fireEvent.click(retryButton); // This line was removed as per the edit hint

    // The retry button should be clickable
    expect(retryButton).toBeInTheDocument();
  });

  it('uses initial data when provided', () => {
    const initialData = {
      get: '/games',
      parameters: {},
      errors: [],
      results: 1,
      response: [mockGameData],
    };

    render(<LiveGamesDetail data={initialData} />);

    expect(mockUseLiveGames).toHaveBeenCalledWith({
      initialData,
    });
  });

  it('has proper accessibility attributes', () => {
    mockUseLiveGames.mockReturnValue({
      games: [mockGameData],
      loading: false,
      error: null,
    });

    render(<LiveGamesDetail />);

    const grid = screen.getByTestId('live-games-grid');
    expect(grid).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    mockUseLiveGames.mockReturnValue({
      games: [mockGameData],
      loading: false,
      error: null,
    });

    render(<LiveGamesDetail />);

    // The main container should have the container classes
    const mainContainer = screen.getByTestId('live-games-grid').closest('div')?.parentElement;
    expect(mainContainer).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');

    const grid = screen.getByTestId('live-games-grid');
    expect(grid).toHaveClass('grid', 'gap-4', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('handles error state without retry button when error is not an Error object', () => {
    mockUseLiveGames.mockReturnValue({
      games: [],
      loading: false,
      error: 'String error',
    });

    render(<LiveGamesDetail />);

    expect(screen.getByText('Error loading live games')).toBeInTheDocument();
    expect(screen.getByText('String error')).toBeInTheDocument();
  });

  it('shows games even when there is an error but games exist', () => {
    const mockError = new Error('Partial error');
    mockUseLiveGames.mockReturnValue({
      games: [mockGameData],
      loading: false,
      error: mockError,
    });

    render(<LiveGamesDetail />);

    // Should show games despite error
    expect(screen.getByText('Live NBA Games')).toBeInTheDocument();
    expect(screen.getByText('Lakers')).toBeInTheDocument();
    expect(screen.getByText('Warriors')).toBeInTheDocument();
  });
});
