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

// Utility function to generate distinct colors for tags
const getTagColor = (tag: string) => {
  const colors = [
    // Emerald - green
    'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700',
    // Blue
    'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700',
    // Orange
    'bg-orange-100 dark:bg-orange-900/60 text-orange-900 dark:text-orange-100 border-orange-300 dark:border-orange-700',
    // Purple
    'bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-700',
    // Red
    'bg-red-100 dark:bg-red-900/60 text-red-900 dark:text-red-100 border-red-300 dark:border-red-700',
    // Teal
    'bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-100 border-teal-300 dark:border-teal-700',
    // Indigo
    'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 border-indigo-300 dark:border-indigo-700',
    // Amber
    'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700',
  ];

  // Use tag hash for consistent colors
  const hash = tag.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

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
          game-log-card-enhanced group relative border-2 border-gray-100 dark:border-gray-700 rounded-xl
          cursor-pointer transition-all duration-300 bg-white dark:bg-gray-900
          hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10
          focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500
          ${isNavigating ? 'opacity-75 scale-[0.98]' : 'hover:scale-[1.02]'}
        `}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="article"
        data-testid="game-log-item"
        aria-label={`Game log for ${getTeamDisplay(log.game)} - Click to view details`}
      >
        <CardHeader
          className={`flex flex-row justify-between items-start pb-2 text-gray-900 dark:text-white ${
            isMobile ? 'pb-2' : 'pb-2'
          }`}
        >
          <div className="flex items-center gap-2 flex-1">
            <ClassificationIcon classification={log.classification} />
            <div className="flex flex-col flex-1">
              <CardTitle
                className={`font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
              >
                {log.game?.id ? (
                  <Link
                    href={`/games/${log.game.id}`}
                    className="hover:underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    {getTeamDisplay(log.game)}
                  </Link>
                ) : (
                  getTeamDisplay(log.game)
                )}
              </CardTitle>
              <span
                className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}
              >
                {log.user?.id ? (
                  <Link
                    href={`/users/${log.user.id}`}
                    className="hover:underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
            )}
          </div>
          <RatingStars rating={log.rating_for_game} />
        </CardHeader>

        <CardContent className="pt-0">
          <div className={`space-y-3 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            {/* Game Details - Enhanced with Industry Best Practices */}
            <div
              className={`flex flex-wrap gap-2 ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'text-xs' : 'text-sm'}`}
            >
              <span className="bg-brand-primary text-white px-3 py-1.5 rounded-md font-semibold text-xs shadow-sm border border-brand-primary">
                {log.classification}
              </span>
              {log.watched_setting && (
                <span className="bg-semantic-success/10 dark:bg-semantic-success/20 text-semantic-success dark:text-semantic-success px-3 py-1.5 rounded-md font-semibold text-xs shadow-sm border border-semantic-success/20 dark:border-semantic-success/30">
                  {log.watched_setting}
                </span>
              )}
              {log.watched_scope && (
                <span className="bg-accent-purple/10 dark:bg-accent-purple/20 text-accent-purple dark:text-accent-purple px-3 py-1.5 rounded-md font-semibold text-xs shadow-sm border border-accent-purple/20 dark:border-accent-purple/30">
                  {log.watched_scope}
                </span>
              )}
            </div>

            {/* Notes */}
            {log.notes && (
              <div className="text-gray-700 dark:text-gray-300">
                <p className={isMobile ? 'text-xs' : 'text-sm'}>{log.notes}</p>
              </div>
            )}

            {/* Tags - Enhanced with Industry Best Practices */}
            {log.tags && log.tags.length > 0 && (
              <div className={`flex flex-wrap gap-1 ${isMobile ? 'gap-1' : 'gap-1'}`}>
                {log.tags.map(tag => (
                  <span
                    key={`${log.id}-tag-${tag}`}
                    className={`${getTagColor(tag)} px-2 py-1 rounded-md font-medium border border-emerald-300 dark:border-emerald-700 text-xs shadow-sm`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Watched Date */}
            {log.watched_date && (
              <div
                className={`text-neutral-500 dark:text-neutral-400 ${isMobile ? 'text-xs' : 'text-xs'}`}
              >
                Watched: {format(new Date(log.watched_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter
          className={`flex items-center justify-between mt-3 text-gray-900 dark:text-white ${
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
                  className={`bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md rounded-lg ${
                    isMobile ? 'p-2 min-h-[44px]' : ''
                  }`}
                  aria-label="Edit game log"
                >
                  <Edit
                    className={`text-blue-600 dark:text-blue-400 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? 'sm' : 'sm'}
                  onClick={() => {
                    onDelete(log);
                  }}
                  className={`bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md rounded-lg ${
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

        {/* Comments Section - Enhanced with Industry Best Practices */}
        <div className="border-t-2 border-gray-100 dark:border-gray-700">
          <button
            onClick={e => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
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
