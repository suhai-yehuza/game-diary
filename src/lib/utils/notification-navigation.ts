import { useRouter } from 'next/navigation';

import type { IAppNotification } from '@/types';

/**
 * Utility for handling notification navigation based on notification type and data
 */
export class NotificationNavigation {
  private readonly router: ReturnType<typeof useRouter>;

  constructor(router: ReturnType<typeof useRouter>) {
    this.router = router;
  }

  /**
   * Navigate to the appropriate page based on notification type and data
   */
  navigateToNotificationSource(notification: IAppNotification): void {
    const { type } = notification;

    // Handle different notification types
    switch (type) {
      case 'comment_added':
      case 'comment_updated':
      case 'comment_deleted':
        this.navigateToComment(notification);
        break;

      case 'reaction_added':
      case 'reaction_removed':
      case 'reaction_updated':
        this.navigateToReaction(notification);
        break;

      case 'friend_request':
        this.navigateToFriendRequest(notification);
        break;

      case 'game_log_created':
      case 'game_log_updated':
        this.navigateToGameLog(notification);
        break;

      case 'success':
      case 'error':
      case 'warning':
      case 'info':
        this.navigateToGeneral(notification);
        break;

      default:
        console.warn('Unknown notification type:', type);
        this.navigateToGeneral(notification);
    }
  }

  /**
   * Navigate to a comment (game log, player, team, or child comment)
   */
  private navigateToComment(notification: IAppNotification): void {
    const { data } = notification;

    // If we have specific comment data, navigate to the comment
    if (data?.commentId) {
      this.navigateToCommentById(data.commentId);
      return;
    }

    // If we have target information, navigate based on target type
    if (data?.gameLogId) {
      this.router.push(`/protected/dashboard/game-logs/${data.gameLogId}`);
    } else {
      // Fallback to general navigation
      this.navigateToGeneral(notification);
    }
  }

  /**
   * Navigate to a reaction (game log, player, team, or comment)
   */
  private navigateToReaction(notification: IAppNotification): void {
    const { data } = notification;

    // If we have specific reaction data, navigate to the reaction source
    if (data?.reactionId) {
      this.navigateToReactionById(data.reactionId);
      return;
    }

    // If we have specific game log data, navigate to it
    if (data?.gameLogId) {
      this.router.push(`/protected/dashboard/game-logs/${data.gameLogId}`);
    } else {
      // Fallback to general navigation
      this.navigateToGeneral(notification);
    }
  }

  /**
   * Navigate to friend request management
   */
  private navigateToFriendRequest(notification: IAppNotification): void {
    const { data } = notification;

    // If we have target user ID, navigate to their profile
    if (data?.userId) {
      this.router.push(`/users/${data.userId}`);
      return;
    }

    // If we have friendship data, navigate to the user profile
    if (data?.friendshipId) {
      // For now, navigate to dashboard where friendship management might be
      this.router.push('/protected/dashboard');
      return;
    }

    // Fallback to dashboard
    this.router.push('/protected/dashboard');
  }

  /**
   * Navigate to a game log
   */
  private navigateToGameLog(notification: IAppNotification): void {
    const { data } = notification;

    // If we have specific game log data, navigate to it
    if (data?.gameLogId) {
      this.router.push(`/protected/dashboard/game-logs/${data.gameLogId}`);
      return;
    }

    // If we have target ID, assume it's a game log ID
    if (data?.gameLogId) {
      this.router.push(`/protected/dashboard/game-logs/${data.gameLogId}`);
      return;
    }

    // Fallback to dashboard
    this.router.push('/protected/dashboard');
  }

  /**
   * Navigate to a comment by ID (handles both regular and child comments)
   */
  private navigateToCommentById(_commentId: string): void {
    // For now, navigate to the dashboard where comments are typically displayed
    // In a real implementation, you might want to scroll to the specific comment
    this.router.push('/protected/dashboard');
  }

  /**
   * Navigate to a reaction by ID
   */
  private navigateToReactionById(_reactionId: string): void {
    // For now, navigate to the dashboard where reactions are typically displayed
    // In a real implementation, you might want to scroll to the specific reaction
    this.router.push('/protected/dashboard');
  }

  /**
   * Navigate to general notification or fallback
   */
  private navigateToGeneral(notification: IAppNotification): void {
    // If there's a custom action URL, use it
    if (notification.actionUrl) {
      this.router.push(notification.actionUrl);
      return;
    }

    // If there's data with a URL, use it
    if (notification.data?.url) {
      this.router.push(notification.data.url);
      return;
    }

    // Fallback to home page
    this.router.push('/');
  }
}

/**
 * Hook for using notification navigation
 */
export function useNotificationNavigation() {
  const router = useRouter();
  const navigation = new NotificationNavigation(router);

  return {
    navigateToNotificationSource: (notification: IAppNotification) => {
      navigation.navigateToNotificationSource(notification);
    },
  };
}
