import { useQuery } from '@apollo/client';
import { useState } from 'react';

import { GET_USER_GAME_LOGS } from '@src/lib/graphql/queries';
import type { IFilters, IGameLogsSectionProps } from '@src/lib/types/game-log.types';
import type { GameLog, GameLogEdge } from '@src/lib/types/generated/graphql';

import { GameLogActions } from './game-log-actions';
import { GameLogModal } from './game-log-modal';
import { GameLogSearchSection } from './game-log-search-section';

export const GameLogsSection = ({ userId, currentUser }: IGameLogsSectionProps) => {
  const [selectedGameLog, setSelectedGameLog] = useState<GameLog | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);
  const [filters, setFilters] = useState<IFilters>({
    searchText: '',
    classification: undefined,
    dateRange: undefined,
    tags: undefined,
  });

  const { data: userGameLogsData, loading } = useQuery(GET_USER_GAME_LOGS, {
    variables: {
      filters: {
        userId,
        searchText: filters.searchText,
        classification: filters.classification,
        dateRange: filters.dateRange,
        tags: filters.tags,
      },
      pagination: {
        first: 10,
      },
    },
  });

  const handleFiltersChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters as IFilters);
  };

  const gameLogs = userGameLogsData?.gameLogs?.edges.map((edge: GameLogEdge) => edge.node) || [];

  return (
    <div className="space-y-4">
      <GameLogSearchSection onFiltersChange={handleFiltersChange} />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {gameLogs.map((gameLog: GameLog) => {
            const teams = gameLog.game?.teams;

            return (
              <div key={gameLog.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {teams?.home.name} vs {teams?.visitors.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(gameLog.game?.date.start || '').toLocaleDateString()}
                    </p>
                  </div>
                  <GameLogActions
                    gameLog={gameLog}
                    currentUser={currentUser}
                    onEdit={() => setSelectedGameLog(gameLog)}
                    onDelete={() => {
                      /* Handle delete */
                    }}
                  />
                </div>

                {gameLog.notes && (
                  <div className="mt-2">
                    <p className="text-sm">
                      {expandedNotes.includes(gameLog.id)
                        ? gameLog.notes
                        : `${gameLog.notes.slice(0, 100)}...`}
                    </p>
                    {gameLog.notes.length > 100 && (
                      <button
                        onClick={() => {
                          setExpandedNotes(prev =>
                            prev.includes(gameLog.id)
                              ? prev.filter(id => id !== gameLog.id)
                              : [...prev, gameLog.id]
                          );
                        }}
                        className="text-blue-500 text-sm mt-1"
                      >
                        {expandedNotes.includes(gameLog.id) ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedGameLog && (
        <GameLogModal
          gameLog={selectedGameLog}
          isOpen={!!selectedGameLog}
          mode="update"
          onClose={() => setSelectedGameLog(null)}
          onSuccess={() => {
            setSelectedGameLog(null);
            // Refresh data
          }}
        />
      )}
    </div>
  );
};
