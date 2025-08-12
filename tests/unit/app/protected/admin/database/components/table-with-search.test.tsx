import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import TableWithSearch from '@/app/protected/admin/database/components/TableWithSearch';
import type { ITestItem } from '@/lib/types/admin.types';

// Mock fetch
global.fetch = vi.fn();

// Mock the config
vi.mock('@/lib/config/app.config', () => ({
  API_CONFIG: {
    pagination: {
      DEFAULT_PAGE_SIZE: 10,
    },
  },
}));

// Mock the UI components
vi.mock('@/app/protected/admin/database/components/ui/error-boundary', () => ({
  ErrorBoundary: ({ children, componentName }: any) => (
    <div data-testid="error-boundary" data-component-name={componentName}>
      {children}
    </div>
  ),
}));

vi.mock('@/app/protected/admin/database/components/ui/error-display', () => ({
  ErrorDisplay: ({ error }: any) => (error ? <div data-testid="error-display">{error}</div> : null),
}));

vi.mock('@/app/protected/admin/database/components/ui/pagination-controls', () => ({
  PaginationControls: ({ onPageChange, currentPage, hasNextPage, hasPreviousPage }: any) => (
    <div data-testid="pagination-controls">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={!hasPreviousPage}>
        Previous
      </button>
      <span>Page {currentPage}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={!hasNextPage}>
        Next
      </button>
    </div>
  ),
}));

vi.mock('@/app/protected/admin/database/components/ui/pagination-info', () => ({
  PaginationInfo: ({ currentPage, totalCount, pageSize }: any) => (
    <div data-testid="pagination-info">
      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)}{' '}
      of {totalCount} items
    </div>
  ),
}));

vi.mock('@/app/protected/admin/database/components/ui/sortable-header', () => ({
  SortableHeader: ({ label, sortKey, currentSortKey, currentSortDirection, onSort }: any) => (
    <button
      data-testid={`sort-header-${sortKey}`}
      onClick={() => onSort(sortKey)}
      className={`sortable-header ${currentSortKey === sortKey ? 'active' : ''}`}
    >
      {label} {currentSortKey === sortKey ? (currentSortDirection === 'asc' ? '↑' : '↓') : ''}
    </button>
  ),
}));

vi.mock('@/app/protected/admin/database/components/ui/table-search', () => ({
  TableSearch: ({ onSearch, onSearchFieldChange, searchTerm, searchField, searchFields }: any) => (
    <div data-testid="table-search">
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={e => onSearch(e.target.value)}
        placeholder="Search..."
      />
      <select
        data-testid="search-field-select"
        value={searchField}
        onChange={e => onSearchFieldChange(e.target.value)}
      >
        {searchFields.map((field: any) => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

const mockColumns = [
  { key: 'name' as keyof ITestItem, label: 'Name', sortable: true },
  { key: 'email' as keyof ITestItem, label: 'Email', sortable: true },
  { key: 'createdAt' as keyof ITestItem, label: 'Created At', sortable: true },
];

const mockData: ITestItem[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: '2023-01-02' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', createdAt: '2023-01-03' },
];

describe('TableWithSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: mockData,
        totalCount: mockData.length,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      }),
    });
  });

  it('renders the table with search functionality', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('table-search')).toBeInTheDocument();
  });

  it('renders with correct component name in error boundary', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    const errorBoundary = screen.getByTestId('error-boundary');
    expect(errorBoundary).toHaveAttribute('data-component-name', 'usersTable');
  });

  it('renders search components', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-field-select')).toBeInTheDocument();
  });

  it('renders sortable headers for sortable columns', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    expect(screen.getByTestId('sort-header-name')).toBeInTheDocument();
    expect(screen.getByTestId('sort-header-email')).toBeInTheDocument();
    expect(screen.getByTestId('sort-header-createdAt')).toBeInTheDocument();
  });

  it('renders pagination components', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-info')).toBeInTheDocument();
  });

  it('renders search input field', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search...');
  });

  it('renders search field select', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    const searchFieldSelect = screen.getByTestId('search-field-select');
    expect(searchFieldSelect).toBeInTheDocument();
  });

  it('handles sort header clicks', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    const nameHeader = screen.getByTestId('sort-header-name');
    fireEvent.click(nameHeader);
    expect(nameHeader).toHaveClass('sortable-header', 'active');
  });

  it('handles pagination navigation', () => {
    render(<TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />);

    const paginationControls = screen.getByTestId('pagination-controls');
    const nextButton = paginationControls.querySelector('button:last-child');
    if (nextButton) {
      fireEvent.click(nextButton);
    }
  });

  it('renders with custom item label', () => {
    render(<TableWithSearch tableName="products" columns={mockColumns} itemLabel="product" />);

    expect(screen.getByTestId('pagination-info')).toBeInTheDocument();
  });

  it('maintains proper component structure', () => {
    const { container } = render(
      <TableWithSearch tableName="users" columns={mockColumns} itemLabel="user" />
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});
