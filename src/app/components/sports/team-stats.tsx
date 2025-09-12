'use client';

import {
  BarChart3,
  Calendar,
  Home,
  MapPin,
  RefreshCw,
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { CustomSelect } from '@/app/components/ui/custom-select';
import { useTeamStats } from '@/hooks/use-team-stats';
import { getCurrentNbaSeason, getSeasonFilterOptions } from '@/lib/utils/season-filter.utils';
import type { ITeamStatsProps } from '@/types';

export function TeamStats({ teamId, teamName: _teamName }: ITeamStatsProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(getCurrentNbaSeason().toString());
  const [showAllTime, setShowAllTime] = useState(false);

  // Get season filter options (current + 10 previous seasons)
  const seasonOptions = useMemo(() => getSeasonFilterOptions(11, false), []);

  const { stats, loading, error, refetch } = useTeamStats({
    teamId,
    season: showAllTime ? undefined : selectedSeason,
    skip: false,
  });

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
  };

  const handleAllTimeToggle = () => {
    setShowAllTime(!showAllTime);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number, decimals = 1) => {
    return value.toFixed(decimals);
  };

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (diff: number) => {
    if (diff > 0) return 'text-green-600 dark:text-green-400';
    if (diff < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Team Statistics</h3>
          <div className="flex items-center space-x-2">
            <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, () => Math.random().toString(36).substr(2, 9)).map(id => (
            <div
              key={`skeleton-stats-${id}`}
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
          <h3 className="text-lg font-semibold">Team Statistics</h3>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Error loading team statistics</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Team Statistics</h3>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Statistics Available</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No team statistics found for {showAllTime ? 'all time' : `${selectedSeason} season`}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Beautiful Filters Card */}
      <div className="head2head-filters-card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Team Statistics Filters
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filter team statistics by season
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
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
              Season:
            </span>
            <CustomSelect
              value={selectedSeason}
              onChange={handleSeasonChange}
              options={seasonOptions}
              size="sm"
              className="flex-1"
              disabled={showAllTime}
            />
          </div>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium uppercase tracking-wide">
                  Win Percentage
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {formatPercentage(stats.winPercentage)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium uppercase tracking-wide">
                  Games Played
                </p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                  {stats.gamesPlayed}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium uppercase tracking-wide">
                  Record
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {stats.wins}-{stats.losses}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-400/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium uppercase tracking-wide">
                  Conference
                </p>
                <p className="text-xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {stats.conference}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-400/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Home Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.homeRecord.wins}-{stats.homeRecord.losses}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formatPercentage(
                  (stats.homeRecord.wins / (stats.homeRecord.wins + stats.homeRecord.losses)) * 100
                )}{' '}
                win rate
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Away Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.awayRecord.wins}-{stats.awayRecord.losses}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formatPercentage(
                  (stats.awayRecord.wins / (stats.awayRecord.wins + stats.awayRecord.losses)) * 100
                )}{' '}
                win rate
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Last 10 Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.lastTenRecord.wins}-{stats.lastTenRecord.losses}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formatPercentage(
                  (stats.lastTenRecord.wins /
                    (stats.lastTenRecord.wins + stats.lastTenRecord.losses)) *
                    100
                )}{' '}
                win rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offensive Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Offensive Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(stats.points.avg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Points per Game</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${getTrendColor(stats.points.diff)}`}
              >
                {getTrendIcon(stats.points.diff)}
                {stats.points.diff > 0 ? '+' : ''}
                {formatNumber(stats.points.diff)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(stats.assists.avg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Assists per Game</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${getTrendColor(stats.assists.diff)}`}
              >
                {getTrendIcon(stats.assists.diff)}
                {stats.assists.diff > 0 ? '+' : ''}
                {formatNumber(stats.assists.diff)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatPercentage(stats.fgPct.avg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Field Goal %</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${getTrendColor(stats.fgPct.diff)}`}
              >
                {getTrendIcon(stats.fgPct.diff)}
                {stats.fgPct.diff > 0 ? '+' : ''}
                {formatNumber(stats.fgPct.diff, 1)}%
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatPercentage(stats.fg3Pct.avg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">3-Point %</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${getTrendColor(stats.fg3Pct.diff)}`}
              >
                {getTrendIcon(stats.fg3Pct.diff)}
                {stats.fg3Pct.diff > 0 ? '+' : ''}
                {formatNumber(stats.fg3Pct.diff, 1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defensive Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Defensive Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatNumber(stats.rebounds.avg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rebounds per Game</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${getTrendColor(stats.rebounds.diff)}`}
              >
                {getTrendIcon(stats.rebounds.diff)}
                {stats.rebounds.diff > 0 ? '+' : ''}
                {formatNumber(stats.rebounds.diff)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatNumber(stats.steals.avg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Steals per Game</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${getTrendColor(stats.steals.diff)}`}
              >
                {getTrendIcon(stats.steals.diff)}
                {stats.steals.diff > 0 ? '+' : ''}
                {formatNumber(stats.steals.diff)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatNumber(stats.blocks.avg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Blocks per Game</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${getTrendColor(stats.blocks.diff)}`}
              >
                {getTrendIcon(stats.blocks.diff)}
                {stats.blocks.diff > 0 ? '+' : ''}
                {formatNumber(stats.blocks.diff)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {formatNumber(stats.turnovers.avg)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Turnovers per Game</div>
              <div
                className={`text-xs mt-1 flex items-center justify-center gap-1 ${getTrendColor(-stats.turnovers.diff)}`}
              >
                {getTrendIcon(-stats.turnovers.diff)}
                {stats.turnovers.diff > 0 ? '-' : '+'}
                {formatNumber(Math.abs(stats.turnovers.diff))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
