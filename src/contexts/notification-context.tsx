'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { useToast } from '@src/components/ui/use-toast';
import { clientCache, CLIENT_CACHE_KEYS } from '@src/lib/cache/client';
import type { AppNotification, NotificationContextType } from '@src/lib/types/notification.types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // Load notifications from Redis cache on mount
  useEffect(() => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') {
      setIsLoaded(true);
      return;
    }

    const loadNotifications = async () => {
      try {
        const savedNotifications = await clientCache.getItem<AppNotification[]>(
          CLIENT_CACHE_KEYS.NOTIFICATIONS
        );

        if (savedNotifications && Array.isArray(savedNotifications)) {
          // Convert date strings back to Date objects
          const notificationsWithDates = savedNotifications.map((n: AppNotification) => ({
            ...n,
            timestamp: n.timestamp ? new Date(n.timestamp) : new Date(n.createdAt),
            deletedAt: n.deletedAt ? new Date(n.deletedAt) : null,
          }));
          setNotifications(notificationsWithDates);
        }
      } catch (error) {
        console.error('Failed to load notifications from cache:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadNotifications();
  }, []);

  // Save notifications to Redis cache whenever they change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return;

    const saveNotifications = async () => {
      try {
        await clientCache.setItem(
          CLIENT_CACHE_KEYS.NOTIFICATIONS,
          notifications,
          60 * 60 * 24 * 30 // 30 days TTL
        );
      } catch (error) {
        console.error('Failed to save notifications to cache:', error);
      }
    };

    saveNotifications();
  }, [notifications, isLoaded]);

  // Convert backend notifications to frontend format
  const activeNotifications = notifications.map(n => ({
    ...n,
    timestamp: n.timestamp || n.createdAt,
    resolved: n.read,
  }));

  const unreadCount = activeNotifications.filter(n => !n.read).length;

  const addNotification = (
    notification: Omit<
      AppNotification,
      'id' | 'createdAt' | 'updatedAt' | 'read' | 'readAt' | 'deletedAt'
    >
  ) => {
    const newNotification: AppNotification = {
      id: Math.random().toString(36).substring(7),
      ...notification,
      read: false,
      readAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      timestamp: new Date(),
      resolved: false,
      description: notification.title,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast for new notification
    toast({
      title: notification.title || 'New Notification',
      description: notification.message,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? {
              ...notification,
              resolved: true,
              deletedAt: new Date(), // Soft delete when marking as read
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    const now = new Date();
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        resolved: true,
        deletedAt: !notification.deletedAt ? now : notification.deletedAt, // Only set deletedAt if not already deleted
      }))
    );
  };

  const clearNotifications = () => {
    // Instead of removing, soft delete all notifications
    const now = new Date();
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        deletedAt: !notification.deletedAt ? now : notification.deletedAt,
      }))
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: activeNotifications, // Only expose non-deleted notifications
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
