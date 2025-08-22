import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameSearchResult } from '@/app/components/search/GameSearchResult';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('GameSearchResult', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  const mockGame = {
    id: '123',
    type: 'game' as const,
    date: '2023-01-15T10:30:00Z',
    created_at: '2023-01-15T10:30:00Z',
    home_team_nickname: 'Warriors',
    away_team_nickname: 'Lakers',
    home_team_name: 'Golden State Warriors',
    away_team_name: 'Los Angeles Lakers',
    home_team_score: 110,
    away_team_score: 105,
    home_team_city: 'San Francisco',
    status: 'Final',
    average_rating: 4.2,
    total_ratings: 15,
  };

  it('renders game with team nicknames', () => {
    render(<GameSearchResult game={mockGame} />);

    expect(screen.getByText('Lakers @ Warriors')).toBeInTheDocument();
    expect(screen.getByText('Game')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('105 - 110')).toBeInTheDocument();
    expect(screen.getByText('4.2/5 (15 ratings)')).toBeInTheDocument();
    expect(screen.getByText('final')).toBeInTheDocument();
    expect(screen.getByText('• San Francisco')).toBeInTheDocument();
  });

  it('renders game with team names when nicknames not available', () => {
    const gameWithoutNicknames = {
      ...mockGame,
      home_team_nickname: undefined,
      away_team_nickname: undefined,
    };

    render(<GameSearchResult game={gameWithoutNicknames} />);

    expect(screen.getByText('Los Angeles Lakers @ Golden State Warriors')).toBeInTheDocument();
  });

  it('renders game with unknown teams when names not available', () => {
    const gameWithoutNames = {
      ...mockGame,
      home_team_nickname: undefined,
      away_team_nickname: undefined,
      home_team_name: undefined,
      away_team_name: undefined,
    };

    render(<GameSearchResult game={gameWithoutNames} />);

    expect(screen.getByText('Unknown Team @ Unknown Team')).toBeInTheDocument();
  });

  it('renders game without scores', () => {
    const gameWithoutScores = {
      ...mockGame,
      home_team_score: undefined,
      away_team_score: undefined,
    };

    render(<GameSearchResult game={gameWithoutScores} />);

    expect(screen.queryByText('105 - 110')).not.toBeInTheDocument();
  });

  it('renders game without rating', () => {
    const gameWithoutRating = {
      ...mockGame,
      average_rating: 0,
    };

    render(<GameSearchResult game={gameWithoutRating} />);

    expect(screen.queryByText(/\/5/)).not.toBeInTheDocument();
  });

  it('renders game with string rating', () => {
    const gameWithStringRating = {
      ...mockGame,
      average_rating: '3.8',
    };

    render(<GameSearchResult game={gameWithStringRating} />);

    expect(screen.getByText('3.8/5 (15 ratings)')).toBeInTheDocument();
  });

  it('renders game without date', () => {
    const gameWithoutDate = {
      ...mockGame,
      date: undefined,
    };

    render(<GameSearchResult game={gameWithoutDate} />);

    expect(screen.getByText('Unknown Date')).toBeInTheDocument();
  });

  it('renders game without status', () => {
    const gameWithoutStatus = {
      ...mockGame,
      status: undefined,
    };

    render(<GameSearchResult game={gameWithoutStatus} />);

    expect(screen.getByText('Unknown Status')).toBeInTheDocument();
  });

  it('renders game without city', () => {
    const gameWithoutCity = {
      ...mockGame,
      home_team_city: undefined,
    };

    render(<GameSearchResult game={gameWithoutCity} />);

    expect(screen.queryByText(/•/)).not.toBeInTheDocument();
  });

  it('navigates to game page when clicked', () => {
    render(<GameSearchResult game={mockGame} />);

    const clickableElement = screen.getByText('Lakers @ Warriors').closest('div');
    fireEvent.click(clickableElement!);

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/game/123');
  });
});
