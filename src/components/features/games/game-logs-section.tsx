import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { CommentsSection } from '@/components/common';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { GameLogResponse } from '@/lib/types';

export function GameLogsSection() {
  const { data, loading, error } = useQuery(GET_GAME_LOGS, {
    variables: {
      filters: {
        pagination: {
          first: 100,
        },
      },
    },
  });

  if (loading) return <div className="text-center p-4">Loading game logs...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>;
  if (!data?.gameLogs?.items)
    return <div className="text-center p-4 text-muted-foreground">No game logs yet</div>;

  const gameLogs = data.gameLogs.items;

  return (
    <div className="space-y-6">
      {gameLogs.map((log: GameLogResponse) => (
        <Card key={log.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/protected/user/${log.user?.id}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={log.user?.image_url || '/default-user-avatar.svg'}
                  alt={log.user?.username || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="font-semibold">
                    {`${log.user?.first_name || 'missing-first-name'} ${log.user?.last_name || 'missing-last-name'}`}
                  </div>
                  <div className="text-sm text-muted-foreground">@{log.user?.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      try {
                        const date = new Date(log.watched_date);
                        if (isNaN(date.getTime())) {
                          return 'Invalid date';
                        }
                        return format(date, 'MMM d, yyyy');
                      } catch (error) {
                        console.error('Error formatting date:', error);
                        return 'Invalid date';
                      }
                    })()}
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <StarRating rating={Number(log.rating_for_game)} size="sm" />
                <span>{log.rating_for_game}/5</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={log.game?.teams?.visitors?.logo || '/default-team-logo.svg'}
                  alt={log.game?.teams?.visitors?.name || 'Visitor Team'}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="font-semibold">{log.game?.teams?.visitors?.nickname}</span>
                <span className="text-muted-foreground">vs</span>
                <Image
                  src={log.game?.teams?.home?.logo || '/default-team-logo.svg'}
                  alt={log.game?.teams?.home?.name || 'Home Team'}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="font-semibold">{log.game?.teams?.home?.nickname}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Watched at {log.watched_location} via {log.watched_setting}
              </div>
            </div>
            <CommentsSection parent_id={log.id} parent_type="game_log" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
