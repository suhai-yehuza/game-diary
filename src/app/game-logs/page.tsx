'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_GAME_LOGS } from '../../lib/graphql/queries';
import { GameLogResponse } from '../../lib/types/types';
import Link from 'next/link';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

export default function GameLogsPage() {
  const [gameLogs, setGameLogs] = useState<GameLogResponse[]>([]);
  const {
    data: gameLogsData,
    loading,
    error,
  } = useQuery(GET_GAME_LOGS, {
    variables: {
      pagination: {
        first: 100,
      },
    },
  });

  useEffect(() => {
    if (gameLogsData) {
      const logs =
        gameLogsData?.game_logs?.edges?.map((edge: { node: GameLogResponse }) => edge.node) || [];
      setGameLogs(logs);
    }
  }, [gameLogsData]);

  if (loading) return <div>Loading Game Logs...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Game Logs</h1>

      <div className="grid gap-6">
        {gameLogs.map(gameLog => (
          <Link
            href={`/game-logs/${gameLog.id}`}
            key={gameLog.id}
            className="block bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h2 className="text-xl font-semibold">{gameLog.user?.username}</h2>
                <p className="text-gray-600">{format(new Date(), 'MMMM d, yyyy')}</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold">{gameLog.user?.username}</p>
                <p className="text-gray-600">{gameLog.user?.username}</p>
              </div>

              <div className="text-right">
                <p className="text-gray-600">{gameLog.user?.username}</p>
                <p className="text-gray-600">{gameLog.user?.username}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
