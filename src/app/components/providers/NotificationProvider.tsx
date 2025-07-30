'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  GET_USER_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS_COUNT,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
} from '@/lib/graphql/queries';
import type { INotificationContextType, IAppNotification } from '@/lib/types';

// Create the notification context
const NotificationContext = createContext<INotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<IAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Query for notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery(
    GET_USER_NOTIFICATIONS,
    {
      variables: {
        filters: { read: false }, // Only fetch unread notifications
        pagination: { first: 50 },
      },
      skip: !user?.id,
      fetchPolicy: 'cache-and-network',
    }
  );

  // Query for unread count
  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery(
    GET_UNREAD_NOTIFICATIONS_COUNT,
    {
      skip: !user?.id,
      fetchPolicy: 'cache-and-network',
    }
  );

  // Mutations
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

  // Update notifications when data changes
  useEffect(() => {
    if (notificationsData?.userNotifications) {
      const notificationNodes = notificationsData.userNotifications.edges.map((edge: any) => ({
        id: edge.node.id,
        userId: edge.node.user_id,
        type: edge.node.type,
        title: edge.node.title,
        message: edge.node.message,
        read: edge.node.read,
        readAt: edge.node.read ? new Date(edge.node.updated_at) : null,
        createdAt: new Date(edge.node.created_at),
        updatedAt: new Date(edge.node.updated_at),
        deletedAt: edge.node.deleted_at ? new Date(edge.node.deleted_at) : null,
        resolved: edge.node.resolved,
        data: {
          targetId: edge.node.target_id,
          targetType: edge.node.target_type,
        },
      }));
      setNotifications(notificationNodes);
    }
  }, [notificationsData]);

  // Update unread count when data changes
  useEffect(() => {
    if (unreadCountData?.unreadNotificationsCount !== undefined) {
      setUnreadCount(unreadCountData.unreadNotificationsCount);
    }
  }, [unreadCountData]);

  // Mark notification as read
  const handleMarkAsRead = useCallback(
    (id: string) => {
      void (async () => {
        try {
          await markAsRead({ variables: { notificationId: id } });

          // Update local state
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === id
                ? { ...notification, read: true, readAt: new Date() }
                : notification
            )
          );

          // Refetch unread count
          await refetchUnreadCount();
        } catch (error) {
          console.error('Error marking notification as read:', error);
          toast.error('Failed to mark notification as read');
        }
      })();
    },
    [markAsRead, refetchUnreadCount]
  );

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(() => {
    void (async () => {
      try {
        await markAllAsRead();

        // Update local state
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            read: true,
            readAt: new Date(),
          }))
        );

        // Refetch unread count
        await refetchUnreadCount();
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Failed to mark all notifications as read');
      }
    })();
  }, [markAllAsRead, refetchUnreadCount]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Add notification (for real-time updates)
  const addNotification = useCallback(
    (
      notification: Omit<
        IAppNotification,
        'id' | 'createdAt' | 'updatedAt' | 'read' | 'readAt' | 'deletedAt'
      >
    ) => {
      const newNotification: IAppNotification = {
        ...notification,
        id: `temp-${Date.now()}`,
        read: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast for new notification
      toast.info(notification.message, {
        description: notification.title,
        duration: 5000,
      });
    },
    []
  );

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      void refetchNotifications();
      void refetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, refetchNotifications, refetchUnreadCount]);

  const contextValue: INotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications(): INotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
