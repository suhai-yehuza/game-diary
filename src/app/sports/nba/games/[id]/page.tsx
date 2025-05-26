'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { CreateGameLogModal } from '@/components/features/games';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { fetchNbaGameById } from '@/lib/external-apis';
import type { GameApiResponse, TransformedGame } from '@/lib/types/game.types';

export default function GamePage({ params }: { params: { id: string } }) {
  const [gameData, setGameData] = useState<GameApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthContext();
  const gameId = params?.id;

  useEffect(() => {
    const loadGame = async () => {
      try {
        const response = await fetchNbaGameById(gameId);
        setGameData(response as GameApiResponse | null);
      } catch (error) {
        console.error('Error loading game:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGame();
  }, [gameId]);

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

  if (!gameData?.data?.[0]) {
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

  const game = gameData.data[0];

  // Transform the game data into the format we need
  const transformedGame: TransformedGame = {
    ...game,
    homeTeam: game.teams.home,
    awayTeam: game.teams.visitors,
    homeTeamScore: game.scores.home.points,
    awayTeamScore: game.scores.visitors.points,
  };

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
                <CreateGameLogModal game_id={gameId} />
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
