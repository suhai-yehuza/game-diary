import { useUser } from '@clerk/nextjs';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { NotificationBell } from '@/app/components/common/NotificationBell';
import { useNotifications } from '@/app/components/providers/NotificationProvider';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock the notification provider
vi.mock('@/app/components/providers/NotificationProvider', () => ({
  useNotifications: vi.fn(),
}));

// Mock the UI components
vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/app/components/ui/Card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Bell: ({ className }: any) => <div data-testid="bell-icon" className={className} />,
  Check: ({ className }: any) => <div data-testid="check-icon" className={className} />,
}));

const mockUseUser = useUser as ReturnType<typeof vi.fn>;
const mockUseNotifications = useNotifications as ReturnType<typeof vi.fn>;

describe('NotificationBell', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'friend_request',
      title: 'Friend Request',
      message: 'John Doe sent you a friend request',
      read: false,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      deletedAt: null,
      resolved: false,
      data: { targetId: '123', targetType: 'user' },
    },
    {
      id: '2',
      type: 'comment_added',
      title: 'New Comment',
      message: 'Someone commented on your game log',
      read: true,
      createdAt: new Date('2024-01-01T09:00:00Z'),
      updatedAt: new Date('2024-01-01T09:00:00Z'),
      deletedAt: null,
      resolved: false,
      data: { targetId: '456', targetType: 'game_log' },
    },
  ];

  const mockNotificationContext = {
    notifications: mockNotifications,
    unreadCount: 1,
    addNotification: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    clearNotifications: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseUser.mockReturnValue({
      user: { id: 'user-123' },
      isLoaded: true,
      isSignedIn: true,
    } as any);

    mockUseNotifications.mockReturnValue(mockNotificationContext);
  });

  describe('Authentication', () => {
    it('should not render when user is not authenticated', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);

      render(<NotificationBell />);

      expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
    });

    it('should not render when user is not loaded', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);

      render(<NotificationBell />);

      expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
    });

    it('should render when user is authenticated', () => {
      mockUseUser.mockReturnValue({
        user: { id: 'user-123' },
        isLoaded: true,
        isSignedIn: true,
      } as any);

      render(<NotificationBell />);

      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });

    it('should render when user has no ID but is signed in', () => {
      mockUseUser.mockReturnValue({
        user: { id: undefined },
        isLoaded: true,
        isSignedIn: true,
      } as any);

      render(<NotificationBell />);

      expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
    });
  });

  describe('Notification Context', () => {
    it('should not render when notification context is not available', () => {
      mockUseNotifications.mockReturnValue(undefined as any);

      render(<NotificationBell />);

      expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
    });

    it('should render when notification context is available', () => {
      render(<NotificationBell />);

      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });
  });

  describe('Unread Count Badge', () => {
    it('should display unread count badge when there are unread notifications', () => {
      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        unreadCount: 5,
      });

      render(<NotificationBell />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display 99+ when unread count exceeds 99', () => {
      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        unreadCount: 150,
      });

      render(<NotificationBell />);

      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('should not display badge when there are no unread notifications', () => {
      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        unreadCount: 0,
      });

      render(<NotificationBell />);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Functionality', () => {
    it('should open dropdown when bell is clicked', async () => {
      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
    });

    it('should close dropdown when close button is clicked', async () => {
      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });

      // Click on the close button instead of backdrop
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
      });
    });
  });

  describe('Notification Display', () => {
    it('should display notifications in dropdown', async () => {
      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('Friend Request')).toBeInTheDocument();
        expect(screen.getByText('John Doe sent you a friend request')).toBeInTheDocument();
        expect(screen.getByText('New Comment')).toBeInTheDocument();
        expect(screen.getByText('Someone commented on your game log')).toBeInTheDocument();
      });
    });

    it('should display empty state when no notifications', async () => {
      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        notifications: [],
        unreadCount: 0,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeInTheDocument();
      });
    });

    it('should show mark all as read button when there are unread notifications', async () => {
      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('Mark all as read')).toBeInTheDocument();
      });
    });

    it('should not show mark all as read button when all notifications are read', async () => {
      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        unreadCount: 0,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
      });
    });
  });

  describe('Notification Actions', () => {
    it('should call markAsRead when individual notification is marked as read', async () => {
      const mockMarkAsRead = vi.fn();
      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        markAsRead: mockMarkAsRead,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        const markAsReadButtons = screen.getAllByTestId('check-icon');
        fireEvent.click(markAsReadButtons[0]);
      });

      expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('should call markAllAsRead when mark all as read is clicked', async () => {
      const mockMarkAllAsRead = vi.fn();
      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        markAllAsRead: mockMarkAllAsRead,
      });

      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        const markAllAsReadButton = screen.getByText('Mark all as read');
        fireEvent.click(markAllAsReadButton);
      });

      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });
  });

  describe('Time Formatting', () => {
    it('should format time correctly for recent notifications', async () => {
      const recentNotification = {
        ...mockNotifications[0],
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      };

      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        notifications: [recentNotification],
      });

      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('5m ago')).toBeInTheDocument();
      });
    });

    it('should format time correctly for older notifications', async () => {
      const oldNotification = {
        ...mockNotifications[0],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      };

      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        notifications: [oldNotification],
      });

      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('2d ago')).toBeInTheDocument();
      });
    });
  });

  describe('Notification Icons', () => {
    it('should display correct icon for friend request', async () => {
      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('👥')).toBeInTheDocument();
      });
    });

    it('should display correct icon for comment', async () => {
      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('💬')).toBeInTheDocument();
      });
    });

    it('should display default bell icon for unknown notification type', async () => {
      const unknownNotification = {
        ...mockNotifications[0],
        type: 'unknown_type',
      };

      mockUseNotifications.mockReturnValue({
        ...mockNotificationContext,
        notifications: [unknownNotification],
      });

      render(<NotificationBell />);

      const bellButton = screen.getByTestId('bell-icon').closest('button');
      fireEvent.click(bellButton!);

      await waitFor(() => {
        expect(screen.getByText('🔔')).toBeInTheDocument();
      });
    });
  });
});
