'use client';

import { BarChart3, Target, Zap, Clock, Users } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { CustomSelect } from '@/app/components/ui/custom-select';
import { PlayerImage } from '@/app/components/ui/player-image';
import { usePlayerStats } from '@/hooks/use-player-stats';
import { getCurrentNbaSeason, getSeasonFilterOptionsSimple } from '@/lib/utils/season-filter.utils';
import type {
  IPlayerStatsResponse,
  IPlayerResponse as _IPlayerResponse,
  IPlayerSeasonStatsProps,
} from '@/types';

export function PlayerSeasonStats({ player, playerId, playerName }: IPlayerSeasonStatsProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(getCurrentNbaSeason().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 20;
  const seasonOptions = useMemo(() => getSeasonFilterOptionsSimple(11, false), []);

  // Fetch player statistics for selected season
  const {
    playerStats,
    loading: playerStatsLoading,
    error: playerStatsError,
  } = usePlayerStats({
    playerId,
    season: selectedSeason,
    skip: !playerId,
  });

  // Reset page when season changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSeason]);

  // Calculate pagination
  const totalGames = playerStats?.response?.length || 0;
  const totalPages = Math.ceil(totalGames / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = playerStats?.response?.slice(startIndex, endIndex) || [];

  // Helper function to convert minutes string (MM:SS) to decimal minutes
  const parseMinutes = (minStr: string | number | null | undefined): number => {
    if (!minStr) return 0;

    // If it's already a number, return it
    if (typeof minStr === 'number') return minStr;

    // If it's a string in MM:SS format, convert to decimal minutes
    if (typeof minStr === 'string' && minStr.includes(':')) {
      const [minutes, seconds] = minStr.split(':').map(Number);
      return minutes + seconds / 60;
    }

    // If it's a string that can be parsed as a number, parse it
    const parsed = parseFloat(minStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper function to format decimal minutes back to MM:SS format
  const formatMinutes = (decimalMinutes: number): string => {
    const minutes = Math.floor(decimalMinutes);
    const seconds = Math.round((decimalMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to format decimal minutes with 2 decimal places
  const _formatMinutesDecimal = (decimalMinutes: number): string => {
    return decimalMinutes.toFixed(2);
  };

  // Helper function to calculate season totals
  const calculateSeasonTotals = (stats: IPlayerStatsResponse) => {
    if (!stats?.response || stats.response.length === 0) return null;

    const games = stats.response;
    const totals = games.reduce(
      (acc, game) => ({
        points: acc.points + (game.points || 0),
        fgm: acc.fgm + (game.fgm || 0),
        fga: acc.fga + (game.fga || 0),
        fg3m: acc.fg3m + (game.tpm || 0), // Use tpm from API
        fg3a: acc.fg3a + (game.tpa || 0), // Use tpa from API
        ftm: acc.ftm + (game.ftm || 0),
        fta: acc.fta + (game.fta || 0),
        reb: acc.reb + (game.totReb || 0), // Use totReb from API
        oreb: acc.oreb + (game.offReb || 0), // Use offReb from API
        dreb: acc.dreb + (game.defReb || 0), // Use defReb from API
        ast: acc.ast + (game.assists || 0), // Use assists from API
        stl: acc.stl + (game.steals || 0), // Use steals from API
        blk: acc.blk + (game.blocks || 0), // Use blocks from API
        turnover: acc.turnover + (game.turnovers || 0), // Use turnovers from API
        pf: acc.pf + (game.pFouls || 0), // Use pFouls from API
        min: acc.min + parseMinutes(game.min),
        games: acc.games + 1,
      }),
      {
        points: 0,
        fgm: 0,
        fga: 0,
        fg3m: 0,
        fg3a: 0,
        ftm: 0,
        fta: 0,
        reb: 0,
        oreb: 0,
        dreb: 0,
        ast: 0,
        stl: 0,
        blk: 0,
        turnover: 0,
        pf: 0,
        min: 0,
        games: 0,
      }
    );

    return {
      ...totals,
      fgPct: totals.fga > 0 ? (totals.fgm / totals.fga) * 100 : 0,
      fg3Pct: totals.fg3a > 0 ? (totals.fg3m / totals.fg3a) * 100 : 0,
      ftPct: totals.fta > 0 ? (totals.ftm / totals.fta) * 100 : 0,
    };
  };

  // Helper function to calculate percentages
  const calculatePercentages = (totals: {
    fga: number;
    fgm: number;
    fg3a: number;
    fg3m: number;
    fta: number;
    ftm: number;
  }) => {
    return {
      fgPct: totals.fga > 0 ? ((totals.fgm / totals.fga) * 100).toFixed(1) : '0.0',
      fg3Pct: totals.fg3a > 0 ? ((totals.fg3m / totals.fg3a) * 100).toFixed(1) : '0.0',
      ftPct: totals.fta > 0 ? ((totals.ftm / totals.fta) * 100).toFixed(1) : '0.0',
    };
  };

  if (playerStatsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Season Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (playerStatsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Season Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-semantic-error">
            <p>Failed to load player statistics</p>
            <p className="text-sm text-theme-muted mt-1">{playerStatsError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playerStats?.response || playerStats.response.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Season Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-theme-muted">
            <p>No statistics available for this season</p>
            <p className="text-sm text-theme-muted mt-1">
              Player statistics may not be available for {selectedSeason}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const seasonTotals = calculateSeasonTotals(playerStats);
  const percentages = seasonTotals ? calculatePercentages(seasonTotals) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Season Player Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Season Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-theme-secondary">Season:</label>
            <CustomSelect
              options={seasonOptions}
              value={selectedSeason}
              onChange={setSelectedSeason}
              placeholder="Select season..."
              className="min-w-[200px]"
            />
          </div>

          {/* Player Header */}
          <div className="flex items-center gap-3 p-4 bg-bg-theme-secondary rounded-lg">
            <PlayerImage player={player} size="md" className="rounded-full" />
            <div>
              <h3 className="font-semibold text-lg">{playerName}</h3>
              <p className="text-sm text-theme-muted">
                Season {selectedSeason} • {seasonTotals?.games || 0} games
              </p>
            </div>
          </div>

          {/* Season Statistics */}
          {seasonTotals && percentages && (
            <div className="space-y-8">
              {/* Season Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Scoring Stats */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-theme-primary flex items-center gap-2">
                    <Target className="w-5 h-5 text-semantic-info" />
                    Scoring
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Points</span>
                      <span className="font-semibold">{seasonTotals.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">FG</span>
                      <span className="font-semibold">
                        {seasonTotals.fgm}/{seasonTotals.fga} ({percentages.fgPct}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">3PT</span>
                      <span className="font-semibold">
                        {seasonTotals.fg3m}/{seasonTotals.fg3a} ({percentages.fg3Pct}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">FT</span>
                      <span className="font-semibold">
                        {seasonTotals.ftm}/{seasonTotals.fta} ({percentages.ftPct}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rebounding Stats */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-theme-primary flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Rebounding
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Total</span>
                      <span className="font-semibold">{seasonTotals.reb}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Offensive</span>
                      <span className="font-semibold">{seasonTotals.oreb}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Defensive</span>
                      <span className="font-semibold">{seasonTotals.dreb}</span>
                    </div>
                  </div>
                </div>

                {/* Other Stats */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-theme-primary flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    Other
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Assists</span>
                      <span className="font-semibold">{seasonTotals.ast}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Steals</span>
                      <span className="font-semibold">{seasonTotals.stl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Blocks</span>
                      <span className="font-semibold">{seasonTotals.blk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Turnovers</span>
                      <span className="font-semibold">{seasonTotals.turnover}</span>
                    </div>
                  </div>
                </div>

                {/* Advanced Stats */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-theme-primary flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Advanced
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Minutes</span>
                      <span className="font-semibold">{formatMinutes(seasonTotals.min)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Games</span>
                      <span className="font-semibold">{seasonTotals.games}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-muted">Fouls</span>
                      <span className="font-semibold">{seasonTotals.pf}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Game Statistics */}
              <div className="space-y-4">
                <h4 className="font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                  Game-by-Game Statistics
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                            Game
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            PTS
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            FG
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            3PT
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            FT
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            REB
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            AST
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            STL
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            BLK
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            TO
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            MIN
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {currentGames.map((game, index) => (
                          <tr
                            key={game.game?.id || index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              Game {startIndex + index + 1}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">
                              {game.points || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {game.fgm || 0}/{game.fga || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {game.tpm || 0}/{game.tpa || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {game.ftm || 0}/{game.fta || 0}
                            </td>
                            <td className="px-4 py-3 text-center">{game.totReb || 0}</td>
                            <td className="px-4 py-3 text-center">{game.assists || 0}</td>
                            <td className="px-4 py-3 text-center">{game.steals || 0}</td>
                            <td className="px-4 py-3 text-center">{game.blocks || 0}</td>
                            <td className="px-4 py-3 text-center">{game.turnovers || 0}</td>
                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                              {game.min || '0:00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalGames)} of {totalGames}{' '}
                        games
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
