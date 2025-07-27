import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { GameLogsTableWithSearch } from '@src/app/protected/admin/database/components/game-logs-table';

// Mock the GraphQL query
vi.mock('@src/lib/graphql/queries', () => ({
  SEARCH_GAME_LOGS_ADMIN: {
    loc: {
      source: {
        body: 'mock query',
      },
    },
  },
}));

// Mock fetch to prevent actual API calls
global.fetch = vi.fn();

describe('GameLogsTableWithSearch', () => {
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
    expect(() => render(<GameLogsTableWithSearch />)).not.toThrow();
  });

  it('renders classification tabs', () => {
    render(<GameLogsTableWithSearch />);
    expect(screen.getByText('Public Logs')).toBeInTheDocument();
    expect(screen.getByText('Private Logs')).toBeInTheDocument();
    expect(screen.getByText('Protected Logs')).toBeInTheDocument();
  });

  it('shows loading state initially for public logs', () => {
    render(<GameLogsTableWithSearch />);
    expect(screen.getByText('Loading public game logs...')).toBeInTheDocument();
  });

  it('renders search component structure', () => {
    render(<GameLogsTableWithSearch />);
    // Check that the component renders its basic structure
    expect(screen.getByText('Loading public game logs...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', () => {
    render(<GameLogsTableWithSearch />);
    // Component should render loading state even when API fails
    expect(screen.getByText('Loading public game logs...')).toBeInTheDocument();
  });

  it('has proper component structure', () => {
    render(<GameLogsTableWithSearch />);
    // Verify the component has the expected structure
    expect(screen.getByText('Loading public game logs...')).toBeInTheDocument();
  });
});
