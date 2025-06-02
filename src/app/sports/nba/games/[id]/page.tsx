'use client';

import { useQuery } from '@apollo/client';
import { SignInButton } from '@clerk/nextjs';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { CreateGameLogModal } from '@/components/features/games';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { fetchNbaGameById } from '@/lib/external-apis';
import { GET_TEAM_STATS } from '@/lib/graphql/queries';
import type { Game, GameStatistics } from '@/lib/types/game.types';
import { cn } from '@/lib/utils';

// Helper function to validate state values
const isValidState = (state: string | undefined | null): boolean => {
  if (!state) return false;

  // Common invalid values
  if (state.length === 1 || state === 'O' || state === '0') return false;

  // Valid US state codes (2 letters) or reasonable length for full state names
  if (state.length === 2 || (state.length > 3 && state.length < 20)) {
    return /^[A-Za-z\s]+$/.test(state);
  }

  return false;
};

// Helper function to format arena location
const formatArenaLocation = (arena: {
  name?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): string => {
  const parts = [];

  if (arena.city) parts.push(arena.city);
  if (arena.state && isValidState(arena.state)) parts.push(arena.state);
  if (arena.country) parts.push(arena.country);

  return parts.join(', ');
};

// Team display component
interface TeamDisplayProps {
  team: {
    logo: string;
    name: string;
    nickname: string;
  };
  score?: number;
  opponentScore?: number;
  isHome: boolean;
  imageErrors: Record<string, boolean>;
  onImageError: (id: string) => void;
  gameId: string;
}

const TeamDisplay = ({
  team,
  score,
  opponentScore,
  isHome,
  imageErrors,
  onImageError,
  gameId,
}: TeamDisplayProps) => (
  <div className={cn('text-center space-y-6', isHome ? 'flex-row-reverse text-right' : '')}>
    {team?.logo && (
      <Image
        src={imageErrors[`${gameId}-${isHome ? 'home' : 'visitors'}`] ? '/gamelog.svg' : team.logo}
        alt={team.name}
        width={96}
        height={96}
        className="mx-auto w-24 h-24 object-contain"
        onError={() => onImageError(`${gameId}-${isHome ? 'home' : 'visitors'}`)}
      />
    )}
    <div className="space-y-2">
      <div className="text-xl font-bold">{team.nickname}</div>
      <div className="text-muted-foreground">
        {score !== undefined && (
          <div
            className={`text-3xl font-bold ${
              score > (opponentScore || 0) ? 'text-green-500' : 'text-muted-foreground'
            }`}
          >
            {score}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const { user } = useAuthContext();
  const userId = user?.id;
  const [gameData, setGameData] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const {
    loading: statsLoading,
    error: statsError,
    data: statsData,
  } = useQuery(GET_TEAM_STATS, {
    variables: { gameId: gameId },
    skip: !gameId,
  });

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        const response = await fetchNbaGameById(gameId);
        if (!response.response || response.response.length === 0) {
          throw new Error('Game not found');
        }
        const apiGame = response.response[0];

        const game: Game = {
          id: apiGame.id.toString(),
          date: {
            start: new Date(apiGame.date.start),
            end: apiGame.date.end ? new Date(apiGame.date.end) : null,
            duration: apiGame.date.duration || null,
          },
          status: {
            clock: apiGame.status.clock || null,
            halftime: apiGame.status.halftime,
            short: apiGame.status.short,
            long: apiGame.status.long,
          },
          homeTeamId: apiGame.teams.home.id.toString(),
          awayTeamId: apiGame.teams.visitors.id.toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          arena: {
            name: apiGame.arena.name || null,
            city: apiGame.arena.city || null,
            state: apiGame.arena.state || null,
            country: apiGame.arena.country || null,
          },
          league: apiGame.league,
          season: apiGame.season,
          stage: apiGame.stage,
          periods: apiGame.periods,
          teams: apiGame.teams,
          scores: apiGame.scores,
          officials: apiGame.officials || [],
          timesTied: apiGame.timesTied || null,
          leadChanges: apiGame.leadChanges || null,
          nugget: apiGame.nugget || null,
          isCompleted: apiGame.status.short === '3',
          awayTeamScore: apiGame.scores.visitors.points,
          homeTeamScore: apiGame.scores.home.points,
          gameType: 'NBA',
          nbaGameId: apiGame.id.toString(),
        };

        setGameData(game);
        setLoading(false);
      } catch (error) {
        console.error('Error loading game data:', error);
        setError('Failed to load game data');
        setLoading(false);
      }
    };

    loadGameData();
  }, [params.id, gameId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!gameData) return <div>Game not found</div>;

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
              {userId ? (
                <CreateGameLogModal gameId={gameId} userId={userId} />
              ) : (
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    Sign in to Create Game Log
                  </Button>
                </SignInButton>
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
              {gameData?.league && (
                <Image
                  src={gameData.teams.home.logo}
                  alt={gameData.league}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  {gameData?.teams.visitors.nickname} vs {gameData?.teams.home.nickname}
                </h1>
                <p className="text-muted-foreground">
                  {format(new Date(gameData?.date.start), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="text-lg font-medium">{gameData?.status.long}</div>
          </div>

          {/* Scoreboard */}
          <div className="bg-card rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Away Team */}
              <TeamDisplay
                team={gameData?.teams.visitors}
                score={gameData?.scores.visitors.points}
                opponentScore={gameData?.scores.home.points}
                isHome={false}
                imageErrors={imageErrors}
                onImageError={handleImageError}
                gameId={gameId}
              />

              {/* Score */}
              <div className="text-center flex flex-col justify-center space-y-4">
                <div className="text-4xl font-bold">
                  {gameData?.scores.visitors.points} - {gameData?.scores.home.points}
                </div>
                {gameData?.status.clock && (
                  <div className="text-muted-foreground">{gameData?.status.clock}</div>
                )}
              </div>

              {/* Home Team */}
              <TeamDisplay
                team={gameData?.teams.home}
                score={gameData?.scores.home.points}
                opponentScore={gameData?.scores.visitors.points}
                isHome={true}
                imageErrors={imageErrors}
                onImageError={handleImageError}
                gameId={gameId}
              />
            </div>
          </div>

          {/* Game Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Arena Info */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-6">Arena Information</h3>
              <div className="space-y-2">
                <p className="font-medium">{gameData?.arena.name}</p>
                <p className="text-muted-foreground">{formatArenaLocation(gameData?.arena)}</p>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-6">Game Statistics</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Times Tied</p>
                    <p className="font-medium">{gameData?.timesTied}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Changes</p>
                    <p className="font-medium">{gameData?.leadChanges}</p>
                  </div>
                </div>
                {gameData?.officials.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Officials</p>
                    <ul className="space-y-1">
                      {gameData?.officials.map((official: string, index: number) => (
                        <li key={index} className="text-sm">
                          {official}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Statistics */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-8 text-center">Team Statistics</h3>
            {statsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : statsError ? (
              <div className="text-red-500 text-center py-12 bg-red-50 rounded-lg">
                <p className="font-medium">Error loading team statistics</p>
                <p className="text-sm mt-2">{statsError.message}</p>
              </div>
            ) : statsData?.game_stats ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {statsData.game_stats.map((teamStats: GameStatistics, index: number) => (
                  <div key={index} className="bg-card rounded-xl shadow-lg overflow-hidden">
                    {/* Team Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-orange-600 p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 relative flex-shrink-0">
                            <Image
                              src={
                                imageErrors[`${teamStats.teamId}-stats`]
                                  ? '/gamelog.svg'
                                  : teamStats.teamId
                              }
                              alt={teamStats.teamId}
                              fill
                              sizes="(max-width: 64px) 100vw, 64px"
                              className="rounded-full bg-white p-1 object-contain"
                              onError={() => handleImageError(`${teamStats.teamId}-stats`)}
                            />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-white">{teamStats.teamId}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">{teamStats.points}</p>
                          <p className="text-blue-100">Points</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-8">
                      {/* Shooting Stats */}
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2">
                          Shooting
                        </h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Field Goals</p>
                            <p className="text-xl font-bold">
                              {teamStats.fieldGoals.made}/{teamStats.fieldGoals.attempted}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {teamStats.fieldGoals.percentage}%
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">3-Pointers</p>
                            <p className="text-xl font-bold">
                              {teamStats.threePointers.made}/{teamStats.threePointers.attempted}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {teamStats.threePointers.percentage}%
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Free Throws</p>
                            <p className="text-xl font-bold">
                              {teamStats.freeThrows.made}/{teamStats.freeThrows.attempted}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {teamStats.freeThrows.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Game Stats */}
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2">
                          Game Stats
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Points</p>
                            <p className="text-2xl font-bold text-blue-600">{teamStats.points}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Rebounds</p>
                            <p className="text-2xl font-bold text-blue-600">{teamStats.rebounds}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Assists</p>
                            <p className="text-2xl font-bold text-blue-600">{teamStats.assists}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Steals</p>
                            <p className="text-2xl font-bold text-blue-600">{teamStats.steals}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Blocks</p>
                            <p className="text-2xl font-bold text-blue-600">{teamStats.blocks}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Turnovers</p>
                            <p className="text-2xl font-bold text-red-600">{teamStats.turnovers}</p>
                          </div>
                        </div>
                      </div>

                      {/* Plus/Minus */}
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <p className="text-sm text-gray-600 mb-1">Plus/Minus</p>
                        <p
                          className={`text-2xl font-bold ${teamStats.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {teamStats.plusMinus > 0 ? '+' : ''}
                          {teamStats.plusMinus}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Game Nugget */}
          {gameData?.nugget && (
            <div className="mt-8 bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-4">Game Highlight</h3>
              <p className="text-muted-foreground">{gameData?.nugget}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
