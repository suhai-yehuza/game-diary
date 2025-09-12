'use client';

import { useUser } from '@clerk/nextjs';
import { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { NotificationCacheUtils } from '@/lib/cache';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '@/lib/graphql/mutations';
import { GET_USER_NOTIFICATIONS, GET_UNREAD_NOTIFICATIONS_COUNT } from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import { ErrorCategory, ErrorSeverity } from '@/types';
import type {
  IAppNotification,
  INotificationContextType,
  GetUserNotificationsQuery,
  GetUnreadNotificationsCountQuery,
  MarkNotificationAsReadMutation,
  MarkAllNotificationsAsReadMutation,
} from '@/types';

// Create the notification context
const NotificationContext = createContext<INotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Handle case where Clerk is not configured (e.g., during SSR or in test environment)
  let user = null;
  let isLoaded = false;

  try {
    const userData = useUser();
    user = userData.user;
    isLoaded = userData.isLoaded;
  } catch {
    // Clerk is not configured (e.g., during SSR or in test environment)
    console.log('Clerk not configured, using fallback user data');
    user = null;
    isLoaded = true; // Consider loaded if Clerk is not available
  }

  const [notifications, setNotifications] = useState<IAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Determine if we should skip queries based on authentication state
  // Skip queries if Clerk is not loaded, user is not authenticated, or there's an auth error
  // Also add a small delay to prevent race conditions on page load
  const [shouldSkipQueries, setShouldSkipQueries] = useState(true);

  useEffect(() => {
    // Add a longer delay to prevent queries from running before authentication is properly determined
    const timer = setTimeout(() => {
      // Check if we're on the landing page (no user authentication required)
      const isLandingPage = typeof window !== 'undefined' && window.location.pathname === '/';

      const shouldSkip = !isLoaded || !user?.id || authError !== null || isLandingPage;
      setShouldSkipQueries(shouldSkip);

      if (process.env.NODE_ENV === 'development') {
        console.log('🔔 NotificationProvider skip decision:', {
          isLoaded,
          userId: user?.id,
          authError,
          isLandingPage,
          shouldSkip,
        });
      }
    }, 500); // Increased to 500ms delay to ensure proper initialization

    return () => clearTimeout(timer);
  }, [isLoaded, user?.id, authError]);

  // Debug logging for skip state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 NotificationProvider skip state:', {
        isLoaded,
        userId: user?.id,
        authError,
        shouldSkipQueries,
      });
    }
  }, [isLoaded, user?.id, authError, shouldSkipQueries]);

  // Query for notifications with proper authentication handling
  const {
    data: notificationsData,
    refetch: refetchNotifications,
    loading: notificationsLoading,
    error: notificationsError,
  } = useOptimizedQuery<GetUserNotificationsQuery>(GET_USER_NOTIFICATIONS, {
    variables: {
      filters: { read: false }, // Only fetch unread notifications
      pagination: { first: 20 },
    },
    skip: shouldSkipQueries || !user?.id, // Double-check user ID
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
    errorPolicy: shouldSkipQueries ? 'ignore' : 'all', // Ignore errors when skipped
    context: {
      component: 'NotificationProvider',
      action: 'Load user notifications',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
  });

  // Query for unread count with proper authentication handling
  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
    loading: unreadCountLoading,
    error: unreadCountError,
  } = useOptimizedQuery<GetUnreadNotificationsCountQuery>(GET_UNREAD_NOTIFICATIONS_COUNT, {
    skip: shouldSkipQueries || !user?.id, // Double-check user ID
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
    errorPolicy: shouldSkipQueries ? 'ignore' : 'all', // Ignore errors when skipped
    context: {
      component: 'NotificationProvider',
      action: 'Load unread notifications count',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
  });

  // Handle authentication errors and retry logic
  useEffect(() => {
    // Only handle errors if queries are not skipped
    if (!shouldSkipQueries && (notificationsError || unreadCountError)) {
      const error = notificationsError || unreadCountError;
      console.warn('Notification query error:', error);

      // Check if it's an authentication error
      if (
        error?.message?.includes('Authentication required') ||
        error?.message?.includes('AuthorizationError')
      ) {
        setAuthError('Authentication required');

        // Retry after a delay if we haven't exceeded max retries
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const delay = Math.pow(2, retryCountRef.current) * 1000; // Exponential backoff

          retryTimeoutRef.current = setTimeout(() => {
            console.log(
              `Retrying notification queries (attempt ${retryCountRef.current}/${maxRetries})`
            );
            setAuthError(null);
            void refetchNotifications();
            void refetchUnreadCount();
          }, delay);
        } else {
          console.error('Max retries exceeded for notification queries');
        }
      }
    } else {
      // Clear auth error on successful queries
      if (authError) {
        setAuthError(null);
        retryCountRef.current = 0;
      }
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [
    notificationsError,
    unreadCountError,
    authError,
    refetchNotifications,
    refetchUnreadCount,
    shouldSkipQueries,
  ]);

  // Cache management for notifications
  useEffect(() => {
    if (user?.id && notificationsData?.userNotifications?.edges) {
      const notificationList = notificationsData.userNotifications.edges.map(
        edge =>
          ({
            id: edge.node.id,
            userId: edge.node.user_id,
            type: edge.node.type,
            title: edge.node.title,
            message: edge.node.message,
            targetId: edge.node.target_id,
            targetType: edge.node.target_type,
            resolved: edge.node.resolved,
            read: edge.node.read,
            readAt: edge.node.read ? new Date() : null,
            createdAt: new Date(edge.node.created_at),
            updatedAt: new Date(edge.node.created_at), // GraphQL doesn't have updated_at
            deletedAt: null,
          }) as IAppNotification
      );

      // Cache the notifications
      try {
        NotificationCacheUtils.cacheUserNotifications(user.id, notificationList);
      } catch (error) {
        console.warn('Failed to cache notifications:', error);
      }

      setNotifications(notificationList);
    }
  }, [notificationsData, user?.id]);

  // Cache management for unread count
  useEffect(() => {
    if (user?.id && unreadCountData?.unreadNotificationsCount !== undefined) {
      const count = unreadCountData.unreadNotificationsCount;

      // Cache the unread count
      try {
        NotificationCacheUtils.cacheUserUnreadCount(user.id, count);
      } catch (error) {
        console.warn('Failed to cache unread count:', error);
      }

      setUnreadCount(count);
    }
  }, [unreadCountData, user?.id]);

  // Initialize from cache and handle authentication state changes
  useEffect(() => {
    if (user?.id && isLoaded && !isInitialized) {
      setIsInitialized(true);

      // Try to load notifications from cache
      NotificationCacheUtils.getCachedUserNotifications(user.id)
        .then(cachedNotifications => {
          if (cachedNotifications && cachedNotifications.length > 0) {
            setNotifications(cachedNotifications);
            console.log('📱 Loaded notifications from cache');
          }
        })
        .catch(error => {
          console.warn('Failed to load notifications from cache:', error);
        });

      // Try to load unread count from cache
      NotificationCacheUtils.getCachedUserUnreadCount(user.id)
        .then(cachedCount => {
          if (cachedCount !== null && cachedCount > 0) {
            setUnreadCount(cachedCount);
            console.log('📱 Loaded unread count from cache');
          }
        })
        .catch(error => {
          console.warn('Failed to load unread count from cache:', error);
        });
    } else if (!user?.id && isLoaded) {
      // User is not authenticated, clear state
      setNotifications([]);
      setUnreadCount(0);
      setIsInitialized(false);
      setAuthError(null);
    }
  }, [user?.id, isLoaded, isInitialized]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Performance monitoring - only log if queries are actually slow
  useEffect(() => {
    if (notificationsLoading) {
      // Log when loading starts, but don't compare boolean with number
      console.log('📱 Notifications query in progress...');
    }
  }, [notificationsLoading]);

  useEffect(() => {
    if (unreadCountLoading) {
      // Log when loading starts, but don't compare boolean with number
      console.log('📱 Unread count query in progress...');
    }
  }, [unreadCountLoading]);

  // Mark notification as read
  const [markAsRead, { loading: _markAsReadLoading }] =
    useOptimizedMutation<MarkNotificationAsReadMutation>(MARK_NOTIFICATION_AS_READ, {
      context: {
        component: 'NotificationProvider',
        action: 'Mark notification as read',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    });

  // Mark all notifications as read
  const [markAllAsRead, { loading: _markAllAsReadLoading }] =
    useOptimizedMutation<MarkAllNotificationsAsReadMutation>(MARK_ALL_NOTIFICATIONS_AS_READ, {
      context: {
        component: 'NotificationProvider',
        action: 'Mark all notifications as read',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    });

  // Update notifications when data changes
  useEffect(() => {
    if (notificationsData?.userNotifications?.edges) {
      const notificationList = notificationsData.userNotifications.edges.map(
        edge =>
          ({
            id: edge.node.id,
            userId: edge.node.user_id,
            type: edge.node.type,
            title: edge.node.title,
            message: edge.node.message,
            targetId: edge.node.target_id,
            targetType: edge.node.target_type,
            resolved: edge.node.resolved,
            read: edge.node.read,
            readAt: edge.node.read ? new Date() : null,
            createdAt: new Date(edge.node.created_at),
            updatedAt: new Date(edge.node.created_at), // GraphQL doesn't have updated_at
            deletedAt: null,
          }) as IAppNotification
      );
      setNotifications(notificationList);
    }
  }, [notificationsData]);

  // Update unread count when data changes
  useEffect(() => {
    if (unreadCountData?.unreadNotificationsCount !== undefined) {
      setUnreadCount(unreadCountData.unreadNotificationsCount);
    }
  }, [unreadCountData]);

  // Handle marking a single notification as read
  const _handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const result = await markAsRead({
          variables: { notificationId },
        });

        if (
          (result as { data?: MarkNotificationAsReadMutation })?.data?.markNotificationAsRead
            ?.success
        ) {
          // Update local state
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === notificationId ? { ...notification, read: true } : notification
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
          toast.success('Notification marked as read');
        } else {
          const errors =
            (result as { data?: MarkNotificationAsReadMutation })?.data?.markNotificationAsRead
              ?.errors || [];
          const message = errors[0]?.message || 'Failed to mark notification as read';
          toast.error(message);
        }
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'NotificationProvider',
          action: 'Mark notification as read',
        });
        toast.error('Failed to mark notification as read');
      }
    },
    [markAsRead]
  );

  // Handle marking all notifications as read
  const _handleMarkAllAsRead = useCallback(async () => {
    try {
      const result = await markAllAsRead();

      if (
        (result as { data?: MarkAllNotificationsAsReadMutation })?.data?.markAllNotificationsAsRead
          ?.success
      ) {
        // Update local state
        setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      } else {
        const errors =
          (result as { data?: MarkAllNotificationsAsReadMutation })?.data
            ?.markAllNotificationsAsRead?.errors || [];
        const message = errors[0]?.message || 'Failed to mark all notifications as read';
        toast.error(message);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NotificationProvider',
        action: 'Mark all notifications as read',
      });
      toast.error('Failed to mark all notifications as read');
    }
  }, [markAllAsRead]);

  // Refresh notifications
  const _refreshNotifications = useCallback(async () => {
    if (!user?.id || !isLoaded) {
      console.warn('Cannot refresh notifications: user not authenticated');
      return;
    }

    try {
      // Reset retry count on manual refresh
      retryCountRef.current = 0;
      setAuthError(null);

      await Promise.all([refetchNotifications(), refetchUnreadCount()]);
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NotificationProvider',
        action: 'Refresh notifications',
      });
    }
  }, [refetchNotifications, refetchUnreadCount, user?.id, isLoaded]);

  // Context value
  const contextValue: INotificationContextType = {
    notifications,
    unreadCount,
    loading: (notificationsLoading || unreadCountLoading) && !authError,
    error: authError ? new Error(authError) : notificationsError || unreadCountError || null,
    // Performance metrics - removed as they no longer exist
    notificationsQueryTime: 0,
    unreadCountQueryTime: 0,
    isNotificationsSlow: false,
    isUnreadCountSlow: false,
    addNotification: (
      notification: Omit<
        IAppNotification,
        'id' | 'createdAt' | 'updatedAt' | 'read' | 'readAt' | 'deletedAt'
      >
    ) => {
      const newNotification: IAppNotification = {
        ...notification,
        id: `temp-${Date.now()}`,
        read: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      setNotifications(prev => [...prev, newNotification]);
      setUnreadCount(prev => prev + 1);

      // Show toast notification
      toast.info(notification.message, {
        description: notification.title,
        duration: 5000,
      });
    },
    clearNotifications: () => {
      setNotifications([]);
      setUnreadCount(0);
    },
    refreshNotifications: () => {
      void _refreshNotifications();
    },
    markAsRead: (notificationId: string) => {
      void _handleMarkAsRead(notificationId);
    },
    markAllAsRead: () => {
      void _handleMarkAllAsRead();
    },
  };

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
