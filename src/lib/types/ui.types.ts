import type React from 'react';

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

// Component interfaces from header.tsx
export interface IButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
}

export interface IInputProps {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete?: string;
  spellCheck?: boolean;
  id?: string;
  ref?: (input: HTMLInputElement | null) => void;
}

// Component interfaces from admin database page
export interface IApiResponse {
  success: boolean;
  data?: Record<string, unknown>[];
  error?: string;
}

export interface IBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  className?: string;
}

export interface IAdminButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Provider interfaces
export interface IClerkProviderWrapperProps {
  children: React.ReactNode;
}
