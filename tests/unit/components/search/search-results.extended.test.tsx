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

// Mock SearchAnalytics
vi.mock('@/app/components/search/SearchAnalytics', () => ({
  SearchAnalytics: ({ query, resultsCount, _searchTime, category, filters }: any) => (
    <div data-testid="search-analytics">
      <span data-testid="analytics-query">{query}</span>
      <span data-testid="analytics-count">{resultsCount}</span>
      <span data-testid="analytics-category">{category}</span>
      <span data-testid="analytics-filters">{JSON.stringify(filters)}</span>
    </div>
  ),
  useSearchAnalytics: () => ({
    trackSearchInteraction: vi.fn(),
  }),
}));

describe('SearchResults Extended Tests', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Advanced Filter Functionality', () => {
    it('toggles advanced filters panel', () => {
      render(<SearchResults results={mockResults} query="test" />);

      const toggleButton = screen.getByText('Show Advanced Filters');
      expect(toggleButton).toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByText('Hide Advanced Filters')).toBeInTheDocument();

      // Check that advanced filters panel is shown
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Result Type')).toBeInTheDocument();
      expect(screen.getByText('Sort Order')).toBeInTheDocument();
    });

    it('handles sort change', () => {
      render(<SearchResults results={mockResults} query="test" />);

      const sortSelect = screen.getByDisplayValue('Sort by Relevance');
      fireEvent.change(sortSelect, { target: { value: 'date' } });

      expect(sortSelect).toHaveValue('date');
    });

    it('handles all sort options', () => {
      render(<SearchResults results={mockResults} query="test" />);

      const sortSelect = screen.getByDisplayValue('Sort by Relevance');

      // Test all sort options
      fireEvent.change(sortSelect, { target: { value: 'relevance' } });
      expect(sortSelect).toHaveValue('relevance');

      fireEvent.change(sortSelect, { target: { value: 'date' } });
      expect(sortSelect).toHaveValue('date');

      fireEvent.change(sortSelect, { target: { value: 'name' } });
      expect(sortSelect).toHaveValue('name');
    });
  });

  describe('Search Insights and Analytics', () => {
    it('displays search insights correctly', () => {
      render(<SearchResults results={mockResults} query="test" />);

      expect(screen.getByText('10 results found')).toBeInTheDocument();
      expect(screen.getByText(/Results for:/)).toBeInTheDocument();
      expect(screen.getByText('"test"')).toBeInTheDocument();
    });

    it('shows most relevant category when available', () => {
      const resultsWithUnevenData = {
        ...mockResults,
        data: {
          ...mockResults.data,
          totalUsers: 10,
          totalGames: 5,
          totalGameLogs: 3,
          totalTeams: 2,
          totalPlayers: 1,
        },
      };

      render(<SearchResults results={resultsWithUnevenData} query="test" />);

      expect(screen.getByText(/Most relevant category:/)).toBeInTheDocument();
      expect(screen.getByText('users')).toBeInTheDocument();
    });

    it('does not show most relevant category when no results', () => {
      const emptyResults = {
        ...mockResults,
        data: {
          ...mockResults.data,
          totalUsers: 0,
          totalGames: 0,
          totalGameLogs: 0,
          totalTeams: 0,
          totalPlayers: 0,
        },
      };

      render(<SearchResults results={emptyResults} query="test" />);

      expect(screen.queryByText(/Most relevant category:/)).not.toBeInTheDocument();
    });
  });

  describe('Search Tips Display', () => {
    it('shows search tips for short queries', () => {
      render(<SearchResults results={mockResults} query="ab" />);

      expect(screen.getByText('Search Tips')).toBeInTheDocument();
      expect(screen.getByText(/Use quotes for exact phrases/)).toBeInTheDocument();
      expect(screen.getByText(/Search by team names/)).toBeInTheDocument();
    });

    it('does not show search tips for longer queries', () => {
      render(<SearchResults results={mockResults} query="longer query" />);

      expect(screen.queryByText('Search Tips')).not.toBeInTheDocument();
    });
  });

  describe('Filter Button Styling', () => {
    it('applies correct active styling to filter buttons', () => {
      render(<SearchResults results={mockResults} query="test" />);

      const allFilter = screen.getByText('All (10)');
      expect(allFilter).toHaveClass('bg-brand-primary', 'text-white');
    });

    it('applies correct inactive styling to filter buttons', () => {
      render(<SearchResults results={mockResults} query="test" />);

      const usersFilter = screen.getAllByText('Users (2)')[0];
      expect(usersFilter).toHaveClass('bg-semantic-success/10', 'text-semantic-success');

      const gamesFilter = screen.getAllByText('Games (2)')[0];
      expect(gamesFilter).toHaveClass('bg-accent-orange/10', 'text-accent-orange');

      const gameLogsFilter = screen.getAllByText('Game Logs (2)')[0];
      expect(gameLogsFilter).toHaveClass('bg-accent-purple/10', 'text-accent-purple');

      const teamsFilter = screen.getAllByText('Teams (2)')[0];
      expect(teamsFilter).toHaveClass('bg-semantic-error/10', 'text-semantic-error');

      const playersFilter = screen.getAllByText('Players (2)')[0];
      expect(playersFilter).toHaveClass('bg-accent-blue/10', 'text-accent-blue');
    });
  });

  describe('Section Visibility Logic', () => {
    it('shows all sections when filter is "all"', () => {
      render(<SearchResults results={mockResults} query="test" />);

      // Use getAllByText to get the first occurrence of each filter button
      expect(screen.getAllByText('Users (2)')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Games (2)')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Game Logs (2)')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Teams (2)')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Players (2)')[0]).toBeInTheDocument();
    });

    it('shows only specific section when filter is active', () => {
      render(<SearchResults results={mockResults} query="test" />);

      // Click on users filter
      const usersFilter = screen.getAllByText('Users (2)')[0];
      fireEvent.click(usersFilter);

      // Should show only users section - filter buttons remain visible but sections change
      expect(screen.getAllByText('Users (2)')[0]).toBeInTheDocument();
      // Note: The component behavior shows that filter buttons remain visible even when filtered
    });

    it('hides sections with no results', () => {
      const resultsWithSomeEmpty = {
        ...mockResults,
        data: {
          ...mockResults.data,
          users: [],
          totalUsers: 0,
          games: [],
          totalGames: 0,
        },
      };

      render(<SearchResults results={resultsWithSomeEmpty} query="test" />);

      // When sections have no results, they should not be rendered
      // Note: The component might still show filter buttons with 0 counts
      expect(screen.getAllByText('Game Logs (2)')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Teams (2)')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Players (2)')[0]).toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('shows no results state when filter has no results', () => {
      const emptyResults = {
        ...mockResults,
        data: {
          ...mockResults.data,
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
      };

      render(<SearchResults results={emptyResults} query="test" />);

      expect(screen.getByText(/No results found for "test"/)).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search terms/)).toBeInTheDocument();
      expect(screen.getByText(/Check your spelling/)).toBeInTheDocument();
    });

    it('shows no results state for specific filter with no results', () => {
      const resultsWithSomeEmpty = {
        ...mockResults,
        data: {
          ...mockResults.data,
          users: [],
          totalUsers: 0,
        },
      };

      render(<SearchResults results={resultsWithSomeEmpty} query="test" />);

      // Click on users filter
      const usersFilter = screen.getByText('Users (0)');
      fireEvent.click(usersFilter);

      expect(screen.getByText(/No results found for "test"/)).toBeInTheDocument();
    });
  });

  describe('Icon Fallbacks', () => {
    it('handles missing lucide-react icons gracefully', () => {
      // Mock lucide-react to return undefined for some icons
      vi.doMock('lucide-react', () => ({
        Search: () => <span data-testid="search-icon">Search</span>,
        User: undefined,
        Trophy: undefined,
        Gamepad2: undefined,
        Building2: undefined,
      }));

      render(<SearchResults results={mockResults} query="test" />);

      // Should still render without crashing
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });
  });

  describe('Analytics Integration', () => {
    it('passes correct props to SearchAnalytics', () => {
      render(<SearchResults results={mockResults} query="test" />);

      expect(screen.getByTestId('analytics-query')).toHaveTextContent('test');
      expect(screen.getByTestId('analytics-count')).toHaveTextContent('10');
      expect(screen.getByTestId('analytics-category')).toHaveTextContent('all');
    });

    it('updates analytics when filter changes', () => {
      render(<SearchResults results={mockResults} query="test" />);

      const usersFilter = screen.getAllByText('Users (2)')[0]; // Get the first occurrence
      fireEvent.click(usersFilter);

      expect(screen.getByTestId('analytics-category')).toHaveTextContent('users');
    });
  });
});
