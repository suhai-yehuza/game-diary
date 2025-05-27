import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

import { CommentsSection } from '@/components/common';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { GameLogResponse, GameLogsResponse } from '@/lib/types/shared.types';

const ITEMS_PER_PAGE = 100;

// Helper function to get badge variant based on classification
const getClassificationBadgeVariant = (classification: string) => {
  switch (classification) {
    case 'PUBLIC':
      return 'default'; // Primary color for public
    case 'PROTECTED':
      return 'secondary'; // Secondary color for protected
    case 'PRIVATE':
      return 'destructive'; // Red color for private
    default:
      return 'outline';
  }
};

export function GameLogsSection() {
  const { data, loading, error, fetchMore } = useQuery<GameLogsResponse>(GET_GAME_LOGS, {
    variables: {
      first: ITEMS_PER_PAGE,
      after: null,
      filters: {
        // classification: "PROTECTED" as const
      }
    },
    notifyOnNetworkStatusChange: true,
  });

  // Create a ref for the loading trigger element
  const loadingTriggerRef = useRef<HTMLDivElement>(null);

  // Create a callback for the intersection observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !loading && data?.gameLogs?.pageInfo?.hasNextPage) {
        handleLoadMore();
      }
    },
    [loading, data?.gameLogs?.pageInfo?.hasNextPage]
  );

  // Set up the intersection observer
  useEffect(() => {
    const element = loadingTriggerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  const handleLoadMore = async () => {
    if (!data?.gameLogs?.pageInfo?.hasNextPage) return;

    try {
      console.log('Loading more with cursor:', data.gameLogs.pageInfo.endCursor);
      const result = await fetchMore({
        variables: {
          first: ITEMS_PER_PAGE,
          after: data.gameLogs.pageInfo.endCursor,
          filters: {
            classification: "PROTECTED" as const
          }
        },
        updateQuery: (prev: GameLogsResponse, { fetchMoreResult }: { fetchMoreResult?: GameLogsResponse }) => {
          console.log('Fetch More Result:', {
            prev,
            fetchMoreResult
          });
          if (!fetchMoreResult) return prev;
          return {
            gameLogs: {
              ...fetchMoreResult.gameLogs,
              edges: [...prev.gameLogs.edges, ...fetchMoreResult.gameLogs.edges],
              pageInfo: fetchMoreResult.gameLogs.pageInfo,
              totalCount: fetchMoreResult.gameLogs.totalCount,
            },
          };
        },
      });
      console.log('Fetch More Complete:', result);
    } catch (error) {
      console.error('Error loading more game logs:', error);
    }
  };

  if (loading && !data) return <div className="text-center p-4">Loading game logs...</div>;
  
  if (error) {
    console.error('Query Error:', error);
    return (
      <div className="text-center p-4">
        <div className="text-red-500 mb-2">Error loading game logs</div>
        <div className="text-sm text-muted-foreground">{error.message}</div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!data?.gameLogs?.edges?.length) {
    console.log('No game logs found');
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground mb-2">No game logs yet</div>
        <p className="text-sm text-muted-foreground">
          Start by logging your first game!
        </p>
      </div>
    );
  }

  const gameLogs = data.gameLogs.edges.map((edge: { node: GameLogResponse }) => edge.node);
  console.log('Rendering game logs:', gameLogs);

  return (
    <div className="space-y-6">
      {gameLogs.map((log: GameLogResponse) => (
        <Card key={log.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/protected/user/${log.userId}`}
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
                        const date = new Date(log.watchedDate);
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
              <div className="flex items-center gap-2">
                <Badge 
                  variant={getClassificationBadgeVariant(log.classification)}
                  className={cn(
                    log.classification === 'PUBLIC' && 'bg-green-500 hover:bg-green-600',
                    log.classification === 'PROTECTED' && 'bg-yellow-500 hover:bg-yellow-600',
                    log.classification === 'PRIVATE' && 'bg-red-500 hover:bg-red-600'
                  )}
                >
                  {log.classification}
                </Badge>
                <div className="flex items-center gap-1">
                  <StarRating rating={log.ratingForGame} size="sm" />
                  <span>{log.ratingForGame}/5</span>
                </div>
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
                Watched at {log.watchedLocation} via {log.watchedSetting}
              </div>
            </div>
            <CommentsSection parent_id={log.id} parent_type="game_log" />
          </CardContent>
        </Card>
      ))}
      
      {/* Loading trigger element */}
      <div ref={loadingTriggerRef} className="h-10 flex items-center justify-center">
        {loading && <div className="text-muted-foreground">Loading more...</div>}
      </div>
    </div>
  );
}
