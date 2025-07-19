import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  const mockGameLogs = [
    {
      id: '1',
      user_id: 'user1',
      game_id: 'game1',
      rating_for_game: 5,
      classification: 'completed',
      created_at: '2023-01-01T00:00:00Z',
      user: {
        username: 'john_doe',
        first_name: 'John',
        last_name: 'Doe',
      },
      game: {
        title: 'Test Game 1',
        platform: 'PC',
      },
    },
    {
      id: '2',
      user_id: 'user2',
      game_id: 'game2',
      rating_for_game: 3,
      classification: 'in_progress',
      created_at: '2023-01-02T00:00:00Z',
      user: {
        username: 'jane_smith',
        first_name: 'Jane',
        last_name: 'Smith',
      },
      game: {
        title: 'Test Game 2',
        platform: 'PS5',
      },
    },
  ];

  const mockResponse = {
    data: {
      searchGameLogs: {
        edges: mockGameLogs.map(log => ({ node: log })),
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: '1',
          endCursor: '2',
        },
        totalCount: 2,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search component', () => {
    render(<GameLogsTableWithSearch />);

    expect(screen.getByPlaceholderText('Search game logs...')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<GameLogsTableWithSearch />);

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('user_id')).toBeInTheDocument();
    expect(screen.getByText('game_id')).toBeInTheDocument();
    expect(screen.getByText('rating_for_game')).toBeInTheDocument();
    expect(screen.getByText('classification')).toBeInTheDocument();
    expect(screen.getByText('created_at')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<GameLogsTableWithSearch />);

    expect(screen.getByText('Loading game logs...')).toBeInTheDocument();
  });

  it('fetches and displays game logs', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('Test Game 1')).toBeInTheDocument();
      expect(screen.getByText('Test Game 2')).toBeInTheDocument();
    });
  });

  it('displays game log information correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('displays user information correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays game information correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('PC')).toBeInTheDocument();
      expect(screen.getByText('PS5')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
    });
  });

  it('displays pagination info', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('2 total game logs')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    const searchInput = screen.getByPlaceholderText('Search game logs...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({
          body: JSON.stringify({
            query: 'mock query',
            variables: {
              first: 20,
              after: null,
              searchTerm: 'test',
              searchField: 'all',
            },
          }),
        })
      );
    });
  });

  it('handles search field changes', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    const dropdown = screen.getByDisplayValue('All Fields');
    fireEvent.change(dropdown, { target: { value: 'game_title' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({
          body: JSON.stringify({
            query: 'mock query',
            variables: {
              first: 20,
              after: null,
              searchTerm: '',
              searchField: 'game_title',
            },
          }),
        })
      );
    });
  });

  it('handles pagination controls', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('displays error message when fetch fails', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays error message when API returns errors', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => ({
        errors: [{ message: 'API error' }],
      }),
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('API error')).toBeInTheDocument();
    });
  });

  it('handles empty game log list', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => ({
        data: {
          searchGameLogs: {
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

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('No game logs found')).toBeInTheDocument();
    });
  });

  it('calculates row numbers correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('displays classification badges correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('in_progress')).toBeInTheDocument();
    });
  });

  it('displays rating stars correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    render(<GameLogsTableWithSearch />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
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
