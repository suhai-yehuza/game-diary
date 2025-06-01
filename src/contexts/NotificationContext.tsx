'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { useToast } from '@/components/ui/use-toast';
import type { AppNotification, NotificationContextType } from '@/lib/types/notification.types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function generateId(): string {
  return Math.random().toString(36).substring(2);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { toast } = useToast();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      // Convert date strings back to Date objects
      const notificationsWithDates = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
        deletedAt: n.deletedAt ? new Date(n.deletedAt) : null,
      }));
      setNotifications(notificationsWithDates);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Filter out soft-deleted notifications
  const activeNotifications = notifications.filter(n => !n.deletedAt);
  const unreadCount = activeNotifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'deletedAt'>) => {
    const newNotification: AppNotification = {
      id: generateId(),
      message: notification.message,
      timestamp: new Date(),
      read: false,
      deletedAt: null,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      description: notification.description,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata,
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
              read: true,
              deletedAt: new Date() // Soft delete when marking as read
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
        read: true,
        deletedAt: !notification.deletedAt ? now : notification.deletedAt // Only set deletedAt if not already deleted
      }))
    );
  };

  const clearNotifications = () => {
    // Instead of removing, soft delete all notifications
    const now = new Date();
    setNotifications(prev => 
      prev.map(notification => ({ 
        ...notification, 
        deletedAt: !notification.deletedAt ? now : notification.deletedAt
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
