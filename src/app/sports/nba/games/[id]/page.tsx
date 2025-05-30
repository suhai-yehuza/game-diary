'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect } from 'react';

import { CreateGameLogModal } from '@/components/features/games';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { GET_GAME_BY_ID } from '@/lib/graphql/queries';
import type { Game, TransformedGame } from '@/lib/types/game.types';

export default function GamePage({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuthContext();
  const gameId = params?.id;

  const { loading, error, data, refetch } = useQuery(GET_GAME_BY_ID, {
    variables: { id: gameId },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
    notifyOnNetworkStatusChange: true,
    context: {
      skipDeduplication: true,
    },
  });

  // Handle component unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending requests when component unmounts
      if (refetch) {
        // The refetch function will be automatically cancelled on unmount
        refetch();
      }
    };
  }, [refetch]);

  const transformGame = useCallback((game: Game): TransformedGame => {
    // Parse the JSON data if it's a string, otherwise use it directly
    const teams = typeof game.teams === 'string' ? JSON.parse(game.teams) : game.teams;
    const scores = typeof game.scores === 'string' ? JSON.parse(game.scores) : game.scores;

    // Ensure we have the required data structure
    if (!teams?.home || !teams?.visitors || !scores?.home?.points || !scores?.visitors?.points) {
      console.error('Invalid game data structure:', { teams, scores });
      throw new Error('Invalid game data structure');
    }

    // Parse status fields if they are objects
    const parseStatusField = (field: unknown): string => {
      if (typeof field === 'object' && field !== null) {
        try {
          return JSON.stringify(field);
        } catch (error) {
          console.log({ error });
          return '';
        }
      }
      return String(field || '');
    };

    // Transform status object to ensure all fields are strings
    const status = {
      clock: parseStatusField(game.status?.clock),
      halftime: Boolean(game.status?.halftime),
      long: parseStatusField(game.status?.long),
      short: parseStatusField(game.status?.short),
    };

    return {
      ...game,
      homeTeam: teams.home,
      awayTeam: teams.visitors,
      homeTeamScore: scores.home.points,
      awayTeamScore: scores.visitors.points,
      status,
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.game) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Game Not Found</h2>
            <p className="text-yellow-600">The requested game could not be found.</p>
            <Link
              href="/sports/nba"
              className="mt-4 inline-block text-sm text-yellow-600 hover:text-yellow-800"
            >
              ← Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let transformedGame;
  try {
    transformedGame = transformGame(data.game);
  } catch (error) {
    console.error('Error transforming game data:', error);
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Game</h2>
            <p className="text-red-600">There was an error loading the game data.</p>
            <Link
              href="/sports/nba"
              className="mt-4 inline-block text-sm text-red-600 hover:text-red-800"
            >
              ← Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/sports/nba"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Games
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <CreateGameLogModal gameId={gameId} />
              ) : (
                <Button asChild>
                  <Link href="/sign-in">Sign in to log game</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {transformedGame.awayTeam.nickname} vs {transformedGame.homeTeam.nickname}
                </h1>
                <p className="text-muted-foreground">
                  {format(new Date(transformedGame.date.start), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="text-lg font-medium">{transformedGame.status.long}</div>
          </div>

          {/* Scoreboard */}
          <div className="bg-card rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Away Team */}
              <div className="text-center space-y-6">
                {transformedGame.awayTeam.logo && (
                  <Image
                    src={transformedGame.awayTeam.logo}
                    alt={transformedGame.awayTeam.name}
                    width={96}
                    height={96}
                    className="mx-auto w-24 h-24 object-contain"
                    priority
                  />
                )}
                <div className="space-y-2">
                  <div className="text-xl font-bold">{transformedGame.awayTeam.nickname}</div>
                  <div
                    className={`text-3xl font-bold ${
                      transformedGame.awayTeamScore > transformedGame.homeTeamScore
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {transformedGame.awayTeamScore}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-center flex flex-col justify-center space-y-4">
                <div className="text-4xl font-bold">
                  {transformedGame.awayTeamScore} - {transformedGame.homeTeamScore}
                </div>
              </div>

              {/* Home Team */}
              <div className="text-center space-y-6">
                {transformedGame.homeTeam.logo && (
                  <Image
                    src={transformedGame.homeTeam.logo}
                    alt={transformedGame.homeTeam.name}
                    width={96}
                    height={96}
                    className="mx-auto w-24 h-24 object-contain"
                    priority
                  />
                )}
                <div className="space-y-2">
                  <div className="text-xl font-bold">{transformedGame.homeTeam.nickname}</div>
                  <div
                    className={`text-3xl font-bold ${
                      transformedGame.homeTeamScore > transformedGame.awayTeamScore
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {transformedGame.homeTeamScore}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
