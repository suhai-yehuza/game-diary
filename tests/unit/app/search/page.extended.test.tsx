import { render, screen, fireEvent } from '@testing-library/react';
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
  useMobileDetection: () => false,
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

  it('renders empty state when no query and allows typing then search', async () => {
    render(<SearchPage />);

    expect(screen.getByTestId('empty')).toHaveTextContent('no-query');

    const input = screen.getByPlaceholderText('Search games, teams, players...');
    fireEvent.change(input, { target: { value: 'lebron' } });

    // Submit the form to trigger search
    const form = input.closest('form');
    fireEvent.submit(form!);

    // No query param push, so no fetch yet; just ensure UI remains stable
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  // Query-present scenario is covered in a separate test file to avoid module caching issues
});
