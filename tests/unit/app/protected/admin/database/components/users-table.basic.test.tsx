import { render, screen, act } from '@testing-library/react';
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

  it('renders without crashing', async () => {
    await act(async () => {
      expect(() => render(<UsersTableWithSearch />)).not.toThrow();
    });
  });

  it('shows search interface initially', async () => {
    await act(async () => {
      render(<UsersTableWithSearch />);
    });
    // Check for search input instead of loading text
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('renders search component structure', async () => {
    await act(async () => {
      render(<UsersTableWithSearch />);
    });
    // Check that the component renders its basic structure
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    await act(async () => {
      render(<UsersTableWithSearch />);
    });
    // Component should render search interface even when API fails
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('has proper component structure', async () => {
    await act(async () => {
      render(<UsersTableWithSearch />);
    });
    // Verify the component has the expected structure
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });
});
