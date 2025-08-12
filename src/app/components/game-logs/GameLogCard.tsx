'use client';

import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

import { GameLogComments } from '@/app/components/comments/GameLogComments';
import { ClassificationIcon } from '@/app/components/game-logs/ClassificationIcon';
import { RatingStars } from '@/app/components/game-logs/RatingStars';
import { getTeamDisplay } from '@/app/components/game-logs/utils/gameLogsUtils';
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
  return (
    <div key={`${log.id}-${idx ?? ''}`} className="mb-6">
      <Card className="border-2 border-gray-300 dark:border-gray-500 bg-neutral-100 dark:bg-neutral-800 shadow-md">
        <CardHeader className="flex flex-row justify-between items-start pb-2 text-gray-900 dark:text-gray-100">
          <div className="flex items-center gap-2">
            <ClassificationIcon classification={log.classification} />
            <div className="flex flex-col">
              <CardTitle className="text-base font-semibold">
                <a
                  href={`/games/${log.game_id}`}
                  className="text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                >
                  {getTeamDisplay(log.game)}
                </a>
              </CardTitle>
              <span className="text-xs text-gray-500">
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
          <div className="space-y-3">
            {/* Game Details */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                {log.classification}
              </span>
              {log.watched_setting && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                  {log.watched_setting}
                </span>
              )}
              {log.watched_scope && (
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                  {log.watched_scope}
                </span>
              )}
            </div>

            {/* Notes */}
            {log.notes && (
              <div className="text-gray-700 dark:text-gray-300">
                <p className="text-sm">{log.notes}</p>
              </div>
            )}

            {/* Tags */}
            {log.tags && log.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {log.tags.map(tag => (
                  <span
                    key={`${log.id}-tag-${tag}`}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Watched Date */}
            {log.watched_date && (
              <div className="text-xs text-gray-500">
                Watched: {format(new Date(log.watched_date), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between mt-3 text-gray-900 dark:text-gray-100">
          <div className="flex items-center gap-2">
            {showActions && onEdit && onDelete && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(log)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition shadow-sm"
                >
                  <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(log)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-700 transition shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
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
