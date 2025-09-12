'use client';

import { RefreshCw, Trophy, Users } from 'lucide-react';
import { useState, useMemo } from 'react';

import { GameCard } from '@/app/components/sports/game-card';
import { PaginatedGrid } from '@/app/components/sports/paginated-grid';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { CustomSelect } from '@/app/components/ui/custom-select';
import { useHeadToHeadGames } from '@/hooks/use-head-to-head-games';
import { useNBATeams } from '@/hooks/use-nba-teams';
import { getCurrentNbaSeason, getSeasonFilterOptionsSimple } from '@/lib/utils/season-filter.utils';
import type { IHead2HeadGamesProps } from '@/types';

export function Head2HeadGames({ teamId, teamName: _teamName }: IHead2HeadGamesProps) {
  const currentSeason = getCurrentNbaSeason().toString();
  const [selectedSeason, setSelectedSeason] = useState<string>(currentSeason);
  const [selectedOpponent, setSelectedOpponent] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllTime, setShowAllTime] = useState(false);

  // Fetch all NBA teams
  const { teams: allTeams } = useNBATeams({
    skip: false,
  });

  // Get season filter options (current + 10 previous seasons)
  const seasonOptions = useMemo(() => getSeasonFilterOptionsSimple(11, false), []);

  const { games, loading, error, pagination, refetch } = useHeadToHeadGames({
    teamId: teamId, // Always use the current team ID for the API call
    season: showAllTime ? undefined : selectedSeason,
    opponent: selectedOpponent !== 'all' ? selectedOpponent : undefined,
    page: currentPage,
    skip: false,
  });

  // Group games by opponent team for better organization
  const _gamesByOpponent = useMemo(() => {
    const grouped: Record<string, typeof games> = {};

    games.forEach(game => {
      // Determine the opponent team
      const isHomeTeam = game.teams?.home?.id === teamId;
      const opponentTeam = isHomeTeam ? game.teams?.visitors : game.teams?.home;

      if (opponentTeam?.id) {
        const opponentKey = `${opponentTeam.id}-${opponentTeam.name}`;
        if (!grouped[opponentKey]) {
          grouped[opponentKey] = [];
        }
        grouped[opponentKey].push(game);
      }
    });

    // Sort opponents by number of games (most frequent first)
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b.length - a.length)
      .reduce<Record<string, typeof games>>((acc, [key, games]) => {
        acc[key] = games;
        return acc;
      }, {});
  }, [games, teamId]);

  // Get available opponents for the filter - use all teams instead of just those from games
  const availableOpponents = useMemo(() => {
    if (!allTeams || allTeams.length === 0) {
      return [{ id: 'all', name: 'All Teams', key: 'all' }];
    }

    // Filter out the current team from the opponents list
    const opponentTeams = allTeams.filter(team => team.id !== teamId);

    const opponents = opponentTeams.map(team => ({
      id: team.id,
      name: team.name,
      key: team.id,
      code: team.code || team.nickname || team.name,
    }));

    return [{ id: 'all', name: 'All Teams', key: 'all' }, ...opponents];
  }, [allTeams, teamId]);

  // No additional filtering needed - API handles opponent filtering
  const filteredGames = games;

  // Calculate head-to-head statistics
  const h2hStats = useMemo(() => {
    const stats: Record<string, { wins: number; losses: number; total: number }> = {};

    // Group games by opponent for statistics
    const gamesByOpponentForStats: Record<string, typeof games> = {};

    games.forEach(game => {
      const homeTeamId = game.teams?.home?.id;
      const awayTeamId = game.teams?.visitors?.id;

      // Determine the opponent team
      const isHomeTeam = homeTeamId === teamId;
      const opponentId = isHomeTeam ? awayTeamId : homeTeamId;

      if (opponentId) {
        if (!gamesByOpponentForStats[opponentId]) {
          gamesByOpponentForStats[opponentId] = [];
        }
        gamesByOpponentForStats[opponentId].push(game);
      }
    });

    Object.entries(gamesByOpponentForStats).forEach(([opponentId, opponentGames]) => {
      let wins = 0;
      let losses = 0;

      opponentGames.forEach(game => {
        const isHomeTeam = game.teams?.home?.id === teamId;
        const homeScore = game.scores?.home?.points || 0;
        const awayScore = game.scores?.visitors?.points || 0;

        if (isHomeTeam) {
          if (homeScore > awayScore) wins++;
          else if (homeScore < awayScore) losses++;
        } else {
          if (awayScore > homeScore) wins++;
          else if (awayScore < homeScore) losses++;
        }
      });

      stats[opponentId] = {
        wins,
        losses,
        total: wins + losses,
      };
    });

    return stats;
  }, [games, teamId]);

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    setCurrentPage(1);
  };

  const handleOpponentChange = (opponent: string) => {
    setSelectedOpponent(opponent);
    setCurrentPage(1);
  };

  const handleAllTimeToggle = () => {
    setShowAllTime(!showAllTime);
    setSelectedOpponent('all'); // Reset opponent filter when switching modes
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Head-to-Head Games</h3>
          <div className="flex items-center space-x-2">
            <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, () => Math.random().toString(36).substr(2, 9)).map(id => (
            <div
              key={`skeleton-game-${id}`}
              className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Head-to-Head Games</h3>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Error loading head-to-head games</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare opponent options for CustomSelect

  const opponentOptions = availableOpponents.map(opponent => ({
    value: opponent.key,
    label: opponent.name,
    icon: null,
  }));

  return (
    <div className="space-y-6">
      {/* Beautiful Filters Card - matching Game Logs design */}
      <div className="head2head-filters-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Head-to-Head Filters
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filter head-to-head games by season and opponent
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAllTimeToggle}
              variant={showAllTime ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              All Time
            </Button>

            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 space-y-4">
          {/* Row 1: Season and Opponent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!showAllTime && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                  Season:
                </span>
                <CustomSelect
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                  options={seasonOptions}
                  size="sm"
                  className="flex-1"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                Opponent:
              </span>
              <CustomSelect
                value={selectedOpponent}
                onChange={handleOpponentChange}
                options={opponentOptions}
                size="sm"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head Statistics Summary */}
      {Object.keys(h2hStats).length > 0 && selectedOpponent === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Head-to-Head Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(h2hStats)
                .slice(0, 6)
                .map(([opponentId, stats]) => {
                  const opponentTeam = allTeams.find(team => team.id === opponentId);
                  const opponentName = opponentTeam?.name || 'Unknown Team';
                  const winPercentage =
                    stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : '0.0';

                  return (
                    <div key={opponentId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{opponentName}</h4>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stats.total} games
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {stats.wins}W
                          </span>
                          <span className="mx-1">-</span>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {stats.losses}L
                          </span>
                        </div>
                        <div className="text-sm font-medium">{winPercentage}%</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specific Opponent Statistics */}
      {selectedOpponent !== 'all' && h2hStats[selectedOpponent] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              vs {availableOpponents.find(o => o.key === selectedOpponent)?.name || 'Selected Team'}
              {!showAllTime && selectedSeason && (
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({selectedSeason} season)
                </span>
              )}
              {showAllTime && (
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  (All Time)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                const stats = h2hStats[selectedOpponent] || { wins: 0, losses: 0, total: 0 };
                const winPercentage =
                  stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : '0.0';

                return (
                  <>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.wins}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Wins</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.losses}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Losses</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {winPercentage}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <PaginatedGrid
          items={filteredGames}
          renderItem={(game: { id: string }) => (
            <GameCard key={game.id} game={game} showTeamLogos={true} highlightTeam={teamId} />
          )}
          pagination={{
            page: pagination?.page || 1,
            limit: pagination?.limit || 20,
            totalCount: filteredGames.length,
            totalPages: Math.ceil(filteredGames.length / (pagination?.limit || 20)),
          }}
          onPageChange={handlePageChange}
          loading={loading}
          error={null}
        />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Head-to-Head Games</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {(() => {
                const filters = [];
                if (showAllTime) {
                  filters.push('all-time');
                } else {
                  filters.push(`${selectedSeason} season`);
                }
                if (selectedOpponent !== 'all') {
                  const opponentName =
                    availableOpponents.find(o => o.key === selectedOpponent)?.name ||
                    'selected opponent';
                  filters.push(`vs ${opponentName}`);
                }
                return `No head-to-head games found for ${filters.join(', ')}`;
              })()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
