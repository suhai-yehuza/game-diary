import { useQuery } from '@apollo/client';
import Image from 'next/image';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GET_LIVE_GAMES } from '@/lib/graphql/queries';
import type { ExtendedGame } from '@/lib/types/game.types';

import dummyLiveGames from './dummy-live-games.json';

interface LiveGameEdge {
  node: ExtendedGame;
}

interface LiveGamesConnection {
  edges: LiveGameEdge[];
}

interface LiveGamesData {
  liveGames: LiveGamesConnection;
}

export function LiveGamesSection() {
  const { data, loading, error } = useQuery<LiveGamesData>(GET_LIVE_GAMES, {
    pollInterval: 30000, // Poll every 30 seconds for live updates
    variables: {
      first: 10, // Limit to 10 live games
      after: null,
    },
  });

  if (loading) return <div className="text-center p-4">Loading live games...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>;
  // if (!data?.liveGames?.edges)
  //   return <div className="text-center p-4 text-muted-foreground">No data available</div>;
  if (!data?.liveGames?.edges) {
    <div className="text-center p-4 text-muted-foreground">No data available</div>;
  }

  // Extract games from the connection type
  let live_games = data?.liveGames.edges.map((edge: LiveGameEdge) => edge.node) || [];

  if (live_games.length === 0) {
    live_games = (dummyLiveGames as unknown as LiveGamesConnection).edges.map(
      (edge: LiveGameEdge) => edge.node
    );
    // return <div className="text-center p-4 text-muted-foreground">No live games at the moment</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {live_games.map((game: ExtendedGame) => (
        <Card key={game.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {game.teams.visitors.nickname} vs {game.teams.home.nickname}
              </CardTitle>
              <Badge className="animate-pulse bg-green-300">LIVE</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Image
                  src={game.teams.visitors.logo}
                  alt={game.teams.visitors.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-bold">{game.scores.visitors.points}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {game.status.clock} - Q{game.periods.current}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{game.scores.home.points}</span>
                <Image
                  src={game.teams.home.logo}
                  alt={game.teams.home.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{game.arena.name}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
