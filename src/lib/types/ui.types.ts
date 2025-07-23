import type React from 'react';

// ========================================
// NOTIFICATION TYPES
// ========================================

export type INotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'reaction_added'
  | 'reaction_removed'
  | 'reaction_updated'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_deleted'
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'friend_removed';

export interface INotificationData {
  userId?: string;
  gameLogId?: string;
  commentId?: string;
  reactionId?: string;
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

// ========================================
// BASE COMPONENT TYPES
// ========================================

// Base button interface that can be extended
export interface IBaseButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Specific button variants
export interface IButtonProps extends IBaseButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
  'aria-label'?: string;
}

export interface IAdminButtonProps extends IBaseButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
}

// Base input interface that can be extended
export interface IBaseInputProps {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  required?: boolean;
}

// Specific input variants
export interface IInputProps extends IBaseInputProps {
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete?: string;
  spellCheck?: boolean;
  ref?: (input: HTMLInputElement | null) => void;
}

// ========================================
// ADMIN & API TYPES
// ========================================

export interface IApiResponse {
  success: boolean;
  data?: Record<string, unknown>[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  className?: string;
}

// Provider interfaces
export interface IClerkProviderWrapperProps {
  children: React.ReactNode;
}

export interface TableWithSearchProps {
  endpoint: string;
  columns: ColumnConfig<any>[];
  itemLabel: string;
  tableName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type ColumnConfig<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};
