'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { Star, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { CommentsSection } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GET_GAME_LOG_WITH_REACTIONS } from '@/lib/graphql/queries';
import { GameLogResponse } from '@/lib/types/shared.types';

export default function GameLog() {
  const params = useParams();
  const [gameLog, setGameLog] = useState<GameLogResponse | null>(null);
  const { data, loading, error } = useQuery(GET_GAME_LOG_WITH_REACTIONS, {
    variables: { id: params?.id },
  });

  useEffect(() => {
    if (data) {
      setGameLog(data.game_log);
    }
  }, [data]);

  if (loading)
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>;
  if (!gameLog) return <div className="text-center p-4">Game log not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center">
          <Link href="/protected/user">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>

        {/* Game Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Game Details</CardTitle>
          </CardHeader>
          <CardContent>
            {gameLog.game && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {gameLog.game.teams?.visitors?.logo && (
                      <Image
                        src={gameLog.game.teams.visitors.logo}
                        alt={gameLog.game.teams.visitors.name || 'Visitor Team'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{gameLog.game.teams?.visitors?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {gameLog.game.teams?.visitors?.nickname}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">vs</div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <h3 className="font-semibold">{gameLog.game.teams?.home?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {gameLog.game.teams?.home?.nickname}
                      </p>
                    </div>
                    {gameLog.game.teams?.home?.logo && (
                      <Image
                        src={gameLog.game.teams.home.logo}
                        alt={gameLog.game.teams.home.name || 'Home Team'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>
                      {gameLog.game.date?.start
                        ? format(new Date(gameLog.game.date.start), 'MMMM d, yyyy h:mm a')
                        : 'Date not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Arena</p>
                    <p>{gameLog.game.arena}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watch Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Watch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Watched Setting</p>
                <Badge variant="secondary" className="capitalize mt-1">
                  {gameLog.watched_setting}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="mt-1">{gameLog.watched_location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Watch Date</p>
                <p className="mt-1">
                  {gameLog.watched_date && !isNaN(new Date(gameLog.watched_date).getTime())
                    ? format(new Date(gameLog.watched_date), 'MMMM d, yyyy h:mm a')
                    : 'Date not available'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{gameLog.rating_for_game}/5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Details Card */}
        {gameLog.user && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {gameLog.user.image_url && (
                  <Image
                    src={gameLog.user.image_url}
                    alt={gameLog.user.username || 'User'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-semibold">
                    {gameLog.user.first_name} {gameLog.user.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{gameLog.user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Statistics Card */}
        {gameLog.game?.homeTeamStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {
                  <div className="text-sm space-y-1">
                    <p>Points: {gameLog.game.homeTeamStats.points}</p>
                    <p>Rebounds: {gameLog.game.homeTeamStats.totReb}</p>
                    <p>Assists: {gameLog.game.homeTeamStats.assists}</p>
                    <p>Steals: {gameLog.game.homeTeamStats.steals}</p>
                    <p>Blocks: {gameLog.game.homeTeamStats.blocks}</p>
                  </div>
                }
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <CommentsSection parent_id={gameLog.id} parent_type="game_log" />
      </div>
    </div>
  );
}
