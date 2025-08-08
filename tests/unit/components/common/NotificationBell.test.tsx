import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { NotificationBell } from '@/app/components/common/NotificationBell';

// Mock React hooks to simulate client-side rendering
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn(initial => {
      if (initial === false) {
        // isClient state
        return [true, vi.fn()];
      }
      return [initial, vi.fn()];
    }),
    useEffect: vi.fn(callback => callback()),
  };
});

// Mock useNotifications hook
vi.mock('@/app/components/providers/NotificationProvider', () => ({
  useNotifications: vi.fn(() => ({
    notifications: [],
    unreadCount: 0,
    markAsRead: vi.fn(),
    addNotification: vi.fn(),
  })),
}));

// Mock useUser hook
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(() => ({
    user: { id: 'user123' } as any,
    isLoaded: true,
    isSignedIn: true,
  })),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render notification bell', () => {
    render(<NotificationBell />);

    const bell = screen.getByRole('button', { name: /notifications/i });
    expect(bell).toBeInTheDocument();
    expect(bell).toHaveAttribute('aria-label', 'Notifications');
  });

  it('should show unread count badge when there are unread notifications', async () => {
    const notificationProvider = await import('@/app/components/providers/NotificationProvider');
    const useNotifications = vi.mocked(notificationProvider.useNotifications);
    useNotifications.mockReturnValue({
      notifications: [
        {
          id: '1',
          userId: 'user123',
          type: 'friend_request',
          title: 'Test',
          message: 'Test notification',
          read: false,
          readAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: '2',
          userId: 'user123',
          type: 'friend_accepted',
          title: 'Test 2',
          message: 'Test notification 2',
          read: false,
          readAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ],
      unreadCount: 2,
      markAsRead: vi.fn(),
      addNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      clearNotifications: vi.fn(),
    });

    render(<NotificationBell />);

    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-500');
  });

  it('should not show badge when there are no unread notifications', async () => {
    const notificationProvider = await import('@/app/components/providers/NotificationProvider');
    const useNotifications = vi.mocked(notificationProvider.useNotifications);
    useNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markAsRead: vi.fn(),
      addNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      clearNotifications: vi.fn(),
    });

    render(<NotificationBell />);

    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });

  it('should handle click events', () => {
    render(<NotificationBell />);

    const bell = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bell);

    // The component should handle the click without throwing errors
    expect(bell).toBeInTheDocument();
  });

  it('should handle large unread count', async () => {
    const notificationProvider = await import('@/app/components/providers/NotificationProvider');
    const useNotifications = vi.mocked(notificationProvider.useNotifications);
    useNotifications.mockReturnValue({
      notifications: Array.from({ length: 100 }, (_, i) => ({
        id: `notification-${i}`,
        userId: 'user123',
        type: 'friend_request',
        message: `Test notification ${i}`,
        title: `Test ${i}`,
        read: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      unreadCount: 100,
      markAsRead: vi.fn(),
      addNotification: vi.fn(),
      markAllAsRead: vi.fn(),
      clearNotifications: vi.fn(),
    });

    render(<NotificationBell />);

    const badge = screen.getByText('99+');
    expect(badge).toBeInTheDocument();
  });

  it('should handle user not being signed in', async () => {
    const clerkModule = await import('@clerk/nextjs');
    const useUser = vi.mocked(clerkModule.useUser);
    useUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    });

    render(<NotificationBell />);

    // When user is not signed in, the component should return null
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should handle user being signed in', async () => {
    const clerkModule = await import('@clerk/nextjs');
    const useUser = vi.mocked(clerkModule.useUser);
    useUser.mockReturnValue({
      user: { id: 'user123' } as any,
      isLoaded: true,
      isSignedIn: true,
    });

    render(<NotificationBell />);

    const bell = screen.getByRole('button', { name: /notifications/i });
    expect(bell).toBeInTheDocument();
  });
});
