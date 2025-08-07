import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import {
  NotificationProvider,
  useNotifications,
} from '@/app/components/providers/NotificationProvider';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    refetch: vi.fn(),
  })),
  useMutation: vi.fn(() => [vi.fn(), { loading: false, error: null }]),
  gql: vi.fn((strings, ..._args) => strings.join('')),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    user: { id: 'test-user-id' },
    isLoaded: true,
  })),
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

// Test component that uses the notification context
function TestComponent() {
  const { addNotification, markAsRead, notifications, clearNotifications } = useNotifications();

  return (
    <div>
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
      <button data-testid="clear-notifications" onClick={clearNotifications}>
        Clear Notifications
      </button>
      <div data-testid="notification-count">{notifications.length} notifications</div>
      {notifications.map(notification => (
        <div key={notification.id} data-testid={`notification-${notification.id}`}>
          {notification.message} - {notification.type}
        </div>
      ))}
    </div>
  );
}

describe('NotificationProvider', () => {
  describe('NotificationProvider', () => {
    it('provides notification context to children', () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('add-notification')).toBeInTheDocument();
      expect(screen.getByTestId('notification-count')).toBeInTheDocument();
    });

    it('initializes with empty notifications', () => {
      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      expect(screen.getByTestId('notification-count')).toHaveTextContent('0 notifications');
    });
  });

  describe('useNotifications', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow();

      consoleSpy.mockRestore();
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

      expect(contextValue).toHaveProperty('addNotification');
      expect(contextValue).toHaveProperty('markAsRead');
      expect(contextValue).toHaveProperty('notifications');
      expect(typeof contextValue.addNotification).toBe('function');
      expect(typeof contextValue.markAsRead).toBe('function');
      expect(Array.isArray(contextValue.notifications)).toBe(true);
    });
  });
});
