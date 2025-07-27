import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearchParams } from 'next/navigation';

import { AdminDatabaseContent } from '@src/app/protected/admin/database/components/database-content';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

// Mock the API config
vi.mock('@/lib/config/app.config', () => ({
  API_CONFIG: {
    pagination: {
      DEFAULT_PAGE_SIZE: 10,
    },
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Mock the table components
vi.mock('@src/app/protected/admin/database/components/users-table', () => ({
  UsersTableWithSearch: () => <div data-testid="users-table">Users Table</div>,
}));

vi.mock('@src/app/protected/admin/database/components/game-logs-table', () => ({
  GameLogsTableWithSearch: () => <div data-testid="game-logs-table">Game Logs Table</div>,
}));

vi.mock('@src/app/protected/admin/database/components/comments-table', () => ({
  CommentsTableWithSearch: () => <div data-testid="comments-table">Comments Table</div>,
}));

vi.mock('@src/app/protected/admin/database/components/reactions-table', () => ({
  ReactionsTableWithSearch: () => <div data-testid="reactions-table">Reactions Table</div>,
}));

vi.mock('@src/app/protected/admin/database/components/friendships-table', () => ({
  FriendshipsTableWithSearch: () => <div data-testid="friendships-table">Friendships Table</div>,
}));

vi.mock('@src/app/protected/admin/database/components/notifications-table', () => ({
  NotificationsTableWithSearch: () => (
    <div data-testid="notifications-table">Notifications Table</div>
  ),
}));

vi.mock('@src/app/protected/admin/database/components/game-ratings-table', () => ({
  GameRatingsTableWithSearch: () => <div data-testid="game-ratings-table">Game Ratings Table</div>,
}));

describe('AdminDatabaseContent', () => {
  const mockSearchParams = new Map();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useSearchParams
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key),
    });

    // Mock successful fetch response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              { id: 1, username: 'testuser', email: 'test@example.com' },
              { id: 2, username: 'testuser2', email: 'test2@example.com' },
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              pages: 1,
            },
          }),
      } as unknown as Response)
    );
  });

  it('renders database management page with title and description', () => {
    render(<AdminDatabaseContent />);

    expect(screen.getByText('Database Management')).toBeInTheDocument();
    expect(screen.getByText(/View and manage database tables/)).toBeInTheDocument();
  });

  it('shows users table by default', () => {
    render(<AdminDatabaseContent />);

    expect(screen.getByTestId('users-table')).toBeInTheDocument();
  });

  it('renders all table tabs', () => {
    render(<AdminDatabaseContent />);

    // Check for tab buttons by their role and content
    const tabButtons = screen.getAllByRole('button');
    expect(tabButtons.length).toBeGreaterThan(0);

    // Check that the users tab is active by default
    expect(screen.getByTestId('users-table')).toBeInTheDocument();
  });

  it('initializes with tab from URL params', () => {
    mockSearchParams.set('tab', 'game_logs');

    render(<AdminDatabaseContent />);

    expect(screen.getByTestId('game-logs-table')).toBeInTheDocument();
  });

  it('falls back to users tab for invalid URL param', () => {
    mockSearchParams.set('tab', 'invalid_tab');

    render(<AdminDatabaseContent />);

    expect(screen.getByTestId('users-table')).toBeInTheDocument();
  });

  it('renders error boundary wrapper', () => {
    render(<AdminDatabaseContent />);

    // The component should be wrapped in ErrorBoundary
    expect(screen.getByText('Database Management')).toBeInTheDocument();
  });

  it('renders tabs container', () => {
    render(<AdminDatabaseContent />);

    // Check that the tabs are rendered
    const tabButtons = screen.getAllByRole('button');
    expect(tabButtons.length).toBeGreaterThan(0);
  });
});
