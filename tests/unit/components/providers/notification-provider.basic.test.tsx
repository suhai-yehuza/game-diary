import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { toast } from 'sonner';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  gql: vi.fn((strings, ..._args) => strings.join('')),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock GraphQL queries
vi.mock('@/lib/graphql/queries', () => ({
  GET_USER_NOTIFICATIONS: 'GET_USER_NOTIFICATIONS',
  GET_UNREAD_NOTIFICATIONS_COUNT: 'GET_UNREAD_NOTIFICATIONS_COUNT',
  MARK_NOTIFICATION_AS_READ: 'MARK_NOTIFICATION_AS_READ',
  MARK_ALL_NOTIFICATIONS_AS_READ: 'MARK_ALL_NOTIFICATIONS_AS_READ',
}));

import {
  NotificationProvider,
  useNotifications,
} from '@/app/components/providers/NotificationProvider';

// Get mocked functions
const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockUseUser = vi.mocked(useUser);
const mockToast = vi.mocked(toast);

// Test component that uses the notification context
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
            userId: 'test-user',
            type: 'success',
            title: 'Test Notification',
            message: 'Test message',
            data: {},
          })
        }
      >
        Add Notification
      </button>
      <button
        data-testid="mark-as-read"
        onClick={() => notifications[0] && markAsRead(notifications[0].id)}
      >
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
  const mockRefetchNotifications = vi.fn();
  const mockRefetchUnreadCount = vi.fn();
  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseUser.mockReturnValue({
      user: { id: 'test-user-id' } as any,
      isLoaded: true,
      isSignedIn: true,
    });

    // Ensure the two queries return different refetch spies so we can assert on both
    let queryCallIndex = 0;
    const createQueryResponse = (refetchFn: any) =>
      ({
        data: null,
        refetch: refetchFn,
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
      }) as any;

    mockUseQuery.mockImplementation(() => {
      const response =
        queryCallIndex === 0
          ? createQueryResponse(mockRefetchNotifications)
          : createQueryResponse(mockRefetchUnreadCount);
      queryCallIndex += 1;
      return response;
    });

    // Mock useMutation to return the correct structure for all calls
    mockUseMutation.mockReturnValue([
      vi.fn(),
      {
        loading: false,
        error: undefined,
        called: true,
        client: {} as any,
        reset: vi.fn(),
      } as any,
    ]);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Basic Functionality', () => {
    it('provides notification context to children', () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('add-notification')).toBeInTheDocument();
      expect(screen.getByTestId('unread-count')).toBeInTheDocument();
      expect(screen.getByTestId('notifications-count')).toBeInTheDocument();
    });

    it('initializes with empty notifications and zero unread count', () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });

    it('provides correct context structure', () => {
      let contextValue: any = null;

      function ContextTest() {
        contextValue = useNotifications();
        return null;
      }

      render(
        <NotificationProvider>
          <ContextTest />
        </NotificationProvider>
      );

      expect(contextValue).toHaveProperty('notifications');
      expect(contextValue).toHaveProperty('unreadCount');
      expect(contextValue).toHaveProperty('addNotification');
      expect(contextValue).toHaveProperty('markAsRead');
      expect(contextValue).toHaveProperty('markAllAsRead');
      expect(contextValue).toHaveProperty('clearNotifications');
      expect(typeof contextValue.addNotification).toBe('function');
      expect(typeof contextValue.markAsRead).toBe('function');
      expect(typeof contextValue.markAllAsRead).toBe('function');
      expect(typeof contextValue.clearNotifications).toBe('function');
      expect(Array.isArray(contextValue.notifications)).toBe(true);
      expect(typeof contextValue.unreadCount).toBe('number');
    });
  });

  describe('GraphQL Data Handling', () => {
    it('processes notifications data correctly', () => {
      const mockNotificationsData = {
        userNotifications: {
          edges: [
            {
              node: {
                id: 'notification-1',
                user_id: 'test-user',
                type: 'success',
                title: 'Test Title',
                message: 'Test Message',
                target_id: 'target-1',
                target_type: 'game_log',
                resolved: false,
                read: false,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
                deleted_at: null,
              },
            },
          ],
        },
      };

      mockUseQuery
        .mockReturnValueOnce({
          data: mockNotificationsData,
          refetch: mockRefetchNotifications,
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
        } as any)
        .mockReturnValueOnce({
          data: null,
          refetch: mockRefetchUnreadCount,
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
        } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      expect(screen.getByTestId('notification-notification-1')).toHaveTextContent(
        'Test Message - success - unread'
      );
    });

    it('processes unread count data correctly', () => {
      const mockUnreadCountData = {
        unreadNotificationsCount: 5,
      };

      mockUseQuery
        .mockReturnValueOnce({
          data: null,
          refetch: mockRefetchNotifications,
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
        } as any)
        .mockReturnValueOnce({
          data: mockUnreadCountData,
          refetch: mockRefetchUnreadCount,
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
        } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('unread-count')).toHaveTextContent('5');
    });

    it('handles empty notifications data', () => {
      const mockEmptyData = {
        userNotifications: {
          edges: [],
        },
      };

      mockUseQuery
        .mockReturnValueOnce({
          data: mockEmptyData,
          refetch: mockRefetchNotifications,
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
        } as any)
        .mockReturnValueOnce({
          data: null,
          refetch: mockRefetchUnreadCount,
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
        } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
    });

    it('handles null data gracefully', () => {
      mockUseQuery
        .mockReturnValueOnce({
          data: null,
          refetch: mockRefetchNotifications,
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
        } as any)
        .mockReturnValueOnce({
          data: null,
          refetch: mockRefetchUnreadCount,
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
        } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });
  });

  describe('Notification Management', () => {
    it('adds notification correctly', async () => {
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

      expect(screen.getByText(/Test message - success - unread/)).toBeInTheDocument();
      expect(mockToast.info).toHaveBeenCalledWith('Test message', {
        description: 'Test Notification',
        duration: 5000,
      });
    });

    it('marks notification as read', async () => {
      mockMarkAsRead.mockResolvedValue({});

      // Set up useMutation to return the specific mock functions for this test
      mockUseMutation.mockReturnValue([
        mockMarkAsRead,
        {
          loading: false,
          error: undefined,
          called: true,
          client: {} as any,
          reset: vi.fn(),
        } as any,
      ]);

      // Set up mock data for this test
      mockUseQuery
        .mockReturnValueOnce({
          data: {
            userNotifications: {
              edges: [
                {
                  node: {
                    id: 'notification-1',
                    user_id: 'test-user-id',
                    type: 'success',
                    title: 'Test Notification',
                    message: 'Test message',
                    target_id: null,
                    target_type: null,
                    resolved: false,
                    read: false,
                    created_at: '2024-01-15T10:00:00Z',
                    updated_at: '2024-01-15T10:00:00Z',
                    deleted_at: null,
                  },
                },
              ],
            },
          },
          refetch: mockRefetchNotifications,
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
        } as any)
        .mockReturnValueOnce({
          data: { unreadNotificationsCount: 1 },
          refetch: mockRefetchUnreadCount,
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
        } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Wait for the notification to be loaded from the mock query
      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      });

      // Mark as read
      fireEvent.click(screen.getByTestId('mark-as-read'));

      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalled();
        expect(mockRefetchUnreadCount).toHaveBeenCalled();
      });
    });

    it('marks all notifications as read', async () => {
      mockMarkAllAsRead.mockResolvedValue({});

      // Set up useMutation to return the specific mock functions for this test
      mockUseMutation.mockReturnValue([
        mockMarkAllAsRead,
        {
          loading: false,
          error: undefined,
          called: true,
          client: {} as any,
          reset: vi.fn(),
        } as any,
      ]);

      // Set up mock data for this test
      mockUseQuery
        .mockReturnValueOnce({
          data: {
            userNotifications: {
              edges: [
                {
                  node: {
                    id: 'notification-1',
                    user_id: 'test-user-id',
                    type: 'success',
                    title: 'Test Notification',
                    message: 'Test message',
                    target_id: null,
                    target_type: null,
                    resolved: false,
                    read: false,
                    created_at: '2024-01-15T10:00:00Z',
                    updated_at: '2024-01-15T10:00:00Z',
                    deleted_at: null,
                  },
                },
              ],
            },
          },
          refetch: mockRefetchNotifications,
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
        } as any)
        .mockReturnValueOnce({
          data: { unreadNotificationsCount: 1 },
          refetch: mockRefetchUnreadCount,
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
        } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Wait for the notification to be loaded from the mock query
      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      });

      // Mark all as read
      fireEvent.click(screen.getByTestId('mark-all-as-read'));

      await waitFor(() => {
        expect(mockMarkAllAsRead).toHaveBeenCalled();
        expect(mockRefetchUnreadCount).toHaveBeenCalled();
      });
    });

    it('clears notifications', () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Add a notification first
      fireEvent.click(screen.getByTestId('add-notification'));

      // Clear notifications
      fireEvent.click(screen.getByTestId('clear-notifications'));

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });
  });

  describe('Error Handling', () => {
    it('handles mark as read error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockMarkAsRead.mockRejectedValue(new Error('Network error'));

      // Set up useMutation to return the failing mock
      mockUseMutation.mockReturnValue([
        mockMarkAsRead,
        {
          loading: false,
          error: undefined,
          called: true,
          client: {} as any,
          reset: vi.fn(),
        } as any,
      ]);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Add a notification first
      fireEvent.click(screen.getByTestId('add-notification'));

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      });

      // Mark as read
      fireEvent.click(screen.getByTestId('mark-as-read'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error marking notification as read:',
          expect.any(Error)
        );
        expect(mockToast.error).toHaveBeenCalledWith('Failed to mark notification as read');
      });

      consoleSpy.mockRestore();
    });

    it('handles mark all as read error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockMarkAllAsRead.mockRejectedValue(new Error('Network error'));

      // Set up useMutation to return the failing mock
      mockUseMutation.mockReturnValue([
        mockMarkAllAsRead,
        {
          loading: false,
          error: undefined,
          called: true,
          client: {} as any,
          reset: vi.fn(),
        } as any,
      ]);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Mark all as read
      fireEvent.click(screen.getByTestId('mark-all-as-read'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error marking all notifications as read:',
          expect.any(Error)
        );
        expect(mockToast.error).toHaveBeenCalledWith('Failed to mark all notifications as read');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('User Authentication', () => {
    it('handles user not loaded state', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });

    it('handles user not signed in state', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });

    it('handles Clerk not configured (SSR/test environment)', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Mock useUser to throw an error (simulating Clerk not configured)
      mockUseUser.mockImplementation(() => {
        throw new Error('Clerk not configured');
      });

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(consoleSpy).toHaveBeenCalledWith('Clerk not configured, using fallback user data');
      expect(screen.getByTestId('notifications-count')).toHaveTextContent('0');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');

      consoleSpy.mockRestore();
    });
  });

  describe('Polling Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('polls for new notifications every 30 seconds', async () => {
      // Set up useMutation to return the specific mock functions for this test
      mockUseMutation.mockReturnValue([
        vi.fn(),
        {
          loading: false,
          error: undefined,
          called: true,
          client: {} as any,
          reset: vi.fn(),
        } as any,
      ]);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Fast-forward 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Run only the next timer, not all timers to avoid infinite loop
      act(() => {
        vi.runOnlyPendingTimers();
      });

      expect(mockRefetchNotifications).toHaveBeenCalled();
      expect(mockRefetchUnreadCount).toHaveBeenCalled();
    });

    it('does not poll when user is not authenticated', () => {
      mockUseUser.mockReturnValue({
        user: null,
        isLoaded: true,
        isSignedIn: false,
      });

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Fast-forward 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(mockRefetchNotifications).not.toHaveBeenCalled();
      expect(mockRefetchUnreadCount).not.toHaveBeenCalled();
    });

    it('cleans up polling interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('useNotifications Hook', () => {
    it('throws error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useNotifications must be used within a NotificationProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('State Updates', () => {
    it('updates local state when marking notification as read', async () => {
      mockMarkAsRead.mockResolvedValue({});

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Add a notification
      fireEvent.click(screen.getByTestId('add-notification'));

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('1');
      });

      // Mark as read
      fireEvent.click(screen.getByTestId('mark-as-read'));

      await waitFor(() => {
        expect(screen.getByText(/Test message - success - read/)).toBeInTheDocument();
      });
    });

    it('updates local state when marking all notifications as read', async () => {
      mockMarkAllAsRead.mockResolvedValue({});

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Add multiple notifications
      fireEvent.click(screen.getByTestId('add-notification'));
      fireEvent.click(screen.getByTestId('add-notification'));

      await waitFor(() => {
        expect(screen.getByTestId('notifications-count')).toHaveTextContent('2');
      });

      // Mark all as read
      fireEvent.click(screen.getByTestId('mark-all-as-read'));

      await waitFor(() => {
        const notifications = screen.getAllByText(/Test message - success - read/);
        expect(notifications).toHaveLength(2);
      });
    });
  });

  describe('Notification Data Processing', () => {
    it('correctly maps notification data from GraphQL response', () => {
      const mockNotificationsData = {
        userNotifications: {
          edges: [
            {
              node: {
                id: 'notification-1',
                user_id: 'test-user',
                type: 'comment_added',
                title: 'New Comment',
                message: 'Someone commented on your game log',
                target_id: 'game-log-1',
                target_type: 'game_log',
                resolved: true,
                read: true,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T01:00:00Z',
                deleted_at: null,
              },
            },
          ],
        },
      };

      mockUseQuery
        .mockReturnValueOnce({
          data: mockNotificationsData,
          refetch: mockRefetchNotifications,
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
        } as any)
        .mockReturnValueOnce({
          data: null,
          refetch: mockRefetchUnreadCount,
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
        } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notification-notification-1')).toHaveTextContent(
        'Someone commented on your game log - comment_added - read'
      );
    });

    it('handles notifications with deleted_at timestamp', () => {
      const mockNotificationsData = {
        userNotifications: {
          edges: [
            {
              node: {
                id: 'notification-1',
                user_id: 'test-user',
                type: 'info',
                title: 'Deleted Notification',
                message: 'This notification was deleted',
                target_id: null,
                target_type: null,
                resolved: false,
                read: false,
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z',
                deleted_at: '2023-01-01T02:00:00Z',
              },
            },
          ],
        },
      };

      mockUseQuery
        .mockReturnValueOnce({
          data: mockNotificationsData,
          refetch: mockRefetchNotifications,
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
        } as any)
        .mockReturnValueOnce({
          data: null,
          refetch: mockRefetchUnreadCount,
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
        } as any);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notification-notification-1')).toHaveTextContent(
        'This notification was deleted - info - unread'
      );
    });
  });
});
