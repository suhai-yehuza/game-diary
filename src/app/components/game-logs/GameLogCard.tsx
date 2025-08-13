'use client';

import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

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

  return (
    <div key={`${log.id}-${idx ?? ''}`} className={isMobile ? 'mb-4' : 'mb-6'}>
      <Card className="border-2 border-gray-300 dark:border-gray-500 bg-neutral-100 dark:bg-neutral-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
        <CardHeader
          className={`flex flex-row justify-between items-start pb-2 text-gray-900 dark:text-gray-100 ${
            isMobile ? 'pb-2' : 'pb-2'
          }`}
        >
          <div className="flex items-center gap-2">
            <ClassificationIcon classification={log.classification} />
            <div className="flex flex-col">
              <CardTitle className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                <a
                  href={`/games/${log.game_id}`}
                  className="text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                >
                  {getTeamDisplay(log.game)}
                </a>
              </CardTitle>
              <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {log.user?.id ? (
                  <a href={`/users/${log.user.id}`} className="hover:underline text-blue-600">
                    @{log.user.first_name || log.user.username || 'Unknown User'}
                  </a>
                ) : (
                  '@Unknown User'
                )}
              </span>
            </div>
          </div>
          <RatingStars rating={log.rating_for_game} />
        </CardHeader>

        <CardContent className="pt-0">
          <div className={`space-y-3 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            {/* Game Details */}
            <div
              className={`flex flex-wrap gap-2 ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'text-xs' : 'text-sm'}`}
            >
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-lg">
                {log.classification}
              </span>
              {log.watched_setting && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg">
                  {log.watched_setting}
                </span>
              )}
              {log.watched_scope && (
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-lg">
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

            {/* Tags */}
            {log.tags && log.tags.length > 0 && (
              <div className={`flex flex-wrap gap-1 ${isMobile ? 'gap-1' : 'gap-1'}`}>
                {log.tags.map(tag => (
                  <span
                    key={`${log.id}-tag-${tag}`}
                    className={`bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg ${
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
              <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                Watched: {format(new Date(log.watched_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter
          className={`flex items-center justify-between mt-3 text-gray-900 dark:text-gray-100 ${
            isMobile ? 'mt-2' : 'mt-3'
          }`}
        >
          <div className="flex items-center gap-2">
            {showActions && onEdit && onDelete && (
              <>
                <Button
                  variant="outline"
                  size={isMobile ? 'sm' : 'sm'}
                  onClick={() => onEdit(log)}
                  className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl ${
                    isMobile ? 'p-2 min-h-[44px]' : ''
                  }`}
                >
                  <Edit
                    className={`text-blue-600 dark:text-blue-400 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size={isMobile ? 'sm' : 'sm'}
                  onClick={() => onDelete(log)}
                  className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md rounded-xl ${
                    isMobile ? 'p-2 min-h-[44px]' : ''
                  }`}
                >
                  <Trash2 className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                </Button>
              </>
            )}
          </div>

          {/* Game Log Reactions */}
          <ReactionPicker
            targetId={log.id}
            targetType={ParentType.GameLog}
            size="sm"
            showCount={true}
          />
        </CardFooter>

        {/* Comments Section - Inside the Card */}
        <div
          className="border-t border-gray-200 dark:border-gray-700"
          data-testid="game-log-comments"
        >
          <GameLogComments gameLog={log} />
        </div>
      </Card>
    </div>
  );
};
