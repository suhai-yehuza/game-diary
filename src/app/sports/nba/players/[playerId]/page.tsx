'use client';

import { ArrowLeft, Target, Trophy, User, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { PlayerSeasonStats } from '@/app/components/sports/player-season-stats';
import { Tabs } from '@/app/components/sports/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { PlayerImageLarge } from '@/app/components/ui/player-image';
import { errorHandlers } from '@/lib/utils/error-handler';
import { getCurrentNbaSeason, getSeasonFilterOptionsSimple } from '@/lib/utils/season-filter.utils';
import type { IPlayerResponse, IPlayerDetailPageProps } from '@/types';

export default function NBAPlayerDetailPage({ params: _params }: IPlayerDetailPageProps) {
  // Get params using useParams hook
  const routeParams = useParams();
  const playerId = routeParams?.playerId as string;

  // Helper functions to format player data
  const formatHeight = (height: unknown) => {
    if (!height || typeof height !== 'object') return 'N/A';
    const heightObj = height as Record<string, unknown>;
    if (heightObj.feets && heightObj.inches) {
      const feet = typeof heightObj.feets === 'number' ? heightObj.feets : Number(heightObj.feets);
      const inches =
        typeof heightObj.inches === 'number' ? heightObj.inches : Number(heightObj.inches);
      return `${feet}'${inches}"`;
    }
    if (heightObj.meters) {
      const meters =
        typeof heightObj.meters === 'number' ? heightObj.meters : Number(heightObj.meters);
      return `${meters}m`;
    }
    return 'N/A';
  };

  const formatWeight = (weight: unknown) => {
    if (!weight || typeof weight !== 'object') return 'N/A';
    const weightObj = weight as Record<string, unknown>;
    if (weightObj.pounds) {
      const pounds =
        typeof weightObj.pounds === 'number' ? weightObj.pounds : Number(weightObj.pounds);
      return `${pounds} lbs`;
    }
    if (weightObj.kilograms) {
      const kilograms =
        typeof weightObj.kilograms === 'number' ? weightObj.kilograms : Number(weightObj.kilograms);
      return `${kilograms} kg`;
    }
    return 'N/A';
  };

  // State for player data
  const [player, setPlayer] = useState<IPlayerResponse | null>(null);
  const [playerTeam, setPlayerTeam] = useState<{ id: string; name: string; code: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Get current season (unused but kept for potential future use)
  const _currentSeason = getCurrentNbaSeason().toString();

  // Season filter (unused but kept for potential future use)
  const [_selectedSeason, _setSelectedSeason] = useState<string>(getCurrentNbaSeason().toString());
  const _seasonOptions = useMemo(() => getSeasonFilterOptionsSimple(11, false), []);

  // Fetch player data
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) return;

      try {
        setLoading(true);
        setError(null);

        // Use the NBA API to fetch player data
        const response = await fetch(`/api/players/${playerId}/nba`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.response && data.data.response.length > 0) {
            const playerData = data.data.response[0];
            setPlayer(playerData);

            // Set team as "Unknown Team" for now
            setPlayerTeam({
              id: '1', // Use team ID 1 (Atlanta Hawks) as default
              name: 'Unknown Team',
              code: 'UNK',
            });
          } else {
            setError('Player not found');
          }
        } else if (response.status === 404) {
          setError('Player not found');
        } else {
          setError('Failed to fetch player data');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        errorHandlers.api(new Error(errorMessage), {
          component: 'NBAPlayerDetailPage',
          action: 'fetchPlayerData',
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchPlayerData();
  }, [playerId]);

  // Handle hash changes for tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['overview', 'season-stats'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    // Set initial tab from hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <SportsPageLayout title="Loading Player" description="Loading player information...">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
        </div>
      </SportsPageLayout>
    );
  }

  if (error || !player) {
    return (
      <SportsPageLayout
        title="Player Not Found"
        description="The requested player could not be found"
      >
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Player Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The requested player could not be found.'}
          </p>
          <Link
            href="/sports/nba"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to NBA
          </Link>
        </div>
      </SportsPageLayout>
    );
  }

  return (
    <SportsPageLayout
      title={`${player.firstname} ${player.lastname}`}
      description={`NBA player profile for ${player.firstname} ${player.lastname}`}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/sports/nba"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            {player.leagues?.standard?.logo && (
              <Image
                src={player.leagues.standard.logo}
                alt={`${player.firstname} ${player.lastname}`}
                width={60}
                height={60}
                className="w-15 h-15 rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {player.firstname} {player.lastname}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                {player.leagues?.standard?.jersey && <span>#{player.leagues.standard.jersey}</span>}
                {player.leagues?.standard?.pos && <span>{player.leagues.standard.pos}</span>}
                {playerTeam && (
                  <span>
                    {playerTeam.name} ({playerTeam.code})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs
          defaultTab="overview"
          showLiveGamesTab={false}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div className="space-y-8">
                  {/* Player Image and Basic Info */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Player Image */}
                        <div className="flex-shrink-0">
                          <PlayerImageLarge player={player} />
                        </div>

                        {/* Player Basic Info */}
                        <div className="flex-1 text-center md:text-left">
                          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            {player.firstname} {player.lastname}
                          </h1>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                                #{player.leagues?.standard?.jersey || 'N/A'}
                              </span>
                              <span className="text-xl text-gray-500 dark:text-gray-400">•</span>
                              <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                                {player.leagues?.standard?.pos || 'N/A'}
                              </span>
                            </div>

                            {playerTeam && (
                              <div className="flex items-center justify-center md:justify-start gap-2">
                                <Link
                                  href={`/sports/nba/teams/${playerTeam.id}`}
                                  className="text-xl text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  {playerTeam.name}
                                </Link>
                                <span className="text-gray-500 dark:text-gray-400">•</span>
                                <span className="text-lg text-gray-600 dark:text-gray-300">
                                  {playerTeam.code}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                              <p className="font-semibold text-lg">{formatHeight(player.height)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                              <p className="font-semibold text-lg">{formatWeight(player.weight)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400">College</p>
                              <p className="font-semibold text-lg">{player.college || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                League Entry
                              </p>
                              <p className="font-semibold text-lg">{player.nba?.start || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Player Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium uppercase tracking-wide">
                              Jersey Number
                            </p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                              #{player.leagues?.standard?.jersey || 'N/A'}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium uppercase tracking-wide">
                              Position
                            </p>
                            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                              {player.leagues?.standard?.pos || 'N/A'}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 dark:text-purple-400 text-sm font-medium uppercase tracking-wide">
                              Height
                            </p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                              {formatHeight(player.height)}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-400/10 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-600 dark:text-orange-400 text-sm font-medium uppercase tracking-wide">
                              Weight
                            </p>
                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                              {formatWeight(player.weight)}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-400/10 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Player Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Player Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Full Name
                            </label>
                            <p className="text-lg">
                              {player.firstname} {player.lastname}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Birth Date
                            </label>
                            <p className="text-lg">{player.birth?.date || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              College
                            </label>
                            <p className="text-lg">{player.college || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Team
                            </label>
                            {playerTeam ? (
                              <Link
                                href={`/sports/nba/teams/${playerTeam.id}`}
                                className="text-lg text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {playerTeam.name}
                              </Link>
                            ) : (
                              <p className="text-lg">N/A</p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              NBA Experience
                            </label>
                            <p className="text-lg">{player.nba?.start || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Affiliation
                            </label>
                            <p className="text-lg">{player.affiliation || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ),
            },
            {
              id: 'season-stats',
              label: 'Player Stats',
              content: player ? (
                <PlayerSeasonStats
                  player={player}
                  playerId={playerId}
                  playerName={`${player.firstname} ${player.lastname}`}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto" />
                </div>
              ),
            },
          ]}
        />
      </div>
    </SportsPageLayout>
  );
}
