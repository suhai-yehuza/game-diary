import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import React from 'react';

import type { IFriend } from '@src/lib/types/social.types';

interface IActivity {
  id: string;
  type: 'game_logged' | 'friend_added' | 'achievement';
  user: IFriend;
  description: string;
  timestamp: string;
  gameTitle?: string;
  achievement?: string;
}

interface IFriendActivityProps {
  activities: IActivity[];
  isLoading?: boolean;
}

export const FriendActivity: React.FC<IFriendActivityProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg animate-pulse"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 animate-fade-in">
        <p>No friend activity yet</p>
      </div>
    );
  }

  const getActivityIcon = (type: IActivity['type']) => {
    switch (type) {
      case 'game_logged':
        return '🎮';
      case 'friend_added':
        return '👥';
      case 'achievement':
        return '🏆';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: IActivity['type']) => {
    switch (type) {
      case 'game_logged':
        return 'bg-blue-100 text-blue-800';
      case 'friend_added':
        return 'bg-green-100 text-green-800';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 stagger-children">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-4 bg-white rounded-lg border hover-lift animate-slide-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* User avatar */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            {activity.user.avatar ? (
              <Image
                src={activity.user.avatar}
                alt={activity.user.username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {activity.user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Activity content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}
                  >
                    {activity.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user.username}</span>{' '}
                  {activity.description}
                </p>
                {activity.gameTitle && (
                  <p className="text-sm text-blue-600 font-medium mt-1">{activity.gameTitle}</p>
                )}
                {activity.achievement && (
                  <p className="text-sm text-yellow-600 font-medium mt-1">
                    🏆 {activity.achievement}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-500 ml-2">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
