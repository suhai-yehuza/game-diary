import { render, screen } from '@testing-library/react';
import React from 'react';

import SearchPage from '@/app/search/page';

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<any>('next/navigation');
  return {
    ...actual,
    useSearchParams: () => ({ get: (k: string) => (k === 'q' ? '' : null) }),
    useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  };
});

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  SearchBar: ({ autoFocus, isFocused, setIsFocused }: any) => (
    <div data-testid="search-bar" data-auto-focus={autoFocus} data-is-focused={isFocused}>
      <input
        type="search"
        placeholder="Global search..."
        data-testid="search-input"
        onFocus={() => setIsFocused?.(true)}
        onBlur={() => setIsFocused?.(false)}
      />
    </div>
  ),
  useMobileDetection: () => false,
  useSearchLogic: () => ({
    search_query: '',
    isFocused: false,
    setIsFocused: vi.fn(),
    handleSearch: vi.fn(),
    handleSearchChange: vi.fn(),
    clearSearch: vi.fn(),
    handleKeyDown: vi.fn(),
  }),
}));

vi.mock('@/app/components/search', () => ({
  SearchEmptyState: ({ hasQuery }: { hasQuery: boolean }) => (
    <div data-testid="empty">{hasQuery ? 'has-query' : 'no-query'}</div>
  ),
  SearchResults: ({ query }: { query: string }) => <div data-testid="results">{query}</div>,
}));

describe('SearchPage (client)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
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
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      }),
    })) as any;
  });
  afterEach(() => {
    vi.useRealTimers();
    // @ts-expect-error restore
    global.fetch = undefined;
  });

  it('renders empty state when no query and shows appropriate message', async () => {
    render(<SearchPage />);

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByText('Start searching')).toBeInTheDocument();
    expect(
      screen.getByText('Enter a search term above to find users and game logs.')
    ).toBeInTheDocument();
  });

  // Query-present scenario is covered in a separate test file to avoid module caching issues
});
