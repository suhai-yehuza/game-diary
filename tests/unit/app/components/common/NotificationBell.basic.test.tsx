import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() to properly handle mock variables
const { mockUseUser, mockUseNotifications } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
  mockUseNotifications: vi.fn(),
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: mockUseUser,
}));

vi.mock('@/app/components/providers/NotificationProvider', () => ({
  useNotifications: mockUseNotifications,
}));

// Mock the UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => (
    <div {...props} data-testid="notification-card">
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Bell: ({ className, ...props }: any) => (
    <div className={className} data-testid="bell-icon" {...props} />
  ),
  Check: ({ className, ...props }: any) => (
    <div className={className} data-testid="check-icon" {...props} />
  ),
  X: ({ className, ...props }: any) => (
    <div className={className} data-testid="x-icon" {...props} />
  ),
}));

// Import the component after mocking
import { NotificationBell } from '@/app/components/common/NotificationBell';

describe('NotificationBell', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Friend Request',
      message: 'John Doe sent you a friend request',
      type: 'friend_request',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      id: '2',
      title: 'Reaction Added',
      message: 'Jane Smith reacted to your game log',
      type: 'reaction_added',
      read: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ];

  const mockNotificationContext = {
    notifications: mockNotifications,
    unreadCount: 1,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop by default
    });

    // Default mock implementations
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
    });

    mockUseNotifications.mockReturnValue(mockNotificationContext);
  });

  it('renders notification bell for authenticated user', () => {
    render(<NotificationBell />);

    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('does not render for unauthenticated user', () => {
    mockUseUser.mockReturnValue({
      user: null,
    });

    render(<NotificationBell />);

    expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
  });

  it('does not render when Clerk is not configured', () => {
    mockUseUser.mockImplementation(() => {
      throw new Error('Clerk not configured');
    });

    render(<NotificationBell />);

    expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
  });

  it('does not render when notification context is not available', () => {
    mockUseNotifications.mockReturnValue(null);

    render(<NotificationBell />);

    expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
  });

  it('displays unread count badge', () => {
    render(<NotificationBell />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays 99+ for large unread counts', () => {
    mockUseNotifications.mockReturnValue({
      ...mockNotificationContext,
      unreadCount: 150,
    });

    render(<NotificationBell />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('opens notification dropdown when clicked', () => {
    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByTestId('notification-card')).toBeInTheDocument();
  });

  it('closes notification dropdown when close button is clicked', () => {
    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    expect(screen.getByText('Notifications')).toBeInTheDocument();

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('closes dropdown when escape key is pressed', () => {
    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    expect(screen.getByText('Notifications')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('marks individual notification as read', () => {
    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    const markAsReadButtons = screen.getAllByTestId('check-icon');
    fireEvent.click(markAsReadButtons[0]);

    expect(mockNotificationContext.markAsRead).toHaveBeenCalledWith('1');
  });

  it('marks all notifications as read', () => {
    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    const markAllAsReadButton = screen.getByText('Mark all as read');
    fireEvent.click(markAllAsReadButton);

    expect(mockNotificationContext.markAllAsRead).toHaveBeenCalled();
  });

  it('displays notifications correctly', () => {
    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    expect(screen.getByText('Friend Request')).toBeInTheDocument();
    expect(screen.getByText('John Doe sent you a friend request')).toBeInTheDocument();
    expect(screen.getByText('Reaction Added')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith reacted to your game log')).toBeInTheDocument();
  });

  it('displays empty state when no notifications', () => {
    mockUseNotifications.mockReturnValue({
      ...mockNotificationContext,
      notifications: [],
      unreadCount: 0,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    expect(screen.getByText('No notifications')).toBeInTheDocument();
    // The component doesn't show "You're all caught up!" in desktop view
  });

  it('formats time ago correctly', () => {
    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    expect(screen.getByText('5m ago')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('displays correct notification icons', () => {
    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    // Check that emoji icons are displayed
    expect(screen.getByText('👥')).toBeInTheDocument(); // friend_request
    expect(screen.getByText('👍')).toBeInTheDocument(); // reaction_added
  });

  it('handles mobile view correctly', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    });

    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    // Should show mobile overlay
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('handles window resize for mobile detection', async () => {
    render(<NotificationBell />);

    // Initially desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    });

    // Trigger resize event
    fireEvent.resize(window);

    await waitFor(() => {
      // Component should handle resize without errors
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });
  });

  it('handles different notification types with correct icons', () => {
    const notificationsWithAllTypes = [
      {
        id: '1',
        title: 'Friend Request',
        message: 'Test',
        type: 'friend_request',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '2',
        title: 'Friend Accepted',
        message: 'Test',
        type: 'friend_accepted',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '3',
        title: 'Friend Rejected',
        message: 'Test',
        type: 'friend_rejected',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '4',
        title: 'Reaction Added',
        message: 'Test',
        type: 'reaction_added',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '5',
        title: 'Comment Added',
        message: 'Test',
        type: 'comment_added',
        read: false,
        createdAt: new Date(),
      },
      {
        id: '6',
        title: 'Unknown Type',
        message: 'Test',
        type: 'unknown',
        read: false,
        createdAt: new Date(),
      },
    ];

    mockUseNotifications.mockReturnValue({
      ...mockNotificationContext,
      notifications: notificationsWithAllTypes,
      unreadCount: 6,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    // Check all icon types are displayed
    expect(screen.getByText('👥')).toBeInTheDocument(); // friend_request
    expect(screen.getByText('✅')).toBeInTheDocument(); // friend_accepted
    expect(screen.getByText('❌')).toBeInTheDocument(); // friend_rejected
    expect(screen.getByText('👍')).toBeInTheDocument(); // reaction_added
    expect(screen.getByText('💬')).toBeInTheDocument(); // comment_added
    expect(screen.getByText('🔔')).toBeInTheDocument(); // default
  });

  it('formats time ago for different time ranges', () => {
    const notificationsWithDifferentTimes = [
      {
        id: '1',
        title: 'Just now',
        message: 'Test',
        type: 'friend_request',
        read: false,
        createdAt: new Date(Date.now() - 30 * 1000),
      }, // 30 seconds ago
      {
        id: '2',
        title: 'Minutes ago',
        message: 'Test',
        type: 'friend_request',
        read: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      }, // 45 minutes ago
      {
        id: '3',
        title: 'Hours ago',
        message: 'Test',
        type: 'friend_request',
        read: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      }, // 3 hours ago
      {
        id: '4',
        title: 'Days ago',
        message: 'Test',
        type: 'friend_request',
        read: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }, // 5 days ago
      {
        id: '5',
        title: 'Old date',
        message: 'Test',
        type: 'friend_request',
        read: false,
        createdAt: new Date('2023-01-01'),
      }, // Old date
    ];

    mockUseNotifications.mockReturnValue({
      ...mockNotificationContext,
      notifications: notificationsWithDifferentTimes,
      unreadCount: 5,
    });

    render(<NotificationBell />);

    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);

    // Use getAllByText to handle multiple elements with the same text
    const justNowElements = screen.getAllByText('Just now');
    expect(justNowElements.length).toBeGreaterThan(0);
    expect(screen.getByText('45m ago')).toBeInTheDocument();
    expect(screen.getByText('3h ago')).toBeInTheDocument();
    expect(screen.getByText('5d ago')).toBeInTheDocument();
  });
});
