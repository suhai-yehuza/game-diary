'use client';

import { useQuery, useMutation } from '@apollo/client';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Star, Trophy, Tv, Users, Globe, Shield, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';

import { Avatar, AvatarFallback, AvatarImage } from '@src/components/ui/avatar';
import { Badge } from '@src/components/ui/badge';
import { Button } from '@src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/components/ui/card';
import { Skeleton } from '@src/components/ui/skeleton';
import { StarRating } from '@src/components/ui/star-rating';
import { CommentsSection } from '@src/components/common/comments-section';
import { CREATE_REACTION, DELETE_REACTION } from '@src/lib/graphql/mutations';
import { GET_GAME_LOG } from '@src/lib/graphql/queries';
import { CLASSIFICATION, REACTION_EMOJIS, type ReactionEmojiValue } from '@src/lib/types/config.types';
import type { GameLogProps } from '@src/lib/types/consolidated.types';
import type { GameLog, ParentType } from '@src/lib/types/generated/graphql';
import { cn } from '@src/lib/utils';

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

const getClassificationStyles = (classification: string) => {
  switch (classification) {
    case CLASSIFICATION.PUBLIC:
      return {
        variant: 'default' as const,
        className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        icon: Globe,
      };
    case CLASSIFICATION.PROTECTED:
      return {
        variant: 'secondary' as const,
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        icon: Shield,
      };
    case CLASSIFICATION.PRIVATE:
      return {
        variant: 'destructive' as const,
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        icon: Lock,
      };
    default:
      return {
        variant: 'default' as const,
        className: '',
        icon: Shield,
      };
  }
};

export function GameLogView({ gameLogId }: GameLogProps) {
  const { user } = useUser();
  const currentUserId = user?.id;
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [clickedEmoji, setClickedEmoji] = useState<string | null>(null);

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const {
    data: gameLogData,
    loading: gameLogLoading,
    error: gameLogError,
  } = useQuery<{ gameLog: GameLog }>(GET_GAME_LOG, {
    variables: { id: gameLogId },
    skip: !gameLogId,
    notifyOnNetworkStatusChange: true,
  });

  // Optimistic update helpers
  const optimisticAdd = (_emoji: string, _targetId: string, _targetType: string) => ({
    addReaction: {
      id: 'temp-id-' + _emoji + '-' + _targetId,
      emoji: _emoji,
      userId: currentUserId,
      targetId: _targetId,
      targetType: _targetType,
      __typename: 'Reaction',
    },
  });

  const optimisticRemove = (_emoji: string, _targetId: string, _targetType: string) => ({
    removeReaction: true,
  });

  const [createReaction] = useMutation(CREATE_REACTION, {
    optimisticResponse: ({ emoji, targetId, targetType }) =>
      optimisticAdd(emoji, targetId, targetType),
    // Optionally: update cache here for instant UI
  });
  const [deleteReaction] = useMutation(DELETE_REACTION, {
    optimisticResponse: ({ emoji, targetId, targetType }) =>
      optimisticRemove(emoji, targetId, targetType),
    // Optionally: update cache here for instant UI
  });

  function handleReaction(
    emoji: ReactionEmojiValue,
    targetId: string,
    targetType: string,
    hasReacted: boolean
  ) {
    setClickedEmoji(emoji);
    setTimeout(() => setClickedEmoji(null), 200);
    if (hasReacted) {
      deleteReaction({ variables: { emoji, targetId, targetType } });
    } else {
      createReaction({ variables: { emoji, targetId, targetType } });
    }
  }

  if (gameLogLoading) {
    return <GameLogSkeleton />;
  }

  if (gameLogError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Error loading game log</h3>
                <p className="text-sm text-muted-foreground">{gameLogError.message}</p>
                <Link href="/dashboard">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const gameLog = gameLogData?.gameLog;

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
                <Link href="/dashboard">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
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
  const classificationStyles = getClassificationStyles(gameLog.classification);
  const ClassificationIcon = classificationStyles.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Badge
            variant={classificationStyles.variant}
            className={cn('gap-1', classificationStyles.className)}
          >
            <ClassificationIcon className="h-3 w-3" />
            {gameLog.classification}
          </Badge>
        </div>

        {/* Game Match Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Game Details</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {gameDate ? format(gameDate, 'EEEE, MMMM d, yyyy') : 'Date not available'}
                  </p>
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
                <div className="flex items-center gap-4">
                  <Image
                    src={gameLog.game?.teams?.visitors?.logo || '/gamelog.svg'}
                    alt={gameLog.game?.teams?.visitors?.name || 'Visitor Team'}
                    width={48}
                    height={48}
                    className={cn('w-12 h-12 object-contain', {
                      'opacity-50': imageErrors[gameLog.game?.teams?.visitors?.id || ''],
                    })}
                    onError={() => handleImageError(gameLog.game?.teams?.visitors?.id || '')}
                  />
                  <div>
                    <p className="font-medium">{gameLog.game?.teams?.visitors?.name}</p>
                    <p className="text-2xl font-bold">{gameLog.game?.scores?.visitors?.points}</p>
                  </div>
                </div>

                <div className="text-center px-4">
                  <p className="text-sm text-muted-foreground mb-1">Final</p>
                  <div className="text-3xl font-bold text-muted-foreground">VS</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{gameLog.game?.teams?.home?.name}</p>
                    <p className="text-2xl font-bold">{gameLog.game?.scores?.home?.points}</p>
                  </div>
                  <Image
                    src={gameLog.game?.teams?.home?.logo || '/gamelog.svg'}
                    alt={gameLog.game?.teams?.home?.name || 'Home Team'}
                    width={48}
                    height={48}
                    className={cn('w-12 h-12 object-contain', {
                      'opacity-50': imageErrors[gameLog.game?.teams?.home?.id || ''],
                    })}
                    onError={() => handleImageError(gameLog.game?.teams?.home?.id || '')}
                  />
                </div>
              </div>

              {/* Game Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Trophy className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{gameLog.game?.league || 'NBA'}</p>
                  <p className="text-xs text-muted-foreground">Season {gameLog.game?.season}</p>
                </div>
                <div className="text-center">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {gameLog.game?.arena?.name || 'Unknown Arena'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gameLog.game?.arena?.city && gameLog.game?.arena?.state
                      ? `${gameLog.game.arena.city}, ${gameLog.game.arena.state}`
                      : 'Arena'}
                  </p>
                </div>
                <div className="text-center">
                  <Tv className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">{gameLog.watchedSetting || 'Not specified'}</p>
                  <p className="text-xs text-muted-foreground">
                    {watchDate ? format(watchDate, 'MMM d, yyyy') : 'Not watched'}
                  </p>
                </div>
                <div className="text-center">
                  <Star className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">Rating</p>
                  <div className="flex items-center justify-center gap-1">
                    <StarRating ratingForGame={gameLog.ratingForGame} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      ({gameLog.ratingForGame}/5)
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
                      {gameLog.user.firstName?.[0]}
                      {gameLog.user.lastName?.[0]}
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
                    {gameLog.tags.map((tag: string, index: number) => (
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

        {/* Reactions Section */}
        {gameLog.reactions && gameLog.reactions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Reactions</h3>
            <div className="flex gap-2 mt-2">
              {Object.values(REACTION_EMOJIS).map((emoji: ReactionEmojiValue) => {
                const hasReacted = gameLog.reactions.some(
                  (r: { emoji: string; userId: string }) =>
                    r.emoji === emoji && r.userId === currentUserId
                );
                const count = gameLog.reactions.filter(
                  (r: { emoji: string }) => r.emoji === emoji
                ).length;
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji, gameLog.id, 'GameLog', !!hasReacted)}
                    className={`reaction-animate px-2 py-1 rounded-full border flex items-center gap-1 transition-transform duration-150 ${
                      clickedEmoji === emoji ? 'scale-125 bg-orange-100' : ''
                    } ${hasReacted ? 'border-primary text-primary font-bold' : 'border-gray-300'}`}
                    style={{ outline: 'none' }}
                  >
                    <span>{emoji}</span>
                    {count > 0 && (
                      <span className="ml-1 text-xs font-semibold bg-gray-200 rounded px-1">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentsSection parentId={gameLog.id} parentType={'game_log' as ParentType} initialExpanded={true} />
      </div>
    </div>
  );
}
