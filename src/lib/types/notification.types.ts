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
  read: boolean;
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
    notification: Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'deletedAt'>
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}
