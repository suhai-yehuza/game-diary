import type { ReactElement } from 'react';

// Notification Types
export type INotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'friend_removed';

export interface INotificationData {
  userId?: string;
  gameLogId?: string;
  friendshipId?: string;
  url?: string;
  [key: string]: unknown;
}

export interface IAppNotification {
  id: string;
  userId: string;
  type: INotificationType;
  title: string;
  message: string;
  data?: INotificationData;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  expiresAt?: Date | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  image_url?: string;
  metadata?: Record<string, unknown>;

  // Legacy properties for backward compatibility
  timestamp?: Date;
  resolved?: boolean;
  description?: string;
}

export interface INotificationContextType {
  notifications: IAppNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<
      IAppNotification,
      'id' | 'createdAt' | 'updatedAt' | 'read' | 'readAt' | 'deletedAt'
    >
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Toast notification properties
export interface IToastProps {
  id?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: ReactElement;
  open?: boolean;
}

export type IToastActionElement = ReactElement;

export interface IToasterToast extends IToastProps {
  id: string;
  open?: boolean;
}

export interface IToastState {
  toasts: IToasterToast[];
}

export interface IToastAction {
  type: 'ADD_TOAST' | 'REMOVE_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST';
  toast?: IToasterToast;
  toastId?: string;
}
