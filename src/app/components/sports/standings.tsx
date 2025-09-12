'use client';

import {
  BarChart3,
  Calendar,
  RefreshCw,
  Trophy,
  Users,
  Building2,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState, useMemo } from 'react';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { CustomSelect } from '@/app/components/ui/custom-select';
import { useNBATeams } from '@/hooks/use-nba-teams';
import { useStandings } from '@/hooks/use-standings';
import { getAllNbaFilterOptionsSimple, getDefaultNbaFilters } from '@/lib/utils/nba-filters.utils';
import { getCurrentNbaSeason as _getCurrentNbaSeason } from '@/lib/utils/season-filter.utils';
import type { IStandingsResponse as _IStandingsResponse, IStandingsProps } from '@/types';

export function Standings({ className = '' }: IStandingsProps) {
  // Get default filter values
  const defaultFilters = getDefaultNbaFilters();
  const [selectedSeason, setSelectedSeason] = useState<string>(defaultFilters.season);
  const [selectedConference, setSelectedConference] = useState<string>(defaultFilters.conference);
  const [selectedDivision, setSelectedDivision] = useState<string>(defaultFilters.division);
  const [selectedTeam, setSelectedTeam] = useState<string>(defaultFilters.team);
  // League is always 'standard' for NBA standings
  const selectedLeague = 'standard';

  // Fetch NBA teams for team filter
  const { teams: allTeams, loading: teamsLoading } = useNBATeams({
    skip: false,
  });

  // Get all filter options using centralized utility (excluding league since it's always 'standard')
  const filterOptions = useMemo(() => {
    const options = getAllNbaFilterOptionsSimple(allTeams, teamsLoading);
    return {
      season: options.season,
      conference: options.conference,
      division: options.division,
      team: options.team,
      // league is always 'standard' so we don't include it in the UI
    };
  }, [allTeams, teamsLoading]);

  // Memoize standings options to prevent infinite re-renders
  const standingsOptions = useMemo(
    () => ({
      season: selectedSeason,
      conference: selectedConference !== 'all' ? selectedConference : undefined,
      division: selectedDivision !== 'all' ? selectedDivision : undefined,
      team: selectedTeam !== 'all' ? selectedTeam : undefined,
      league: selectedLeague,
      skip: false,
    }),
    [selectedSeason, selectedConference, selectedDivision, selectedTeam, selectedLeague]
  );

  // Fetch standings data
  const { standings, loading, error, refetch } = useStandings(standingsOptions);

  // No automatic fallback - always use the selected season

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
  };

  const handleConferenceChange = (conference: string) => {
    setSelectedConference(conference);
  };

  const handleDivisionChange = (division: string) => {
    setSelectedDivision(division);
  };

  const handleTeamChange = (team: string) => {
    setSelectedTeam(team);
  };

  // League is always 'standard', so no handler needed

  const formatPercentage = (value: string) => {
    const num = parseFloat(value);
    return `${(num * 100).toFixed(1)}%`;
  };

  const getStreakIcon = (streak: number, winStreak: boolean) => {
    if (streak === 0) return <Minus className="w-4 h-4 text-gray-500" />;
    if (winStreak) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getStreakColor = (streak: number, winStreak: boolean) => {
    if (streak === 0) return 'text-gray-600 dark:text-gray-400';
    if (winStreak) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Sort standings by conference rank
  const sortedStandings = useMemo(() => {
    if (!standings?.response) return [];

    return [...standings.response].sort((a, b) => {
      // First sort by conference (East teams first, then West)
      const conferenceOrder = a.conference.name === 'east' ? 0 : 1;
      const conferenceOrderB = b.conference.name === 'east' ? 0 : 1;

      if (conferenceOrder !== conferenceOrderB) {
        return conferenceOrder - conferenceOrderB;
      }

      // Then sort by conference rank
      return a.conference.rank - b.conference.rank;
    });
  }, [standings?.response]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">NBA Standings</h3>
          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }, () => Math.random().toString(36).substr(2, 9)).map(id => (
            <div
              key={`skeleton-${id}`}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">NBA Standings</h3>
          <Button onClick={() => void refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Error loading standings</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!standings?.response || standings.response.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">NBA Standings</h3>
          <Button onClick={() => void refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Standings Available</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No standings found for the selected filters.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
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
                NBA Standings Filters
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Filter standings by season, conference, division, team, and league
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => void refetch()}
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Season Filter */}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">
              Season:
            </span>
            <CustomSelect
              value={selectedSeason}
              onChange={handleSeasonChange}
              options={filterOptions.season}
              size="sm"
              className="flex-1"
            />
          </div>

          {/* Conference Filter */}
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
              Conference:
            </span>
            <CustomSelect
              value={selectedConference}
              onChange={handleConferenceChange}
              options={filterOptions.conference}
              size="sm"
              className="flex-1"
            />
          </div>

          {/* Division Filter */}
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[70px]">
              Division:
            </span>
            <CustomSelect
              value={selectedDivision}
              onChange={handleDivisionChange}
              options={filterOptions.division}
              size="sm"
              className="flex-1"
            />
          </div>

          {/* Team Filter */}
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[50px]">
              Team:
            </span>
            <CustomSelect
              value={selectedTeam}
              onChange={handleTeamChange}
              options={filterOptions.team}
              size="sm"
              className="flex-1"
              disabled={teamsLoading}
            />
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            NBA Standings
            {standings.results > 0 && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({standings.results} teams)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Team
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    W
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    L
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    PCT
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    GB
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Home
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Away
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    L10
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Streak
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStandings.map((team, index) => {
                  const isFirstEastTeam =
                    team.conference.name === 'east' &&
                    (index === 0 || sortedStandings[index - 1].conference.name !== 'east');
                  const isFirstWestTeam =
                    team.conference.name === 'west' &&
                    (index === 0 || sortedStandings[index - 1].conference.name !== 'west');

                  return (
                    <React.Fragment key={team.team.id}>
                      {/* Conference Header */}
                      {(isFirstEastTeam || isFirstWestTeam) && (
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <td
                            colSpan={10}
                            className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100 text-center"
                          >
                            {team.conference.name === 'east'
                              ? 'Eastern Conference'
                              : 'Western Conference'}
                          </td>
                        </tr>
                      )}

                      <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {team.conference.rank}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Image
                              src={team.team.logo}
                              alt={team.team.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full"
                              onError={e => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {team.team.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {team.division.name} • {team.conference.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 dark:text-gray-100 font-medium">
                          {team.win.total}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 dark:text-gray-100 font-medium">
                          {team.loss.total}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 dark:text-gray-100 font-medium">
                          {formatPercentage(team.win.percentage)}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 dark:text-gray-100">
                          {team.gamesBehind || '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                          {team.win.home}-{team.loss.home}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                          {team.win.away}-{team.loss.away}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                          {team.win.lastTen}-{team.loss.lastTen}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div
                            className={`flex items-center justify-center gap-1 ${getStreakColor(team.streak, team.winStreak)}`}
                          >
                            {getStreakIcon(team.streak, team.winStreak)}
                            <span className="font-medium">{team.streak}</span>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
