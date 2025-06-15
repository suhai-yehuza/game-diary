'use client';

import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { Button } from '@src/app/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@src/app/components/ui/popover';
import { ScrollArea } from '@src/app/components/ui/scroll-area';
import { useNotifications } from '@src/contexts/notification-context';
import type { IAppNotification } from '@src/lib/types/notification.types';

export default function NotificationCenterClient() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
    useNotifications();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleMarkAsRead = (notification: IAppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleClearNotification = (notificationId: string) => {
    // Add to removing items for animation
    setRemovingItems(prev => new Set(prev).add(notificationId));
    // Wait for animation to complete
    setTimeout(() => {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }, 300);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover-scale">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-spring">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 animate-scale-in" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs tap-scale"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-xs tap-scale"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 animate-fade-in">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1 stagger-children">
              {notifications.map((notification: IAppNotification) => (
                <div
                  key={notification.id}
                  className={`
                    p-3 rounded-lg transition-all cursor-pointer hover-lift
                    animate-slide-in-up
                    ${removingItems.has(notification.id) ? 'animate-slide-out-right' : ''}
                    ${
                      notification.read
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                    }
                  `}
                  onClick={() => handleMarkAsRead(notification)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMarkAsRead(notification);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {notification.metadata?.avatar &&
                      typeof notification.metadata.avatar === 'string' ? (
                        <Image
                          src={notification.metadata.avatar}
                          alt="Avatar"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <Bell className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleClearNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 tap-scale"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
