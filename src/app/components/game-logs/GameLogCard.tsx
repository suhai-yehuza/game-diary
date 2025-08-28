'use client';

import { format } from 'date-fns';
import {
  Edit,
  Trash2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

import { GameLogComments } from '@/app/components/comments/GameLogComments';
import { ClassificationIcon } from '@/app/components/game-logs/ClassificationIcon';
import { RatingStars } from '@/app/components/game-logs/RatingStars';
import { getTeamDisplay } from '@/app/components/game-logs/utils/gameLogsUtils';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { ReactionPicker } from '@/app/components/reactions';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/app/components/ui/Card';
import type { IGameLogCardProps } from '@/lib/types';
import { ParentType } from '@/lib/types/generated/graphql';

export const GameLogCard = ({
  log,
  showActions = false,
  idx,
  onEdit,
  onDelete,
}: IGameLogCardProps) => {
  const isMobile = useMobileDetection();
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const gameLogUrl = `/protected/user/game-logs/${log.id}`;

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

  return (
    <div key={`${log.id}-${idx ?? ''}`} className={isMobile ? 'mb-4' : 'mb-6'}>
      <Card
        className={`
          game-log-card-enhanced group relative border-2 rounded-xl
          cursor-pointer transition-all duration-200
          hover:shadow-xl hover:border-brand-primary/50
          focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:border-brand-primary
          ${isNavigating ? 'opacity-75 scale-[0.98]' : 'hover:scale-[1.01]'}
        `}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="article"
        data-testid="game-log-item"
        aria-label={`Game log for ${getTeamDisplay(log.game)} - Click to view details`}
      >
        <CardHeader
          className={`flex flex-row justify-between items-start pb-2 text-gray-900 dark:text-gray-100 ${
            isMobile ? 'pb-2' : 'pb-2'
          }`}
        >
          <div className="flex items-center gap-2 flex-1">
            <ClassificationIcon classification={log.classification} />
            <div className="flex flex-col flex-1">
              <CardTitle
                className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} group-hover:text-brand-primary transition-colors`}
              >
                {log.game?.id ? (
                  <Link
                    href={`/games/${log.game.id}`}
                    className="hover:underline text-brand-primary hover:text-brand-primary/80 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    {getTeamDisplay(log.game)}
                  </Link>
                ) : (
                  getTeamDisplay(log.game)
                )}
              </CardTitle>
              <span className={`text-neutral-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {log.user?.id ? (
                  <Link
                    href={`/users/${log.user.id}`}
                    className="hover:underline text-brand-primary hover:text-brand-primary/80 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    @{log.user.first_name || log.user.username || 'Unknown User'}
                  </Link>
                ) : (
                  '@Unknown User'
                )}
              </span>
            </div>
            {isNavigating ? (
              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-brand-primary transition-colors opacity-0 group-hover:opacity-100" />
            )}
          </div>
          <RatingStars rating={log.rating_for_game} />
        </CardHeader>

        <CardContent className="pt-0">
          <div className={`space-y-3 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            {/* Game Details - Simplified */}
            <div
              className={`flex flex-wrap gap-2 ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'text-xs' : 'text-sm'}`}
            >
              <span className="bg-semantic-info/10 dark:bg-semantic-info/20 text-semantic-info dark:text-semantic-info px-2 py-1 rounded-lg">
                {log.classification}
              </span>
              {log.watched_setting && (
                <span className="bg-semantic-success/10 dark:bg-semantic-success/20 text-semantic-success dark:text-semantic-success px-2 py-1 rounded-lg">
                  {log.watched_setting}
                </span>
              )}
              {log.watched_scope && (
                <span className="bg-accent-purple/10 dark:bg-accent-purple/20 text-accent-purple dark:text-accent-purple px-2 py-1 rounded-lg">
                  {log.watched_scope}
                </span>
              )}
            </div>

            {/* Notes */}
            {log.notes && (
              <div className="text-neutral-700 dark:text-neutral-300">
                <p className={isMobile ? 'text-xs' : 'text-sm'}>{log.notes}</p>
              </div>
            )}

            {/* Tags */}
            {log.tags && log.tags.length > 0 && (
              <div className={`flex flex-wrap gap-1 ${isMobile ? 'gap-1' : 'gap-1'}`}>
                {log.tags.map(tag => (
                  <span
                    key={`${log.id}-tag-${tag}`}
                    className={`bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded-lg ${
                      isMobile ? 'text-xs' : 'text-xs'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Watched Date */}
            {log.watched_date && (
              <div className={`text-neutral-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                Watched: {format(new Date(log.watched_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter
          className={`flex items-center justify-between mt-3 text-neutral-900 dark:text-neutral-100 ${
            isMobile ? 'mt-2' : 'mt-3'
          }`}
        >
          <div className="flex items-center gap-2">
            {showActions && onEdit && onDelete && (
              <>
                <Button
                  variant="outline"
                  size={isMobile ? 'sm' : 'sm'}
                  onClick={() => {
                    onEdit(log);
                  }}
                  className={`bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 hover:bg-brand-primary/10 dark:hover:bg-neutral-700 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl ${
                    isMobile ? 'p-2 min-h-[44px]' : ''
                  }`}
                  aria-label="Edit game log"
                >
                  <Edit
                    className={`text-brand-primary dark:text-brand-primary ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? 'sm' : 'sm'}
                  onClick={() => {
                    onDelete(log);
                  }}
                  className={`bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 text-semantic-error hover:text-semantic-error/80 hover:bg-semantic-error/10 dark:hover:bg-neutral-700 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl ${
                    isMobile ? 'p-2 min-h-[44px]' : ''
                  }`}
                  aria-label="Delete game log"
                >
                  <Trash2 className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                </Button>
              </>
            )}
          </div>

          {/* Game Log Reactions */}
          <div onClick={e => e.stopPropagation()}>
            <ReactionPicker
              targetId={log.id}
              targetType={ParentType.GameLog}
              size="sm"
              showCount={true}
            />
          </div>
        </CardFooter>

        {/* Comments Section - Inline with better UX */}
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={e => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            aria-expanded={showComments}
            aria-controls={`comments-${log.id}`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Comments{' '}
                {log.totalCommentCount && log.totalCommentCount > 0
                  ? `(${log.totalCommentCount})`
                  : ''}
              </span>
            </div>
            {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showComments && (
            <div id={`comments-${log.id}`} data-testid="game-log-comments">
              <GameLogComments gameLog={log} showComments={showComments} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
