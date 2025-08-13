import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogsTable } from '@/app/components/game-logs/GameLogsTable';

// Mock the useUser hook
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    user: null,
  })),
}));

// Mock the useGameLogs hook
vi.mock('@/hooks/use-game-logs', () => ({
  useGameLogs: vi.fn(() => ({
    gameLogs: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    gameLogsHasNextPage: false,
    gameLogsTotalCount: 0,
    loadMoreGameLogs: vi.fn(),
  })),
  useFriendsGameLogs: vi.fn(() => ({
    logs: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
    hasNextPage: false,
    totalCount: 0,
    loadMore: vi.fn(),
  })),
}));

// Mock components
vi.mock('@/app/components/game-logs/GameLogCard', () => ({
  GameLogCard: ({ log }: any) => (
    <div data-testid="game-log-card" data-log-id={log.id}>
      Game Log Card for {log.id}
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/MobileGameLogsTable', () => ({
  MobileGameLogsTable: ({ logs }: any) => (
    <div data-testid="mobile-game-logs-table">Mobile Table with {logs.length} logs</div>
  ),
}));

describe('GameLogsTable Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      expect(() => {
        render(<GameLogsTable />);
      }).not.toThrow();
    });

    it('renders sign-in message when not authenticated', () => {
      render(<GameLogsTable />);
      expect(screen.getByText('Please sign in to view game logs.')).toBeInTheDocument();
    });
  });
});
