'use client';

import { ArrowLeft, RefreshCw, Database, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { SportsPageLayout, TeamCard, TeamFilters } from '@/app/components/sports';
import { Button } from '@/app/components/ui/button';
import { useNBATeams } from '@/hooks/use-nba-teams';
import { useTeamFilters } from '@/hooks/use-team-filters';
import { TAILWIND_CLASSES } from '@/lib/constants/colors';
import type { ITeamResponse } from '@/types';

// Utility function to format large numbers
const formatShort = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export default function NBATeamsPage() {
  const [forceRefresh, setForceRefresh] = useState(false);

  const { teams, loading, error, refetch, cacheStatus, refreshCache } = useNBATeams({
    forceRealData: true,
    forceRefresh,
  });

  // Use team filters hook
  const {
    filters,
    filterOptions,
    filteredTeams,
    showAdvancedFilters,
    hasActiveFilters,
    updateFilter,
    clearFilters,
    toggleAdvancedFilters,
  } = useTeamFilters(teams);

  // Group teams by conference
  const teamsByConference = useMemo(() => {
    const grouped = filteredTeams.reduce<Record<string, ITeamResponse[]>>((acc, team) => {
      let groupName = 'Exhibition'; // Default to Exhibition

      // Check if team is an All Star team first
      if (team.allStar) {
        groupName = 'All Star';
      } else if (team.nbaFranchise) {
        // Check if team is an NBA franchise (but not All Star)
        const conference = team.leagues?.standard?.conference;
        if (conference === 'East' || conference === 'Eastern') {
          groupName = 'East';
        } else if (conference === 'West' || conference === 'Western') {
          groupName = 'West';
        }
        // If NBA franchise but conference doesn't match East/West, it goes to Exhibition
      } else {
        // Not an NBA franchise - check if conference contains "int" (case insensitive)
        const conference = team.leagues?.standard?.conference;
        if (conference?.toLowerCase().includes('int')) {
          groupName = 'International';
        }
        // If not NBA franchise and conference doesn't contain "int", it goes to Exhibition
      }

      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(team);
      return acc;
    }, {});

    // Sort teams within each group by name
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Sort groups in desired order: East, West, All Star, International, Exhibition
    const sortedGroups = Object.keys(grouped).sort((a, b) => {
      const order = {
        East: 1,
        West: 2,
        'All Star': 3,
        International: 4,
        Exhibition: 5,
      };
      const orderA = order[a as keyof typeof order] || 6;
      const orderB = order[b as keyof typeof order] || 6;
      return orderA - orderB;
    });

    // Create new object with sorted groups
    const sortedGrouped: Record<string, ITeamResponse[]> = {};
    sortedGroups.forEach(group => {
      sortedGrouped[group] = grouped[group];
    });

    return sortedGrouped;
  }, [filteredTeams]);

  const handleForceRefresh = () => {
    setForceRefresh(true);
    refreshCache();
    // Reset force refresh after a short delay
    setTimeout(() => setForceRefresh(false), 1000);
  };

  const getCacheStatusIcon = () => {
    switch (cacheStatus) {
      case 'cached':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'fresh':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCacheStatusText = () => {
    switch (cacheStatus) {
      case 'cached':
        return 'Cached';
      case 'fresh':
        return 'Fresh';
      default:
        return 'No Cache';
    }
  };

  if (loading) {
    return (
      <SportsPageLayout
        title="NBA Teams"
        description="Browse all NBA teams and their information"
        showLiveGamesButton={false}
      >
        {/* Navigation section with back button and sport buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Back to NBA Hub */}
          <Link href="/sports/nba">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to NBA Hub
            </Button>
          </Link>

          {/* Sport buttons on the right */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/sports/nba/games"
              className={`inline-flex items-center px-4 py-2 ${TAILWIND_CLASSES.sports.nba} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
            >
              Games
            </Link>
            <Link
              href="/sports/nba/players"
              className={`inline-flex items-center px-4 py-2 ${TAILWIND_CLASSES.sports.mls} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
            >
              Players
            </Link>
          </div>
        </div>

        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
        </div>
      </SportsPageLayout>
    );
  }

  if (error) {
    return (
      <SportsPageLayout
        title="NBA Teams"
        description="Browse all NBA teams and their information"
        showLiveGamesButton={false}
      >
        {/* Navigation section with back button and sport buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Back to NBA Hub */}
          <Link href="/sports/nba">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to NBA Hub
            </Button>
          </Link>

          {/* Sport buttons on the right */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/sports/nba/games"
              className={`inline-flex items-center px-4 py-2 ${TAILWIND_CLASSES.sports.nba} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
            >
              Games
            </Link>
            <Link
              href="/sports/nba/players"
              className={`inline-flex items-center px-4 py-2 ${TAILWIND_CLASSES.sports.mls} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2`}
            >
              Players
            </Link>
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-red-600">Error loading teams: {error}</p>
          <button
            onClick={() => void refetch()}
            className="mt-4 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            Try Again
          </button>
        </div>
      </SportsPageLayout>
    );
  }

  return (
    <SportsPageLayout
      title="NBA Teams"
      description="Browse all NBA teams and their information"
      showLiveGamesButton={false}
    >
      {/* Navigation section with back button and sport buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Back to NBA Hub */}
        <Link href="/sports/nba">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to NBA Hub
          </Button>
        </Link>

        {/* Sport buttons on the right */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Link
            href="/sports/nba/games"
            className={`inline-flex items-center px-3 sm:px-4 py-2 ${TAILWIND_CLASSES.sports.nba} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm`}
          >
            Games
          </Link>
          <Link
            href="/sports/nba/players"
            className={`inline-flex items-center px-3 sm:px-4 py-2 ${TAILWIND_CLASSES.sports.mls} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm`}
          >
            Players
          </Link>
        </div>
      </div>

      {/* Cache Status and Controls */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {getCacheStatusIcon()}
            <div>
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Cache Status: {getCacheStatusText()}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {formatShort(teams.length)} teams loaded • 1 hour cache TTL
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {formatShort(filteredTeams.length)} teams shown • {formatShort(teams.length)} total
                teams
              </div>
              <div className="text-xs text-blue-500 dark:text-blue-400">
                All teams shown • No pagination needed
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceRefresh}
              disabled={forceRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${forceRefresh ? 'animate-spin' : ''}`} />
              {forceRefresh ? 'Refreshing...' : 'Force Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Team Filters */}
      <TeamFilters
        filters={filters}
        filterOptions={filterOptions}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        totalTeams={teams.length}
        filteredTeamsCount={filteredTeams.length}
        onUpdateFilter={updateFilter as (key: string, value: unknown) => void}
        onClearFilters={clearFilters}
        onToggleAdvancedFilters={toggleAdvancedFilters}
        onRefresh={() => void refetch()}
      />

      {/* Teams Display */}
      <div className="space-y-8 mt-8">
        {Object.keys(teamsByConference).length === 0 ? (
          <div className="text-center py-12">
            <p className="nba-empty-state-text text-lg">No teams found matching your criteria.</p>
            <button
              onClick={() => void clearFilters()}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          Object.entries(teamsByConference).map(([groupName, groupTeams]) => (
            <div key={groupName} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                {groupName} ({groupTeams.length} teams)
              </h3>
              {groupTeams.map(team => (
                <TeamCard key={team.id || `team-${team.name}-${team.code}`} team={team} />
              ))}
            </div>
          ))
        )}
      </div>
    </SportsPageLayout>
  );
}
