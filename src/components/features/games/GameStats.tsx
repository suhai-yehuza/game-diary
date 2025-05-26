import React, { useState, useMemo } from 'react';

import type {
  GameStatistics,
  GameWithStatistics,
  ComponentGameStats,
  GameStatsProps,
} from '@/lib/types/game.types';
import { GamePlayerStats } from '@/lib/types/game.types';

const calculateGameStats = (game: GameWithStatistics): ComponentGameStats => {
  const homeTeam = game.teams.home;
  const awayTeam = game.teams.visitors;

  const homePlayers = (game.statistics as GameStatistics[])
    .filter((stat: GameStatistics) => stat.team_id === homeTeam.id)
    .map((stat: GameStatistics) => ({
      id: stat.player_id || '',
      player_id: stat.player_id || '',
      name: stat.player_id || '', // TODO: Get player name from player data
      team_id: homeTeam.id,
      points: stat.points,
      rebounds: stat.rebounds,
      assists: stat.assists,
      steals: stat.steals,
      blocks: stat.blocks,
      turnovers: stat.turnovers,
      fouls: stat.fouls,
      minutes_played: parseInt(stat.minutes),
      plus_minus: stat.plus_minus,
      field_goals: {
        made: stat.field_goals.made,
        attempted: stat.field_goals.attempted,
      },
      three_pointers: {
        made: stat.three_pointers.made,
        attempted: stat.three_pointers.attempted,
      },
      free_throws: {
        made: stat.free_throws.made,
        attempted: stat.free_throws.attempted,
      },
    }));

  const awayPlayers = (game.statistics as GameStatistics[])
    .filter((stat: GameStatistics) => stat.team_id === awayTeam.id)
    .map((stat: GameStatistics) => ({
      id: stat.player_id || '',
      player_id: stat.player_id || '',
      name: stat.player_id || '', // TODO: Get player name from player data
      team_id: awayTeam.id,
      points: stat.points,
      rebounds: stat.rebounds,
      assists: stat.assists,
      steals: stat.steals,
      blocks: stat.blocks,
      turnovers: stat.turnovers,
      fouls: stat.fouls,
      minutes_played: parseInt(stat.minutes),
      plus_minus: stat.plus_minus,
      field_goals: {
        made: stat.field_goals.made,
        attempted: stat.field_goals.attempted,
      },
      three_pointers: {
        made: stat.three_pointers.made,
        attempted: stat.three_pointers.attempted,
      },
      free_throws: {
        made: stat.free_throws.made,
        attempted: stat.free_throws.attempted,
      },
    }));

  const calculateTeamStats = (players: GamePlayerStats[]) => ({
    points: players.reduce((sum, p) => sum + (p?.points || 0), 0),
    rebounds: players.reduce((sum, p) => sum + (p?.rebounds || 0), 0),
    assists: players.reduce((sum, p) => sum + (p?.assists || 0), 0),
    steals: players.reduce((sum, p) => sum + (p?.steals || 0), 0),
    blocks: players.reduce((sum, p) => sum + (p?.blocks || 0), 0),
    turnovers: players.reduce((sum, p) => sum + (p?.turnovers || 0), 0),
    fouls: players.reduce((sum, p) => sum + (p?.fouls || 0), 0),
    fieldGoals: {
      made: players.reduce((sum, p) => sum + (p?.field_goals?.made || 0), 0),
      attempted: players.reduce((sum, p) => sum + (p?.field_goals?.attempted || 0), 0),
    },
    threePointers: {
      made: players.reduce((sum, p) => sum + (p?.three_pointers?.made || 0), 0),
      attempted: players.reduce((sum, p) => sum + (p?.three_pointers?.attempted || 0), 0),
    },
    freeThrows: {
      made: players.reduce((sum, p) => sum + (p?.free_throws?.made || 0), 0),
      attempted: players.reduce((sum, p) => sum + (p?.free_throws?.attempted || 0), 0),
    },
  });

  return {
    players: [...homePlayers, ...awayPlayers],
    homeTeam: calculateTeamStats(homePlayers),
    awayTeam: calculateTeamStats(awayPlayers),
  };
};

export const GameStats = ({ game }: GameStatsProps) => {
  const [_selectedPeriod, _setSelectedPeriod] = useState<'game' | 'season'>('game');
  const [_selectedStat, _setSelectedStat] = useState<string>('points');
  const [_showTrends, _setShowTrends] = useState(false);
  const [_showComparison, _setShowComparison] = useState(false);
  const [_compareWith, _setCompareWith] = useState<string | null>(null);
  const [_showInsights, _setShowInsights] = useState(false);
  const [_showHeatmap, _setShowHeatmap] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [_showTeamStats, _setShowTeamStats] = useState(false);
  const [_showPlayerComparison, _setShowPlayerComparison] = useState(false);
  const [_selectedPlayer, _setSelectedPlayer] = useState<string | null>(null);
  const [_showPlayerTrends, _setShowPlayerTrends] = useState(false);
  const [_showTeamStandings, _setShowTeamStandings] = useState(false);
  const [minMinutes, setMinMinutes] = useState<number>(0);

  // Memoize stats calculation
  const stats = useMemo(() => {
    if (!game) return null;
    return calculateGameStats(game);
  }, [game]);

  // Memoize player stats
  const _playerStats = useMemo(() => {
    if (!stats) return null;
    return stats.players.map((player: GamePlayerStats) => ({
      id: player.id,
      player_id: player.player_id,
      name: player.name,
      points: player.points,
      rebounds: player.rebounds,
      assists: player.assists,
      steals: player.steals,
      blocks: player.blocks,
      turnovers: player.turnovers,
      fouls: player.fouls,
      minutes: player.minutes_played,
      plusMinus: player.plus_minus,
      fieldGoals: player.field_goals,
      threePointers: player.three_pointers,
      freeThrows: player.free_throws,
    }));
  }, [stats]);

  // Filter stats based on selected criteria
  const filteredStats = useMemo(() => {
    if (!game || !stats) return [];
    return stats.players.filter((stat: GamePlayerStats) => {
      if (selectedTeam !== 'all' && stat.team_id !== selectedTeam) return false;
      if (stat.minutes_played < minMinutes) return false;
      return true;
    });
  }, [game, stats, selectedTeam, minMinutes]);

  if (!game || !stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Game Statistics</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option value="all">All Teams</option>
            {Array.from(new Set(stats.players.map((stat: GamePlayerStats) => stat.team_id))).map(
              teamId => (
                <option key={teamId} value={teamId}>
                  {teamId} {/* TODO: Get team name from team data */}
                </option>
              )
            )}
          </select>
          <input
            type="number"
            min="0"
            value={minMinutes}
            onChange={e => setMinMinutes(Number(e.target.value))}
            className="px-3 py-1 border rounded w-24"
            placeholder="Min minutes"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rebounds
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assists
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Steals
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blocks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Turnovers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fouls
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Minutes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                +/-
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStats.map((stat: GamePlayerStats) => (
              <tr key={stat.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{stat.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.points}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.rebounds}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.assists}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.steals}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.blocks}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.turnovers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.fouls}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.minutes_played}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.plus_minus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
