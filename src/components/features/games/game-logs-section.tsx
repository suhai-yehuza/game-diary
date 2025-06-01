'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CommentsSection, ReactionsSection } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { CLASSIFICATION } from '@/lib/types/config.types';
import { GameLog } from '@/lib/types/game.types';
import { cn } from '@/lib/utils';

interface GameLogsSectionProps {
  gameLogs: GameLog[];
  loading: boolean;
  isFetchingMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  onLoadMore: () => void;
  refetch?: () => void;
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'No date';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

const getClassificationBadgeVariant = (classification: string) => {
  switch (classification) {
    case CLASSIFICATION.PUBLIC:
      return 'default';
    case CLASSIFICATION.PROTECTED:
      return 'secondary';
    case CLASSIFICATION.PRIVATE:
      return 'destructive';
    default:
      return 'default';
  }
};

export function GameLogsSection({
  gameLogs,
  loading,
  isFetchingMore,
  loadMoreRef,
  onLoadMore,
  refetch,
}: GameLogsSectionProps) {
  const router = useRouter();

  if (loading && !gameLogs.length) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground">Loading game logs...</div>
      </div>
    );
  }

  if (!gameLogs.length) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground">No game logs found</div>
      </div>
    );
  }

  const handleCardClick = (e: React.MouseEvent, gameLogId: string) => {
    // Check if the click is on the user profile link or any interactive element
    const target = e.target as HTMLElement;
    const isInteractiveElement = 
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.closest('a') ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('.comments-section') ||
      target.closest('.reactions-section');
    
    if (!isInteractiveElement) {
      e.preventDefault();
      router.push(`/protected/user/game-logs/${gameLogId}`);
    }
  };

  return (
    <div className="space-y-6">
      {gameLogs.map(log => (
        <Card 
          key={log.id} 
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group"
          onClick={(e) => handleCardClick(e, log.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Link
                href={`/protected/user/${log.userId}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
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
                    {`${log.user?.firstName || ''} ${log.user?.lastName || ''}`}
                  </div>
                  <div className="text-sm text-muted-foreground">@{log.user?.username}</div>
                  <div className="text-sm text-muted-foreground">{formatDate(log.watchedDate)}</div>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Badge
                  variant={getClassificationBadgeVariant(log.classification)}
                  className={cn(
                    log.classification === CLASSIFICATION.PUBLIC && 'bg-green-500 hover:bg-green-600',
                    log.classification === CLASSIFICATION.PROTECTED && 'bg-yellow-500 hover:bg-yellow-600',
                    log.classification === CLASSIFICATION.PRIVATE && 'bg-red-500 hover:bg-red-600'
                  )}
                >
                  {log.classification}
                </Badge>
                <div className="flex items-center gap-1">
                  <StarRating rating={log.ratingForGame || 0} size="sm" />
                  <span>{log.ratingForGame || 0}/5</span>
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
                Watched at {log.watchedLocation}. {log.watchedSetting}
              </div>
              {log.notes && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm">{log.notes}</p>
                </div>
              )}
            </div>
            <div className="space-y-4 comments-section reactions-section">
              <ReactionsSection 
                targetId={log.id} 
                targetType="game_log" 
                reactions={log.reactions?.edges?.map(edge => edge.node) || []} 
                totalReactionCount={log.reactions?.totalCount || 0}
                onReactionChange={refetch}
              />
              <CommentsSection parentId={log.id} parentType="game_log" />
            </div>
          </CardContent>
          {/* Visual indicator that card is clickable */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Card>
      ))}
      <div ref={loadMoreRef} className="h-10">
        {isFetchingMore && (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm font-medium">Loading more game logs...</span>
          </div>
        )}
      </div>
    </div>
  );
}
