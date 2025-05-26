'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

import { useToast } from '@/components/ui/use-toast';
import type { AppNotification, NotificationContextType } from '@/lib/types';

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
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      id: generateId(),
      message: notification.message,
      timestamp: new Date(),
      read: false,
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
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
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
