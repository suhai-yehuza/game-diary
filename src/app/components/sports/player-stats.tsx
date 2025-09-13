'use client';

import { User, Target, Zap, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { CustomSelect } from '@/app/components/ui/custom-select';
import type {
  IPlayerStatsResponse as _IPlayerStatsResponse,
  ITeamPlayersPlayer as _ITeamPlayersPlayer,
  IPlayerStatsProps,
} from '@/types';

export function PlayerStats({
  playerStats,
  teamPlayers,
  loading,
  error,
  onPlayerSelect,
  selectedPlayerId,
}: IPlayerStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Create player options for the select
  const playerOptions =
    teamPlayers
      ?.map(player => {
        // Add null checks for the player object
        if (!player) {
          return null;
        }

        return {
          value: player.id.toString(),
          label: `${player.firstname} ${player.lastname}`,
          subtitle: `#${player.leagues?.standard?.jersey || 'N/A'} • ${player.leagues?.standard?.pos || 'N/A'}`,
        };
      })
      .filter((option): option is NonNullable<typeof option> => option !== null) || [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Player Statistics
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
    const isNoDataError =
      error.includes('No team players available') ||
      error.includes('No player statistics available');

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {isNoDataError ? (
              <div className="text-theme-muted">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No player data available for this game</p>
                <p className="text-sm text-theme-muted mt-1">
                  Player statistics may not be available for this game yet
                </p>
              </div>
            ) : (
              <div className="text-semantic-error">
                <p>Failed to load player statistics</p>
                <p className="text-sm text-theme-muted mt-1">{error}</p>
              </div>
            )}
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
            <User className="w-5 h-5" />
            Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-theme-muted">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No team players available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedPlayer = teamPlayers?.find(p => p?.id?.toString() === selectedPlayerId);
  const stats = playerStats?.response?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Player Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Player Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-theme-secondary">Select Player</label>
            <CustomSelect
              options={playerOptions}
              value={selectedPlayerId || ''}
              onChange={value => onPlayerSelect(value)}
              placeholder="Choose a player..."
              className="w-full"
            />
          </div>

          {/* Player Stats Display */}
          {selectedPlayer && stats ? (
            <div className="space-y-4">
              {/* Player Header */}
              <div className="flex items-center gap-3 p-4 bg-bg-theme-secondary rounded-lg">
                <div className="w-12 h-12 bg-bg-theme-secondary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-theme-muted" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedPlayer.firstname} {selectedPlayer.lastname}
                  </h3>
                  <p className="text-sm text-theme-muted">
                    #{selectedPlayer.leagues?.standard?.jersey || 'N/A'} •{' '}
                    {selectedPlayer.leagues?.standard?.pos || 'N/A'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isExpanded ? 'Less' : 'More'}
                </Button>
              </div>

              {/* Basic Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Scoring */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Scoring
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Points:</span>
                      <span className="font-medium text-lg">{stats.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FG:</span>
                      <span>
                        {stats.fgm}/{stats.fga} ({stats.fgp}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>3PT:</span>
                      <span>
                        {stats.tpm}/{stats.tpa} ({stats.tpp}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>FT:</span>
                      <span>
                        {stats.ftm}/{stats.fta} ({stats.ftp}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rebounding */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Rebounding
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{stats.totReb}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offensive:</span>
                      <span>{stats.offReb}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Defensive:</span>
                      <span>{stats.defReb}</span>
                    </div>
                  </div>
                </div>

                {/* Other Stats */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Other Stats
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Assists:</span>
                      <span className="font-medium">{stats.assists}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Steals:</span>
                      <span>{stats.steals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blocks:</span>
                      <span>{stats.blocks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Turnovers:</span>
                      <span>{stats.turnovers}</span>
                    </div>
                  </div>
                </div>

                {/* Advanced Stats */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Advanced
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Minutes:</span>
                      <span className="font-medium">{stats.min}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+/-:</span>
                      <span
                        className={
                          parseFloat(stats.plusMinus) >= 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {stats.plusMinus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fouls:</span>
                      <span>{stats.pFouls}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Stats */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Advanced Statistics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {stats.fastBreakPoints !== null && (
                      <div className="flex justify-between">
                        <span>Fast Break Points:</span>
                        <span>{stats.fastBreakPoints}</span>
                      </div>
                    )}
                    {stats.pointsInPaint !== null && (
                      <div className="flex justify-between">
                        <span>Points in Paint:</span>
                        <span>{stats.pointsInPaint}</span>
                      </div>
                    )}
                    {stats.biggestLead !== null && (
                      <div className="flex justify-between">
                        <span>Biggest Lead:</span>
                        <span>{stats.biggestLead}</span>
                      </div>
                    )}
                    {stats.secondChancePoints !== null && (
                      <div className="flex justify-between">
                        <span>Second Chance Points:</span>
                        <span>{stats.secondChancePoints}</span>
                      </div>
                    )}
                    {stats.pointsOffTurnovers !== null && (
                      <div className="flex justify-between">
                        <span>Points off Turnovers:</span>
                        <span>{stats.pointsOffTurnovers}</span>
                      </div>
                    )}
                    {stats.longestRun !== null && (
                      <div className="flex justify-between">
                        <span>Longest Run:</span>
                        <span>{stats.longestRun}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : selectedPlayer ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No statistics available for this player in this game</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a player to view their statistics</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
