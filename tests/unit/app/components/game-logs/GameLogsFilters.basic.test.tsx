import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogsFilters } from '@/app/components/game-logs/GameLogsFilters';

describe('GameLogsFilters', () => {
  const defaultProps = {
    onFiltersChange: vi.fn(),
    initialFilters: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct header', () => {
    render(<GameLogsFilters {...defaultProps} />);
    expect(screen.getByText('Game Logs Filters')).toBeInTheDocument();
    expect(screen.getByText('Filter game logs by team, user, dates, and more')).toBeInTheDocument();
  });

  it('renders show filters button', () => {
    render(<GameLogsFilters {...defaultProps} />);
    expect(screen.getByText('Show Filters')).toBeInTheDocument();
  });

  it('expands filters when show filters button is clicked', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const showFiltersButton = screen.getByText('Show Filters');
    fireEvent.click(showFiltersButton);

    expect(screen.getByText('Hide Filters')).toBeInTheDocument();
    expect(screen.getByText('Team:')).toBeInTheDocument();
    expect(screen.getByText('User:')).toBeInTheDocument();
    expect(screen.getByText('Tags:')).toBeInTheDocument();
    expect(screen.getByText('Rating:')).toBeInTheDocument();
  });

  it('renders all filter inputs when expanded', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const showFiltersButton = screen.getByText('Show Filters');
    fireEvent.click(showFiltersButton);

    // Check for input fields
    expect(screen.getByPlaceholderText('Search by team name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by username or name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by tags...')).toBeInTheDocument();

    // Check for date inputs - there are multiple date inputs, so we check for the specific ones
    expect(screen.getAllByDisplayValue('')).toHaveLength(7); // 7 inputs total (3 text + 4 date)
  });

  it('calls onFiltersChange when filters are updated', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const showFiltersButton = screen.getByText('Show Filters');
    fireEvent.click(showFiltersButton);

    const teamInput = screen.getByPlaceholderText('Search by team name...');
    fireEvent.change(teamInput, { target: { value: 'Lakers' } });

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        teamName: 'Lakers',
      })
    );
  });

  it('shows clear all button when filters are active', () => {
    const propsWithFilters = {
      ...defaultProps,
      initialFilters: {
        teamName: 'Lakers',
        username: 'testuser',
      },
    };

    render(<GameLogsFilters {...propsWithFilters} />);
    const showFiltersButton = screen.getByText('Show Filters');
    fireEvent.click(showFiltersButton);

    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('clears all filters when clear all button is clicked', () => {
    const propsWithFilters = {
      ...defaultProps,
      initialFilters: {
        teamName: 'Lakers',
        username: 'testuser',
      },
    };

    render(<GameLogsFilters {...propsWithFilters} />);
    const showFiltersButton = screen.getByText('Show Filters');
    fireEvent.click(showFiltersButton);

    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    expect(defaultProps.onFiltersChange).toHaveBeenCalledWith({
      teamName: '',
      username: '',
      tags: '',
      watchedDateFrom: '',
      watchedDateTo: '',
      gameDateFrom: '',
      gameDateTo: '',
      rating: '',
      watchedSetting: '',
      watchedScope: '',
    });
  });

  it('applies correct CSS classes to main container', () => {
    render(<GameLogsFilters {...defaultProps} />);
    const container = screen.getByText('Game Logs Filters').closest('div')?.parentElement
      ?.parentElement?.parentElement;
    expect(container).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-xl',
      'border',
      'border-gray-200',
      'dark:border-gray-700'
    );
  });

  it('handles missing callback functions gracefully', () => {
    const propsWithoutCallback = {
      onFiltersChange: undefined,
      initialFilters: {},
    };

    // Should render without errors
    expect(() => render(<GameLogsFilters {...propsWithoutCallback} />)).not.toThrow();
  });

  it('handles all props being optional', () => {
    // Should render without errors
    expect(() => render(<GameLogsFilters />)).not.toThrow();
  });
});
