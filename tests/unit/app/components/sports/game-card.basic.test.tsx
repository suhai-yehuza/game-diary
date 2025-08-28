import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { GameCard } from '@/app/components/sports/game-card';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Calendar: ({ className }: any) => (
    <div data-testid="calendar" className={className}>
      Calendar
    </div>
  ),
  Clock: ({ className }: any) => (
    <div data-testid="clock" className={className}>
      Clock
    </div>
  ),
  Building2: ({ className }: any) => (
    <div data-testid="building-2" className={className}>
      Building2
    </div>
  ),
  Trophy: ({ className }: any) => (
    <div data-testid="trophy" className={className}>
      Trophy
    </div>
  ),
  Star: ({ className }: any) => (
    <div data-testid="star" className={className}>
      Star
    </div>
  ),
  CalendarDays: ({ className }: any) => (
    <div data-testid="calendar-days" className={className}>
      CalendarDays
    </div>
  ),
  X: ({ className }: any) => (
    <div data-testid="x" className={className}>
      X
    </div>
  ),
}));

// Mock Card components
vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

describe('GameCard Component', () => {
  const mockGame = {
    id: 1,
    league: 'NBA',
    season: 2024,
    stage: 1,
    date: {
      start: '2024-01-15T19:30:00.000Z',
      end: '2024-01-15T22:00:00.000Z',
      duration: '2:30',
    },
    status: {
      clock: '00:00',
      halftime: false,
      short: 'FT',
      long: 'Finished',
    },
    periods: {
      current: 4,
      total: 4,
      endOfPeriod: true,
    },
    teams: {
      home: {
        id: 1,
        name: 'Los Angeles Lakers',
        nickname: 'Lakers',
        code: 'LAL',
        logo: 'https://example.com/lakers.png',
      },
      visitors: {
        id: 2,
        name: 'Golden State Warriors',
        nickname: 'Warriors',
        code: 'GSW',
        logo: 'https://example.com/warriors.png',
      },
    },
    scores: {
      home: {
        win: 25,
        loss: 15,
        series: {
          win: 0,
          loss: 0,
        },
        linescore: [28, 32, 30, 25],
        points: 115,
      },
      visitors: {
        win: 20,
        loss: 20,
        series: {
          win: 0,
          loss: 0,
        },
        linescore: [25, 30, 28, 26],
        points: 109,
      },
    },
    arena: {
      name: 'Crypto.com Arena',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
    },
    officials: ['John Smith', 'Jane Doe'],
    timesTied: 3,
    leadChanges: 8,
    nugget: 'Lakers win in overtime',
  };

  const mockLiveGame = {
    id: 2,
    league: 'NBA',
    season: 2024,
    stage: 1,
    date: {
      start: '2024-01-15T19:30:00.000Z',
      end: '2024-01-15T22:00:00.000Z',
      duration: '2:30',
    },
    status: {
      clock: '08:45',
      halftime: false,
      short: 'Q3',
      long: '3rd Quarter',
    },
    periods: {
      current: 3,
      total: 4,
      endOfPeriod: false,
    },
    teams: {
      home: {
        id: 3,
        name: 'Boston Celtics',
        nickname: 'Celtics',
        code: 'BOS',
        logo: 'https://example.com/celtics.png',
      },
      visitors: {
        id: 4,
        name: 'Miami Heat',
        nickname: 'Heat',
        code: 'MIA',
        logo: 'https://example.com/heat.png',
      },
    },
    scores: {
      home: {
        win: 30,
        loss: 10,
        series: {
          win: 0,
          loss: 0,
        },
        linescore: [25, 28, 30],
        points: 83,
      },
      visitors: {
        win: 25,
        loss: 15,
        series: {
          win: 0,
          loss: 0,
        },
        linescore: [22, 25, 33],
        points: 80,
      },
    },
    arena: {
      name: 'TD Garden',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
    },
    officials: ['Mike Johnson', 'Sarah Wilson'],
    timesTied: 2,
    leadChanges: 5,
  };

  const mockScheduledGame = {
    id: 3,
    league: 'NBA',
    season: 2024,
    stage: 1,
    date: {
      start: '2024-01-16T19:30:00.000Z',
      end: '2024-01-16T22:00:00.000Z',
      duration: '2:30',
    },
    status: {
      clock: undefined,
      halftime: false,
      short: 'NS',
      long: 'Not Started',
    },
    periods: {
      current: 0,
      total: 4,
      endOfPeriod: false,
    },
    teams: {
      home: {
        id: 5,
        name: 'Chicago Bulls',
        nickname: 'Bulls',
        code: 'CHI',
        logo: 'https://example.com/bulls.png',
      },
      visitors: {
        id: 6,
        name: 'Detroit Pistons',
        nickname: 'Pistons',
        code: 'DET',
        logo: 'https://example.com/pistons.png',
      },
    },
    scores: {
      home: {
        win: 15,
        loss: 25,
        series: {
          win: 0,
          loss: 0,
        },
        linescore: [],
        points: 0,
      },
      visitors: {
        win: 10,
        loss: 30,
        series: {
          win: 0,
          loss: 0,
        },
        linescore: [],
        points: 0,
      },
    },
    arena: {
      name: 'United Center',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
    },
    officials: ['Tom Brown', 'Lisa Davis'],
    timesTied: 0,
    leadChanges: 0,
  };

  it('renders game information correctly', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Golden State Warriors')).toBeInTheDocument();
    expect(screen.getByText('115')).toBeInTheDocument();
    expect(screen.getByText('109')).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();
  });

  it('displays arena information', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Crypto.com Arena')).toBeInTheDocument();
  });

  it('shows correct status for finished game', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Finished')).toBeInTheDocument();
    expect(screen.getAllByTestId('trophy')).toHaveLength(2); // One for season, one for status
  });

  it('shows correct status for live game', () => {
    render(<GameCard game={mockLiveGame} />);

    expect(screen.getByText('3rd Quarter')).toBeInTheDocument();
    expect(screen.getByTestId('star')).toBeInTheDocument();
  });

  it('shows correct status for scheduled game', () => {
    render(<GameCard game={mockScheduledGame} />);

    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-days')).toBeInTheDocument();
  });

  it('displays team names correctly', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Golden State Warriors')).toBeInTheDocument();
  });

  it('shows total scores for finished games', () => {
    render(<GameCard game={mockGame} />);

    expect(screen.getByText('115')).toBeInTheDocument();
    expect(screen.getByText('109')).toBeInTheDocument();
  });

  it('shows current total scores for live games', () => {
    render(<GameCard game={mockLiveGame} />);

    expect(screen.getByText('83')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('shows zero for scheduled games without scores', () => {
    render(<GameCard game={mockScheduledGame} />);

    expect(screen.getAllByText('0')).toHaveLength(2); // Both home and away scores
  });

  it('displays game date correctly', () => {
    render(<GameCard game={mockGame} />);

    // The exact format may vary based on locale, but should contain date info
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
    expect(screen.getByText(/Mon, Jan 15, 2024/)).toBeInTheDocument();
  });

  it('displays game time correctly', () => {
    render(<GameCard game={mockGame} />);

    // Should display a time with timezone information
    // Look for time format: HH:MM AM/PM TZ (e.g., "11:30 AM PST", "7:30 PM UTC")
    const timeRegex = /\d{1,2}:\d{2}\s*(AM|PM)\s+\w{3}/;
    expect(screen.getByText(timeRegex)).toBeInTheDocument();
  });

  it('handles missing arena information gracefully', () => {
    const gameWithoutArena = {
      ...mockGame,
      arena: {
        name: 'Unknown Arena',
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'Unknown Country',
      },
    };

    render(<GameCard game={gameWithoutArena} />);

    expect(screen.queryByText('Crypto.com Arena')).not.toBeInTheDocument();
  });

  it('handles missing team logos gracefully', () => {
    const gameWithoutLogos = {
      ...mockGame,
      teams: {
        home: { ...mockGame.teams.home, logo: 'https://example.com/default-logo.png' },
        visitors: { ...mockGame.teams.visitors, logo: 'https://example.com/default-logo.png' },
      },
    };

    render(<GameCard game={gameWithoutLogos} />);

    // Should still render team names
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Golden State Warriors')).toBeInTheDocument();
  });
});
