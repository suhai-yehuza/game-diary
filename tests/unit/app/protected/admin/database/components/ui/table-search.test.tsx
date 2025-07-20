import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { TableSearch } from '@src/app/protected/admin/database/components/ui/table-search';

describe('TableSearch', () => {
  const defaultProps = {
    searchTerm: '',
    searchField: 'all',
    onSearchChange: vi.fn(),
    onClear: vi.fn(),
    placeholder: 'Search...',
    searchFields: [
      { value: 'all', label: 'All Fields' },
      { value: 'username', label: 'Username' },
      { value: 'email', label: 'Email' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input with placeholder', () => {
    render(<TableSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders search field dropdown', () => {
    render(<TableSearch {...defaultProps} />);

    expect(screen.getByDisplayValue('All Fields')).toBeInTheDocument();
  });

  it('displays current search term in input', () => {
    render(<TableSearch {...defaultProps} searchTerm="test search" />);

    const searchInput = screen.getByDisplayValue('test search');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onSearchChange when search field changes', () => {
    render(<TableSearch {...defaultProps} />);

    const dropdown = screen.getByDisplayValue('All Fields');
    fireEvent.change(dropdown, { target: { value: 'username' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('', 'username');
  });

  it('shows clear button when search term exists', () => {
    render(<TableSearch {...defaultProps} searchTerm="test" />);

    // There should be at least one button (the Clear button)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('hides clear button when search term is empty', () => {
    render(<TableSearch {...defaultProps} searchTerm="" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    render(<TableSearch {...defaultProps} searchTerm="test" />);

    // Find the Clear button specifically
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  it('renders all search field options', () => {
    render(<TableSearch {...defaultProps} />);

    const dropdown = screen.getByDisplayValue('All Fields');
    fireEvent.click(dropdown);

    expect(screen.getByText('All Fields')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('applies correct CSS classes to search input', () => {
    render(<TableSearch {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toHaveClass(
      'w-full',
      'pl-10',
      'pr-10',
      'py-2',
      'border',
      'border-border',
      'rounded-md',
      'bg-background',
      'text-foreground',
      'placeholder:text-muted-foreground',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-ring',
      'focus:border-transparent'
    );
  });

  it('applies correct CSS classes to dropdown', () => {
    render(<TableSearch {...defaultProps} />);

    const dropdown = screen.getByDisplayValue('All Fields');
    expect(dropdown).toHaveClass(
      'px-3',
      'py-2',
      'border',
      'border-border',
      'rounded-md',
      'bg-background',
      'text-foreground',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-ring',
      'focus:border-transparent',
      'appearance-none',
      'pr-8'
    );
  });

  it('renders with custom placeholder', () => {
    render(<TableSearch {...defaultProps} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('maintains search term state across re-renders', () => {
    const { rerender } = render(<TableSearch {...defaultProps} searchTerm="initial" />);

    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();

    rerender(<TableSearch {...defaultProps} searchTerm="updated" />);

    expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
  });
});
