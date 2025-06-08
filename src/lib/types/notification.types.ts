import type { ReactElement } from 'react';

// Notification Types
export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'friend_removed';

export interface NotificationData {
  userId?: string;
  gameLogId?: string;
  friendshipId?: string;
  url?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  expiresAt?: Date | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;

  // Legacy properties for backward compatibility
  timestamp?: Date;
  resolved?: boolean;
  description?: string;
}

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<
      AppNotification,
      'id' | 'createdAt' | 'updatedAt' | 'read' | 'readAt' | 'deletedAt'
    >
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Consolidated from toast.types.ts
export type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: ReactElement;
  open?: boolean;
};

export type ToastActionElement = ReactElement;

export type ToasterToast = ToastProps & { id: string; open?: boolean };

export type ToastState = { toasts: ToasterToast[] };

export type ToastAction = {
  type: 'ADD_TOAST' | 'REMOVE_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST';
  toast?: ToasterToast;
  toastId?: string;
};
