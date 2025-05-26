import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { AppNotification } from '@/lib/types/notification.types';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
    useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 px-2">
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={clearNotifications} className="h-8 px-2">
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification: AppNotification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {notification.metadata?.avatar &&
                    typeof notification.metadata.avatar === 'string' ? (
                      <Image
                        src={notification.metadata.avatar}
                        alt={
                          typeof notification.metadata.username === 'string'
                            ? notification.metadata.username
                            : ''
                        }
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : null}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{notification.title}</h5>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
