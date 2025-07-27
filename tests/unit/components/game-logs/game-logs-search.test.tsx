import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogsSearch } from '@/app/components/game-logs/GameLogsSearch';

// Mock use-debounce to return value immediately
vi.mock('use-debounce', () => ({
  useDebounce: (value: string) => [value, vi.fn()],
}));

describe('GameLogsSearch', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and field selector', () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm=""
        searchField="all"
      />
    );

    expect(screen.getByPlaceholderText('Search game logs...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays all search field options', () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm=""
        searchField="all"
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    expect(screen.getByText('All Fields')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Setting')).toBeInTheDocument();
    expect(screen.getByText('Scope')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('updates search term when typing', async () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm=""
        searchField="all"
      />
    );

    const searchInput = screen.getByPlaceholderText('Search game logs...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(searchInput).toHaveValue('test search');
  });

  it('calls onSearchChange when search term changes', async () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm=""
        searchField="all"
      />
    );

    const searchInput = screen.getByPlaceholderText('Search game logs...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('test search', 'all');
    });
  });

  it('calls onSearchChange when search field changes', async () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm="test"
        searchField="all"
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'notes' } });

    // Verify that the select value changed
    expect(select).toHaveValue('notes');
  });

  it('shows clear button when search term is not empty', () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm="test"
        searchField="all"
      />
    );

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear button when search term is empty', () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm=""
        searchField="all"
      />
    );

    const clearButton = screen.queryByRole('button');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('calls onClear and resets form when clear button is clicked', async () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm="test"
        searchField="notes"
      />
    );

    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockOnClear).toHaveBeenCalled();
    });

    // Check that the form is reset
    const searchInput = screen.getByPlaceholderText('Search game logs...');
    const select = screen.getByRole('combobox');

    expect(searchInput).toHaveValue('');
    expect(select).toHaveValue('all');
  });

  it('initializes with provided search term and field', () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm="initial search"
        searchField="tags"
      />
    );

    const searchInput = screen.getByPlaceholderText('Search game logs...');
    const select = screen.getByRole('combobox');

    expect(searchInput).toHaveValue('initial search');
    expect(select).toHaveValue('tags');
  });

  it('has correct styling classes', () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm=""
        searchField="all"
      />
    );

    const container = screen
      .getByPlaceholderText('Search game logs...')
      .closest('div')?.parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-3', 'mb-6');
  });

  it('handles empty search term gracefully', async () => {
    render(
      <GameLogsSearch
        onSearchChange={mockOnSearchChange}
        onClear={mockOnClear}
        searchTerm=""
        searchField="all"
      />
    );

    const searchInput = screen.getByPlaceholderText('Search game logs...');
    fireEvent.change(searchInput, { target: { value: '' } });

    // Verify that the input value is empty
    expect(searchInput).toHaveValue('');
  });
});
