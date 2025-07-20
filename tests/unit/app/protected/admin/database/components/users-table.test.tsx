import { render, screen } from '@testing-library/react';
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search component', () => {
    render(<UsersTableWithSearch />);

    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UsersTableWithSearch />);

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('user_id')).toBeInTheDocument();
    expect(screen.getByText('email_address')).toBeInTheDocument();
    expect(screen.getByText('phone_number')).toBeInTheDocument();
    expect(screen.getByText('created_at')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<UsersTableWithSearch />);

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('applies correct CSS classes to table', () => {
    render(<UsersTableWithSearch />);

    const table = screen.getByRole('table');
    expect(table).toHaveClass('w-full');
  });

  it('applies correct CSS classes to table headers', () => {
    render(<UsersTableWithSearch />);

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
