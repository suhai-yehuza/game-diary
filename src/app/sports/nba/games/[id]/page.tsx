'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { CreateGameLogModal } from '@/components/create-game-log-modal';
import { Game, GameStatistics } from '@/lib/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { fetchNbaGameById } from '@/lib/external-apis';
import { useQuery } from '@apollo/client';
import { GET_GAME_STATS } from '@/lib/graphql/queries';

interface ApiGameResponse {
  response: Array<{
    id: number;
    league: {
      id: string;
      name: string;
      type: string;
      logo: string;
    };
    season: number;
    date: {
      start: string;
      end?: string;
      duration?: string;
    };
    stage: number;
    status: {
      clock?: string;
      halftime: boolean;
      short: number;
      long: string;
    };
    periods: {
      current: number;
      total: number;
      endOfPeriod: boolean;
    };
    arena: {
      name: string;
      city: string;
      state: string;
      country: string;
    };
    teams: {
      visitors: {
        id: number;
        name: string;
        nickname: string;
        code: string;
        logo: string;
      };
      home: {
        id: number;
        name: string;
        nickname: string;
        code: string;
        logo: string;
      };
    };
    scores: {
      visitors: {
        win: number;
        loss: number;
        series: {
          win: number;
          loss: number;
        };
        linescore: string[];
        points: number;
      };
      home: {
        win: number;
        loss: number;
        series: {
          win: number;
          loss: number;
        };
        linescore: string[];
        points: number;
      };
    };
    officials?: string[];
    timesTied?: number;
    leadChanges?: number;
    nugget?: string | null;
  }>;
}

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const { userId } = useAuth();
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
  } = useQuery(GET_GAME_STATS, {
    variables: { game_id: gameId },
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
        const apiGame = response.response[0] as unknown as {
          id: number;
          league: {
            id: string;
            name: string;
            type: string;
            logo: string;
          };
          season: number;
          date: {
            start: string;
            end?: string;
            duration?: string;
          };
          stage: number;
          status: {
            clock?: string;
            halftime: boolean;
            short: number;
            long: string;
          };
          periods: {
            current: number;
            total: number;
            endOfPeriod: boolean;
          };
          arena: {
            name: string;
            city: string;
            state: string;
            country: string;
          };
          teams: {
            visitors: {
              id: number;
              name: string;
              nickname: string;
              code: string;
              logo: string;
            };
            home: {
              id: number;
              name: string;
              nickname: string;
              code: string;
              logo: string;
            };
          };
          scores: {
            visitors: {
              linescore: string[];
              points: number;
              win: number;
              loss: number;
              series: {
                win: number;
                loss: number;
              };
            };
            home: {
              linescore: string[];
              points: number;
              win: number;
              loss: number;
              series: {
                win: number;
                loss: number;
              };
            };
          };
        };

        const game: Game = {
          // Basic game information
          id: apiGame.id.toString(),

          // League information
          league: {
            id: apiGame.league.id,
            name: apiGame.league.name,
            type: apiGame.league.type,
            logo: apiGame.league.logo,
          },

          // Season and date information
          season: apiGame.season,
          date: {
            start: apiGame.date.start,
            end: apiGame.date.end || '',
            duration: apiGame.date.duration || '',
          },

          // Game stage and status
          stage: apiGame.stage,
          status: {
            clock: apiGame.status.clock || '',
            halftime: apiGame.status.halftime,
            short: apiGame.status.short,
            long: apiGame.status.long,
          },

          // Period information
          periods: {
            current: apiGame.periods.current,
            total: apiGame.periods.total,
            endOfPeriod: apiGame.periods.endOfPeriod,
          },

          // Arena information
          arena: {
            name: apiGame.arena.name,
            city: apiGame.arena.city,
            state: apiGame.arena.state,
            country: apiGame.arena.country,
          },

          // Teams information
          teams: {
            visitors: {
              id: apiGame.teams.visitors.id.toString(),
              name: apiGame.teams.visitors.name,
              nickname: apiGame.teams.visitors.nickname,
              code: apiGame.teams.visitors.code,
              logo: apiGame.teams.visitors.logo,
            },
            home: {
              id: apiGame.teams.home.id.toString(),
              name: apiGame.teams.home.name,
              nickname: apiGame.teams.home.nickname,
              code: apiGame.teams.home.code,
              logo: apiGame.teams.home.logo,
            },
          },

          // Scores information
          scores: {
            visitors: {
              linescore: apiGame.scores.visitors.linescore,
              points: apiGame.scores.visitors.points,
              win: apiGame.scores.visitors.win ?? 0,
              loss: apiGame.scores.visitors.loss ?? 0,
              series: {
                win: apiGame.scores.visitors.series?.win ?? 0,
                loss: apiGame.scores.visitors.series?.loss ?? 0,
              },
            },
            home: {
              linescore: apiGame.scores.home.linescore,
              points: apiGame.scores.home.points,
              win: apiGame.scores.home.win ?? 0,
              loss: apiGame.scores.home.loss ?? 0,
              series: {
                win: apiGame.scores.home.series?.win ?? 0,
                loss: apiGame.scores.home.series?.loss ?? 0,
              },
            },
          },

          // Additional game information
          officials: [],
          timesTied: 0,
          leadChanges: 0,
          nugget: null,
          statistics: [],
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
  }, [params.id]);

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
              {gameData?.league.logo && (
                <Image
                  src={gameData.league.logo}
                  alt={gameData.league.name}
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
              <div className="text-center space-y-6">
                {gameData?.teams.visitors.logo && (
                  <Image
                    src={
                      imageErrors[`${gameData?.id}-visitors`]
                        ? '/gamelog.svg'
                        : gameData?.teams.visitors.logo
                    }
                    alt={gameData?.teams.visitors.name}
                    width={96}
                    height={96}
                    className="mx-auto w-24 h-24 object-contain"
                    onError={() => handleImageError(`${gameData?.id}-visitors`)}
                  />
                )}
                <div className="space-y-2">
                  <div className="text-xl font-bold">{gameData?.teams.visitors.nickname}</div>
                  <div className="text-muted-foreground">
                    {gameData?.scores.visitors.win}-{gameData?.scores.visitors.loss}
                  </div>
                  <div
                    className={`text-3xl font-bold ${
                      gameData?.scores.visitors.points > gameData?.scores.home.points
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {gameData?.scores.visitors.points}
                  </div>
                </div>
              </div>

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
              <div className="text-center space-y-6">
                {gameData?.teams.home.logo && (
                  <Image
                    src={
                      imageErrors[`${gameData?.id}-home`]
                        ? '/gamelog.svg'
                        : gameData?.teams.home.logo
                    }
                    alt={gameData?.teams.home.name}
                    width={96}
                    height={96}
                    className="mx-auto w-24 h-24 object-contain"
                    onError={() => handleImageError(`${gameData?.id}-home`)}
                  />
                )}
                <div className="space-y-2">
                  <div className="text-xl font-bold">{gameData?.teams.home.nickname}</div>
                  <div className="text-muted-foreground">
                    {gameData?.scores.home.win}-{gameData?.scores.home.loss}
                  </div>
                  <div
                    className={`text-3xl font-bold ${
                      gameData?.scores.home.points > gameData?.scores.visitors.points
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {gameData?.scores.home.points}
                  </div>
                </div>
              </div>
            </div>

            {/* Quarter Scores */}
            {gameData?.scores.visitors.linescore && gameData?.scores.home.linescore && (
              <div className="mt-12 pt-8 border-t">
                <div className="grid grid-cols-6 gap-4">
                  <div className="text-center font-medium">Team</div>
                  {gameData?.scores.visitors.linescore.map((score, index) => (
                    <div key={index} className="text-center font-medium">
                      Q{index + 1}
                    </div>
                  ))}
                  <div className="text-center font-medium">Total</div>
                </div>
                <div className="grid grid-cols-6 gap-4 mt-6">
                  <div className="text-center">{gameData?.teams.visitors.nickname}</div>
                  {gameData?.scores.visitors.linescore.map((score, index) => (
                    <div
                      key={index}
                      className={`text-center ${
                        parseInt(score) > parseInt(gameData?.scores.home.linescore[index] || '0')
                          ? 'text-green-500 font-bold'
                          : parseInt(score) <
                              parseInt(gameData?.scores.home.linescore[index] || '0')
                            ? 'text-muted-foreground'
                            : ''
                      }`}
                    >
                      {score}
                    </div>
                  ))}
                  <div
                    className={`text-center font-bold ${
                      gameData?.scores.visitors.points > gameData?.scores.home.points
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {gameData?.scores.visitors.points}
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-4 mt-6">
                  <div className="text-center">{gameData?.teams.home.nickname}</div>
                  {gameData?.scores.home.linescore.map((score, index) => (
                    <div
                      key={index}
                      className={`text-center ${
                        parseInt(score) >
                        parseInt(gameData?.scores.visitors.linescore[index] || '0')
                          ? 'text-green-500 font-bold'
                          : parseInt(score) <
                              parseInt(gameData?.scores.visitors.linescore[index] || '0')
                            ? 'text-muted-foreground'
                            : ''
                      }`}
                    >
                      {score}
                    </div>
                  ))}
                  <div
                    className={`text-center font-bold ${
                      gameData?.scores.home.points > gameData?.scores.visitors.points
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {gameData?.scores.home.points}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Arena Info */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-6">Arena Information</h3>
              <div className="space-y-2">
                <p className="font-medium">{gameData?.arena.name}</p>
                <p className="text-muted-foreground">
                  {gameData?.arena.city}, {gameData?.arena.state}, {gameData?.arena.country}
                </p>
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
                      {gameData?.officials.map((official, index) => (
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
                          {teamStats.team.logo && (
                            <div className="w-16 h-16 relative flex-shrink-0">
                              <Image
                                src={teamStats.team.logo}
                                alt={teamStats.team.name}
                                fill
                                sizes="(max-width: 64px) 100vw, 64px"
                                className="rounded-full bg-white p-1 object-contain"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="text-2xl font-bold text-white">
                              {teamStats.team.nickname}
                            </h4>
                            <p className="text-blue-100">{teamStats.team.name}</p>
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
                            <p className="text-2xl font-bold text-blue-600">
                              {teamStats.rebounds.total}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Off: {teamStats.rebounds.offensive}</span>
                              <span>Def: {teamStats.rebounds.defensive}</span>
                            </div>
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

                      {/* Advanced Stats */}
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2">
                          Advanced Stats
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Fast Break Points</p>
                            <p className="text-xl font-bold text-blue-600">
                              {teamStats.statistics.fastBreakPoints}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Points in Paint</p>
                            <p className="text-xl font-bold text-blue-600">
                              {teamStats.statistics.pointsInPaint}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Biggest Lead</p>
                            <p className="text-xl font-bold text-blue-600">
                              {teamStats.statistics.biggestLead}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Second Chance Points</p>
                            <p className="text-xl font-bold text-blue-600">
                              {teamStats.statistics.secondChancePoints}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Points off Turnovers</p>
                            <p className="text-xl font-bold text-blue-600">
                              {teamStats.statistics.pointsOffTurnovers}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Longest Run</p>
                            <p className="text-xl font-bold text-blue-600">
                              {teamStats.statistics.longestRun}
                            </p>
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
