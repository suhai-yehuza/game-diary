import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogSearchResult } from '@/app/components/search/GameLogSearchResult';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('GameLogSearchResult', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  const mockGameLog = {
    id: '123',
    type: 'game_log' as const,
    game_id: '123',
    username: 'testuser',
    created_at: '2023-01-15T10:30:00Z',
    away_team_nickname: 'Lakers',
    home_team_nickname: 'Warriors',
    home_team_city: 'San Francisco',
    rating_for_game: 4,
    classification: 'Regular Season',
  };

  it('renders game log with team names', () => {
    render(<GameLogSearchResult gameLog={mockGameLog} />);

    expect(screen.getByText('Lakers @ Warriors')).toBeInTheDocument();
    expect(screen.getByText('Game Log')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('4/5')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('• San Francisco')).toBeInTheDocument();
    expect(screen.getByText('Classification: Regular Season')).toBeInTheDocument();
  });

  it('renders game log without team names', () => {
    const gameLogWithoutTeams = {
      ...mockGameLog,
      away_team_nickname: undefined,
      home_team_nickname: undefined,
    };

    render(<GameLogSearchResult gameLog={gameLogWithoutTeams} />);

    expect(screen.getByText('Game Log #123')).toBeInTheDocument();
  });

  it('renders game log without rating', () => {
    const gameLogWithoutRating = {
      ...mockGameLog,
      rating_for_game: undefined,
    };

    render(<GameLogSearchResult gameLog={gameLogWithoutRating} />);

    expect(screen.queryByText('4/5')).not.toBeInTheDocument();
  });

  it('renders game log without classification', () => {
    const gameLogWithoutClassification = {
      ...mockGameLog,
      classification: undefined,
    };

    render(<GameLogSearchResult gameLog={gameLogWithoutClassification} />);

    expect(screen.queryByText('Classification: Regular Season')).not.toBeInTheDocument();
  });

  it('navigates to user page when clicked', () => {
    render(<GameLogSearchResult gameLog={mockGameLog} />);

    const clickableElement = screen.getByText('Lakers @ Warriors').closest('div');
    fireEvent.click(clickableElement!);

    expect(mockPush).toHaveBeenCalledWith('/protected/user');
  });

  it('handles unknown username', () => {
    const gameLogWithUnknownUser = {
      ...mockGameLog,
      username: undefined,
    };

    render(<GameLogSearchResult gameLog={gameLogWithUnknownUser} />);

    expect(screen.getByText('@unknown')).toBeInTheDocument();
  });

  it('handles unknown game id', () => {
    const gameLogWithUnknownId = {
      ...mockGameLog,
      game_id: undefined,
      away_team_nickname: undefined,
      home_team_nickname: undefined,
    };

    render(<GameLogSearchResult gameLog={gameLogWithUnknownId} />);

    expect(screen.getByText('Game Log #unknown')).toBeInTheDocument();
  });
});
