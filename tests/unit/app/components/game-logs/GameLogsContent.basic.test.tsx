import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { GameLogsContent } from '@/app/components/game-logs/GameLogsContent';
import type { IGameLog } from '@/types';
import { CLASSIFICATION } from '@/types';

// Mock the child components
vi.mock('@/app/components/optimized/GameLogCard', () => ({
  GameLogCard: ({ gameLog, showActions, onEdit, onDelete }: any) => (
    <div data-testid="game-log-item">
      <div>{gameLog?.notes || 'No notes'}</div>
      {showActions && onEdit && onDelete && (
        <div>
          <button onClick={() => onEdit(gameLog)} data-testid="edit-button">
            Edit
          </button>
          <button onClick={() => onDelete(gameLog)} data-testid="delete-button">
            Delete
          </button>
        </div>
      )}
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/GameLogsPagination', () => ({
  GameLogsPagination: ({ hasNextPage, loading, onLoadMore }: any) => (
    <div data-testid="game-logs-pagination">
      <button
        onClick={onLoadMore}
        disabled={loading || !hasNextPage}
        data-testid="load-more-button"
      >
        Load More
      </button>
    </div>
  ),
}));

vi.mock('@/app/components/ui/Tabs', () => ({
  TabsContent: ({ children, value, className, 'data-testid': testId }: any) => (
    <div data-testid={testId} className={className} data-value={value}>
      {children}
    </div>
  ),
}));

const createMockGameLog = (id: string, overrides: Partial<IGameLog> = {}): IGameLog => ({
  id,
  game_id: `game-${id}`,
  rating_for_game: 4,
  notes: `Test notes for log ${id}`,
  tags: ['test', 'basketball'],
  watched_setting: 'TV',
  watched_scope: 'Full Game',
  watched_date: '2024-01-15',
  classification: CLASSIFICATION.PUBLIC,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  game: {
    id: `game-${id}`,
    date: '2024-01-15',
    status: { short: '', long: 'Finished' },
    teams: {
      home: {
        id: 'team-1',
        name: 'Lakers',
        nickname: 'Lakers',
        code: 'LAL',
        logo: null,
      },
      away: {
        id: 'team-2',
        name: 'Warriors',
        nickname: 'Warriors',
        code: 'GSW',
        logo: null,
      },
    },
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  user: {
    id: 'user-1',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
  },
  totalCommentCount: 0,
  totalReactionCount: 0,
  ...overrides,
});

describe('GameLogsContent', () => {
  const defaultProps = {
    tabValue: 'my-logs',
    logs: [],
    loading: false,
    hasNextPage: false,
    totalCount: 0,
    showActions: false,
    onLoadMore: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    filteredAndSortedLogs: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('renders loading message for my-logs tab', () => {
      render(<GameLogsContent {...defaultProps} loading={true} tabValue="my-logs" />);

      expect(screen.getByText('Loading your game logs...')).toBeInTheDocument();
      expect(screen.getByText('Optimized loading with reduced page size')).toBeInTheDocument();
    });

    it('renders loading message for friends-logs tab', () => {
      render(<GameLogsContent {...defaultProps} loading={true} tabValue="friends-logs" />);

      expect(screen.getByText("Loading friends' game logs...")).toBeInTheDocument();
    });

    it('renders loading message for public-logs tab', () => {
      render(<GameLogsContent {...defaultProps} loading={true} tabValue="public-logs" />);

      expect(screen.getByText('Loading public game logs...')).toBeInTheDocument();
    });

    it('renders default loading message for unknown tab', () => {
      render(<GameLogsContent {...defaultProps} loading={true} tabValue="unknown-tab" />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('applies correct CSS classes to loading container', () => {
      render(<GameLogsContent {...defaultProps} loading={true} />);

      const loadingContainer = screen.getByText('Loading your game logs...').parentElement;
      expect(loadingContainer).toHaveClass('text-center', 'py-8');
    });
  });

  describe('Empty State', () => {
    it('renders empty message for my-logs tab', () => {
      render(<GameLogsContent {...defaultProps} logs={[]} tabValue="my-logs" />);

      expect(screen.getByText('No game logs found. Create your first one!')).toBeInTheDocument();
    });

    it('renders empty message for friends-logs tab', () => {
      render(<GameLogsContent {...defaultProps} logs={[]} tabValue="friends-logs" />);

      expect(screen.getByText("No friends' game logs found.")).toBeInTheDocument();
    });

    it('renders empty message for public-logs tab', () => {
      render(<GameLogsContent {...defaultProps} logs={[]} tabValue="public-logs" />);

      expect(screen.getByText('No public game logs found.')).toBeInTheDocument();
    });

    it('renders default empty message for unknown tab', () => {
      render(<GameLogsContent {...defaultProps} logs={[]} tabValue="unknown-tab" />);

      expect(screen.getByText('No game logs found.')).toBeInTheDocument();
    });

    it('applies correct CSS classes to empty state container', () => {
      render(<GameLogsContent {...defaultProps} logs={[]} />);

      const emptyContainer = screen.getByText(
        'No game logs found. Create your first one!'
      ).parentElement;
      expect(emptyContainer).toHaveClass('text-center', 'py-8');
    });
  });

  describe('Game Logs Display', () => {
    it('renders game logs when data is available', () => {
      const mockLogs = [createMockGameLog('1'), createMockGameLog('2')];

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          totalCount={2}
        />
      );

      expect(screen.getByText('Showing 2 of 2 of your game logs')).toBeInTheDocument();
      const gameLogItems = screen.getAllByTestId('game-log-item');
      expect(gameLogItems).toHaveLength(2);
    });

    it('renders correct count message for friends-logs tab', () => {
      const mockLogs = [createMockGameLog('1')];

      render(
        <GameLogsContent
          {...defaultProps}
          tabValue="friends-logs"
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          totalCount={1}
        />
      );

      expect(screen.getByText("Showing 1 of 1 friends' game logs")).toBeInTheDocument();
    });

    it('renders correct count message for public-logs tab', () => {
      const mockLogs = [createMockGameLog('1')];

      render(
        <GameLogsContent
          {...defaultProps}
          tabValue="public-logs"
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          totalCount={1}
        />
      );

      expect(screen.getByText('Showing 1 of 1 game logs')).toBeInTheDocument();
    });

    it('renders filtered and sorted logs instead of raw logs', () => {
      const rawLogs = [createMockGameLog('1'), createMockGameLog('2')];
      const filteredLogs = [createMockGameLog('2')]; // Only second log

      render(
        <GameLogsContent
          {...defaultProps}
          logs={rawLogs}
          filteredAndSortedLogs={filteredLogs}
          totalCount={2}
        />
      );

      // Should show filtered count in message
      expect(screen.getByText('Showing 2 of 2 of your game logs')).toBeInTheDocument();
      // But only render filtered logs
      const gameLogItems = screen.getAllByTestId('game-log-item');
      expect(gameLogItems).toHaveLength(1); // Only one filtered log
    });
  });

  describe('Actions Display', () => {
    it('shows actions when showActions is true', () => {
      const mockLogs = [createMockGameLog('1')];

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          showActions={true}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    it('hides actions when showActions is false', () => {
      const mockLogs = [createMockGameLog('1')];

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          showActions={false}
        />
      );

      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
      const mockLogs = [createMockGameLog('1')];
      const onEdit = vi.fn();

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          showActions={true}
          onEdit={onEdit}
        />
      );

      fireEvent.click(screen.getByTestId('edit-button'));
      expect(onEdit).toHaveBeenCalledWith(mockLogs[0]);
    });

    it('calls onDelete when delete button is clicked', () => {
      const mockLogs = [createMockGameLog('1')];
      const onDelete = vi.fn();

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          showActions={true}
          onDelete={onDelete}
        />
      );

      fireEvent.click(screen.getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledWith(mockLogs[0]);
    });
  });

  describe('Pagination', () => {
    it('renders pagination component', () => {
      const mockLogs = [createMockGameLog('1')];

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          hasNextPage={true}
        />
      );

      expect(screen.getByTestId('game-logs-pagination')).toBeInTheDocument();
      expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    it('calls onLoadMore when load more button is clicked', () => {
      const mockLogs = [createMockGameLog('1')];
      const onLoadMore = vi.fn();

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          hasNextPage={true}
          onLoadMore={onLoadMore}
        />
      );

      fireEvent.click(screen.getByTestId('load-more-button'));
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('disables load more button when loading', () => {
      const mockLogs = [createMockGameLog('1')];

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          hasNextPage={true}
          loading={true}
        />
      );

      // When loading is true, the component should show loading state instead of pagination
      expect(screen.getByText('Loading your game logs...')).toBeInTheDocument();
      expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    it('disables load more button when no next page', () => {
      const mockLogs = [createMockGameLog('1')];

      render(
        <GameLogsContent
          {...defaultProps}
          logs={mockLogs}
          filteredAndSortedLogs={mockLogs}
          hasNextPage={false}
        />
      );

      const loadMoreButton = screen.getByTestId('load-more-button');
      expect(loadMoreButton).toBeDisabled();
    });
  });

  describe('TabsContent Integration', () => {
    it('renders with correct tab value', () => {
      render(<GameLogsContent {...defaultProps} tabValue="my-logs" />);

      const tabsContent = screen.getByTestId('tabs-content-my-logs');
      expect(tabsContent).toBeInTheDocument();
      expect(tabsContent).toHaveAttribute('data-value', 'my-logs');
    });

    it('applies correct CSS classes to tabs content', () => {
      render(<GameLogsContent {...defaultProps} />);

      const tabsContent = screen.getByTestId('tabs-content-my-logs');
      expect(tabsContent).toHaveClass('space-y-4');
    });
  });

  describe('Edge Cases', () => {
    it('handles null logs gracefully', () => {
      render(<GameLogsContent {...defaultProps} logs={null as any} />);

      // When logs is null, the component should render nothing (empty TabsContent)
      const tabsContent = screen.getByTestId('tabs-content-my-logs');
      expect(tabsContent).toBeInTheDocument();
      expect(tabsContent.children).toHaveLength(0);
    });

    it('handles undefined logs gracefully', () => {
      render(<GameLogsContent {...defaultProps} logs={undefined as any} />);

      // When logs is undefined, the component should render nothing (empty TabsContent)
      const tabsContent = screen.getByTestId('tabs-content-my-logs');
      expect(tabsContent).toBeInTheDocument();
      expect(tabsContent.children).toHaveLength(0);
    });

    it('handles logs that are not arrays', () => {
      render(<GameLogsContent {...defaultProps} logs={'not-an-array' as any} />);

      // When logs is not an array, the component should render nothing (empty TabsContent)
      const tabsContent = screen.getByTestId('tabs-content-my-logs');
      expect(tabsContent).toBeInTheDocument();
      expect(tabsContent.children).toHaveLength(0);
    });

    it('renders empty state when logs array is empty but totalCount is greater than 0', () => {
      render(<GameLogsContent {...defaultProps} logs={[]} totalCount={5} />);

      expect(screen.getByText('No game logs found. Create your first one!')).toBeInTheDocument();
    });
  });
});
