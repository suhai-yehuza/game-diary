import { useQuery } from '@apollo/client/react/hooks';
import { Filter, Gamepad2 } from 'lucide-react';
import React, { useState } from 'react';

import { GameLogModal } from '@src/components/features/games';
import { GameLogActions } from '@src/components/features/games/game-log-actions';
import { Button } from '@src/components/ui/button';
import { Card, CardContent } from '@src/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@src/components/ui/popover';
import { Skeleton } from '@src/components/ui/skeleton';
import { StarRating } from '@src/components/ui/star-rating';
import { GET_USER_GAME_LOGS } from '@src/lib/graphql/queries';
import type {
  Classification,
  GameLog,
  GetUserGameLogsQueryVariables,
} from '@src/lib/types/generated/graphql';

interface GameLogsSectionProps {
  userId: string;
  currentUserId: string | null;
}

export function GameLogsSection({ userId, currentUserId }: GameLogsSectionProps) {
  const [selectedClassification, setSelectedClassification] = useState<Classification | 'all'>(
    'all'
  );
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [selectedGameLog, setSelectedGameLog] = useState<GameLog | null>(null);

  const ITEMS_PER_PAGE = 5;

  const {
    data: userGameLogsData,
    loading,
    refetch: refetchUserGameLogs,
  } = useQuery<{ gameLogs: { edges: Array<{ node: GameLog }> } }, GetUserGameLogsQueryVariables>(
    GET_USER_GAME_LOGS,
    {
      variables: {
        filters: {
          userId,
          classification: selectedClassification === 'all' ? undefined : selectedClassification,
        },
        pagination: {
          first: ITEMS_PER_PAGE,
          after: null,
        },
      },
    }
  );

  const toggleNotesExpansion = (gameLogId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameLogId)) {
        newSet.delete(gameLogId);
      } else {
        newSet.add(gameLogId);
      }
      return newSet;
    });
  };

  const handleGameLogClick = (gameLogId: string) => {
    const gameLog = userGameLogsData?.gameLogs?.edges?.find(
      edge => edge.node.id === gameLogId
    )?.node;
    if (gameLog) {
      setSelectedGameLog(gameLog);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const gameLogs = userGameLogsData?.gameLogs?.edges?.map(edge => edge.node) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Game Logs</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <Button
                variant={selectedClassification === 'all' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedClassification('all')}
              >
                All
              </Button>
              <Button
                variant={selectedClassification === 'Public' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedClassification('Public' as Classification)}
              >
                Public
              </Button>
              <Button
                variant={selectedClassification === 'Protected' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedClassification('Protected' as Classification)}
              >
                Protected
              </Button>
              <Button
                variant={selectedClassification === 'Private' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedClassification('Private' as Classification)}
              >
                Private
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {gameLogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Gamepad2 className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-lg font-medium">No game logs found</p>
            <p className="text-sm text-muted-foreground">
              {selectedClassification === 'all'
                ? 'This user has not logged any games yet'
                : `No ${selectedClassification.toLowerCase()} game logs found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {gameLogs.map(gameLog => (
            <Card key={gameLog.id} className="cursor-pointer hover:bg-accent/50">
              <CardContent
                className="p-4"
                onClick={() => handleGameLogClick(gameLog.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleGameLogClick(gameLog.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {gameLog.game.teams.home.name} vs {gameLog.game.teams.visitors.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(gameLog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StarRating ratingForGame={gameLog.ratingForGame} />
                </div>
                {gameLog.notes && (
                  <div className="mt-2">
                    <p className={`text-sm ${expandedNotes.has(gameLog.id) ? '' : 'line-clamp-2'}`}>
                      {gameLog.notes}
                    </p>
                    {gameLog.notes.length > 100 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1"
                        onClick={e => {
                          e.stopPropagation();
                          toggleNotesExpansion(gameLog.id);
                        }}
                      >
                        {expandedNotes.has(gameLog.id) ? 'Show less' : 'Show more'}
                      </Button>
                    )}
                  </div>
                )}
                {currentUserId && (
                  <GameLogActions gameLog={gameLog} onSuccess={refetchUserGameLogs} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGameLog && (
        <GameLogModal
          gameLog={selectedGameLog}
          mode="update"
          onClose={() => setSelectedGameLog(null)}
        />
      )}
    </div>
  );
}
