import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { SearchResults } from '@/app/components/search/SearchResults';

// Mock the search result components
vi.mock('@/app/components/search/UserSearchResult', () => ({
  UserSearchResult: ({ user }: { user: any }) => (
    <div data-testid="user-result">{user.username}</div>
  ),
}));

vi.mock('@/app/components/search/GameSearchResult', () => ({
  GameSearchResult: ({ game }: { game: any }) => <div data-testid="game-result">{game.id}</div>,
}));

vi.mock('@/app/components/search/GameLogSearchResult', () => ({
  GameLogSearchResult: ({ gameLog }: { gameLog: any }) => (
    <div data-testid="game-log-result">{gameLog.id}</div>
  ),
}));

vi.mock('@/app/components/search/TeamSearchResult', () => ({
  TeamSearchResult: ({ team }: { team: any }) => <div data-testid="team-result">{team.name}</div>,
}));

vi.mock('@/app/components/search/PlayerSearchResult', () => ({
  PlayerSearchResult: ({ player }: { player: any }) => (
    <div data-testid="player-result">{player.name}</div>
  ),
}));

describe('SearchResults', () => {
  const mockResults = {
    success: true,
    data: {
      users: [
        { id: '1', type: 'user' as const, created_at: '2023-01-15T10:30:00Z', username: 'user1' },
        { id: '2', type: 'user' as const, created_at: '2023-01-15T10:30:00Z', username: 'user2' },
      ],
      games: [
        { id: 'game1', type: 'game' as const, created_at: '2023-01-15T10:30:00Z' },
        { id: 'game2', type: 'game' as const, created_at: '2023-01-15T10:30:00Z' },
      ],
      gameLogs: [
        { id: 'log1', type: 'game_log' as const, created_at: '2023-01-15T10:30:00Z' },
        { id: 'log2', type: 'game_log' as const, created_at: '2023-01-15T10:30:00Z' },
      ],
      teams: [
        { id: 'team1', type: 'team' as const, created_at: '2023-01-15T10:30:00Z', name: 'Team A' },
        { id: 'team2', type: 'team' as const, created_at: '2023-01-15T10:30:00Z', name: 'Team B' },
      ],
      players: [
        {
          id: 'player1',
          type: 'player' as const,
          created_at: '2023-01-15T10:30:00Z',
          name: 'Player A',
        },
        {
          id: 'player2',
          type: 'player' as const,
          created_at: '2023-01-15T10:30:00Z',
          name: 'Player B',
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

  const mockEmptyResults = {
    success: true,
    data: {
      users: [],
      games: [],
      gameLogs: [],
      teams: [],
      players: [],
      totalUsers: 0,
      totalGames: 0,
      totalGameLogs: 0,
      totalTeams: 0,
      totalPlayers: 0,
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all sections when results are available', () => {
    render(<SearchResults results={mockResults} query="test" />);

    expect(screen.getByText('10 results found')).toBeInTheDocument();
    expect(screen.getAllByText('Users (2)')).toHaveLength(2);
    expect(screen.getAllByText('Games (2)')).toHaveLength(2);
    expect(screen.getAllByText('Game Logs (2)')).toHaveLength(2);
    expect(screen.getAllByText('Teams (2)')).toHaveLength(2);
    expect(screen.getAllByText('Players (2)')).toHaveLength(2);
  });

  it('renders user results', () => {
    render(<SearchResults results={mockResults} query="test" />);

    expect(screen.getAllByTestId('user-result')).toHaveLength(2);
    expect(screen.getByText('user1')).toBeInTheDocument();
  });

  it('renders game results', () => {
    render(<SearchResults results={mockResults} query="test" />);

    expect(screen.getAllByTestId('game-result')).toHaveLength(2);
    expect(screen.getByText('game1')).toBeInTheDocument();
  });

  it('renders game log results', () => {
    render(<SearchResults results={mockResults} query="test" />);

    expect(screen.getAllByTestId('game-log-result')).toHaveLength(2);
    expect(screen.getByText('log1')).toBeInTheDocument();
  });

  it('renders team results', () => {
    render(<SearchResults results={mockResults} query="test" />);

    expect(screen.getAllByTestId('team-result')).toHaveLength(2);
    expect(screen.getByText('Team A')).toBeInTheDocument();
  });

  it('renders player results', () => {
    render(<SearchResults results={mockResults} query="test" />);

    expect(screen.getAllByTestId('player-result')).toHaveLength(2);
    expect(screen.getByText('Player A')).toBeInTheDocument();
  });

  it('filters results when clicking filter buttons', () => {
    render(<SearchResults results={mockResults} query="test" />);

    // Click on users filter
    const usersFilter = screen.getByText('Users (2)', {
      selector: 'span[class*="bg-semantic-success"]',
    });
    fireEvent.click(usersFilter);

    expect(screen.getByText('10 results found')).toBeInTheDocument();
    expect(
      screen.getByText('Users (2)', { selector: 'span[class*="bg-brand-primary"]' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Games (2)', { selector: 'span[class*="bg-accent-orange"]' })
    ).toBeInTheDocument();
  });

  it('shows no results message when no results are found', () => {
    render(<SearchResults results={mockEmptyResults} query="test" />);

    expect(screen.getByText('No results found for "test"')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Try adjusting your search terms or filters to find what you're looking for."
      )
    ).toBeInTheDocument();
  });

  it('handles singular/plural text correctly', () => {
    const singleResult = {
      success: true,
      data: {
        users: [
          { id: '1', type: 'user' as const, created_at: '2023-01-15T10:30:00Z', username: 'user1' },
        ],
        games: [],
        gameLogs: [],
        teams: [],
        players: [],
        totalUsers: 1,
        totalGames: 0,
        totalGameLogs: 0,
        totalTeams: 0,
        totalPlayers: 0,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    };

    render(<SearchResults results={singleResult} query="test" />);

    expect(
      screen.getByText('Users (1)', { selector: 'span[class*="bg-semantic-success"]' })
    ).toBeInTheDocument();
  });

  it('filters to show only games when games filter is clicked', () => {
    render(<SearchResults results={mockResults} query="test" />);

    const gamesFilter = screen.getByText('Games (2)', {
      selector: 'span[class*="bg-accent-orange"]',
    });
    fireEvent.click(gamesFilter);

    expect(screen.getByText('10 results found')).toBeInTheDocument();
    expect(
      screen.getByText('Games (2)', { selector: 'span[class*="bg-brand-primary"]' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Users (2)', { selector: 'span[class*="bg-semantic-success"]' })
    ).toBeInTheDocument();
  });

  it('returns to all results when all filter is clicked', () => {
    render(<SearchResults results={mockResults} query="test" />);

    // First click on users filter
    const usersFilter = screen.getByText('Users (2)', {
      selector: 'span[class*="bg-semantic-success"]',
    });
    fireEvent.click(usersFilter);

    // Then click on all filter
    const allFilter = screen.getByText('All (10)', { selector: 'span[class*="bg-neutral-"]' });
    fireEvent.click(allFilter);

    expect(screen.getByText('10 results found')).toBeInTheDocument();
    expect(
      screen.getByText('Users (2)', { selector: 'span[class*="bg-semantic-success"]' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Games (2)', { selector: 'span[class*="bg-accent-orange"]' })
    ).toBeInTheDocument();
  });
});
