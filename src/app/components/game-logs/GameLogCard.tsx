'use client';

import {
  MessageCircle,
  Eye,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { memo, useCallback, useState } from 'react';

import { GameLogComments } from '@/app/components/comments/GameLogComments';
import { ClassificationIcon } from '@/app/components/game-logs/ClassificationIcon';
import { RatingStars } from '@/app/components/game-logs/RatingStars';
import {
  getTeamDisplay,
  formatWatchedSetting,
  generateDistinctTagColors,
} from '@/app/components/game-logs/utils/gameLogsUtils';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { ReactionPicker } from '@/app/components/reactions';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/app/components/ui/Card';
import type { IGameLogCardProps } from '@/types';
import { ParentType } from '@/types';

// Memoized component to prevent unnecessary re-renders
export const GameLogCard = memo<IGameLogCardProps>(
  ({ gameLog, className, showActions = false, onEdit, onDelete }) => {
    const isMobile = useMobileDetection();
    const router = useRouter();
    const [expandedComments, setExpandedComments] = useState(false);
    const [_expandedReactions, setExpandedReactions] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    const gameLogUrl = `/protected/dashboard/game-logs/${gameLog?.id || 'unknown'}`;

    // Memoized callbacks to prevent child re-renders
    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        // Don't navigate if clicking on interactive elements
        const target = e.target as HTMLElement;
        const isInteractiveElement = target.closest('button, a, [role="button"]');

        if (isInteractiveElement) {
          return;
        }

        // Handle different click types
        if (e.ctrlKey || e.metaKey || e.button === 1) {
          // Ctrl+click or Cmd+click or middle click - open in new tab
          window.open(gameLogUrl, '_blank');
          return;
        }

        // Regular click - navigate in same tab
        setIsNavigating(true);
        router.push(gameLogUrl);
      },
      [gameLogUrl, router]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsNavigating(true);
          router.push(gameLogUrl);
        }
      },
      [gameLogUrl, router]
    );

    const _handleCommentToggle = useCallback(() => {
      setExpandedComments(prev => !prev);
    }, []);

    const _handleReactionToggle = useCallback(() => {
      setExpandedReactions(prev => !prev);
    }, []);

    const handleEdit = useCallback(() => {
      onEdit?.(gameLog);
    }, [gameLog, onEdit]);

    const handleDelete = useCallback(() => {
      onDelete?.(gameLog);
    }, [gameLog, onDelete]);

    return (
      <div className={`${className || ''} ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <Card
          className={`transition-all duration-200 hover:shadow-lg ${
            isMobile ? 'text-sm' : 'text-base'
          } ${isNavigating ? 'opacity-75' : ''}`}
          data-testid="game-log-item"
        >
          <CardHeader
            className={`cursor-pointer transition-all duration-200 hover:bg-muted/30 ${isMobile ? 'pb-2' : 'pb-3'}`}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`View game log for ${getTeamDisplay(gameLog?.game)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}
                >
                  <span
                    className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-600 dark:text-gray-300`}
                  >
                    {gameLog?.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {gameLog?.user?.id ? (
                      <a
                        href={`/users/${gameLog.user.id}`}
                        className="hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        @{gameLog?.user?.first_name || gameLog?.user?.username || 'Anonymous'}
                      </a>
                    ) : (
                      <>
                        @
                        {!gameLog?.user?.id
                          ? 'Anonymous'
                          : gameLog?.user?.first_name || gameLog?.user?.username || 'Anonymous'}
                      </>
                    )}
                  </h3>
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {gameLog?.watched_date
                      ? new Date(gameLog.watched_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })
                      : 'Unknown date'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <RatingStars rating={gameLog?.rating_for_game || 0} size={isMobile ? 'sm' : 'md'} />
                <ClassificationIcon
                  classification={gameLog?.classification}
                  size={isMobile ? 'sm' : 'md'}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className={`${isMobile ? 'pt-0 pb-2' : 'pt-0 pb-3'}`}>
            {/* Game Info */}
            <div className={`mb-4 p-3 bg-muted/50 rounded-lg ${isMobile ? 'p-2' : 'p-3'}`}>
              <h4 className={`font-medium mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
                <a
                  href={`/games/${gameLog?.game?.id}`}
                  className="hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {getTeamDisplay(gameLog?.game)}
                </a>
              </h4>
              <div
                className={`flex items-center space-x-4 text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span>
                    {gameLog?.game?.date
                      ? new Date(gameLog.game.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })
                      : 'Unknown date'}
                  </span>
                </div>
                {gameLog?.watched_location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span>{gameLog.watched_location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Eye className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className="bg-semantic-success/10 dark:bg-semantic-success/20 px-2 py-1 rounded text-xs">
                    {formatWatchedSetting(gameLog?.watched_setting)}
                  </span>
                </div>
                {gameLog?.watched_scope && (
                  <div className="flex items-center space-x-1">
                    <Users className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span className="bg-accent-purple/10 dark:bg-accent-purple/20 px-2 py-1 rounded text-xs">
                      {gameLog.watched_scope}
                    </span>
                  </div>
                )}
                {gameLog?.watched_date && (
                  <div className="flex items-center space-x-1">
                    <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span className="text-neutral-500">
                      Watched:{' '}
                      {new Date(gameLog.watched_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {gameLog?.notes && (
              <div className="mb-4">
                <p className={`leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {gameLog.notes}
                </p>
              </div>
            )}

            {/* Tags */}
            {gameLog?.tags && gameLog.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1">
                {(() => {
                  const tagColors = generateDistinctTagColors(gameLog.tags);
                  return gameLog.tags.map((tag: string) => (
                    <Badge
                      key={`${gameLog.id}-tag-${tag}`}
                      variant="secondary"
                      className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} ${tagColors[tag]}`}
                    >
                      {tag === '' ? '#' : `#${tag}`}
                    </Badge>
                  ));
                })()}
              </div>
            )}

            {/* Action Buttons */}
            {showActions && (
              <div className="flex items-center justify-end space-x-2 mb-4">
                <Button
                  variant="outline"
                  size={isMobile ? 'sm' : 'default'}
                  onClick={(e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    handleEdit();
                  }}
                  className="flex items-center space-x-1"
                  data-testid="edit-button"
                >
                  <Edit className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? 'sm' : 'default'}
                  onClick={(e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    handleDelete();
                  }}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  data-testid="delete-button"
                >
                  <Trash2 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className={isMobile ? 'text-xs' : 'text-sm'}>Delete</span>
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className={`${isMobile ? 'pt-2 pb-3' : 'pt-3 pb-4'}`}>
            {/* Game Log Reactions and Comments */}
            <div onClick={e => e.stopPropagation()}>
              <ReactionPicker
                targetId={gameLog?.id || 'unknown'}
                targetType={ParentType.GameLog}
                size="sm"
                showCount={true}
              />
            </div>
          </CardFooter>

          {/* Comments Section - Enhanced with Industry Best Practices */}
          <div className="border-t-2 border-gray-100 dark:border-gray-700">
            <button
              onClick={e => {
                e.stopPropagation();
                setExpandedComments(!expandedComments);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
              aria-expanded={expandedComments}
              aria-controls={`comments-${gameLog?.id || 'unknown'}`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Comments{' '}
                  {gameLog?.totalCommentCount && gameLog?.totalCommentCount > 0
                    ? `(${gameLog?.totalCommentCount})`
                    : ''}
                </span>
              </div>
              {expandedComments ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedComments && (
              <div id={`comments-${gameLog?.id || 'unknown'}`} data-testid="game-log-comments">
                <div data-game-log-id={gameLog?.id}>
                  <GameLogComments gameLog={gameLog} showComments={expandedComments} />
                </div>
              </div>
            )}
          </div>

          {/* Loading indicator */}
          {isNavigating && (
            <div className="absolute top-0 left-0 right-0 h-20 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded-t-lg">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </Card>
      </div>
    );
  }
);

GameLogCard.displayName = 'GameLogCard';
