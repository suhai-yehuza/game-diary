'use client';

import { ArrowLeft, User, Calendar, Trophy, Target, Users as _Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState, useEffect, useMemo as _useMemo } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { GameCard } from '@/app/components/sports/game-card';
import { Tabs } from '@/app/components/sports/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Button as _Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import type { IPlayerResponse, ITeamResponse, IPlayerDetailPageProps } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

// Interface moved to src/lib/types/page.types.ts

export default function NBAPlayerDetailPage({ params }: IPlayerDetailPageProps) {
  const [playerId, setPlayerId] = useState<string>('');

  useEffect(() => {
    void params.then(p => setPlayerId(p.playerId));
  }, [params]);

  // Fetch player data from database
  const [player, setPlayer] = useState<IPlayerResponse | null>(null);
  const [playerTeam, setPlayerTeam] = useState<ITeamResponse | null>(null);
  const [teamGames, setTeamGames] = useState<Record<string, unknown>[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [gamesError, _setGamesError] = useState<string | null>(null);

  // Fetch player data from database
  useEffect(() => {
    if (!playerId) return;

    const fetchPlayerData = async () => {
      setPlayersLoading(true);
      setPlayersError(null);

      try {
        const response = await fetch(`/api/players/${playerId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setPlayersError('Player not found');
            return;
          }
          throw new Error(`Failed to fetch player: ${response.statusText}`);
        }

        const playerData = await response.json();
        setPlayer(playerData);
      } catch (err) {
        errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
          component: 'NBAPlayerDetailPage',
          action: 'Fetch player data',
        });
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch player';
        setPlayersError(errorMessage);
      } finally {
        setPlayersLoading(false);
      }
    };

    void fetchPlayerData();
  }, [playerId]);

  // For now, set empty arrays for team and games since we don't have team-specific data yet
  useEffect(() => {
    setPlayerTeam(null);
    setTeamGames([]);
    setGamesLoading(false);
  }, [playerId]);

  // Helper functions for player data
  const formatHeight = (height: unknown) => {
    if (!height) return 'N/A';
    if (typeof height === 'string') return height;
    if (typeof height === 'object' && height && 'feets' in height && 'inches' in height) {
      const h = height as { feets: string; inches: string; meters?: string };
      return `${h.feets}'${h.inches}" (${h.meters || 'N/A'}m)`;
    }
    return 'N/A';
  };

  const formatWeight = (weight: unknown) => {
    if (!weight) return 'N/A';
    if (typeof weight === 'string') return weight;
    if (typeof weight === 'object' && weight && 'pounds' in weight) {
      const w = weight as { pounds: string; kilograms?: string };
      return `${w.pounds} lbs (${w.kilograms || 'N/A'} kg)`;
    }
    return 'N/A';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Determine loading and error states
  const isLoading = playersLoading || !playerId;
  const error = playersError || gamesError;

  // Show loading state
  if (isLoading) {
    return (
      <SportsPageLayout
        title="Loading Player..."
        description="Loading player details"
        showLiveGamesButton={false}
      >
        <div className="mb-4">
          <Link
            href="/sports/nba/players"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Players
          </Link>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
        </div>
      </SportsPageLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <SportsPageLayout
        title="Error"
        description="Failed to load player details"
        showLiveGamesButton={false}
      >
        <div className="mb-4">
          <Link
            href="/sports/nba/players"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Players
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </SportsPageLayout>
    );
  }

  // Show not found if player doesn't exist
  if (!player) {
    notFound();
  }

  return (
    <SportsPageLayout
      title={`${player.firstname} ${player.lastname}`}
      description={`${player.firstname} ${player.lastname} player profile and statistics`}
      showLiveGamesButton={false}
    >
      <div className="space-y-8">
        {/* Back Button */}
        <div>
          <Link
            href="/sports/nba/players"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Players
          </Link>
        </div>

        {/* Player Header */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                  {player.firstname.charAt(0)}
                  {player.lastname.charAt(0)}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {player.firstname} {player.lastname}
                  </h1>
                  {player.leagues?.standard && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{player.leagues.standard.jersey}</Badge>
                      <Badge variant="secondary">{player.leagues.standard.pos}</Badge>
                      {player.leagues.standard.active && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Active
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatHeight(player.height)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatWeight(player.weight)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatDate(player.birth?.date || '')}
                    </span>
                  </div>

                  {player.nba && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {player.nba.pro} years pro
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs
          defaultTab="overview"
          showLiveGamesTab={false}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Full Name:</span>
                            <span className="text-gray-900 dark:text-white">
                              {player.firstname} {player.lastname}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Birth Date:</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatDate(player.birth?.date || '')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Country:</span>
                            <span className="text-gray-900 dark:text-white">
                              {player.birth?.country || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Height:</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatHeight(player.height)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Weight:</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatWeight(player.weight)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">College:</span>
                            <span className="text-gray-900 dark:text-white">
                              {player.college || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>NBA Career</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {player.nba && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">NBA Start:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {player.nba.start}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Years Pro:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {player.nba.pro}
                                </span>
                              </div>
                            </>
                          )}
                          {player.leagues?.standard && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Jersey:</span>
                                <span className="text-gray-900 dark:text-white">
                                  #{player.leagues.standard.jersey}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Position:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {player.leagues.standard.pos}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Status:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {player.leagues.standard.active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </>
                          )}
                          {playerTeam && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Current Team:
                              </span>
                              <Link
                                href={`/sports/nba/teams/${playerTeam.id}`}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {playerTeam.name}
                              </Link>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ),
            },
            {
              id: 'games',
              label: `Recent Games (${teamGames.length})`,
              content: (
                <div className="space-y-4">
                  {gamesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary" />
                    </div>
                  ) : teamGames.length > 0 ? (
                    <div className="grid gap-4">
                      {teamGames.map(game => (
                        <GameCard
                          key={(game as { id: string }).id}
                          game={game as unknown as import('@/lib/types').IGameResponse}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No recent games found for this player&apos;s team.
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </SportsPageLayout>
  );
}
