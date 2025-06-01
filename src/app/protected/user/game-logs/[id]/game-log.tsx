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
  Tv
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';

import { CommentsSection, ReactionsSection } from '@/components/common';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { GET_GAME_LOG_BY_ID } from '@/lib/graphql/queries';
import { GameLogResponse } from '@/lib/types/shared.types';
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
  isHome 
}: { 
  team: any; 
  score?: number;
  isHome: boolean;
}) => (
  <div className={cn(
    "flex items-center gap-4",
    isHome ? "flex-row-reverse text-right" : ""
  )}>
    {team?.logo ? (
      <Image
        src={team.logo}
        alt={team.name || 'Team'}
        width={64}
        height={64}
        className="rounded-full ring-2 ring-background"
      />
    ) : (
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
    )}
    <div>
      <h3 className="font-bold text-lg">{team?.name || 'Unknown Team'}</h3>
      <p className="text-sm text-muted-foreground">{team?.nickname}</p>
      {score !== undefined && (
        <p className="text-2xl font-bold mt-1">{score}</p>
      )}
    </div>
  </div>
);

// Watch info item component
const WatchInfoItem = ({ 
  icon: Icon, 
  label, 
  value, 
  badge = false 
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
      <p className="font-medium">{value}</p>
    )}
  </div>
);

export default function GameLog() {
  const params = useParams();
  const gameLogId = params?.id as string;
  const { user } = useUser();
  
  const { data, loading, error } = useQuery(GET_GAME_LOG_BY_ID, {
    variables: { id: gameLogId },
    skip: !gameLogId,
  });

  if (loading) return <GameLogSkeleton />;
  if (error) return <ErrorState error={error} />;
  
  const gameLog = data?.gameLogById as GameLogResponse;
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
                  This game log may have been removed or you don't have permission to view it.
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
            {gameLog.createdAt && formatDistanceToNow(new Date(gameLog.createdAt), { addSuffix: true })}
          </Badge>
        </div>

        {/* Game Match Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Game Details</CardTitle>
                  <CardDescription>
                    {gameDate ? format(gameDate, 'EEEE, MMMM d, yyyy') : 'Date not available'}
                  </CardDescription>
                </div>
                <Badge variant={gameLog.game?.status?.short === 'FT' ? 'default' : 'secondary'}>
                  {gameLog.game?.status?.short || 'Unknown'}
                </Badge>
              </div>
            </CardHeader>
          </div>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Teams and Score */}
              <div className="flex items-center justify-between gap-4">
                <TeamDisplay 
                  team={gameLog.game?.teams?.visitors} 
                  score={gameLog.game?.scores?.visitors?.points}
                  isHome={false}
                />
                
                <div className="text-center px-4">
                  <p className="text-sm text-muted-foreground mb-1">Final</p>
                  <div className="text-3xl font-bold text-muted-foreground">VS</div>
                </div>
                
                <TeamDisplay 
                  team={gameLog.game?.teams?.home} 
                  score={gameLog.game?.scores?.home?.points}
                  isHome={true}
                />
              </div>

              {/* Game Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Building2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {(gameLog.game?.arena as any)?.name || 'Unknown Arena'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(gameLog.game?.arena as any)?.city && (gameLog.game?.arena as any)?.state 
                      ? `${(gameLog.game?.arena as any).city}, ${(gameLog.game?.arena as any).state}`
                      : 'Arena'
                    }
                  </p>
                </div>
                <div className="text-center">
                  <Trophy className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{gameLog.game?.league || 'NBA'}</p>
                  <p className="text-xs text-muted-foreground">Season {gameLog.game?.season}</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{gameLog.game?.timesTied || 0}</p>
                  <p className="text-xs text-muted-foreground">Times Tied</p>
                </div>
                <div className="text-center">
                  <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{gameLog.game?.leadChanges || 0}</p>
                  <p className="text-xs text-muted-foreground">Lead Changes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watch Details and User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Watch Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5" />
                Watch Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <WatchInfoItem
                icon={Tv}
                label="Setting"
                value={gameLog.watchedSetting || 'Not specified'}
                badge
              />
              <WatchInfoItem
                icon={MapPin}
                label="Location"
                value={gameLog.watchedLocation || 'Not specified'}
              />
              <WatchInfoItem
                icon={Calendar}
                label="Watched On"
                value={watchDate ? format(watchDate, 'MMM d, yyyy h:mm a') : 'Not specified'}
              />
              <WatchInfoItem
                icon={Star}
                label="Rating"
                value={
                  <div className="flex items-center gap-2">
                    <StarRating 
                      rating={gameLog.ratingStars || gameLog.ratingForGame || 0} 
                      size="sm"
                    />
                    <span className="text-sm text-muted-foreground">
                      ({gameLog.ratingStars || gameLog.ratingForGame || 0}/5)
                    </span>
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* User Info Card */}
          {gameLog.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Logged By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/protected/user/${gameLog.user.id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={gameLog.user.imageUrl || undefined} />
                      <AvatarFallback>
                        {gameLog.user.firstName?.[0]}{gameLog.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {gameLog.user.firstName} {gameLog.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">@{gameLog.user.username}</p>
                    </div>
                  </div>
                </Link>
                
                {gameLog.notes && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{gameLog.notes}</p>
                  </div>
                )}
                
                {gameLog.tags && gameLog.tags.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {gameLog.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reactions Section */}
        <Card>
          <CardContent className="pt-6">
            <ReactionsSection 
              targetId={gameLog.id} 
              targetType="game_log" 
            />
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentsSection parentId={gameLog.id} parentType="game_log" />
      </div>
    </div>
  );
}
