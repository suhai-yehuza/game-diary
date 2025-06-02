'use client';

import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Star,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Building2,
  Clock,
  TrendingUp,
  Tv,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

import { CommentsSection, ReactionsSection } from '@/components/common';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { GET_GAME_LOG_BY_ID } from '@/lib/graphql/queries';
import type { GameLogByIdResponse, TeamDisplayProps } from '@/lib/types/game-log.types';
import { cn } from '@/lib/utils';

// Loading skeleton component
const GameLogSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-10 w-32" />

      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
            <div className="flex items-center gap-4">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Error state component
const ErrorState = ({ error }: { error: Error }) => (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-red-500 dark:text-red-400">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold">Unable to load game log</h3>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Link href="/protected/user">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Team display component
const TeamDisplay = ({
  team,
  score,
  isHome,
  imageErrors,
  onImageError,
  gameId,
}: TeamDisplayProps) => (
  <div className={cn('flex items-center gap-4', isHome ? 'flex-row-reverse text-right' : '')}>
    {team?.logo ? (
      <Image
        src={
          imageErrors?.[`${gameId}-${isHome ? 'home' : 'visitors'}`] ? '/gamelog.svg' : team.logo
        }
        alt={team.name || 'Team'}
        width={64}
        height={64}
        className="rounded-full ring-2 ring-background"
        onError={() => onImageError?.(`${gameId}-${isHome ? 'home' : 'visitors'}`)}
      />
    ) : (
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
    )}
    <div>
      <h3 className="font-bold text-lg">{team?.name || 'Unknown Team'}</h3>
      <p className="text-sm text-muted-foreground">{team?.nickname}</p>
      {score !== undefined && <p className="text-2xl font-bold mt-1">{score}</p>}
    </div>
  </div>
);

// Watch info item component
const WatchInfoItem = ({
  icon: Icon,
  label,
  value,
  badge = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  badge?: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
    {badge ? (
      <Badge variant="secondary" className="capitalize">
        {value}
      </Badge>
    ) : (
      <div className="font-medium">{value}</div>
    )}
  </div>
);

export default function GameLog() {
  const params = useParams();
  const gameLogId = params?.id as string;
  const { user: _user } = useUser();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const { data, loading, error } = useQuery<GameLogByIdResponse>(GET_GAME_LOG_BY_ID, {
    variables: { id: gameLogId },
    skip: !gameLogId,
  });

  if (loading) return <GameLogSkeleton />;
  if (error) return <ErrorState error={error} />;

  const gameLog = data?.gameLogById;
  if (!gameLog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Game log not found</h3>
                <p className="text-sm text-muted-foreground">
                  This game log may have been removed or you don&apos;t have permission to view it.
                </p>
                <Link href="/protected/user">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const gameDate = gameLog.game?.date?.start ? new Date(gameLog.game.date.start) : null;
  const watchDate = gameLog.watchedDate ? new Date(gameLog.watchedDate) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/protected/user">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {gameLog.createdAt &&
              formatDistanceToNow(new Date(gameLog.createdAt), { addSuffix: true })}
          </Badge>
        </div>

        {/* Game Match Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={gameLog.user?.imageUrl || undefined} />
                    <AvatarFallback>{gameLog.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{gameLog.user?.username}</CardTitle>
                    <CardDescription>
                      {gameDate && format(gameDate, 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={gameLog.rating || 0} />
                  <span className="text-sm text-muted-foreground">({gameLog.rating || 0})</span>
                </div>
              </div>
            </CardHeader>
          </div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <TeamDisplay
                team={gameLog.game?.teams?.visitors}
                score={gameLog.game?.scores?.visitors?.points}
                isHome={false}
                imageErrors={imageErrors}
                onImageError={handleImageError}
                gameId={gameLog.id}
              />

              <div className="text-center">
                <div className="text-2xl font-bold">
                  {gameLog.game?.scores?.visitors?.points} - {gameLog.game?.scores?.home?.points}
                </div>
                <div className="text-sm text-muted-foreground">
                  {gameLog.game?.status?.long || 'Final'}
                </div>
              </div>

              <TeamDisplay
                team={gameLog.game?.teams?.home}
                score={gameLog.game?.scores?.home?.points}
                isHome={true}
                imageErrors={imageErrors}
                onImageError={handleImageError}
                gameId={gameLog.id}
              />
            </div>
          </CardContent>
        </Card>

        {/* Game Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Watch Info */}
          <Card>
            <CardHeader>
              <CardTitle>Watch Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <WatchInfoItem
                icon={Calendar}
                label="Watched Date"
                value={watchDate ? format(watchDate, 'MMMM d, yyyy') : 'Not specified'}
              />
              <WatchInfoItem
                icon={MapPin}
                label="Location"
                value={gameLog.watchedLocation ?? 'Not specified'}
              />
              <WatchInfoItem
                icon={Building2}
                label="Venue"
                value={gameLog.watchedSetting ?? 'Not specified'}
              />
              <WatchInfoItem
                icon={Tv}
                label="Watch Method"
                value={gameLog.watchedScope ?? 'Not specified'}
                badge
              />
            </CardContent>
          </Card>

          {/* Game Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Game Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <WatchInfoItem
                icon={TrendingUp}
                label="Atmosphere"
                value={gameLog.ratingForGame ? `${gameLog.ratingForGame}/10` : 'Not rated'}
                badge
              />
              <WatchInfoItem
                icon={Star}
                label="Overall Rating"
                value={gameLog.ratingStars ? `${gameLog.ratingStars}/5` : 'Not rated'}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>Notes</span>
                </div>
                <div className="font-medium whitespace-pre-wrap">
                  {gameLog.notes ?? 'No notes provided'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reactions and Comments */}
        <div className="space-y-6">
          <ReactionsSection
            targetId={gameLog.id}
            targetType="game_log"
            reactions={gameLog.reactions.edges.map(edge => edge.node)}
            totalReactionCount={gameLog.reactions.totalCount}
          />
          <CommentsSection parentId={gameLog.id} parentType="game_log" initialExpanded={true} />
        </div>
      </div>
    </div>
  );
}
