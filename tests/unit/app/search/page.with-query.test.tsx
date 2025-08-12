import { render, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: (k: string) => (k === 'q' ? 'lebron' : null) }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => false,
}));

vi.mock('@/app/components/search', () => ({
  SearchEmptyState: ({ hasQuery }: { hasQuery: boolean }) => (
    <div data-testid="empty">{hasQuery ? 'has-query' : 'no-query'}</div>
  ),
  SearchResults: ({ query }: { query: string }) => <div data-testid="results">{query}</div>,
}));

describe('SearchPage with query in URL', () => {
  beforeEach(() => {
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
    // @ts-expect-error restore
    global.fetch = undefined;
  });

  it('auto-fetches when query param is present', async () => {
    const { default: SearchPage } = await import('@/app/search/page');
    render(<SearchPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/search?q=lebron');
    });
  });
});
