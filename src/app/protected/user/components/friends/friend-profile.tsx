import { useQuery } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import React from 'react';

import { StarRating } from '@src/app/components/ui/star-rating';
import { GET_GAME_LOGS } from '@src/lib/graphql/queries';
import type { IFriendProfileProps, GameLog } from '@src/lib/types';

import { FriendActivity } from './friend-activity';

export const FriendProfile: React.FC<IFriendProfileProps> = ({ friend }) => {
  const { loading, error, data } = useQuery(GET_GAME_LOGS, {
    variables: {
      userId: friend?.id || '',
      pagination: {
        limit: 10,
        offset: 0,
      },
    },
    skip: !friend?.id,
  });

  if (!friend) {
    return <div className="text-red-500">Friend not found</div>;
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading friend profile</div>;
  }

  const gameLogs = data?.gameLogs || [];
  const recentLogs = gameLogs.slice(0, 5);

  // Mock activity data since FriendActivity now expects different props
  const mockActivities = recentLogs.map((log: GameLog) => ({
    id: log.id,
    type: 'game_logged' as const,
    user: {
      id: friend.id,
      username: friend.username,
      avatar: friend.avatar,
    },
    description: `logged a game`,
    timestamp: log.createdAt,
    gameTitle: `${log.game?.teams?.visitors?.name} vs ${log.game?.teams?.home?.name}`,
  }));

  return (
    <div className="space-y-6">
      {/* Friend Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm animate-fade-in">
        <div className="flex items-center gap-4">
          <Image
            src={friend.avatar || friend.image_url || '/default-avatar.png'}
            alt={friend.username}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{friend.username}</h1>
            <p className="text-gray-600">
              Joined {formatDistanceToNow(new Date(), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <div className="bg-white rounded-lg p-4 shadow-sm hover-lift animate-slide-in-up">
          <h3 className="text-lg font-semibold mb-2">Games Watched</h3>
          <p className="text-3xl font-bold text-blue-600">{gameLogs.length}</p>
        </div>
        <div
          className="bg-white rounded-lg p-4 shadow-sm hover-lift animate-slide-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <h3 className="text-lg font-semibold mb-2">Avg Rating</h3>
          <p className="text-3xl font-bold text-green-600">
            {gameLogs.length > 0
              ? (
                  gameLogs.reduce(
                    (sum: number, log: GameLog) => sum + (log.ratingForGame || 0),
                    0
                  ) / gameLogs.length
                ).toFixed(1)
              : '0.0'}
          </p>
        </div>
        <div
          className="bg-white rounded-lg p-4 shadow-sm hover-lift animate-slide-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <h3 className="text-lg font-semibold mb-2">Favorite Team</h3>
          <p className="text-lg font-semibold text-purple-600">Lakers</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm animate-slide-in-up">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <FriendActivity userId={friend.id} activities={mockActivities} isLoading={false} />
      </div>

      {/* Recent Game Logs */}
      <div className="bg-white rounded-lg p-6 shadow-sm animate-slide-in-up">
        <h2 className="text-xl font-bold mb-4">Recent Games</h2>
        <div className="space-y-4 stagger-children">
          {recentLogs.map((log: GameLog, index: number) => (
            <div
              key={log.id}
              className="border rounded-lg p-4 hover-lift animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">
                    {log.game?.teams?.visitors?.name} vs {log.game?.teams?.home?.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                  {log.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{log.notes}&rdquo;</p>
                  )}
                </div>
                <div className="text-right">
                  <StarRating ratingForGame={log.ratingForGame} size="sm" />
                  <p className="text-sm text-gray-500 mt-1">{log.ratingForGame}/5</p>
                </div>
              </div>
            </div>
          ))}

          {recentLogs.length === 0 && (
            <p className="text-center text-gray-500 py-8 animate-fade-in">No games logged yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
