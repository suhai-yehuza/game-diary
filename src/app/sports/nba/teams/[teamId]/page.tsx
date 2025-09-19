'use client';

import { ArrowLeft, Building2, Calendar, MapPin, Target, Trophy, User, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

import { SportsPageLayout } from '@/app/components/sports';
import { GameCard } from '@/app/components/sports/game-card';
import { Head2HeadGames } from '@/app/components/sports/head2head-games';
import { PaginatedGrid } from '@/app/components/sports/paginated-grid';
import { PlayerCard } from '@/app/components/sports/player-card';
import { SeasonPlayerStats } from '@/app/components/sports/season-player-stats';
import { Tabs } from '@/app/components/sports/tabs';
import { TeamFilters } from '@/app/components/sports/team-filters';
import { TeamStats } from '@/app/components/sports/team-stats';
// import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { errorHandlers } from '@/lib/utils/error-handler';
import { getCurrentNbaSeason, getSeasonFilterOptionsSimple } from '@/lib/utils/season-filter.utils';
import type {
  ITeamResponse,
  IPlayerResponse as _IPlayerResponse,
  ITeamPlayersPlayer,
  ITeamDetailPageProps,
} from '@/types';

// Interface moved to src/lib/types/page.types.ts

export default function NBATeamDetailPage({ params: _params }: ITeamDetailPageProps) {
  // Get params using useParams hook
  const routeParams = useParams();
  const teamId = routeParams?.teamId as string;

  // Fetch team data from database
  const [team, setTeam] = useState<ITeamResponse | null>(null);
  const [teamGames, setTeamGames] = useState<unknown[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<ITeamPlayersPlayer[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [playersError, setPlayersError] = useState<string | null>(null);

  // Pagination state for games
  const [gamesPage, setGamesPage] = useState(1);
  const [gamesPageSize] = useState(20);
  const [gamesPagination, setGamesPagination] = useState<{
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  // Season filtering for players and games
  const currentSeason = getCurrentNbaSeason().toString();
  const [selectedSeason, setSelectedSeason] = useState<string>(currentSeason);
  const [selectedGamesSeason, setSelectedGamesSeason] = useState<string>(currentSeason);

  // Get season filter options (current + 10 previous seasons)
  const seasonOptions = useMemo(() => getSeasonFilterOptionsSimple(11, false), []);

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Handle URL hash for direct navigation to players tab
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#players') {
        setActiveTab('players');
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Reset games page when season changes
  useEffect(() => {
    setGamesPage(1);
  }, [selectedGamesSeason]);

  // Handle games page change
  const handleGamesPageChange = (newPage: number) => {
    setGamesPage(newPage);
  };

  // Fetch team data from database
  useEffect(() => {
    if (!teamId) return;

    const fetchTeamData = async () => {
      setTeamsLoading(true);
      setTeamsError(null);

      try {
        const response = await fetch(`/api/teams/${teamId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setTeamsError('Team not found');
            return;
          }
          throw new Error(`Failed to fetch team: ${response.statusText}`);
        }

        const teamData = await response.json();
        setTeam(teamData);
      } catch (err) {
        errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
          component: 'NBATeamDetailPage',
          action: 'Fetch team data',
        });
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team';
        setTeamsError(errorMessage);
      } finally {
        setTeamsLoading(false);
      }
    };

    void fetchTeamData();
  }, [teamId]);

  // Fetch team games from external API
  useEffect(() => {
    if (!teamId) return;

    const fetchTeamGames = async () => {
      setGamesLoading(true);
      setGamesError(null);

      try {
        const response = await fetch(
          `/api/teams/${teamId}/games?season=${selectedGamesSeason}&page=${gamesPage}&limit=${gamesPageSize}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch team games: ${response.statusText}`);
        }

        const gamesData = await response.json();
        if (gamesData.success && gamesData.data) {
          setTeamGames(gamesData.data);
          setGamesPagination(gamesData.pagination);
        } else {
          throw new Error(gamesData.error || 'Failed to fetch team games');
        }
      } catch (err) {
        errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
          component: 'NBATeamDetailPage',
          action: 'Fetch team games',
        });
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team games';
        setGamesError(errorMessage);
        setTeamGames([]);
        setGamesPagination(null);
      } finally {
        setGamesLoading(false);
      }
    };

    void fetchTeamGames();
  }, [teamId, selectedGamesSeason, gamesPage, gamesPageSize]);

  // Fetch team players from external API
  useEffect(() => {
    if (!teamId) return;

    const fetchTeamPlayers = async () => {
      setPlayersLoading(true);
      setPlayersError(null);

      try {
        const response = await fetch(`/api/teams/${teamId}/players?season=${selectedSeason}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch team players: ${response.statusText}`);
        }

        const playersData = await response.json();
        if (playersData.success && playersData.data?.response) {
          setTeamPlayers(playersData.data?.response?.length === 0 ? [] : playersData.data.response);
        } else {
          throw new Error(playersData.error || 'Failed to fetch team players');
        }
      } catch (err) {
        errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
          component: 'NBATeamDetailPage',
          action: 'Fetch team players',
        });
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team players';
        setPlayersError(errorMessage);
        setTeamPlayers([]);
      } finally {
        setPlayersLoading(false);
      }
    };

    void fetchTeamPlayers();
  }, [teamId, selectedSeason]);

  // Memoize counts to prevent tab re-rendering
  const gamesCount = useMemo(
    () => gamesPagination?.totalCount || teamGames.length,
    [gamesPagination?.totalCount, teamGames.length]
  );
  const playersCount = useMemo(() => teamPlayers.length, [teamPlayers.length]);

  // Determine loading and error states
  const isLoading = teamsLoading || !teamId;
  const error = teamsError || gamesError || playersError;

  // Show loading state
  if (isLoading) {
    return (
      <SportsPageLayout
        title="Loading Team..."
        description="Loading team details"
        showLiveGamesButton={false}
      >
        <div className="mb-4">
          <Link
            href="/sports/nba/teams"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
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
        description="Failed to load team details"
        showLiveGamesButton={false}
      >
        <div className="mb-4">
          <Link
            href="/sports/nba/teams"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </SportsPageLayout>
    );
  }

  // Show not found if team doesn't exist
  if (!team) {
    notFound();
  }

  return (
    <SportsPageLayout
      title={team.name}
      description={`${team.city} ${team.nickname} team details and statistics`}
      showLiveGamesButton={false}
    >
      <div className="space-y-8">
        {/* Back Button */}
        <div>
          <Link
            href="/sports/nba/teams"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Link>
        </div>

        {/* Team Header */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                {team.logo ? (
                  <Image
                    src={team.logo}
                    alt={`${team.name} logo`}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold team-section-title team-header-title mb-2">
                    {team.name}
                  </h1>
                  <p className="text-lg team-detail-label">{team.nickname}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="team-detail-label">{team.city}</span>
                  </div>

                  {team.leagues?.standard && (
                    <>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="team-detail-label">
                          {team.leagues.standard.conference} Conference
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="team-detail-label">
                          {team.leagues.standard.division} Division
                        </span>
                      </div>
                    </>
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
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div className="space-y-8">
                  {/* Team Stats Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 team-overview-card">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium uppercase tracking-wide">
                              Team Code
                            </p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                              {team.code || 'N/A'}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800 team-overview-card">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium uppercase tracking-wide">
                              Location
                            </p>
                            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                              {team.city || 'N/A'}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {team.leagues?.standard && (
                      <>
                        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 team-overview-card">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium uppercase tracking-wide">
                                  Conference
                                </p>
                                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                                  {team.leagues.standard.conference || 'N/A'}
                                </p>
                              </div>
                              <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-400/10 rounded-xl flex items-center justify-center">
                                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 team-overview-card">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium uppercase tracking-wide">
                                  Division
                                </p>
                                <p className="text-xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                                  {team.leagues.standard.division || 'N/A'}
                                </p>
                              </div>
                              <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-400/10 rounded-xl flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>

                  {/* Detailed Team Information */}
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <CardTitle className="flex items-center gap-3 text-xl team-card-title">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        Team Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Basic Information */}
                        <div className="space-y-6 basic-details-content">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold team-section-title">
                              Basic Details
                            </h3>
                          </div>

                          <div className="space-y-4">
                            <div className="group">
                              <dt className="text-sm font-medium team-detail-label mb-1">
                                Full Team Name
                              </dt>
                              <dd className="text-base font-medium team-detail-value bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                {team.name}
                              </dd>
                            </div>

                            <div className="group">
                              <dt className="text-sm font-medium team-detail-label mb-1">
                                Team Nickname
                              </dt>
                              <dd className="text-base font-medium team-detail-value bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                {team.nickname || 'N/A'}
                              </dd>
                            </div>

                            <div className="group">
                              <dt className="text-sm font-medium team-detail-label mb-1">
                                Team Code
                              </dt>
                              <dd className="text-base font-medium team-detail-value bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 font-mono">
                                {team.code || 'N/A'}
                              </dd>
                            </div>

                            <div className="group">
                              <dt className="text-sm font-medium team-detail-label mb-1">City</dt>
                              <dd className="text-base font-medium team-detail-value bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                {team.city || 'N/A'}
                              </dd>
                            </div>
                          </div>
                        </div>

                        {/* League Information */}
                        {team.leagues?.standard && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <h3 className="text-lg font-semibold team-section-title">
                                League Details
                              </h3>
                            </div>

                            <div className="space-y-4">
                              <div className="group">
                                <dt className="text-sm font-medium team-detail-label mb-1">
                                  Conference
                                </dt>
                                <dd className="text-base font-medium team-detail-value bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-lg border border-purple-200 dark:border-purple-800">
                                  <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    {team.leagues.standard.conference} Conference
                                  </div>
                                </dd>
                              </div>

                              <div className="group">
                                <dt className="text-sm font-medium team-detail-label mb-1">
                                  Division
                                </dt>
                                <dd className="text-base font-medium team-detail-value bg-orange-50 dark:bg-orange-900/20 px-4 py-3 rounded-lg border border-orange-200 dark:border-orange-800">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    {team.leagues.standard.division || 'N/A'} Division
                                  </div>
                                </dd>
                              </div>

                              <div className="group">
                                <dt className="text-sm font-medium team-detail-label mb-1">
                                  NBA Franchise Status
                                </dt>
                                <dd className="text-base font-medium team-detail-value">
                                  <div
                                    className={`px-4 py-3 rounded-lg border inline-flex items-center gap-2 ${
                                      team.nbaFranchise
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}
                                  >
                                    {team.nbaFranchise ? (
                                      <>
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        Official NBA Franchise
                                      </>
                                    ) : (
                                      <>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                        Not an NBA Franchise
                                      </>
                                    )}
                                  </div>
                                </dd>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ),
            },
            {
              id: 'games',
              label: `Games (${gamesCount})`,
              content: (
                <div className="space-y-6">
                  {/* Beautiful Games Filter */}
                  <TeamFilters
                    title="Games Filters"
                    description="Filter games by season and other criteria"
                    icon={<Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    filters={[
                      {
                        label: 'Season',
                        value: selectedGamesSeason,
                        onChange: setSelectedGamesSeason,
                        options: seasonOptions,
                        icon: <Calendar className="w-4 h-4 text-gray-500" />,
                      },
                    ]}
                    onRefresh={() => {
                      // Refresh games data
                      window.location.reload();
                    }}
                    error={gamesError}
                  />

                  {/* Games Content with Pagination */}
                  <PaginatedGrid
                    items={teamGames}
                    loading={gamesLoading}
                    error={gamesError}
                    pagination={gamesPagination}
                    onPageChange={handleGamesPageChange}
                    renderItem={(game: unknown) => (
                      <GameCard key={(game as { id: string }).id} game={game} />
                    )}
                    renderEmptyState={() => (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {gamesError
                          ? `Error loading games: ${gamesError}`
                          : `No games found for this team in ${selectedGamesSeason}.`}
                      </div>
                    )}
                    gridClassName="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                    showPagination={true}
                  />
                </div>
              ),
            },
            {
              id: 'head2head',
              label: 'Head 2 Head',
              content: <Head2HeadGames teamId={teamId} teamName={team.name} />,
            },
            {
              id: 'stats',
              label: 'Team Stats',
              content: <TeamStats teamId={teamId} teamName={team.name} />,
            },
            {
              id: 'players',
              label: `Players (${playersCount})`,
              content: (
                <div className="space-y-6">
                  {/* Beautiful Players Filter */}
                  <TeamFilters
                    title="Players Filters"
                    description="Filter players by season and other criteria"
                    icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    filters={[
                      {
                        label: 'Season',
                        value: selectedSeason,
                        onChange: setSelectedSeason,
                        options: seasonOptions,
                        icon: <Calendar className="w-4 h-4 text-gray-500" />,
                      },
                    ]}
                    onRefresh={() => {
                      // Refresh players data
                      window.location.reload();
                    }}
                    error={playersError}
                  />

                  {/* Players Content */}
                  {playersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary" />
                    </div>
                  ) : teamPlayers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {teamPlayers.map(player => (
                        <PlayerCard key={player.id} player={player} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {playersError
                        ? `Error loading players: ${playersError}`
                        : `No players found for this team in ${selectedSeason}.`}
                    </div>
                  )}
                </div>
              ),
            },
            {
              id: 'player-season-stats',
              label: 'Player Stats',
              content: (
                <SeasonPlayerStats
                  teamPlayers={teamPlayers}
                  loading={playersLoading}
                  error={playersError}
                />
              ),
            },
          ]}
        />
      </div>
    </SportsPageLayout>
  );
}
