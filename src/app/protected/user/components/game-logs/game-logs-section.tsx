import { useMutation, useQuery } from '@apollo/client';
import { Filter, Gamepad2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@src/app/components/ui/button';
import { Card, CardContent } from '@src/app/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@src/app/components/ui/popover';
import { Skeleton } from '@src/app/components/ui/skeleton';
import { StarRating } from '@src/app/components/ui/star-rating';
import { CREATE_REACTION, DELETE_REACTION } from '@src/lib/graphql/mutations';
import { GET_USER_GAME_LOGS } from '@src/lib/graphql/queries';
import {
  REACTION_EMOJIS,
  EMOJI_TO_GRAPHQL_MAPPING,
  type IReactionEmojiValue,
} from '@src/lib/types/config.types';
import type {
  Classification,
  GameLog,
  GetUserGameLogsQuery,
  GetUserGameLogsQueryVariables,
  CommentConnection,
} from '@src/lib/types/generated/graphql';
import { cn } from '@src/lib/utils';

import { GameLogActions } from './game-log-actions';
import { GameLogModal } from './game-log-modal';

const ITEMS_PER_PAGE = 10;

interface IGameLogsSectionProps {
  userId: string;
  currentUserId: string | null;
}

export function GameLogsSection({ userId, currentUserId }: IGameLogsSectionProps) {
  const router = useRouter();
  const [selectedClassification, setSelectedClassification] = useState<Classification | 'all'>(
    'all'
  );
  const [selectedGameLog, setSelectedGameLog] = useState<GameLog | null>(null);
  const [clickedEmoji, setClickedEmoji] = useState<IReactionEmojiValue | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: userGameLogsData,
    loading: userGameLogsLoading,
    refetch: refetchUserGameLogs,
  } = useQuery<GetUserGameLogsQuery, GetUserGameLogsQueryVariables>(GET_USER_GAME_LOGS, {
    variables: {
      filters: {
        userId,
        classification: selectedClassification === 'all' ? undefined : selectedClassification,
      },
    },
  });

  // Reaction mutations
  const [createReaction] = useMutation(CREATE_REACTION, {
    onCompleted: () => {
      refetchUserGameLogs();
    },
  });

  const [deleteReaction] = useMutation(DELETE_REACTION, {
    onCompleted: () => {
      refetchUserGameLogs();
    },
  });

  // Helper function to convert emoji character to GraphQL enum value
  function emojiToGraphQLEnum(emojiChar: IReactionEmojiValue): string {
    const emojiKey = Object.entries(REACTION_EMOJIS).find(([, char]) => char === emojiChar)?.[0];
    if (!emojiKey) return 'THUMBS_UP';
    return (
      EMOJI_TO_GRAPHQL_MAPPING[emojiKey as keyof typeof EMOJI_TO_GRAPHQL_MAPPING] || 'THUMBS_UP'
    );
  }

  function handleReaction(emoji: IReactionEmojiValue, targetId: string, hasReacted: boolean) {
    if (!currentUserId) return;

    setClickedEmoji(emoji);
    setTimeout(() => setClickedEmoji(null), 200);

    const graphqlEmojiEnum = emojiToGraphQLEnum(emoji);

    if (hasReacted) {
      const gameLog = userGameLogsData?.gameLogs?.edges.find(
        edge => edge.node.id === targetId
      )?.node;
      const reaction = gameLog?.reactions?.find(
        (r: { emoji: string; userId: string }) => r.emoji === emoji && r.userId === currentUserId
      );

      if (reaction?.id) {
        deleteReaction({ variables: { id: reaction.id } });
      }
    } else {
      createReaction({
        variables: {
          input: {
            emoji: graphqlEmojiEnum,
            targetId,
            targetType: 'game_log',
          },
        },
      });
    }
  }

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

  const handleGameLogClick = (gameLogId: string, event: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = event.target as HTMLElement;
    const cardElement = event.currentTarget as HTMLElement;

    const isInteractiveElement =
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[data-interactive]') ||
      target.closest('.dropdown-menu') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      (target.closest('[role="button"]') && target.closest('[role="button"]') !== cardElement);

    if (!isInteractiveElement) {
      router.push(`/protected/user/game-logs/${gameLogId}`);
    }
  };

  if (userGameLogsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const gameLogs = userGameLogsData?.gameLogs?.edges?.map(edge => edge.node) || [];
  const gameLogsWithComments = gameLogs.map(gameLog => {
    const commentEdges =
      (gameLog as GameLog).comments?.edges?.map(edge => ({
        cursor: edge.cursor,
        node: edge.node,
      })) || [];
    const commentConnection: CommentConnection = {
      edges: commentEdges,
      pageInfo: (gameLog as GameLog).comments?.pageInfo || {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: (gameLog as GameLog).comments?.totalCount || 0,
    };
    return {
      ...gameLog,
      comments: commentConnection,
    } as GameLog;
  });
  const totalCount = userGameLogsData?.gameLogs?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
                variant={String(selectedClassification) === 'Public' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedClassification('Public' as Classification)}
              >
                Public
              </Button>
              <Button
                variant={String(selectedClassification) === 'Protected' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedClassification('Protected' as Classification)}
              >
                Protected
              </Button>
              <Button
                variant={String(selectedClassification) === 'Private' ? 'default' : 'ghost'}
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
          {gameLogsWithComments.map(gameLog => (
            <Card
              key={gameLog.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={e => handleGameLogClick(gameLog.id, e)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleGameLogClick(gameLog.id, e);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <CardContent className="p-4">
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
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {Object.entries(REACTION_EMOJIS).map(([key, emoji]) => {
                        const reactionCount =
                          gameLog.reactions?.filter(
                            r =>
                              r.emoji ===
                              EMOJI_TO_GRAPHQL_MAPPING[key as keyof typeof EMOJI_TO_GRAPHQL_MAPPING]
                          ).length || 0;
                        const hasReacted = gameLog.reactions?.some(
                          r =>
                            r.emoji ===
                              EMOJI_TO_GRAPHQL_MAPPING[
                                key as keyof typeof EMOJI_TO_GRAPHQL_MAPPING
                              ] && r.userId === currentUserId
                        );

                        return (
                          <Button
                            key={key}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'h-8 w-8 p-0',
                              hasReacted && 'bg-accent',
                              clickedEmoji === emoji && 'scale-110'
                            )}
                            onClick={e => {
                              e.stopPropagation();
                              handleReaction(emoji, gameLog.id, hasReacted);
                            }}
                          >
                            <span className="text-lg">{emoji}</span>
                            {reactionCount > 0 && (
                              <span className="ml-1 text-xs">{reactionCount}</span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                    <GameLogActions gameLog={gameLog} onSuccess={refetchUserGameLogs} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {selectedGameLog && (
        <GameLogModal
          gameLog={selectedGameLog}
          mode="update"
          onClose={() => setSelectedGameLog(null)}
          onSuccess={refetchUserGameLogs}
        />
      )}
    </div>
  );
}
