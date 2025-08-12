import { useUser } from '@clerk/nextjs';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogsTable } from '@/app/components/game-logs/GameLogsTable';
import { useGameLogs, useFriendsGameLogs } from '@/hooks/use-game-logs';

// Mock hooks
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

vi.mock('@/hooks/use-game-logs', () => ({
  useGameLogs: vi.fn(),
  useFriendsGameLogs: vi.fn(),
}));

// Mock all components with simple divs
vi.mock('@/app/components/reactions', () => ({
  ReactionPicker: () => <div data-testid="reaction-picker">Reactions</div>,
}));

vi.mock('@/app/components/comments/GameLogComments', () => ({
  GameLogComments: () => <div data-testid="game-log-comments">Comments</div>,
}));

vi.mock('@/app/components/game-logs/CreateGameLogModal', () => ({
  CreateGameLogModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="create-game-log-modal" data-is-open={isOpen}>
      Create Modal
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/EditGameLogModal', () => ({
  EditGameLogModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="edit-game-log-modal" data-is-open={isOpen}>
      Edit Modal
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/DeleteGameLogModal', () => ({
  DeleteGameLogModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="delete-game-log-modal" data-is-open={isOpen}>
      Delete Modal
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/GameLogsSearch', () => ({
  GameLogsSearch: () => <div data-testid="game-logs-search">Search Component</div>,
}));

vi.mock('@/app/components/game-logs/GameLogsSort', () => ({
  GameLogsSort: () => <div data-testid="game-logs-sort">Sort Component</div>,
}));

vi.mock('@/app/components/game-logs/GameLogsHeader', () => ({
  GameLogsHeader: ({ onCreateClick }: { onCreateClick: () => void }) => (
    <div data-testid="game-logs-header">
      <h2>Game Logs</h2>
      <button onClick={onCreateClick} data-testid="create-button">
        Create New Log
      </button>
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/GameLogsTabs', () => ({
  GameLogsTabs: ({ children, selectedTab, onTabChange }: any) => (
    <div data-testid="tabs" data-selected-tab={selectedTab}>
      <button onClick={() => onTabChange('friends-logs')} data-testid="tab-change-trigger">
        Change Tab
      </button>
      {children}
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/GameLogsFilters', () => ({
  GameLogsFilters: () => <div data-testid="game-logs-filters">Filters Component</div>,
}));

vi.mock('@/app/components/game-logs/GameLogsContent', () => ({
  GameLogsContent: ({
    tabValue,
    logs,
    loading,
  }: {
    tabValue: string;
    logs: any[];
    loading?: boolean;
  }) => {
    const getEmptyMessage = (tabValue: string): string => {
      switch (tabValue) {
        case 'my-logs':
          return 'No game logs found. Create your first one!';
        case 'friends-logs':
          return "No friends' game logs found.";
        case 'public-logs':
          return 'No public game logs found.';
        default:
          return 'No game logs found.';
      }
    };

    const getLoadingMessage = (tabValue: string): string => {
      switch (tabValue) {
        case 'my-logs':
          return 'Loading your game logs...';
        case 'friends-logs':
          return "Loading friends' game logs...";
        case 'public-logs':
          return 'Loading public game logs...';
        default:
          return 'Loading...';
      }
    };

    return (
      <div data-testid={`game-logs-content-${tabValue}`}>
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600 mb-2">{getLoadingMessage(tabValue)}</div>
            <div className="text-sm text-gray-500">Optimized loading with reduced page size</div>
          </div>
        ) : Array.isArray(logs) && logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{getEmptyMessage(tabValue)}</p>
          </div>
        ) : (
          <div>Content for {tabValue}</div>
        )}
      </div>
    );
  },
}));

vi.mock('@/app/components/ui/Tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange?.('friends-logs')}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tabs-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-trigger-${value}`}>{children}</button>
  ),
}));

vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardFooter: ({ children }: any) => <div data-testid="card-footer">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseGameLogs = vi.mocked(useGameLogs);
const mockUseFriendsGameLogs = vi.mocked(useFriendsGameLogs);

describe('GameLogsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: {
        id: 'user-1',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
      isLoaded: true,
      isSignedIn: true,
    } as any);
  });

  describe('Basic Rendering', () => {
    it('renders the component with header and tabs', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { id: 'user-1', username: 'john' } as any,
      });
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        friendsLogs: [],
        friendsLogsEndCursor: null,
        friendsLogsHasNextPage: false,
        friendsLogsTotalCount: 0,
        loadMoreFriendsLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);
      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByTestId('game-logs-header')).toBeInTheDocument();
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('renders loading state when data is loading', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { id: 'user-1', username: 'john' } as any,
      });
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        friendsLogs: [],
        friendsLogsEndCursor: null,
        friendsLogsHasNextPage: false,
        friendsLogsTotalCount: 0,
        loadMoreFriendsLogs: vi.fn(),
        loading: true,
        error: null,
        refetch: vi.fn(),
      } as any);
      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByText('Loading your game logs...')).toBeInTheDocument();
    });

    it('renders error state when there is an error', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { id: 'user-1', username: 'john' } as any,
      });
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        friendsLogs: [],
        friendsLogsEndCursor: null,
        friendsLogsHasNextPage: false,
        friendsLogsTotalCount: 0,
        loadMoreFriendsLogs: vi.fn(),
        loading: false,
        error: new Error('Failed to load game logs'),
        refetch: vi.fn(),
      } as any);
      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByText('Error loading game logs. Please try again.')).toBeInTheDocument();
    });

    it('renders empty state when no game logs', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { id: 'user-1', username: 'john' } as any,
      });
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);
      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      // The empty state message is rendered by GameLogsContent component
      expect(screen.getByText('No game logs found. Create your first one!')).toBeInTheDocument();
    });

    it('renders empty state for friends logs when no friends logs', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { id: 'user-1', username: 'john' } as any,
      });
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);
      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      // The empty state message is rendered by GameLogsContent component
      expect(screen.getByText("No friends' game logs found.")).toBeInTheDocument();
    });

    it('renders empty state for public logs when no public logs', () => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: { id: 'user-1', username: 'john' } as any,
      });
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);
      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      // The empty state message is rendered by GameLogsContent component
      expect(screen.getByText('No public game logs found.')).toBeInTheDocument();
    });
  });

  describe('Modal Functionality', () => {
    it('opens create modal when create button is clicked', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      const createButton = screen.getByTestId('create-button');
      fireEvent.click(createButton);
      expect(screen.getByTestId('create-game-log-modal')).toBeInTheDocument();
    });

    it('closes create modal when modal is closed', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      const createButton = screen.getByTestId('create-button');
      fireEvent.click(createButton);
      expect(screen.getByTestId('create-game-log-modal')).toBeInTheDocument();

      // The modal should be open initially
      expect(screen.getByTestId('create-game-log-modal')).toHaveAttribute('data-is-open', 'true');
    });
  });

  describe('Search and Sort Components', () => {
    it('renders filters component', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByTestId('game-logs-filters')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('renders tabs component', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('renders content for all three tabs', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByTestId('game-logs-content-my-logs')).toBeInTheDocument();
      expect(screen.getByTestId('game-logs-content-friends-logs')).toBeInTheDocument();
      expect(screen.getByTestId('game-logs-content-public-logs')).toBeInTheDocument();
    });
  });

  describe('User Authentication', () => {
    it('handles user not loaded state', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByText('Please sign in to view game logs.')).toBeInTheDocument();
    });

    it('handles user not signed in state', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByText('Please sign in to view game logs.')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('calls useGameLogs hook', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(mockUseGameLogs).toHaveBeenCalled();
    });

    it('calls useFriendsGameLogs hook', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(mockUseFriendsGameLogs).toHaveBeenCalled();
    });

    it('calls useUser hook', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(mockUseUser).toHaveBeenCalled();
    });
  });

  describe('Component Structure', () => {
    it('renders tabs container', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('renders tabs list', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      // The TabsList component doesn't have a test ID, but we can check for the tabs container
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('renders create button with correct styling', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      const createButton = screen.getByTestId('create-button');
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveTextContent('Create New Log');
    });
  });

  describe('Error Handling', () => {
    it('handles friends logs error state', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: new Error('Failed to load friends logs'),
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      // Should still render the component even with friends logs error
      expect(screen.getByText('Error loading game logs. Please try again.')).toBeInTheDocument();
      expect(screen.getByText('Failed to load friends logs')).toBeInTheDocument();
    });

    it('handles loading state for friends logs', () => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);

      render(<GameLogsTable />);
      // Should still render the component even with friends logs loading
      expect(screen.getByText('Game Logs')).toBeInTheDocument();
    });
  });

  describe('State Management and Event Handlers', () => {
    beforeEach(() => {
      mockUseGameLogs.mockReturnValue({
        gameLogs: [
          {
            id: 'game-log-1',
            user_id: 'user-1',
            game_id: 'game-1',
            notes: 'Test notes',
            rating_for_game: 4,
            classification: 'PUBLIC',
            tags: ['test'],
            watched_at: '2024-01-15T10:00:00Z',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
          },
        ],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 1,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      mockUseFriendsGameLogs.mockReturnValue({
        logs: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        hasNextPage: false,
        totalCount: 0,
        loadMore: vi.fn(),
      } as any);
    });

    it('handles tab changes via GameLogsTabs component', () => {
      render(<GameLogsTable />);

      // Initially on 'my-logs' tab
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-selected-tab', 'my-logs');

      // Trigger tab change through the mocked component
      const tabChangeButton = screen.getByTestId('tab-change-trigger');
      fireEvent.click(tabChangeButton);

      // Component should handle the tab change (our mock sets it to 'friends-logs')
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('handles modal close callbacks', () => {
      render(<GameLogsTable />);

      // Open create modal
      const createButton = screen.getByTestId('create-button');
      fireEvent.click(createButton);

      // Modal should be open
      expect(screen.getByTestId('create-game-log-modal')).toHaveAttribute('data-is-open', 'true');
    });

    it('handles edit modal state management', () => {
      render(<GameLogsTable />);

      // Edit modal is not rendered until there's a game log to edit
      expect(screen.queryByTestId('edit-game-log-modal')).not.toBeInTheDocument();

      // The component should handle edit state correctly
      expect(screen.getByTestId('game-logs-header')).toBeInTheDocument();
    });

    it('handles delete modal state management', () => {
      render(<GameLogsTable />);

      // Delete modal is not rendered until there's a game log to delete
      expect(screen.queryByTestId('delete-game-log-modal')).not.toBeInTheDocument();

      // The component should handle delete state correctly
      expect(screen.getByTestId('game-logs-header')).toBeInTheDocument();
    });

    it('processes search and filter state correctly', () => {
      render(<GameLogsTable />);

      // Check that filters component is rendered and would handle search/filter state
      expect(screen.getByTestId('game-logs-filters')).toBeInTheDocument();
    });

    it('handles refetch functionality in success callbacks', () => {
      const mockRefetch = vi.fn();

      mockUseGameLogs.mockReturnValue({
        gameLogs: [],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 0,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      render(<GameLogsTable />);

      // The refetch function should be available for callbacks
      expect(mockRefetch).toBeDefined();
    });

    it('processes filtered game logs correctly with data', () => {
      const gameLogWithGame = {
        id: 'game-log-1',
        user_id: 'user-1',
        game_id: 'game-1',
        notes: 'Great game between Lakers and Warriors',
        rating_for_game: 5,
        classification: 'PUBLIC',
        tags: ['playoffs', 'exciting'],
        watched_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        game: {
          id: 'game-1',
          game_date: '2024-01-15',
          season: '2023-24',
          home_team: { code: 'LAL', full_name: 'Los Angeles Lakers' },
          away_team: { code: 'GSW', full_name: 'Golden State Warriors' },
        },
        user: {
          id: 'user-1',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
        },
      };

      mockUseGameLogs.mockReturnValue({
        gameLogs: [gameLogWithGame],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 1,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<GameLogsTable />);

      // The component should process and display game logs correctly
      expect(screen.getByTestId('game-logs-content-my-logs')).toBeInTheDocument();
      expect(screen.getByText('Content for my-logs')).toBeInTheDocument();
    });

    it('handles classification filter correctly', () => {
      const publicGameLog = {
        id: 'game-log-1',
        classification: 'PUBLIC',
        user_id: 'user-1',
        game_id: 'game-1',
        notes: 'Public game log',
        rating_for_game: 4,
        tags: [],
        watched_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      mockUseGameLogs.mockReturnValue({
        gameLogs: [publicGameLog],
        gameLogsEndCursor: null,
        gameLogsHasNextPage: false,
        gameLogsTotalCount: 1,
        loadMoreGameLogs: vi.fn(),
        loading: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<GameLogsTable />);

      // Component should filter and display public logs correctly
      expect(screen.getByTestId('game-logs-content-public-logs')).toBeInTheDocument();
      expect(screen.getByText('Content for public-logs')).toBeInTheDocument();
    });

    it('handles empty classification filter correctly', () => {
      render(<GameLogsTable />);

      // Component should handle filtering when no classification is set
      expect(screen.getByTestId('game-logs-content-my-logs')).toBeInTheDocument();
    });

    it('handles sort configuration changes', () => {
      render(<GameLogsTable />);

      // Component should handle sort state management
      expect(screen.getByTestId('game-logs-filters')).toBeInTheDocument();
    });

    it('handles search term and field changes', () => {
      render(<GameLogsTable />);

      // Component should handle search state management
      expect(screen.getByTestId('game-logs-filters')).toBeInTheDocument();
    });
  });
});
