'use client';

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { 
  Calendar,
  Clock,
  Eye,
  MapPin,
  MessageCircle,
  Star,
  Trophy,
  TrendingUp,
  Users,
  Tv
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { CommentsSection, ReactionsSection } from '@/components/common';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

// Loading skeleton component
const GameLogSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-20 w-full mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </CardContent>
  </Card>
);

// Empty state component
const EmptyState = () => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold text-lg mb-2">No Game Logs Yet</h3>
      <p className="text-muted-foreground text-center max-w-sm">
        Start tracking your game watching experience by logging the games you've watched!
      </p>
    </CardContent>
  </Card>
);

// Helper function to format dates nicely
const formatWatchedDate = (date: string | Date | null | undefined) => {
  if (!date) return 'No date';
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  } else {
    return format(dateObj, 'MMM d, yyyy');
  }
};

// Helper function to get classification styles
const getClassificationStyles = (classification: string) => {
  switch (classification) {
    case CLASSIFICATION.PUBLIC:
      return {
        variant: 'default' as const,
        className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        icon: Users,
      };
    case CLASSIFICATION.PROTECTED:
      return {
        variant: 'secondary' as const,
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        icon: Eye,
      };
    case CLASSIFICATION.PRIVATE:
      return {
        variant: 'destructive' as const,
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        icon: Eye,
      };
    default:
      return {
        variant: 'default' as const,
        className: '',
        icon: Users,
      };
  }
};

// Team matchup component
const TeamMatchup = ({ game }: { game: GameLog['game'] }) => {
  if (!game) return null;

  const homeScore = game.scores?.home?.points || 0;
  const awayScore = game.scores?.visitors?.points || 0;
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;

  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        {/* Away Team */}
        <div className={cn(
          "flex items-center gap-3 flex-1",
          awayWon && "text-green-600 dark:text-green-400"
        )}>
          <div className="w-12 h-12 relative">
            <Image
              src={game.teams?.visitors?.logo || '/default-team-logo.svg'}
              alt={game.teams?.visitors?.name || 'Away Team'}
              width={48}
              height={48}
              className="object-contain w-full h-full"
              priority={false}
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{game.teams?.visitors?.name}</p>
            <p className="text-xs text-muted-foreground">{game.teams?.visitors?.nickname}</p>
          </div>
          <span className="text-2xl font-bold">{awayScore}</span>
        </div>

        {/* VS Divider */}
        <div className="text-center px-2">
          <p className="text-xs text-muted-foreground mb-1">Final</p>
          <span className="text-sm font-medium text-muted-foreground">VS</span>
        </div>

        {/* Home Team */}
        <div className={cn(
          "flex items-center gap-3 flex-1 flex-row-reverse text-right",
          homeWon && "text-green-600 dark:text-green-400"
        )}>
          <div className="w-12 h-12 relative">
            <Image
              src={game.teams?.home?.logo || '/default-team-logo.svg'}
              alt={game.teams?.home?.name || 'Home Team'}
              width={48}
              height={48}
              className="object-contain w-full h-full"
              priority={false}
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{game.teams?.home?.name}</p>
            <p className="text-xs text-muted-foreground">{game.teams?.home?.nickname}</p>
          </div>
          <span className="text-2xl font-bold">{homeScore}</span>
        </div>
      </div>

      {/* Game Stats */}
      {(game.timesTied || game.leadChanges) && (
        <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t">
          {game.timesTied !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>{game.timesTied} times tied</span>
            </div>
          )}
          {game.leadChanges !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="h-3 w-3" />
              <span>{game.leadChanges} lead changes</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
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

  // Loading state
  if (loading && !gameLogs.length) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <GameLogSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!gameLogs.length) {
    return <EmptyState />;
  }

  const handleCardClick = (e: React.MouseEvent, gameLogId: string) => {
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
    <div className="space-y-4">
      {gameLogs.map((log) => {
        const classificationStyles = getClassificationStyles(log.classification);
        const ClassificationIcon = classificationStyles.icon;
        
        return (
          <Card 
            key={log.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group"
            onClick={(e) => handleCardClick(e, log.id)}
          >
            {/* Card Header */}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                {/* User Info */}
                <Link
                  href={`/protected/user/${log.userId}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="h-10 w-10 ring-2 ring-background">
                    <AvatarImage src={log.user?.imageUrl || undefined} />
                    <AvatarFallback>
                      {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {log.user?.firstName} {log.user?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{log.user?.username}
                    </div>
                  </div>
                </Link>

                {/* Metadata */}
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant={classificationStyles.variant}
                    className={cn("gap-1", classificationStyles.className)}
                  >
                    <ClassificationIcon className="h-3 w-3" />
                    {log.classification}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatWatchedDate(log.watchedDate)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Card Content */}
            <CardContent className="space-y-4">
              {/* Team Matchup */}
              <TeamMatchup game={log.game} />

              {/* Watch Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={log.ratingForGame || 0} size="sm" />
                  <span className="font-medium">{log.ratingForGame || 0}/5</span>
                </div>
                
                {log.watchedLocation && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{log.watchedLocation}</span>
                  </div>
                )}
                
                {log.watchedSetting && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Tv className="h-3.5 w-3.5" />
                    <span className="capitalize">{log.watchedSetting}</span>
                  </div>
                )}

                {log.game?.date?.start && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Game from {format(new Date(log.game.date.start), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {log.notes && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
                </div>
              )}

              {/* Tags */}
              {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Interactions */}
              <div className="space-y-3 pt-2 border-t comments-section reactions-section">
                <ReactionsSection 
                  targetId={log.id} 
                  targetType="game_log" 
                  reactions={log.reactions?.edges?.map(edge => edge.node) || []} 
                  totalReactionCount={log.reactions?.totalCount || 0}
                  onReactionChange={refetch}
                />
                
                {/* Comments Preview */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>{log.comments?.totalCount || 0} comments</span>
                  {log.createdAt && (
                    <>
                      <span className="text-xs">•</span>
                      <span className="text-xs">
                        Posted {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                    </>
                  )}
                </div>
                
                <CommentsSection parentId={log.id} parentType="game_log" />
              </div>
            </CardContent>

            {/* Hover indicator */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>
        );
      })}

      {/* Load More */}
      <div ref={loadMoreRef} className="h-10">
        {isFetchingMore && (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm font-medium">Loading more game logs...</span>
          </div>
        )}
      </div>
    </div>
  );
}
