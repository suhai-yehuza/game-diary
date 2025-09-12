'use client';

import { BarChart3, Target, Zap, Clock, Users } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { CustomSelect } from '@/app/components/ui/custom-select';
import { PlayerImage } from '@/app/components/ui/player-image';
import { usePlayerStats } from '@/hooks/use-player-stats';
import { getCurrentNbaSeason } from '@/lib/utils/season-filter.utils';
import type { ITeamPlayersPlayer as _ITeamPlayersPlayer, ISeasonPlayerStatsProps } from '@/types';

export function SeasonPlayerStats({ teamPlayers, loading, error }: ISeasonPlayerStatsProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 20;
  const currentSeason = getCurrentNbaSeason().toString();

  // Fetch player statistics for selected player (season-level)
  const {
    playerStats,
    loading: playerStatsLoading,
    error: playerStatsError,
  } = usePlayerStats({
    playerId: selectedPlayerId || '',
    season: currentSeason,
    skip: !selectedPlayerId,
  });

  // Create player options for the dropdown
  const playerOptions = useMemo(() => {
    if (!teamPlayers) return [];

    return teamPlayers
      .filter(player => player?.id)
      .map(player => ({
        value: player.id.toString(),
        label: `${player.firstname} ${player.lastname}`,
        subtitle: `#${player.leagues?.standard?.jersey || 'N/A'} • ${player.leagues?.standard?.pos || 'N/A'}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [teamPlayers]);

  // Get selected player details
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId || !teamPlayers) return null;
    return teamPlayers.find(p => p?.id?.toString() === selectedPlayerId) || null;
  }, [selectedPlayerId, teamPlayers]);

  // Reset page when player changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPlayerId]);

  // Calculate pagination
  const totalGames = playerStats?.response?.length || 0;
  const totalPages = Math.ceil(totalGames / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = playerStats?.response?.slice(startIndex, endIndex) || [];

  if (loading) {
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Season Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Failed to load team players</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teamPlayers || teamPlayers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Season Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No team players available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {/* Player Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Player
            </label>
            <CustomSelect
              options={playerOptions}
              value={selectedPlayerId || ''}
              onChange={setSelectedPlayerId}
              placeholder="Choose a player to view season statistics..."
              className="w-full"
            />
          </div>

          {/* Player Statistics */}
          {selectedPlayerId && (
            <div className="space-y-4">
              {playerStatsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary" />
                </div>
              ) : playerStatsError ? (
                <div className="text-center py-8 text-red-500">
                  <p>Failed to load player statistics</p>
                  <p className="text-sm text-gray-500 mt-1">{playerStatsError}</p>
                </div>
              ) : !playerStats?.response || playerStats.response.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No season statistics available for this player</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Player Header */}
                  {selectedPlayer && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <PlayerImage player={selectedPlayer} size="md" className="rounded-full" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {selectedPlayer.firstname} {selectedPlayer.lastname}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          #{selectedPlayer.leagues?.standard?.jersey || 'N/A'} •{' '}
                          {selectedPlayer.leagues?.standard?.pos || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Season Totals */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Season {currentSeason} Totals
                    </h4>

                    {/* Calculate season totals */}
                    {(() => {
                      const totals = playerStats.response.reduce(
                        (acc, game) => ({
                          points: acc.points + (game.points || 0),
                          fgm: acc.fgm + (game.fgm || 0),
                          fga: acc.fga + (game.fga || 0),
                          fg3m: acc.fg3m + (game.tpm || 0),
                          fg3a: acc.fg3a + (game.tpa || 0),
                          ftm: acc.ftm + (game.ftm || 0),
                          fta: acc.fta + (game.fta || 0),
                          reb: acc.reb + (game.totReb || 0),
                          oreb: acc.oreb + (game.offReb || 0),
                          dreb: acc.dreb + (game.defReb || 0),
                          ast: acc.ast + (game.assists || 0),
                          stl: acc.stl + (game.steals || 0),
                          blk: acc.blk + (game.blocks || 0),
                          turnover: acc.turnover + (game.turnovers || 0),
                          pf: acc.pf + (game.pFouls || 0),
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
                          games: 0,
                        }
                      );

                      const percentages = {
                        fgPct:
                          totals.fga > 0 ? ((totals.fgm / totals.fga) * 100).toFixed(1) : '0.0',
                        fg3Pct:
                          totals.fg3a > 0 ? ((totals.fg3m / totals.fg3a) * 100).toFixed(1) : '0.0',
                        ftPct:
                          totals.fta > 0 ? ((totals.ftm / totals.fta) * 100).toFixed(1) : '0.0',
                      };

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Scoring Stats */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                              <Target className="w-5 h-5 text-blue-500" />
                              Scoring
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Points</span>
                                <span className="font-semibold">{totals.points}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">FG</span>
                                <span className="font-semibold">
                                  {totals.fgm}/{totals.fga} ({percentages.fgPct}%)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">3PT</span>
                                <span className="font-semibold">
                                  {totals.fg3m}/{totals.fg3a} ({percentages.fg3Pct}%)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">FT</span>
                                <span className="font-semibold">
                                  {totals.ftm}/{totals.fta} ({percentages.ftPct}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Rebounding Stats */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                              <Users className="w-5 h-5 text-green-500" />
                              Rebounding
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total</span>
                                <span className="font-semibold">{totals.reb}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Offensive</span>
                                <span className="font-semibold">{totals.oreb}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Defensive</span>
                                <span className="font-semibold">{totals.dreb}</span>
                              </div>
                            </div>
                          </div>

                          {/* Other Stats */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                              <Zap className="w-5 h-5 text-purple-500" />
                              Other
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Assists</span>
                                <span className="font-semibold">{totals.ast}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Steals</span>
                                <span className="font-semibold">{totals.stl}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Blocks</span>
                                <span className="font-semibold">{totals.blk}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Turnovers</span>
                                <span className="font-semibold">{totals.turnover}</span>
                              </div>
                            </div>
                          </div>

                          {/* Advanced Stats */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                              <Clock className="w-5 h-5 text-orange-500" />
                              Advanced
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Games</span>
                                <span className="font-semibold">{totals.games}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Fouls</span>
                                <span className="font-semibold">{totals.pf}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Individual Game Statistics */}
              {playerStats?.response && playerStats.response.length > 0 && (
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
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
