/**
 * UI Types
 * UI-related type definitions including toasts, notifications, and interface components
 */

// ========================================
// TOAST TYPES
// ========================================

export interface IToastProps {
  id?: string;
  title?: string;
  description?: string;
  action?: IToastActionElement;
  variant?: 'default' | 'destructive';
  duration?: number;
  open?: boolean;
}

export interface IToastActionElement {
  altText: string;
  onClick: () => void;
}

export interface IToastState {
  toasts: IToasterToast[];
}

export interface IToastAction {
  type: 'ADD_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST' | 'REMOVE_TOAST';
  toast?: IToasterToast;
  toastId?: string;
}

export interface IToasterToast extends IToastProps {
  id: string;
  open?: boolean;
}

// Alternative toast action element type (React component)
export type IToastActionElement2 = {
  type: string;
  props: Record<string, unknown>;
  key?: string | number | null;
};

// ========================================
// NOTIFICATION TYPES
// ========================================

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

// ========================================
// CHART TYPES
// ========================================

export interface IChartData<TLabel = string> {
  labels?: TLabel[];
  datasets: IChartDataset[];
}

export interface IChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  [key: string]: unknown;
}
