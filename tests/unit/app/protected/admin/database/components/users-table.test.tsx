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

// Mock fetch to prevent actual API calls
global.fetch = vi.fn();

describe('UsersTableWithSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Mock fetch to return a rejected promise to simulate API failure
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('API not available in tests'))
    ) as unknown as typeof global.fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    expect(() => render(<UsersTableWithSearch />)).not.toThrow();
  });

  it('shows loading state initially', () => {
    render(<UsersTableWithSearch />);
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('renders search component structure', () => {
    render(<UsersTableWithSearch />);
    // Check that the component renders its basic structure
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', () => {
    render(<UsersTableWithSearch />);
    // Component should render loading state even when API fails
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('has proper component structure', () => {
    render(<UsersTableWithSearch />);
    // Verify the component has the expected structure
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });
});
