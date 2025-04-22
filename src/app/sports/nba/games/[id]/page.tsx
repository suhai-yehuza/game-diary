'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { CreateGameLogModal } from '@/components/create-game-log-modal';
import { Game } from '@/lib/types/types';
import { useAuth } from '@/contexts/AuthContext';
import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { fetchNbaGameById } from '@/lib/external-apis';

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
            logo: apiGame.league.logo
          },
          
          // Season and date information
          season: apiGame.season,
          date: {
            start: apiGame.date.start,
            end: apiGame.date.end || '',
            duration: apiGame.date.duration || ''
          },
          
          // Game stage and status
          stage: apiGame.stage,
          status: {
            clock: apiGame.status.clock || '',
            halftime: apiGame.status.halftime,
            short: apiGame.status.short,
            long: apiGame.status.long
          },
          
          // Period information
          periods: {
            current: apiGame.periods.current,
            total: apiGame.periods.total,
            endOfPeriod: apiGame.periods.endOfPeriod
          },
          
          // Arena information
          arena: {
            name: apiGame.arena.name,
            city: apiGame.arena.city,
            state: apiGame.arena.state,
            country: apiGame.arena.country
          },
          
          // Teams information
          teams: {
            visitors: {
              id: apiGame.teams.visitors.id.toString(),
              name: apiGame.teams.visitors.name,
              nickname: apiGame.teams.visitors.nickname,
              code: apiGame.teams.visitors.code,
              logo: apiGame.teams.visitors.logo
            },
            home: {
              id: apiGame.teams.home.id.toString(),
              name: apiGame.teams.home.name,
              nickname: apiGame.teams.home.nickname,
              code: apiGame.teams.home.code,
              logo: apiGame.teams.home.logo
            }
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
                loss: apiGame.scores.visitors.series?.loss ?? 0
              }
            },
            home: {
              linescore: apiGame.scores.home.linescore,
              points: apiGame.scores.home.points,
              win: apiGame.scores.home.win ?? 0,
              loss: apiGame.scores.home.loss ?? 0,
              series: {
                win: apiGame.scores.home.series?.win ?? 0,
                loss: apiGame.scores.home.series?.loss ?? 0
              }
            }
          },
          
          // Additional game information
          officials: [],
          timesTied: 0,
          leadChanges: 0,
          nugget: null,
          statistics: []
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
                    src={imageErrors[`${gameData?.id}-visitors`] ? '/gamelog.svg' : gameData?.teams.visitors.logo}
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
                  <div className={`text-3xl font-bold ${
                    gameData?.scores.visitors.points > gameData?.scores.home.points 
                      ? 'text-green-500' 
                      : 'text-muted-foreground'
                  }`}>
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
                    src={imageErrors[`${gameData?.id}-home`] ? '/gamelog.svg' : gameData?.teams.home.logo}
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
                  <div className={`text-3xl font-bold ${
                    gameData?.scores.home.points > gameData?.scores.visitors.points 
                      ? 'text-green-500' 
                      : 'text-muted-foreground'
                  }`}>
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
                    <div key={index} className={`text-center ${
                      parseInt(score) > parseInt(gameData?.scores.home.linescore[index] || '0')
                        ? 'text-green-500 font-bold'
                        : parseInt(score) < parseInt(gameData?.scores.home.linescore[index] || '0')
                          ? 'text-muted-foreground'
                          : ''
                    }`}>
                      {score}
                    </div>
                  ))}
                  <div className={`text-center font-bold ${
                    gameData?.scores.visitors.points > gameData?.scores.home.points
                      ? 'text-green-500'
                      : 'text-muted-foreground'
                  }`}>
                    {gameData?.scores.visitors.points}
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-4 mt-6">
                  <div className="text-center">{gameData?.teams.home.nickname}</div>
                  {gameData?.scores.home.linescore.map((score, index) => (
                    <div key={index} className={`text-center ${
                      parseInt(score) > parseInt(gameData?.scores.visitors.linescore[index] || '0')
                        ? 'text-green-500 font-bold'
                        : parseInt(score) < parseInt(gameData?.scores.visitors.linescore[index] || '0')
                          ? 'text-muted-foreground'
                          : ''
                    }`}>
                      {score}
                    </div>
                  ))}
                  <div className={`text-center font-bold ${
                    gameData?.scores.home.points > gameData?.scores.visitors.points
                      ? 'text-green-500'
                      : 'text-muted-foreground'
                  }`}>
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
                        <li key={index} className="text-sm">{official}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Statistics */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6">Team Statistics</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {gameData?.statistics?.map((teamStats, index) => (
                <div key={index} className="bg-card rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-6">
                    {teamStats.team.logo && (
                      <Image
                        src={teamStats.team.logo}
                        alt={teamStats.team.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    )}
                    <h4 className="text-xl font-bold">{teamStats.team.nickname}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-4 text-blue-500">Shooting</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Field Goals</p>
                          <p className="font-medium">
                            {teamStats.fieldGoals.made}/{teamStats.fieldGoals.attempted}{' '}
                            <span className="text-muted-foreground">
                              ({teamStats.fieldGoals.percentage.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">3-Pointers</p>
                          <p className="font-medium">
                            {teamStats.threePointers.made}/{teamStats.threePointers.attempted}{' '}
                            <span className="text-muted-foreground">
                              ({teamStats.threePointers.percentage.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Free Throws</p>
                          <p className="font-medium">
                            {teamStats.freeThrows.made}/{teamStats.freeThrows.attempted}{' '}
                            <span className="text-muted-foreground">
                              ({teamStats.freeThrows.percentage.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-4 text-blue-500">Game Stats</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Points</p>
                          <p className="font-medium">{teamStats.points}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rebounds</p>
                          <p className="font-medium">
                            {teamStats.rebounds.total} (Off: {teamStats.rebounds.offensive}, Def:{' '}
                            {teamStats.rebounds.defensive})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Assists</p>
                          <p className="font-medium">{teamStats.assists}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Steals</p>
                          <p className="font-medium">{teamStats.steals}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Blocks</p>
                          <p className="font-medium">{teamStats.blocks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Turnovers</p>
                          <p className="font-medium">{teamStats.turnovers}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h5 className="font-medium mb-4 text-blue-500">Advanced Stats</h5>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Fast Break Points</p>
                          <p className="font-medium">{teamStats.statistics.fastBreakPoints}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Points in Paint</p>
                          <p className="font-medium">{teamStats.statistics.pointsInPaint}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Biggest Lead</p>
                          <p className="font-medium">{teamStats.statistics.biggestLead}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Second Chance Points</p>
                          <p className="font-medium">{teamStats.statistics.secondChancePoints}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Points off Turnovers</p>
                          <p className="font-medium">{teamStats.statistics.pointsOffTurnovers}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Longest Run</p>
                          <p className="font-medium">{teamStats.statistics.longestRun}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Plus/Minus</p>
                      <p className={`font-medium ${teamStats.plusMinus >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {teamStats.plusMinus > 0 ? '+' : ''}{teamStats.plusMinus}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
