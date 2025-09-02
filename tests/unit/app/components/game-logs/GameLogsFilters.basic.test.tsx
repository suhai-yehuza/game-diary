import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogsFilters } from '@/app/components/game-logs/GameLogsFilters';

// Mock child components
vi.mock('@/app/components/game-logs/GameLogsSearch', () => ({
  GameLogsSearch: ({ onSearchChange, onClear, searchTerm, searchField }: any) => (
    <div data-testid="game-logs-search">
      <input
        data-testid="search-input"
        value={searchTerm || ''}
        onChange={e => onSearchChange?.(e.target.value)}
        placeholder={`Search by ${searchField}`}
      />
      <button data-testid="clear-search" onClick={onClear}>
        Clear
      </button>
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/GameLogsSort', () => ({
  GameLogsSort: ({
    sortKey,
    sortDirection,
    onSort,
    displayedCount,
    totalCount,
    classification,
  }: any) => (
    <div data-testid="game-logs-sort">
      <select
        data-testid="sort-field"
        defaultValue={sortKey || ''}
        onChange={e => onSort?.(e.target.value, sortDirection)}
      >
        <option value="date">Date</option>
        <option value="title">Title</option>
        <option value="rating">Rating</option>
      </select>
      <button
        data-testid="sort-direction"
        onClick={() => onSort?.(sortKey, sortDirection === 'asc' ? 'desc' : 'asc')}
      >
        {sortDirection}
      </button>
      <span data-testid="count-display">
        {displayedCount} of {totalCount}
      </span>
      <span data-testid="classification">{classification || ''}</span>
    </div>
  ),
}));

describe('GameLogsFilters', () => {
  const defaultProps = {
    searchTerm: 'test search',
    searchField: 'title',
    sortConfig: {
      field: 'date',
      direction: 'asc' as const,
    },
    displayedCount: 10,
    totalCount: 25,
    classification: 'all',
    onSearchChange: vi.fn(),
    onSearchClear: vi.fn(),
    onSort: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with search and filter section', () => {
    render(<GameLogsFilters {...defaultProps} />);
    expect(screen.getByText('Search & Filter')).toBeInTheDocument();
  });

  it('renders GameLogsSearch component with correct props', () => {
    render(<GameLogsFilters {...defaultProps} />);
    expect(screen.getByTestId('game-logs-search')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by title')).toBeInTheDocument();
  });

  it('renders GameLogsSort component with correct props', () => {
    render(<GameLogsFilters {...defaultProps} />);
    expect(screen.getByTestId('game-logs-sort')).toBeInTheDocument();
    expect(screen.getByTestId('sort-field')).toBeInTheDocument();
    expect(screen.getByText('asc')).toBeInTheDocument();
    expect(screen.getByText('10 of 25')).toBeInTheDocument();
    expect(screen.getByText('all')).toBeInTheDocument();
  });

  it('handles search change correctly', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const searchInput = screen.getByTestId('search-input');

    fireEvent.change(searchInput, { target: { value: 'new search' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('new search');
  });

  it('handles search clear correctly', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const clearButton = screen.getByTestId('clear-search');

    fireEvent.click(clearButton);

    expect(defaultProps.onSearchClear).toHaveBeenCalled();
  });

  it('handles sort field change correctly', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const sortField = screen.getByTestId('sort-field');

    fireEvent.change(sortField, { target: { value: 'title' } });

    expect(defaultProps.onSort).toHaveBeenCalledWith('title', 'asc');
  });

  it('handles sort direction change correctly', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const sortDirection = screen.getByTestId('sort-direction');

    fireEvent.click(sortDirection);

    expect(defaultProps.onSort).toHaveBeenCalledWith('date', 'desc');
  });

  it('handles sort direction change from desc to asc', () => {
    const descProps = {
      ...defaultProps,
      sortConfig: {
        field: 'date',
        direction: 'desc' as const,
      },
    };

    render(<GameLogsFilters {...descProps} />);
    const sortDirection = screen.getByTestId('sort-direction');

    fireEvent.click(sortDirection);

    expect(defaultProps.onSort).toHaveBeenCalledWith('date', 'asc');
  });

  it('handles empty search term', () => {
    const emptySearchProps = {
      ...defaultProps,
      searchTerm: '',
    };

    render(<GameLogsFilters {...emptySearchProps} />);
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('handles empty search term', () => {
    const emptySearchProps = {
      ...defaultProps,
      searchTerm: '',
    };

    render(<GameLogsFilters {...emptySearchProps} />);
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('handles different search fields', () => {
    const contentSearchProps = {
      ...defaultProps,
      searchField: 'content',
    };

    render(<GameLogsFilters {...contentSearchProps} />);
    expect(screen.getByPlaceholderText('Search by content')).toBeInTheDocument();
  });

  it('handles different sort configurations', () => {
    const titleSortProps = {
      ...defaultProps,
      sortConfig: {
        field: 'title',
        direction: 'desc' as const,
      },
    };

    render(<GameLogsFilters {...titleSortProps} />);
    expect(screen.getByTestId('sort-field')).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();
  });

  it('handles undefined sort config', () => {
    const undefinedSortProps = {
      ...defaultProps,
      sortConfig: null,
    };

    render(<GameLogsFilters {...undefinedSortProps} />);
    expect(screen.getByTestId('sort-field')).toBeInTheDocument();
    expect(screen.getByText('asc')).toBeInTheDocument();
  });

  it('handles null sort config', () => {
    const nullSortProps = {
      ...defaultProps,
      sortConfig: null,
    };

    render(<GameLogsFilters {...nullSortProps} />);
    expect(screen.getByTestId('sort-field')).toBeInTheDocument();
    expect(screen.getByText('asc')).toBeInTheDocument();
  });

  it('handles different count displays', () => {
    const zeroCountProps = {
      ...defaultProps,
      displayedCount: 0,
      totalCount: 0,
    };

    render(<GameLogsFilters {...zeroCountProps} />);
    expect(screen.getByText('0 of 0')).toBeInTheDocument();
  });

  it('handles large count displays', () => {
    const largeCountProps = {
      ...defaultProps,
      displayedCount: 999999,
      totalCount: 1000000,
    };

    render(<GameLogsFilters {...largeCountProps} />);
    expect(screen.getByText('999999 of 1000000')).toBeInTheDocument();
  });

  it('handles different classifications', () => {
    const classificationProps = {
      ...defaultProps,
      classification: 'favorites',
    };

    render(<GameLogsFilters {...classificationProps} />);
    expect(screen.getByText('favorites')).toBeInTheDocument();
  });

  it('handles empty classification', () => {
    const emptyClassificationProps = {
      ...defaultProps,
      classification: '',
    };

    render(<GameLogsFilters {...emptyClassificationProps} />);
    expect(screen.getByTestId('classification')).toBeInTheDocument();
  });

  it('applies correct CSS classes to main container', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const container = screen.getByText('Search & Filter').closest('div')?.parentElement;
    expect(container).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'border',
      'border-gray-200',
      'dark:border-gray-700',
      'p-4',
      'sm:p-6',
      'space-y-4'
    );
  });

  it('renders with proper section structure', () => {
    render(<GameLogsFilters {...defaultProps} />);

    // Check that both sections are rendered
    expect(screen.getByText('Search & Filter')).toBeInTheDocument();

    // Check that the sort section has the border-t class (indicating it's separated)
    const sortSection = screen.getByTestId('game-logs-sort').closest('div');
    expect(sortSection?.parentElement).toHaveClass(
      'border-t',
      'border-gray-200',
      'dark:border-gray-700',
      'pt-4'
    );
  });

  it('handles missing callback functions gracefully', () => {
    const noCallbacksProps = {
      ...defaultProps,
      onSearchChange: () => {},
      onSearchClear: () => {},
      onSort: () => {},
    };

    render(<GameLogsFilters {...noCallbacksProps} />);

    // Should render without errors
    expect(screen.getByTestId('game-logs-search')).toBeInTheDocument();
    expect(screen.getByTestId('game-logs-sort')).toBeInTheDocument();
  });

  it('handles all props being optional', () => {
    const minimalProps = {
      searchTerm: '',
      searchField: 'title',
      sortConfig: {
        field: 'date',
        direction: 'asc' as const,
      },
      displayedCount: 0,
      totalCount: 0,
      classification: 'all',
      onSearchChange: () => {},
      onSearchClear: () => {},
      onSort: () => {},
    };

    render(<GameLogsFilters {...minimalProps} />);

    // Should render without errors
    expect(screen.getByTestId('game-logs-search')).toBeInTheDocument();
    expect(screen.getByTestId('game-logs-sort')).toBeInTheDocument();
  });
});
