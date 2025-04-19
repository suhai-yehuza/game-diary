import { useQuery } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

import { StarRating } from '@/components/ui/star-rating';
import { GET_USER, GET_GAME_LOGS } from '@/lib/graphql/queries';
import { FriendProfileProps, TeamCounts } from '@/lib/types';
import { SharedGameLog } from '@/lib/types/generated/graphql';

import { FriendActivity } from './FriendActivity';

export const FriendProfile: React.FC<FriendProfileProps> = ({ friendId, onClose }) => {
  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_USER, {
    variables: { id: friendId },
  });

  const {
    loading: statsLoading,
    error: statsError,
    data: statsData,
  } = useQuery(GET_GAME_LOGS, {
    variables: {
      userId: friendId,
      pagination: {
        limit: 100,
        offset: 0,
      },
    },
  });

  if (userLoading || statsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (userError || statsError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="text-red-500">Error loading profile</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  const gameLogs = statsData?.gameLogs || [];

  // Calculate statistics
  const totalGames = gameLogs.length;
  const totalWatchTime = gameLogs.length;
  const averageRating =
    gameLogs.reduce((acc: number, log: SharedGameLog) => acc + (log.rating || 0), 0) / totalGames ||
    0;
  const favoriteTeams = gameLogs.reduce((acc: TeamCounts, log: SharedGameLog) => {
    const teams = [log.game.teams.visitors.name, log.game.teams.home.name];
    teams.forEach(team => {
      acc[team] = (acc[team] || 0) + 1;
    });
    return acc;
  }, {});

  const topTeams = (Object.entries(favoriteTeams) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([team]) => team);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-4xl w-full my-8"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Image
              src={user.image_url || '/default-user-avatar.svg'}
              alt={user.username}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-gray-500">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700">Games Watched</h3>
            <p className="text-2xl font-bold">{totalGames}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-700">Total Watch Time</h3>
            <p className="text-2xl font-bold">{totalWatchTime} games</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-700">Average Rating</h3>
            <div className="flex items-center gap-2">
              <StarRating rating={averageRating} size="md" />
              <p className="text-2xl font-bold">{averageRating.toFixed(1)}/5</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Favorite Teams</h3>
            <div className="space-y-2">
              {topTeams.map((team, _index) => (
                <div
                  key={team}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="font-medium">{team}</span>
                  <span className="text-sm text-gray-500">{favoriteTeams[team]} games</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {friendId && <FriendActivity friendId={friendId} />}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Game History</h3>
          <div className="space-y-4">
            {gameLogs.slice(0, 5).map((log: SharedGameLog) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {log.game.teams.visitors.name} vs {log.game.teams.home.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Watched{' '}
                      {formatDistanceToNow(new Date(log.watchedDate || Date.now()), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <StarRating rating={log.rating || 0} size="sm" />
                      <span className="font-medium">{log.rating}/5</span>
                    </div>
                  </div>
                </div>
                {log.notes && (
                  <p className="mt-2 text-sm text-gray-600 italic">&ldquo;{log.notes}&rdquo;</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
