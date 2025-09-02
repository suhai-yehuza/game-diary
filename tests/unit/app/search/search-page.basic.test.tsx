import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js router and search params
const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock child components
vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => false,
  SearchBar: ({ autoFocus, isFocused, setIsFocused: _setIsFocused }: any) => (
    <div data-testid="search-bar" data-autofocus={autoFocus} data-focused={isFocused}>
      Search Bar
    </div>
  ),
}));

vi.mock('@/app/components/search', () => ({
  SearchEmptyState: ({ hasQuery }: any) => (
    <div data-testid="search-empty-state" data-has-query={hasQuery}>
      Empty State
    </div>
  ),
  SearchResults: ({ results, query }: any) => (
    <div data-testid="search-results" data-query={query}>
      Search Results: {results?.total || 0} results
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: ({ className }: any) => (
    <div data-testid="alert-circle" className={className}>
      Alert Circle
    </div>
  ),
}));

import SearchPage from '@/app/search/page';

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue('');
    mockPush.mockClear();
    (global.fetch as any).mockClear();
  });

  it('renders search page with empty state when no query', () => {
    render(<SearchPage />);

    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('search-empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('search-empty-state')).toHaveAttribute('data-has-query', 'false');
  });

  it('renders search results when query is provided', async () => {
    const mockResults = {
      total: 5,
      games: [],
      players: [],
      teams: [],
      users: [],
    };

    mockGet.mockReturnValue('test query');
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    expect(screen.getByTestId('search-results')).toHaveAttribute('data-query', 'test query');
  });

  it('shows loading state while searching', async () => {
    mockGet.mockReturnValue('test query');
    (global.fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SearchPage />);

    expect(screen.getByText('Searching...')).toBeInTheDocument();
    expect(screen.getByText('Finding the best results for you')).toBeInTheDocument();
  });

  it('shows error state when search fails', async () => {
    mockGet.mockReturnValue('test query');
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Search Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to perform search. Please try again.')).toBeInTheDocument();
  });

  it('handles network errors gracefully', async () => {
    mockGet.mockReturnValue('test query');
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Search Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to perform search. Please try again.')).toBeInTheDocument();
  });

  it('does not perform search for short queries', () => {
    mockGet.mockReturnValue('a'); // Single character query

    render(<SearchPage />);

    // For short queries, the component should not render search results
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('clears results when query is removed', async () => {
    // Start with a query
    mockGet.mockReturnValue('test query');
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 5, games: [], players: [], teams: [], users: [] }),
    });

    const { rerender } = render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    // Clear the query
    mockGet.mockReturnValue('');
    rerender(<SearchPage />);

    expect(screen.getByTestId('search-empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
  });

  it('handles search with special characters', async () => {
    const specialQuery = 'test & query with "quotes"';
    mockGet.mockReturnValue(specialQuery);
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 0, games: [], players: [], teams: [], users: [] }),
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/search?q=${encodeURIComponent(specialQuery)}`
      );
    });
  });

  it('handles empty search results', async () => {
    mockGet.mockReturnValue('test query');
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 0, games: [], players: [], teams: [], users: [] }),
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    expect(screen.getByText('Search Results: 0 results')).toBeInTheDocument();
  });

  it('handles null search results gracefully', async () => {
    mockGet.mockReturnValue('test query');
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    render(<SearchPage />);

    // The component should handle null results gracefully
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('handles undefined search results gracefully', async () => {
    mockGet.mockReturnValue('test query');
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });

    render(<SearchPage />);

    // The component should handle undefined results gracefully
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
