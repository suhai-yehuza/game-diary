import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

import { CommentsSection, ReactionsSection } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { GameLogResponse, GameLogsResponse } from '@/lib/types/shared.types';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 2;

// Helper function to get badge variant based on classification
const getClassificationBadgeVariant = (classification: string) => {
  switch (classification) {
    case 'PUBLIC':
      return 'default';
    case 'PROTECTED':
      return 'secondary';
    case 'PRIVATE':
      return 'destructive';
    default:
      return 'outline';
  }
};

// Helper function to format date
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'Invalid date';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Invalid date';
    }
    return format(parsedDate, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export function GameLogsSection() {
  const { data, loading, error, fetchMore } = useQuery<GameLogsResponse>(GET_GAME_LOGS, {
    variables: {
      first: ITEMS_PER_PAGE,
      after: null,
      filters: {
        classification: 'PROTECTED' as const,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const loadingTriggerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const MAX_PAGES = 10; // Prevent excessive loading
  const currentPage = useMemo(() => {
    if (!data?.gameLogs?.edges) return 0;
    return Math.ceil(data.gameLogs.edges.length / ITEMS_PER_PAGE);
  }, [data?.gameLogs?.edges]);

  const handleLoadMore = useCallback(async () => {
    if (!data?.gameLogs?.pageInfo?.hasNextPage || isLoadingMore || currentPage >= MAX_PAGES) return;

    setIsLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          first: ITEMS_PER_PAGE,
          after: data.gameLogs.pageInfo.endCursor,
          filters: {
            classification: 'PROTECTED' as const,
          },
        },
        updateQuery: (
          prev: GameLogsResponse,
          { fetchMoreResult }: { fetchMoreResult?: GameLogsResponse }
        ) => {
          if (!fetchMoreResult) return prev;

          // Create a Map to store unique game logs by ID
          const uniqueGameLogs = new Map();

          // Add existing game logs to the Map
          prev.gameLogs.edges.forEach(edge => {
            uniqueGameLogs.set(edge.node.id, edge);
          });

          // Add new game logs to the Map (this will overwrite any duplicates)
          fetchMoreResult.gameLogs.edges.forEach(edge => {
            uniqueGameLogs.set(edge.node.id, edge);
          });

          return {
            gameLogs: {
              ...fetchMoreResult.gameLogs,
              edges: Array.from(uniqueGameLogs.values()),
              pageInfo: fetchMoreResult.gameLogs.pageInfo,
              totalCount: fetchMoreResult.gameLogs.totalCount,
            },
          };
        },
      });
    } catch (error) {
      console.error('Error loading more game logs:', error);
      // Could add a toast notification here for better UX
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    data?.gameLogs?.pageInfo?.hasNextPage,
    data?.gameLogs?.pageInfo?.endCursor,
    fetchMore,
    isLoadingMore,
    currentPage,
  ]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !loading && data?.gameLogs?.pageInfo?.hasNextPage) {
        handleLoadMore();
      }
    },
    [loading, data?.gameLogs?.pageInfo?.hasNextPage, handleLoadMore]
  );

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

  const gameLogs = useMemo(() => {
    if (!data?.gameLogs?.edges) return [];
    return data.gameLogs.edges.map((edge: { node: GameLogResponse }) => edge.node);
  }, [data?.gameLogs?.edges]);

  if (loading && !data) return <div className="text-center p-4">Loading game logs...</div>;

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-500 mb-2">Error loading game logs</div>
        <div className="text-sm text-muted-foreground">{error.message}</div>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!gameLogs.length) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground mb-2">No game logs yet</div>
        <p className="text-sm text-muted-foreground">Start by logging your first game!</p>
      </div>
    );
  }

  console.log('gameLogs', gameLogs);

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
                  src={log.user?.imageUrl || '/default-user-avatar.svg'}
                  alt={log.user?.username || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                  priority={false}
                />
                <div>
                  <div className="font-semibold">
                    {`${log.user?.first_name || 'missing-first-name2'} ${log.user?.last_name || 'missing-last-name2'}`}
                  </div>
                  <div className="text-sm text-muted-foreground">@{log.user?.username}</div>
                  <div className="text-sm text-muted-foreground">{formatDate(log.watchedDate)}</div>
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
                <div className="w-6 h-6 relative">
                  <Image
                    src={log.game?.teams?.visitors?.logo || '/default-team-logo.svg'}
                    alt={log.game?.teams?.visitors?.name || 'Visitor Team'}
                    width={24}
                    height={24}
                    className="object-contain w-full h-full"
                    priority={false}
                  />
                </div>
                <span className="font-semibold">{log.game?.teams?.visitors?.nickname}</span>
                <span className="text-muted-foreground">vs</span>
                <div className="w-6 h-6 relative">
                  <Image
                    src={log.game?.teams?.home?.logo || '/default-team-logo.svg'}
                    alt={log.game?.teams?.home?.name || 'Home Team'}
                    width={24}
                    height={24}
                    className="object-contain w-full h-full"
                    priority={false}
                  />
                </div>
                <span className="font-semibold">{log.game?.teams?.home?.nickname}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Watched at {log.watchedLocation} via {log.watchedSetting}
              </div>
            </div>
            <div className="space-y-4">
              <ReactionsSection target_id={log.id} target_type="game_log" />
              <CommentsSection parent_id={log.id} parent_type="game_log" />
            </div>
          </CardContent>
        </Card>
      ))}
      <div ref={loadingTriggerRef} className="h-10" />
    </div>
  );
}
