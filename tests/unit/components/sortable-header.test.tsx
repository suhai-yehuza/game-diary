import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SortableHeader } from '@src/app/protected/admin/database/components/ui';

describe('SortableHeader', () => {
  const mockOnSort = vi.fn();

  beforeEach(() => {
    mockOnSort.mockClear();
  });

  it('renders with correct text content', () => {
    render(
      <SortableHeader
        sortKey="username"
        currentSortKey={null}
        currentSortDirection={null}
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('calls onSort with correct parameters when clicked', () => {
    render(
      <SortableHeader
        sortKey="username"
        currentSortKey={null}
        currentSortDirection={null}
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    fireEvent.click(screen.getByText('Username'));
    expect(mockOnSort).toHaveBeenCalledWith('username', 'asc');
  });

  it('cycles through sort directions correctly', () => {
    const { rerender } = render(
      <SortableHeader
        sortKey="username"
        currentSortKey={null}
        currentSortDirection={null}
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    // First click: asc
    fireEvent.click(screen.getByText('Username'));
    expect(mockOnSort).toHaveBeenCalledWith('username', 'asc');

    // Rerender with asc state
    rerender(
      <SortableHeader
        sortKey="username"
        currentSortKey="username"
        currentSortDirection="asc"
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    // Second click: desc
    fireEvent.click(screen.getByText('Username'));
    expect(mockOnSort).toHaveBeenCalledWith('username', 'desc');

    // Rerender with desc state
    rerender(
      <SortableHeader
        sortKey="username"
        currentSortKey="username"
        currentSortDirection="desc"
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    // Third click: null (no sort)
    fireEvent.click(screen.getByText('Username'));
    expect(mockOnSort).toHaveBeenCalledWith('username', null);
  });

  it('shows correct sort indicators', () => {
    const { rerender } = render(
      <SortableHeader
        sortKey="username"
        currentSortKey={null}
        currentSortDirection={null}
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    // No sort indicator when not sorted - should show ArrowUpDown icon
    const arrowUpDown = screen.getByTestId('arrow-up-down');
    expect(arrowUpDown).toHaveClass('text-white/70');

    // Ascending sort indicator
    rerender(
      <SortableHeader
        sortKey="username"
        currentSortKey="username"
        currentSortDirection="asc"
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    const arrowUp = screen.getByTestId('arrow-up');
    expect(arrowUp).toHaveClass('text-yellow-300');

    // Descending sort indicator
    rerender(
      <SortableHeader
        sortKey="username"
        currentSortKey="username"
        currentSortDirection="desc"
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    const arrowDown = screen.getByTestId('arrow-down');
    expect(arrowDown).toHaveClass('text-yellow-300');
  });

  it('applies correct CSS classes based on sort state', () => {
    const { rerender } = render(
      <SortableHeader
        sortKey="username"
        currentSortKey={null}
        currentSortDirection={null}
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    const header = screen.getByText('Username').closest('th');
    expect(header).toHaveClass('cursor-pointer', 'hover:bg-emerald-500/20');

    // When sorted - should have active background
    rerender(
      <SortableHeader
        sortKey="username"
        currentSortKey="username"
        currentSortDirection="asc"
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    expect(header).toHaveClass('cursor-pointer', 'hover:bg-emerald-500/20', 'bg-emerald-500/30');
  });

  it('handles different sort keys correctly', () => {
    render(
      <SortableHeader
        sortKey="email"
        currentSortKey="username"
        currentSortDirection="asc"
        onSort={mockOnSort}
      >
        Email
      </SortableHeader>
    );

    fireEvent.click(screen.getByText('Email'));
    expect(mockOnSort).toHaveBeenCalledWith('email', 'asc');
  });

  it('is accessible with proper ARIA attributes', () => {
    render(
      <SortableHeader
        sortKey="username"
        currentSortKey="username"
        currentSortDirection="asc"
        onSort={mockOnSort}
      >
        Username
      </SortableHeader>
    );

    const header = screen.getByText('Username').closest('th');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('cursor-pointer');
    expect(header).toHaveAttribute('role', 'columnheader');
  });
});
