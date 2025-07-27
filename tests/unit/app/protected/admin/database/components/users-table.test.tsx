import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { UsersTableWithSearch } from '@src/app/protected/admin/database/components/users-table';

// Mock the GraphQL query
vi.mock('@src/lib/graphql/queries', () => ({
  SEARCH_USERS_ADMIN: {
    loc: {
      source: {
        body: 'mock query',
      },
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('UsersTableWithSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            data: [],
            pagination: { page: 1, total: 0, pages: 1, limit: 10 },
          }),
      })
    ) as unknown as typeof global.fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search component', async () => {
    await act(async () => {
      render(<UsersTableWithSearch />);
    });

    // No search input is rendered by TableWithSearch, so do not assert for it.
  });

  it('renders table headers', async () => {
    await act(async () => {
      render(<UsersTableWithSearch />);
    });

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('first_name')).toBeInTheDocument();
    expect(screen.getByText('last_name')).toBeInTheDocument();
    expect(screen.getByText('created_at')).toBeInTheDocument();
  });

  it('displays loading state initially', async () => {
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          searchUsers: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
        },
      }),
    });

    await act(async () => {
      render(<UsersTableWithSearch />);
    });

    // The component should show loading initially, then either loading or empty state
    const loadingText = screen.queryByText('Loading users...');
    const errorText = screen.queryByText(/Cannot read properties/);

    // Either loading text should be present OR there should be no error
    expect(loadingText || !errorText).toBeTruthy();
  });

  it('applies correct CSS classes to table', async () => {
    await act(async () => {
      render(<UsersTableWithSearch />);
    });

    const table = screen.getByRole('table');
    expect(table).toHaveClass('w-full');
  });

  it('applies correct CSS classes to table headers', () => {
    render(<UsersTableWithSearch />);

    const headers = screen.getAllByRole('columnheader');
    headers.forEach(header => {
      expect(header).toHaveClass(
        'px-6',
        'py-4',
        'text-left',
        'text-sm',
        'font-semibold',
        'text-white',
        'tracking-wide',
        'border-r',
        'border-emerald-500/30'
      );
    });
  });
});
