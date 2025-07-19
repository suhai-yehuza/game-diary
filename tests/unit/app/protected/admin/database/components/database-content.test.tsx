import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AdminDatabaseContent } from '@src/app/protected/admin/database/components/database-content';

// Mock the table components
vi.mock('@src/app/protected/admin/database/components/users-table', () => ({
  UsersTableWithSearch: () => <div data-testid="users-table">Users Table</div>,
}));

vi.mock('@src/app/protected/admin/database/components/game-logs-table', () => ({
  GameLogsTableWithSearch: () => <div data-testid="game-logs-table">Game Logs Table</div>,
}));

// Mock fetch
global.fetch = vi.fn();

describe('AdminDatabaseContent', () => {
  const mockTableData = [
    { id: '1', name: 'Test User', email: 'test@example.com' },
    { id: '2', name: 'Test User 2', email: 'test2@example.com' },
  ];

  const mockApiResponse = {
    success: true,
    data: mockTableData,
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      pages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders page title and description', () => {
    render(<AdminDatabaseContent />);

    expect(screen.getByText('Database Management')).toBeInTheDocument();
    expect(screen.getByText(/View and manage database tables/)).toBeInTheDocument();
  });

  it('renders all table tabs', () => {
    render(<AdminDatabaseContent />);

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Game Logs')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('Reactions')).toBeInTheDocument();
    expect(screen.getByText('Friendships')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows users table by default', () => {
    render(<AdminDatabaseContent />);

    expect(screen.getByTestId('users-table')).toBeInTheDocument();
  });

  it('switches to game logs table when clicked', () => {
    render(<AdminDatabaseContent />);

    const gameLogsTab = screen.getByText('Game Logs');
    fireEvent.click(gameLogsTab);

    expect(screen.getByTestId('game-logs-table')).toBeInTheDocument();
  });

  it('renders table with fetch data button', () => {
    render(<AdminDatabaseContent />);

    // Switch to a non-component table (like comments)
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    expect(screen.getByText('Fetch Data')).toBeInTheDocument();
  });

  it('fetches data when fetch button is clicked', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockApiResponse,
    });

    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/database/comments?page=1&limit=20',
        expect.any(Object)
      );
    });
  });

  it('displays loading state when fetching data', async () => {
    (fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays fetched data in table', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockApiResponse,
    });

    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('displays pagination info when data is fetched', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => mockApiResponse,
    });

    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('2 total records')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays error message when API returns error', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: 'API error message',
      }),
    });

    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('API error message')).toBeInTheDocument();
    });
  });

  it('handles pagination controls', async () => {
    const paginatedResponse = {
      ...mockApiResponse,
      pagination: {
        page: 2,
        limit: 20,
        total: 40,
        pages: 2,
      },
    };

    (fetch as any).mockResolvedValueOnce({
      json: async () => paginatedResponse,
    });

    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  it('displays empty state when no data is loaded', () => {
    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    expect(screen.getByText(/No data loaded/)).toBeInTheDocument();
  });

  it('applies correct CSS classes to tabs', () => {
    render(<AdminDatabaseContent />);

    const tabs = screen.getAllByRole('tab');
    tabs.forEach(tab => {
      expect(tab).toHaveClass('flex-1', 'flex', 'items-center', 'gap-2');
    });
  });

  it('applies correct CSS classes to tab content', () => {
    render(<AdminDatabaseContent />);

    const tabContent = screen.getByRole('tabpanel');
    expect(tabContent).toHaveClass('flex-1', 'flex', 'flex-col', 'min-h-0');
  });

  it('handles tab switching correctly', () => {
    render(<AdminDatabaseContent />);

    // Start with users table
    expect(screen.getByTestId('users-table')).toBeInTheDocument();

    // Switch to game logs
    const gameLogsTab = screen.getByText('Game Logs');
    fireEvent.click(gameLogsTab);
    expect(screen.getByTestId('game-logs-table')).toBeInTheDocument();

    // Switch back to users
    const usersTab = screen.getByText('Users');
    fireEvent.click(usersTab);
    expect(screen.getByTestId('users-table')).toBeInTheDocument();
  });

  it('maintains tab state across re-renders', () => {
    const { rerender } = render(<AdminDatabaseContent />);

    // Switch to game logs
    const gameLogsTab = screen.getByText('Game Logs');
    fireEvent.click(gameLogsTab);

    // Re-render
    rerender(<AdminDatabaseContent />);

    // Should still show game logs table
    expect(screen.getByTestId('game-logs-table')).toBeInTheDocument();
  });

  it('displays table icons correctly', () => {
    render(<AdminDatabaseContent />);

    // Check that icons are rendered (they should be SVG elements)
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('formats table data correctly', async () => {
    const complexData = [
      { id: '1', name: 'Test', email: 'test@example.com', created_at: '2023-01-01T00:00:00Z' },
    ];

    (fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: complexData,
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      }),
    });

    render(<AdminDatabaseContent />);

    // Switch to comments table
    const commentsTab = screen.getByText('Comments');
    fireEvent.click(commentsTab);

    const fetchButton = screen.getByText('Fetch Data');
    fireEvent.click(fetchButton);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });
});
