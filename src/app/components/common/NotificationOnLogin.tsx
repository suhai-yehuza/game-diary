'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useNotifications } from '@/app/components/providers/NotificationProvider';

export function NotificationOnLogin() {
  // Handle case where Clerk is not configured (e.g., during SSR or in test environment)
  let user = null;

  try {
    const userData = useUser();
    user = userData.user;
  } catch {
    // Clerk is not configured (e.g., during SSR or in test environment)
    console.log('Clerk not configured, using fallback user data');
    user = null;
  }

  const { notifications, unreadCount } = useNotifications();
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    // Only show notifications once per session when user logs in and has unread notifications
    if (user?.id && unreadCount > 0 && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;

      // Show a toast notification about unresolved notifications
      toast.info(`You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`, {
        description: 'Click the bell icon to view them',
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => {
            // This could trigger opening the notification dropdown
            // For now, we'll just show a message
            toast.info('Click the bell icon in the header to view notifications');
          },
        },
      });

      // Show individual notifications for recent ones (last 5)
      const recentNotifications = notifications
        .filter(notification => !notification.read)
        .slice(0, 5);

      recentNotifications.forEach((notification, index) => {
        setTimeout(
          () => {
            toast.info(notification.message, {
              description: notification.title,
              duration: 4000,
            });
          },
          (index + 1) * 1000
        ); // Stagger the notifications
      });
    }
  }, [user?.id, unreadCount, notifications]);

  // Reset the flag when user changes (new login)
  useEffect(() => {
    if (user?.id) {
      hasNotifiedRef.current = false;
    }
  }, [user?.id]);

  // This component doesn't render anything
  return null;
}
