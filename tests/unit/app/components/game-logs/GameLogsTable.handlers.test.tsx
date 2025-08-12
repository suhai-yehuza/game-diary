import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { GameLogsTable } from '@/app/components/game-logs/GameLogsTable';

// Mock auth
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: { id: 'u1' }, isLoaded: true, isSignedIn: true }),
}));

// Provide deterministic logs to exercise search and sort
const sampleLogs = [
  {
    id: 'log-a',
    user_id: 'u1',
    game_id: 'g1',
    notes: 'Alpha note',
    rating_for_game: 2,
    classification: 'PUBLIC',
    tags: ['alpha'],
    watched_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    game: {
      id: 'g1',
      game_date: '2024-01-01',
      season: '2023-24',
      home_team: { code: 'AAA', full_name: 'Alpha' },
      away_team: { code: 'BBB', full_name: 'Beta' },
    },
    user: { id: 'u1', username: 'user1' },
  },
  {
    id: 'log-b',
    user_id: 'u1',
    game_id: 'g2',
    notes: 'Beta note with tag',
    rating_for_game: 5,
    classification: 'PUBLIC',
    tags: ['beta'],
    watched_at: '2024-01-02T00:00:00Z',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    game: {
      id: 'g2',
      game_date: '2024-01-02',
      season: '2023-24',
      home_team: { code: 'CCC', full_name: 'Gamma' },
      away_team: { code: 'DDD', full_name: 'Delta' },
    },
    user: { id: 'u1', username: 'user1' },
  },
];

// Mock hooks used by the table
vi.mock('@/hooks/use-game-logs', () => ({
  useGameLogs: () => ({
    gameLogs: sampleLogs,
    gameLogsHasNextPage: false,
    gameLogsTotalCount: sampleLogs.length,
    loadMoreGameLogs: vi.fn(),
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useFriendsGameLogs: () => ({
    logs: [],
    loading: false,
    error: null,
    hasNextPage: false,
    totalCount: 0,
    loadMore: vi.fn(),
  }),
}));

// Mock GameLogModal to avoid apollo client usage inside
vi.mock('@/app/components/game-logs/GameLogModal', () => ({
  GameLogModal: () => <div />,
}));

// Use the real content component but mock its children dependencies
vi.mock('@/app/components/game-logs/GameLogCard', () => ({
  GameLogCard: ({ log }: any) => <div data-testid="log-item">{log.id}</div>,
}));
vi.mock('@/app/components/game-logs/GameLogsPagination', () => ({
  GameLogsPagination: () => <div data-testid="pagination" />,
}));
vi.mock('@/app/components/game-logs/GameLogsHeader', () => ({
  GameLogsHeader: ({ onCreateClick }: { onCreateClick: () => void }) => (
    <div>
      <button data-testid="create" onClick={onCreateClick}>
        Create
      </button>
    </div>
  ),
}));

// Custom mock for filters to expose controls that call handler props
vi.mock('@/app/components/game-logs/GameLogsFilters', () => ({
  GameLogsFilters: ({ onSearchChange, onSearchClear, onSort, displayedCount, totalCount }: any) => (
    <div data-testid="filters">
      <div data-testid="counts">
        {displayedCount}/{totalCount}
      </div>
      <button data-testid="search-alpha" onClick={() => onSearchChange('alpha', 'all')}>
        Search alpha
      </button>
      <button data-testid="clear" onClick={() => onSearchClear()}>
        Clear
      </button>
      <button data-testid="sort-asc" onClick={() => onSort('rating_for_game', 'asc')}>
        Sort Asc
      </button>
      <button data-testid="sort-none" onClick={() => onSort('rating_for_game', null)}>
        Sort None
      </button>
    </div>
  ),
}));

describe('GameLogsTable handlers', () => {
  it('invokes search and reduces visible items', () => {
    render(<GameLogsTable />);

    // Initially two items
    expect(screen.getAllByTestId('log-item')).toHaveLength(2);

    fireEvent.click(screen.getByTestId('search-alpha'));

    // After searching for alpha, only the first item should remain
    const items = screen.getAllByTestId('log-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('log-a');

    // Filter reduces rendered items to 1
    expect(screen.getAllByTestId('log-item')).toHaveLength(1);
  });

  it('clears search and shows all items again', () => {
    render(<GameLogsTable />);
    fireEvent.click(screen.getByTestId('search-alpha'));
    expect(screen.getAllByTestId('log-item')).toHaveLength(1);
    fireEvent.click(screen.getByTestId('clear'));
    expect(screen.getAllByTestId('log-item')).toHaveLength(2);
  });

  it('sorts by rating ascending then clears sort', () => {
    render(<GameLogsTable />);

    // Ascending should place the lower rating first (log-a with rating 2)
    fireEvent.click(screen.getByTestId('sort-asc'));
    let items = screen.getAllByTestId('log-item');
    expect(items[0]).toHaveTextContent('log-a');
    expect(items[1]).toHaveTextContent('log-b');

    // Removing sort should preserve original order from hook (which is [a, b])
    fireEvent.click(screen.getByTestId('sort-none'));
    items = screen.getAllByTestId('log-item');
    expect(items[0]).toHaveTextContent('log-a');
    expect(items[1]).toHaveTextContent('log-b');
  });
});
