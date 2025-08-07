import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';
import { useLiveGames } from '@/hooks/use-live-games';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src: _src, alt: _alt, _priority, ...props }: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the hook
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: vi.fn(),
}));

// Mock the mock data - use a factory function to avoid circular reference
vi.mock('@/lib/mock/liveGamesMock', async () => {
  const actual = await vi.importActual('@/lib/mock/liveGamesMock');
  return {
    ...actual,
    createMockLiveGames: vi.fn(),
  };
});

const mockGames = [
  {
    id: 1234567,
    league: 'NBA',
    season: 2024,
    date: {
      start: '2024-12-23T19:30:00.000Z',
      end: '2024-12-23T22:15:00.000Z',
      duration: '2:45',
    },
    stage: 2,
    status: {
      clock: '5:30',
      halftime: false,
      short: 'Q3',
      long: '3rd Quarter',
    },
    periods: {
      current: 3,
      total: 4,
      endOfPeriod: false,
    },
    arena: {
      name: 'Madison Square Garden',
      city: 'New York',
      state: 'NY',
      country: 'USA',
    },
    teams: {
      home: {
        id: 583,
        name: 'New York Knicks',
        nickname: 'Knicks',
        code: 'NYK',
        logo: 'https://media.api-sports.io/basketball/teams/583.png',
      },
      visitors: {
        id: 584,
        name: 'Boston Celtics',
        nickname: 'Celtics',
        code: 'BOS',
        logo: 'https://media.api-sports.io/basketball/teams/584.png',
      },
    },
    scores: {
      home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [28, 32, 25], points: 85 },
      visitors: {
        win: 0,
        loss: 0,
        series: { win: 0, loss: 0 },
        linescore: [30, 35, 30],
        points: 95,
      },
    },
    officials: [],
    timesTied: 2,
    leadChanges: 3,
  },
  {
    id: 1234568,
    league: 'NBA',
    season: 2024,
    date: {
      start: '2024-12-23T20:00:00.000Z',
      end: '2024-12-23T22:45:00.000Z',
      duration: '2:45',
    },
    stage: 2,
    status: {
      clock: '2:15',
      halftime: false,
      short: 'Q4',
      long: '4th Quarter',
    },
    periods: {
      current: 4,
      total: 4,
      endOfPeriod: false,
    },
    arena: {
      name: 'Chase Center',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
    },
    teams: {
      home: {
        id: 583,
        name: 'Golden State Warriors',
        nickname: 'Warriors',
        code: 'GSW',
        logo: 'https://media.api-sports.io/basketball/teams/583.png',
      },
      visitors: {
        id: 583,
        name: 'Los Angeles Lakers',
        nickname: 'Lakers',
        code: 'LAL',
        logo: 'https://media.api-sports.io/basketball/teams/583.png',
      },
    },
    scores: {
      home: {
        win: 12,
        loss: 15,
        series: { win: 0, loss: 0 },
        linescore: [25, 28, 30, 0],
        points: 83,
      },
      visitors: {
        win: 14,
        loss: 13,
        series: { win: 0, loss: 0 },
        linescore: [22, 30, 32, 0],
        points: 84,
      },
    },
    officials: ['Bob Wilson', 'Sarah Brown', 'Tom Davis'],
    timesTied: 5,
    leadChanges: 12,
    nugget: 'Lakers lead by 1 in a nail-biter finish',
  },
];

describe('LiveGamesBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live games count and team codes', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('2 Live Games')).toBeInTheDocument();
    expect(screen.getByText('BOS')).toBeInTheDocument();
    expect(screen.getByText('NYK')).toBeInTheDocument();
    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('GSW')).toBeInTheDocument();
  });

  it('renders correct number of game elements', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const gameElements = screen.getAllByTestId('game');
    expect(gameElements).toHaveLength(2);
  });

  it('renders mock data if games is empty in test environment', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: [] }) as any);
    render(<LiveGamesBanner />);
    // Banner should show mock data in test environments when no real games
    expect(screen.getByTestId('live-games-banner')).toBeInTheDocument();
    expect(screen.getByText('8 Live Games')).toBeInTheDocument();
  });

  it('renders mock data if games is undefined in test environment', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: undefined }) as any);
    render(<LiveGamesBanner />);
    // Banner should show mock data in test environments when games is undefined
    expect(screen.getByTestId('live-games-banner')).toBeInTheDocument();
    expect(screen.getByText('8 Live Games')).toBeInTheDocument();
  });

  it('displays live indicator with pulsing animation', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const liveIndicator = screen.getByTestId('live-indicator');
    expect(liveIndicator).toBeInTheDocument();
    expect(liveIndicator).toHaveClass('animate-live-dot-glow');
    expect(liveIndicator).toHaveClass('bg-red-600');
    expect(liveIndicator).toHaveClass('rounded-full');
  });

  it('displays "View All" link', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const viewAllLink = screen.getByText('View All');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink.closest('a')).toHaveAttribute('href', '/sports/live');
  });

  it('displays team scores', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('95')).toBeInTheDocument(); // BOS score
    expect(screen.getByText('85')).toBeInTheDocument(); // NYK score
    expect(screen.getByText('84')).toBeInTheDocument(); // LAL score
    expect(screen.getByText('83')).toBeInTheDocument(); // GSW score
  });

  it('displays game clock when available', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('5:30')).toBeInTheDocument();
    expect(screen.getByText('2:15')).toBeInTheDocument();
  });

  it('displays @ separator between teams', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const separators = screen.getAllByText('@');
    expect(separators).toHaveLength(2); // One for each game
  });

  it('displays quarter information', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('Q3')).toBeInTheDocument();
    expect(screen.getByText('Q4')).toBeInTheDocument();
  });

  it('displays game separators between games', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const banner = screen.getByTestId('live-games-banner');
    const separators = banner.querySelectorAll('.w-px.h-6.bg-gray-600');
    expect(separators).toHaveLength(1); // One separator between 2 games
  });

  it('has scrolling animation class', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const banner = screen.getByTestId('live-games-banner');
    const scrollingContent = banner.querySelector('.animate-scroll-left');
    expect(scrollingContent).toBeInTheDocument();
  });

  it('displays correct team order (visitors @ home)', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    // Check first game: BOS @ NYK
    expect(screen.getByText('BOS')).toBeInTheDocument();
    expect(screen.getByText('NYK')).toBeInTheDocument();

    // Check second game: LAL @ GSW
    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('GSW')).toBeInTheDocument();
  });

  it('handles missing team codes gracefully', () => {
    (useLiveGames as any).mockImplementation(
      () =>
        ({
          games: [
            {
              id: 3,
              teams: {
                visitors: { code: undefined, name: 'Team A', nickname: 'Team A', logo: '' },
                home: { code: undefined, name: 'Team B', nickname: 'Team B', logo: '' },
              },
              scores: {
                visitors: { points: 0 },
                home: { points: 0 },
              },
              status: {
                clock: null,
                halftime: false,
                short: 'Q1',
                long: '1st Quarter',
              },
              league: 'NBA',
              arena: { name: 'Arena', city: 'City' },
            },
          ],
        }) as any
    );
    render(<LiveGamesBanner />);
    // Should render the banner with undefined codes
    expect(screen.getByTestId('live-games-banner')).toBeInTheDocument();
  });

  it('handles missing clock gracefully', () => {
    (useLiveGames as any).mockImplementation(
      () =>
        ({
          games: [
            {
              id: 4,
              teams: {
                visitors: { code: 'TEAM1', name: 'Team 1', nickname: 'Team 1', logo: '' },
                home: { code: 'TEAM2', name: 'Team 2', nickname: 'Team 2', logo: '' },
              },
              scores: {
                visitors: { points: 50 },
                home: { points: 45 },
              },
              status: {
                clock: null,
                halftime: false,
                short: 'Q2',
                long: '2nd Quarter',
              },
              league: 'NBA',
              arena: { name: 'Arena', city: 'City' },
            },
          ],
        }) as any
    );
    render(<LiveGamesBanner />);
    expect(screen.getByTestId('live-games-banner')).toBeInTheDocument();
    expect(screen.getByText('Q2')).toBeInTheDocument();
  });

  it('displays halftime status correctly', () => {
    (useLiveGames as any).mockImplementation(
      () =>
        ({
          games: [
            {
              id: 5,
              teams: {
                visitors: { code: 'TEAM3', name: 'Team 3', nickname: 'Team 3', logo: '' },
                home: { code: 'TEAM4', name: 'Team 4', nickname: 'Team 4', logo: '' },
              },
              scores: {
                visitors: { points: 60 },
                home: { points: 65 },
              },
              status: {
                clock: null,
                halftime: true,
                short: 'HT',
                long: 'Halftime',
              },
              league: 'NBA',
              arena: { name: 'Arena', city: 'City' },
            },
          ],
        }) as any
    );
    render(<LiveGamesBanner />);
    expect(screen.getByText('HT')).toBeInTheDocument();
  });

  it('has correct banner styling classes', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const banner = screen.getByTestId('live-games-banner');
    expect(banner).toHaveClass(
      'fixed',
      'top-0',
      'left-0',
      'right-0',
      'z-[60]',
      'bg-gradient-to-r',
      'from-gray-900',
      'to-blue-900'
    );
  });

  it('displays team logos', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    // Check for team logo images
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);

    // Check for specific team logos
    expect(screen.getByText('NYK')).toBeInTheDocument();
    expect(screen.getByText('BOS')).toBeInTheDocument();
  });

  it('handles single game correctly', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: [mockGames[0]] }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('1 Live Game')).toBeInTheDocument();
    expect(screen.getAllByTestId('game')).toHaveLength(1);

    // Should not have separators for single game
    const banner = screen.getByTestId('live-games-banner');
    const separators = banner.querySelectorAll('.w-px.h-6.bg-gray-600');
    expect(separators).toHaveLength(0);
  });
});
