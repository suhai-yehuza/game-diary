import { useQuery } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import React from 'react';

import { StarRating } from '@/components/ui/star-rating';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { FriendActivityProps } from '@/lib/types/api.types';
import { GameLog } from '@/lib/types/generated/graphql';

export const FriendActivity: React.FC<FriendActivityProps> = ({ friendId }) => {
  const { loading, error, data } = useQuery(GET_GAME_LOGS, {
    variables: {
      userId: friendId,
      pagination: {
        limit: 5,
        offset: 0,
      },
    },
  });

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading activity</div>;
  }

  const activities = data?.gameLogs || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity: GameLog) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Watched a game</span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {activity.game?.teams?.visitors?.name} vs {activity.game?.teams?.home?.name}
                </div>
                {activity.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic">
                    &ldquo;{activity.notes}&rdquo;
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <StarRating ratingForGame={activity.ratingForGame} size="sm" />
                    <span className="text-sm text-gray-500">{activity.ratingForGame}/5</span>
                  </div>
                  <span className="text-sm text-gray-500">2 times watched</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
