import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogsTable } from '@/app/components/game-logs/GameLogsTable';
import type { IGameLog } from '@/lib/types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Clerk
const mockUser = {
  id: 'user-123',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
};

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: mockUser,
    isLoaded: true,
  }),
}));

// Mock hooks
const mockGameLogs: IGameLog[] = [
  {
    id: 'log-1',
    game_id: 'game-1',
    rating_for_game: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    classification: 'PUBLIC',
    user: {
      id: 'user-1',
      username: 'testuser',
    },
  },
  {
    id: 'log-2',
    game_id: 'game-2',
    rating_for_game: 5,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    classification: 'PRIVATE',
    user: {
      id: 'user-2',
      username: 'testuser2',
    },
  },
];

const mockFriendsLogs: IGameLog[] = [
  {
    id: 'friend-log-1',
    game_id: 'game-3',
    rating_for_game: 3,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    classification: 'PUBLIC',
    user: {
      id: 'user-3',
      username: 'frienduser',
    },
  },
];

const mockPublicLogs: IGameLog[] = [
  {
    id: 'public-log-1',
    game_id: 'game-4',
    rating_for_game: 4,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
    classification: 'PUBLIC',
    user: {
      id: 'user-4',
      username: 'publicuser',
    },
  },
];

vi.mock('@/hooks/use-game-logs', () => ({
  useGameLogs: vi.fn(({ filters }) => {
    if (filters?.userId) {
      return {
        gameLogs: mockGameLogs,
        loading: false,
        loadingMore: false,
        error: null,
        refetch: vi.fn(),
        gameLogsHasNextPage: false,
        gameLogsTotalCount: mockGameLogs.length,
        loadMoreGameLogs: vi.fn(),
      };
    } else {
      return {
        gameLogs: mockPublicLogs,
        loading: false,
        loadingMore: false,
        error: null,
        refetch: vi.fn(),
        gameLogsHasNextPage: false,
        gameLogsTotalCount: mockPublicLogs.length,
        loadMoreGameLogs: vi.fn(),
      };
    }
  }),
  useFriendsGameLogs: vi.fn(() => ({
    logs: mockFriendsLogs,
    loading: false,
    loadingMore: false,
    error: null,
    hasNextPage: false,
    totalCount: mockFriendsLogs.length,
    loadMore: vi.fn(),
  })),
}));

// Mock child components
vi.mock('@/app/components/game-logs/GameLogsHeader', () => ({
  GameLogsHeader: ({ onCreateClick }: { onCreateClick: () => void }) => (
    <div data-testid="game-logs-header">
      <button data-testid="create-button" onClick={onCreateClick}>
        Create Game Log
      </button>
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/GameLogsTabs', () => ({
  GameLogsTabs: ({ children, selectedTab, onTabChange }: any) => (
    <div data-testid="game-logs-tabs">
      <button data-testid="my-logs-tab" onClick={() => onTabChange('my-logs')}>
        My Logs
      </button>
      <button data-testid="friends-logs-tab" onClick={() => onTabChange('friends-logs')}>
        Friends Logs
      </button>
      <button data-testid="public-logs-tab" onClick={() => onTabChange('public-logs')}>
        Public Logs
      </button>
      <div data-testid="selected-tab">{selectedTab}</div>
      {children}
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/GameLogsFilters', () => ({
  GameLogsFilters: ({ onSearchChange, onSearchClear, onSort }: any) => (
    <div data-testid="game-logs-filters">
      <input data-testid="search-input" onChange={e => onSearchChange(e.target.value, 'all')} />
      <button data-testid="clear-search" onClick={onSearchClear}>
        Clear
      </button>
      <select data-testid="sort-select" onChange={e => onSort('rating', e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/GameLogsContent', () => ({
  GameLogsContent: ({ tabValue, logs, onEdit, onDelete }: any) => (
    <div data-testid={`game-logs-content-${tabValue}`}>
      {logs.map((log: IGameLog) => (
        <div key={log.id} data-testid={`game-log-${log.id}`}>
          <span>{log.id}</span>
          <button data-testid={`edit-${log.id}`} onClick={() => onEdit(log)}>
            Edit
          </button>
          <button data-testid={`delete-${log.id}`} onClick={() => onDelete(log)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/CreateGameLogModal', () => ({
  CreateGameLogModal: ({ isOpen, onClose, onSuccess }: any) => (
    <div data-testid="create-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      <button data-testid="close-create-modal" onClick={onClose}>
        Close
      </button>
      <button data-testid="success-create-modal" onClick={onSuccess}>
        Success
      </button>
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/EditGameLogModal', () => ({
  EditGameLogModal: ({ isOpen, onClose, onSuccess, gameLog }: any) => (
    <div data-testid="edit-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      <span data-testid="edit-game-log-title">{gameLog?.id}</span>
      <button data-testid="close-edit-modal" onClick={onClose}>
        Close
      </button>
      <button data-testid="success-edit-modal" onClick={onSuccess}>
        Success
      </button>
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/DeleteGameLogModal', () => ({
  DeleteGameLogModal: ({ isOpen, onClose, onSuccess, gameLog }: any) => (
    <div data-testid="delete-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      <span data-testid="delete-game-log-title">{gameLog?.id}</span>
      <button data-testid="close-delete-modal" onClick={onClose}>
        Close
      </button>
      <button data-testid="success-delete-modal" onClick={onSuccess}>
        Success
      </button>
    </div>
  ),
}));

describe('GameLogsTable Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing when user is authenticated', () => {
    render(<GameLogsTable />);

    expect(screen.getByTestId('game-logs-header')).toBeInTheDocument();
    expect(screen.getByTestId('game-logs-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('game-logs-filters')).toBeInTheDocument();
  });

  it('handles create modal open/close', async () => {
    render(<GameLogsTable />);

    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-modal')).toHaveStyle({ display: 'block' });
    });

    const closeButton = screen.getByTestId('close-create-modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-modal')).toHaveStyle({ display: 'none' });
    });
  });

  it('handles create modal success', async () => {
    render(<GameLogsTable />);

    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    const successButton = screen.getByTestId('success-create-modal');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-modal')).toHaveStyle({ display: 'none' });
    });
  });

  it('handles edit button click', () => {
    render(<GameLogsTable />);

    const editButton = screen.getByTestId('edit-log-1');
    fireEvent.click(editButton);

    // Should handle the click without crashing
    expect(editButton).toBeInTheDocument();
  });

  it('handles delete button click', () => {
    render(<GameLogsTable />);

    const deleteButton = screen.getByTestId('delete-log-1');
    fireEvent.click(deleteButton);

    // Should handle the click without crashing
    expect(deleteButton).toBeInTheDocument();
  });

  it('handles tab changes', () => {
    render(<GameLogsTable />);

    const friendsTab = screen.getByTestId('friends-logs-tab');
    fireEvent.click(friendsTab);

    expect(screen.getByTestId('selected-tab')).toHaveTextContent('friends-logs');

    const publicTab = screen.getByTestId('public-logs-tab');
    fireEvent.click(publicTab);

    expect(screen.getByTestId('selected-tab')).toHaveTextContent('public-logs');
  });

  it('handles search changes', () => {
    render(<GameLogsTable />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // The search functionality is handled by the filters component
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search clear', () => {
    render(<GameLogsTable />);

    const clearButton = screen.getByTestId('clear-search');
    fireEvent.click(clearButton);

    // The clear functionality is handled by the filters component
    expect(clearButton).toBeInTheDocument();
  });

  it('handles sort changes', () => {
    render(<GameLogsTable />);

    const sortSelect = screen.getByTestId('sort-select');
    fireEvent.change(sortSelect, { target: { value: 'desc' } });

    // The sort functionality is handled by the filters component
    expect(sortSelect).toBeInTheDocument();
  });

  it('displays correct tab content for my-logs', () => {
    render(<GameLogsTable />);

    expect(screen.getByTestId('game-logs-content-my-logs')).toBeInTheDocument();
    expect(screen.getByTestId('game-log-log-1')).toBeInTheDocument();
    expect(screen.getByTestId('game-log-log-2')).toBeInTheDocument();
  });

  it('displays correct tab content for friends-logs', () => {
    render(<GameLogsTable />);

    // Switch to friends tab
    const friendsTab = screen.getByTestId('friends-logs-tab');
    fireEvent.click(friendsTab);

    expect(screen.getByTestId('game-logs-content-friends-logs')).toBeInTheDocument();
    expect(screen.getByTestId('game-log-friend-log-1')).toBeInTheDocument();
  });

  it('displays correct tab content for public-logs', () => {
    render(<GameLogsTable />);

    // Switch to public tab
    const publicTab = screen.getByTestId('public-logs-tab');
    fireEvent.click(publicTab);

    expect(screen.getByTestId('game-logs-content-public-logs')).toBeInTheDocument();
    expect(screen.getByTestId('game-log-public-log-1')).toBeInTheDocument();
  });

  it('handles multiple game logs with different actions', () => {
    render(<GameLogsTable />);

    // Test edit action for first log
    const editButton1 = screen.getByTestId('edit-log-1');
    fireEvent.click(editButton1);

    expect(screen.getByTestId('edit-game-log-title')).toHaveTextContent('log-1');

    // Close edit modal
    const closeEditButton = screen.getByTestId('close-edit-modal');
    fireEvent.click(closeEditButton);

    // Test delete action for second log
    const deleteButton2 = screen.getByTestId('delete-log-2');
    fireEvent.click(deleteButton2);

    expect(screen.getByTestId('delete-game-log-title')).toHaveTextContent('log-2');
  });

  it('handles tab switching with different content', () => {
    render(<GameLogsTable />);

    // Start with my-logs (default)
    expect(screen.getByTestId('game-log-log-1')).toBeInTheDocument();
    expect(screen.getByTestId('game-log-log-2')).toBeInTheDocument();

    // Switch to friends-logs
    const friendsTab = screen.getByTestId('friends-logs-tab');
    fireEvent.click(friendsTab);

    expect(screen.getByTestId('game-log-friend-log-1')).toBeInTheDocument();

    // Switch to public-logs
    const publicTab = screen.getByTestId('public-logs-tab');
    fireEvent.click(publicTab);

    expect(screen.getByTestId('game-log-public-log-1')).toBeInTheDocument();
  });
});
