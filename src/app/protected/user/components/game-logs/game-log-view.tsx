'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Globe,
  Lock,
  MapPin,
  Shield,
  Star,
  Trophy,
  Tv,
  Users,
  SmilePlus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { CommentsSection } from '@src/app/components/common/comments-section';
import { Avatar, AvatarFallback, AvatarImage } from '@src/app/components/ui/avatar';
import { Badge } from '@src/app/components/ui/badge';
import { Button } from '@src/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@src/app/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@src/app/components/ui/popover';
import { Skeleton } from '@src/app/components/ui/skeleton';
import { StarRating } from '@src/app/components/ui/star-rating';
import { CREATE_REACTION, DELETE_REACTION } from '@src/lib/graphql/mutations';
import { GET_GAME_LOG } from '@src/lib/graphql/queries';
import type { IGameLogProps } from '@src/lib/types';
import {
  CLASSIFICATION,
  REACTION_EMOJIS,
  EMOJI_TO_GRAPHQL_MAPPING,
  type IReactionEmojiValue,
} from '@src/lib/types/config.types';
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

export function GameLogView({ gameLogId }: IGameLogProps) {
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

  // Helper function to convert emoji character to GraphQL enum value
  function emojiToGraphQLEnum(emojiChar: IReactionEmojiValue): string {
    // Find the key in REACTION_EMOJIS that corresponds to this emoji character
    const emojiKey = Object.entries(REACTION_EMOJIS).find(([, char]) => char === emojiChar)?.[0];

    if (!emojiKey) {
      return 'THUMBS_UP'; // fallback
    }

    // Convert the key to GraphQL enum value
    const graphqlEnum =
      EMOJI_TO_GRAPHQL_MAPPING[emojiKey as keyof typeof EMOJI_TO_GRAPHQL_MAPPING] || 'THUMBS_UP';

    return graphqlEnum;
  }

  function handleReaction(
    emoji: IReactionEmojiValue,
    targetId: string,
    targetType: string,
    hasReacted: boolean
  ) {
    setClickedEmoji(emoji);
    setTimeout(() => setClickedEmoji(null), 200);

    const graphqlEmojiEnum = emojiToGraphQLEnum(emoji);

    if (hasReacted) {
      // Find the reaction ID to delete
      const reaction = gameLogData?.gameLog?.reactions?.find(
        (r: { emoji: string; userId: string }) => r.emoji === emoji && r.userId === currentUserId
      );

      if (reaction?.id) {
        deleteReaction({ variables: { id: reaction.id } });
      }
    } else {
      createReaction({
        variables: {
          input: {
            emoji: graphqlEmojiEnum,
            targetId,
            targetType,
          },
        },
      });
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

        {/* Seamless Content & Community Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/80 via-white to-slate-50/60 dark:from-slate-900/80 dark:via-slate-800/90 dark:to-slate-900/60 backdrop-blur-sm border border-border/30 shadow-xl shadow-black/5">
          {/* Floating gradient orbs for visual interest */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            {/* Personal Notes - Floating Section */}
            {gameLog.notes && (
              <div className="p-8 pb-6">
                <div className="relative">
                  {/* Decorative gradient bar */}
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/80 via-indigo-500/80 to-purple-500/80 rounded-full"></div>

                  <div className="pl-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-500/20">
                        <span className="text-lg">📝</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        Personal Notes
                      </h3>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/30 dark:to-indigo-950/20 rounded-xl p-5 backdrop-blur-sm border border-blue-100/20 dark:border-blue-500/10">
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap font-medium">
                        {gameLog.notes}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Community Reactions - Flowing Integration */}
            {((gameLog.reactions && gameLog.reactions.length > 0) || user) && (
              <div className={cn('px-8', gameLog.notes ? 'pb-6' : 'pt-8 pb-6')}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/20 dark:border-amber-500/20">
                    <span className="text-lg">❤️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground tracking-tight">
                    Community Reactions
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Existing Reactions */}
                  {gameLog.reactions &&
                    gameLog.reactions.length > 0 &&
                    Object.values(REACTION_EMOJIS).map((emoji: IReactionEmojiValue) => {
                      const hasReacted = gameLog.reactions.some(
                        (r: { emoji: string; userId: string }) =>
                          r.emoji === emoji && r.userId === currentUserId
                      );
                      const count = gameLog.reactions.filter(
                        (r: { emoji: string }) => r.emoji === emoji
                      ).length;

                      if (count === 0) return null;

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(emoji, gameLog.id, 'GameLog', !!hasReacted)}
                          className={cn(
                            'group relative px-4 py-3 rounded-2xl transition-all duration-300 text-base font-medium',
                            'hover:scale-105 hover:shadow-lg hover:shadow-black/10',
                            'backdrop-blur-sm border',
                            clickedEmoji === emoji && 'scale-110',
                            hasReacted
                              ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/10'
                              : 'bg-gradient-to-r from-white/60 to-white/40 dark:from-white/10 dark:to-white/5 border-border/40 hover:border-border/60 hover:bg-white/80 dark:hover:bg-white/10'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl transition-transform group-hover:scale-110">
                              {emoji}
                            </span>
                            <span
                              className={cn(
                                'text-sm font-bold px-2 py-1 rounded-full min-w-[24px] text-center transition-colors',
                                hasReacted
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted/60 text-muted-foreground'
                              )}
                            >
                              {count}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                  {/* Add Reaction Picker */}
                  {user && (
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              'group relative px-4 py-3 rounded-2xl transition-all duration-300 text-base font-medium',
                              'hover:scale-105 hover:shadow-lg hover:shadow-black/10',
                              'backdrop-blur-sm border',
                              'bg-gradient-to-r from-white/60 to-white/40 dark:from-white/10 dark:to-white/5 border-border/40 hover:border-border/60 hover:bg-white/80 dark:hover:bg-white/10'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <SmilePlus className="h-5 w-5 transition-transform group-hover:scale-110" />
                              <span className="text-sm font-medium">React</span>
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start">
                          <div className="grid grid-cols-6 gap-1">
                            {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
                              const hasReacted = gameLog.reactions?.some(
                                (r: { emoji: string; userId: string }) =>
                                  r.emoji === emoji && r.userId === currentUserId
                              );

                              return (
                                <Button
                                  key={name}
                                  variant={hasReacted ? 'secondary' : 'ghost'}
                                  size="sm"
                                  onClick={() =>
                                    handleReaction(
                                      emoji as IReactionEmojiValue,
                                      gameLog.id,
                                      'GameLog',
                                      !!hasReacted
                                    )
                                  }
                                  className={cn(
                                    'h-8 w-full p-0',
                                    hasReacted && 'ring-1 ring-primary/20'
                                  )}
                                  title={name.charAt(0) + name.slice(1).toLowerCase()}
                                >
                                  <span className="text-base">{emoji}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Discussion Section - Seamless Integration */}
            <div className="relative">
              {/* Remove the transition gradient completely */}

              {/* Only add top padding if there's content above */}
              <div
                className={cn(
                  gameLog.notes || (gameLog.reactions && gameLog.reactions.length > 0)
                    ? 'pt-8'
                    : 'pt-0'
                )}
              >
                {/* Remove the header section completely for true seamless integration */}

                {/* Embedded Comments without any additional styling or containers */}
                <div className="px-8 pb-8">
                  <CommentsSection
                    parentId={gameLog.id}
                    parentType={'game_log' as ParentType}
                    initialExpanded={true}
                    embedded={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
