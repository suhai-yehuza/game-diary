import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  NotificationProvider,
  useNotifications,
} from '@/app/components/providers/NotificationProvider';
import { errorHandlers } from '@/lib/utils/error-handler';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock GraphQL queries
vi.mock('@/lib/graphql/queries', () => ({
  GET_USER_NOTIFICATIONS: 'GET_USER_NOTIFICATIONS',
  GET_UNREAD_NOTIFICATIONS_COUNT: 'GET_UNREAD_NOTIFICATIONS_COUNT',
  MARK_NOTIFICATION_AS_READ: 'MARK_NOTIFICATION_AS_READ',
  MARK_ALL_NOTIFICATIONS_AS_READ: 'MARK_ALL_NOTIFICATIONS_AS_READ',
}));

// Mock error handlers
vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Test component to access the context
function TestComponent() {
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  return (
    <div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="notifications-count">{notifications.length}</div>
      <button
        data-testid="add-notification"
        onClick={() =>
          addNotification({
            type: 'success',
            title: 'Test',
            message: 'Test message',
            userId: 'test-user-id',
          })
        }
      >
        Add Notification
      </button>
      <button data-testid="mark-as-read" onClick={() => markAsRead('test-id')}>
        Mark as Read
      </button>
      <button data-testid="mark-all-as-read" onClick={markAllAsRead}>
        Mark All as Read
      </button>
      <button data-testid="clear-notifications" onClick={clearNotifications}>
        Clear Notifications
      </button>
      {notifications.map(notification => (
        <div key={notification.id} data-testid={`notification-${notification.id}`}>
          {notification.message} - {notification.type} - {notification.read ? 'read' : 'unread'}
        </div>
      ))}
    </div>
  );
}

describe('NotificationProvider', () => {
  const mockUseQuery = vi.mocked(useQuery);
  const mockUseMutation = vi.mocked(useMutation);
  const mockUseUser = vi.mocked(useUser);
  const mockErrorHandlers = vi.mocked(errorHandlers);
  const mockToast = vi.mocked(toast);

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock user
    mockUseUser.mockReturnValue({
      user: { id: 'test-user-id' },
      isLoaded: true,
      isSignedIn: true,
    } as any);

    // Mock queries
    mockUseQuery.mockReturnValue({
      data: {
        userNotifications: {
          edges: [],
        },
        unreadNotificationsCount: 0,
      },
      refetch: vi.fn(),
      loading: false,
      error: undefined,
      client: {} as any,
      observable: {} as any,
      networkStatus: 1,
      called: true,
      variables: {},
      previousData: undefined,
      updateQuery: vi.fn(),
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      subscribeToMore: vi.fn(),
      reobserve: vi.fn(),
      fetchMore: vi.fn(),
    } as any);

    // Mock mutations
    mockUseMutation.mockReturnValue([
      vi.fn().mockResolvedValue({}),
      { loading: false, error: undefined, called: false, client: {} as any, reset: vi.fn() },
    ] as any);
  });

  describe('Basic Functionality', () => {
    it('renders children without crashing', () => {
      render(
        <NotificationProvider>
          <div>Test Content</div>
        </NotificationProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('provides notification context', () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('unread-count')).toBeInTheDocument();
      expect(screen.getByTestId('notifications-count')).toBeInTheDocument();
    });

    it('initializes with empty notifications', () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    });
  });

  describe('Add Notification', () => {
    it('adds notification to the list', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      const addButton = screen.getByTestId('add-notification');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
        expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
      });

      expect(screen.getByText('Test message - success - unread')).toBeInTheDocument();
    });

    it('shows toast when adding notification', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      const addButton = screen.getByTestId('add-notification');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockToast.info).toHaveBeenCalledWith('Test message', {
          description: 'Test',
          duration: 5000,
        });
      });
    });
  });

  describe('Mark as Read', () => {
    it('marks notification as read', async () => {
      const mockMarkAsRead = vi.fn().mockResolvedValue({});
      mockUseMutation.mockReturnValue([
        mockMarkAsRead,
        { loading: false, error: undefined, called: false, client: {} as any, reset: vi.fn() },
      ] as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      const markButton = screen.getByTestId('mark-as-read');
      fireEvent.click(markButton);

      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalledWith({
          variables: { notificationId: 'test-id' },
        });
      });
    });

    it('handles mark as read error', async () => {
      const mockMarkAsRead = vi.fn().mockRejectedValue(new Error('Mark as read failed'));
      mockUseMutation.mockReturnValue([
        mockMarkAsRead,
        { loading: false, error: undefined, called: false, client: {} as any, reset: vi.fn() },
      ] as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      const markButton = screen.getByTestId('mark-as-read');
      fireEvent.click(markButton);

      await waitFor(() => {
        expect(mockErrorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
          component: 'React Component',
          action: 'Mark notification as read',
        });
        expect(mockToast.error).toHaveBeenCalledWith('Failed to mark notification as read');
      });
    });
  });

  describe('Mark All as Read', () => {
    it('marks all notifications as read', async () => {
      const mockMarkAllAsRead = vi.fn().mockResolvedValue({});
      mockUseMutation.mockReturnValue([
        mockMarkAllAsRead,
        { loading: false, error: undefined, called: false, client: {} as any, reset: vi.fn() },
      ] as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      const markAllButton = screen.getByTestId('mark-all-as-read');
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(mockMarkAllAsRead).toHaveBeenCalled();
      });
    });

    it('handles mark all as read error', async () => {
      const mockMarkAllAsRead = vi.fn().mockRejectedValue(new Error('Mark all as read failed'));
      mockUseMutation.mockReturnValue([
        mockMarkAllAsRead,
        { loading: false, error: undefined, called: false, client: {} as any, reset: vi.fn() },
      ] as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      const markAllButton = screen.getByTestId('mark-all-as-read');
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(mockErrorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
          component: 'React Component',
          action: 'Mark all notifications as read',
        });
        expect(mockToast.error).toHaveBeenCalledWith('Failed to mark all notifications as read');
      });
    });
  });

  describe('Clear Notifications', () => {
    it('clears all notifications', async () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Add a notification first
      const addButton = screen.getByTestId('add-notification');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      });

      // Clear notifications
      const clearButton = screen.getByTestId('clear-notifications');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
        expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Data Loading', () => {
    it('loads notifications from GraphQL', () => {
      const mockNotifications = {
        userNotifications: {
          edges: [
            {
              node: {
                id: '1',
                user_id: 'test-user-id',
                type: 'info',
                title: 'Test Title',
                message: 'Test Message',
                read: false,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
                resolved: false,
                target_id: null,
                target_type: null,
                deleted_at: null,
              },
            },
          ],
        },
      };

      mockUseQuery.mockReturnValue({
        data: mockNotifications,
        refetch: vi.fn(),
        loading: false,
        error: undefined,
        client: {} as any,
        observable: {} as any,
        networkStatus: 1,
        called: true,
        variables: {},
        previousData: undefined,
        updateQuery: vi.fn(),
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        reobserve: vi.fn(),
        fetchMore: vi.fn(),
      } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByText('Test Message - info - unread')).toBeInTheDocument();
    });

    it('loads unread count from GraphQL', () => {
      mockUseQuery.mockReturnValue({
        data: {
          unreadNotificationsCount: 5,
        },
        refetch: vi.fn(),
        loading: false,
        error: undefined,
        client: {} as any,
        observable: {} as any,
        networkStatus: 1,
        called: true,
        variables: {},
        previousData: undefined,
        updateQuery: vi.fn(),
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        reobserve: vi.fn(),
        fetchMore: vi.fn(),
      } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('unread-count')).toHaveTextContent('5');
    });
  });

  describe('Error Handling', () => {
    it('handles missing user gracefully', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      } as any);

      expect(() => {
        render(
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        );
      }).not.toThrow();
    });

    it('handles Clerk not being configured', () => {
      mockUseUser.mockImplementation(() => {
        throw new Error('Clerk not configured');
      });

      expect(() => {
        render(
          <NotificationProvider>
            <TestComponent />
          </NotificationProvider>
        );
      }).not.toThrow();
    });
  });

  describe('useNotifications Hook', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useNotifications must be used within a NotificationProvider');
    });
  });
});
