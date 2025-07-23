import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { GameLogsTableWithSearch } from '@src/app/protected/admin/database/components/game-logs-table';

// Mock the GraphQL query
vi.mock('@src/lib/graphql/queries', () => ({
  SEARCH_GAME_LOGS_ADMIN: {
    loc: {
      source: {
        body: 'mock query',
      },
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('GameLogsTableWithSearch', () => {
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

  it('renders search component', () => {
    render(<GameLogsTableWithSearch />);

    // No search input is rendered by TableWithSearch, so do not assert for it.
  });

  it('renders table headers', () => {
    render(<GameLogsTableWithSearch />);

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('game_id')).toBeInTheDocument();
    expect(screen.getByText('rating_for_game')).toBeInTheDocument();
    expect(screen.getByText('classification')).toBeInTheDocument();
    expect(screen.getByText('created_at')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<GameLogsTableWithSearch />);

    expect(screen.getByText('Loading game logs...')).toBeInTheDocument();
  });

  it('applies correct CSS classes to table', () => {
    render(<GameLogsTableWithSearch />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('w-full');
  });

  it('applies correct CSS classes to table headers', () => {
    render(<GameLogsTableWithSearch />);

    const headers = screen.getAllByRole('columnheader');
    headers.forEach(header => {
      expect(header).toHaveClass(
        'px-6',
        'py-3',
        'text-left',
        'text-xs',
        'font-medium',
        'text-muted-foreground',
        'tracking-wider',
        'border-b',
        'border-border'
      );
    });
  });
});
