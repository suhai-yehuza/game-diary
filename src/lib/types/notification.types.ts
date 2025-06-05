import type { ReactElement } from 'react';

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'friend_removed'
  | 'game_update'
  | 'comment'
  | 'reaction';

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  userId: string;
  deletedAt?: Date | null;
  title?: string;
  description?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<AppNotification, 'id' | 'timestamp' | 'resolved' | 'deletedAt'>
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
