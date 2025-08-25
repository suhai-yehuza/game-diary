import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { SearchResults } from '@/app/components/search/SearchResults';
import type { ISearchResultsProps, ISearchResponse } from '@/lib/types';

// Mock SearchAnalytics
vi.mock('@/app/components/search/SearchAnalytics', () => ({
  SearchAnalytics: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="search-analytics">{children}</div>
  ),
  useSearchAnalytics: () => ({
    trackSearchInteraction: vi.fn(),
  }),
}));

// Mock child components
vi.mock('@/app/components/search/GameLogSearchResult', () => ({
  GameLogSearchResult: ({ gameLog }: any) => (
    <div data-testid="game-log-result" data-id={gameLog.id}>
      {gameLog.title}
    </div>
  ),
}));

vi.mock('@/app/components/search/GameSearchResult', () => ({
  GameSearchResult: ({ game }: any) => (
    <div data-testid="game-result" data-id={game.id}>
      {game.title}
    </div>
  ),
}));

vi.mock('@/app/components/search/PlayerSearchResult', () => ({
  PlayerSearchResult: ({ player }: any) => (
    <div data-testid="player-result" data-id={player.id}>
      {player.first_name} {player.last_name}
    </div>
  ),
}));

vi.mock('@/app/components/search/TeamSearchResult', () => ({
  TeamSearchResult: ({ team }: any) => (
    <div data-testid="team-result" data-id={team.id}>
      {team.name}
    </div>
  ),
}));

vi.mock('@/app/components/search/UserSearchResult', () => ({
  UserSearchResult: ({ user }: any) => (
    <div data-testid="user-result" data-id={user.id}>
      {user.username}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  User: ({ className }: { className?: string }) => (
    <div data-testid="user-icon" className={className}>
      User
    </div>
  ),
  Trophy: ({ className }: { className?: string }) => (
    <div data-testid="trophy-icon" className={className}>
      Trophy
    </div>
  ),
  Gamepad2: ({ className }: { className?: string }) => (
    <div data-testid="gamepad2-icon" className={className}>
      Gamepad2
    </div>
  ),
  Building2: ({ className }: { className?: string }) => (
    <div data-testid="building2-icon" className={className}>
      Building2
    </div>
  ),
  Search: ({ className }: { className?: string }) => (
    <div data-testid="search-icon" className={className}>
      Search
    </div>
  ),
}));

describe('SearchResults Extended Tests', () => {
  const mockResults: ISearchResponse = {
    success: true,
    data: {
      users: [
        {
          id: 'user-1',
          type: 'user',
          username: 'testuser1',
          email_address: 'test1@example.com',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'user-2',
          type: 'user',
          username: 'testuser2',
          email_address: 'test2@example.com',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      games: [
        { id: 'game-1', type: 'game', date: '2024-01-01', created_at: '2024-01-01T00:00:00Z' },
        { id: 'game-2', type: 'game', date: '2024-01-02', created_at: '2024-01-01T00:00:00Z' },
      ],
      gameLogs: [
        { id: 'log-1', type: 'game_log', rating_for_game: 4, created_at: '2024-01-01T00:00:00Z' },
        { id: 'log-2', type: 'game_log', rating_for_game: 5, created_at: '2024-01-01T00:00:00Z' },
      ],
      teams: [
        {
          id: 'team-1',
          type: 'team',
          name: 'Test Team 1',
          city: 'Test City 1',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'team-2',
          type: 'team',
          name: 'Test Team 2',
          city: 'Test City 2',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      players: [
        {
          id: 'player-1',
          type: 'player',
          first_name: 'John',
          last_name: 'Doe',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'player-2',
          type: 'player',
          first_name: 'Jane',
          last_name: 'Smith',
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
      totalUsers: 2,
      totalGames: 2,
      totalGameLogs: 2,
      totalTeams: 2,
      totalPlayers: 2,
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 10,
      pages: 1,
    },
  };

  const defaultProps: ISearchResultsProps = {
    results: mockResults,
    query: 'test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SearchResults {...defaultProps} />);

    expect(screen.getByTestId('search-analytics')).toBeInTheDocument();
  });

  it('displays filter buttons for all result types', () => {
    render(<SearchResults {...defaultProps} />);

    expect(screen.getByText(/All \(/)).toBeInTheDocument();
    expect(screen.getAllByText('Users (2)')).toHaveLength(2);
    expect(screen.getAllByText('Games (2)')).toHaveLength(2);
    expect(screen.getAllByText('Game Logs (2)')).toHaveLength(2);
    expect(screen.getAllByText('Teams (2)')).toHaveLength(2);
    expect(screen.getAllByText('Players (2)')).toHaveLength(2);
  });

  it('displays sort options', () => {
    render(<SearchResults {...defaultProps} />);

    expect(screen.getByText('Sort by Relevance')).toBeInTheDocument();
    expect(screen.getByText('Sort by Date')).toBeInTheDocument();
    expect(screen.getByText('Sort by Name')).toBeInTheDocument();
  });

  it('shows all results when "All" filter is active', () => {
    render(<SearchResults {...defaultProps} />);

    // Should show all result types
    expect(screen.getAllByTestId('user-result')).toHaveLength(2);
    expect(screen.getAllByTestId('game-result')).toHaveLength(2);
    expect(screen.getAllByTestId('game-log-result')).toHaveLength(2);
    expect(screen.getAllByTestId('team-result')).toHaveLength(2);
    expect(screen.getAllByTestId('player-result')).toHaveLength(2);
  });

  it('handles sort changes', () => {
    render(<SearchResults {...defaultProps} />);

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'date' } });

    expect(sortSelect).toHaveValue('date');
  });

  it('displays correct icons for each filter type', () => {
    render(<SearchResults {...defaultProps} />);

    expect(screen.getAllByTestId('user-icon')).toHaveLength(2); // Users and Players sections
    expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
    expect(screen.getByTestId('gamepad2-icon')).toBeInTheDocument();
    expect(screen.getByTestId('building2-icon')).toBeInTheDocument();
  });

  it('handles long query strings', () => {
    const longQuery = 'a'.repeat(1000);
    render(<SearchResults {...defaultProps} query={longQuery} />);

    // Should not crash with long queries
    expect(screen.getByTestId('search-analytics')).toBeInTheDocument();
  });

  it('handles special characters in query', () => {
    const specialQuery = 'test@#$%^&*()_+-=[]{}|;:,.<>?';
    render(<SearchResults {...defaultProps} query={specialQuery} />);

    // Should not crash with special characters
    expect(screen.getByTestId('search-analytics')).toBeInTheDocument();
  });

  it('handles unicode characters in query', () => {
    const unicodeQuery = 'test🚀🎮🏀⚽';
    render(<SearchResults {...defaultProps} query={unicodeQuery} />);

    // Should not crash with unicode characters
    expect(screen.getByTestId('search-analytics')).toBeInTheDocument();
  });
});
