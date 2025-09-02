'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { SportsPageLayout, TeamCard, TeamFilters } from '@/app/components/sports';
import { Button } from '@/app/components/ui/button';
import { useNBATeams } from '@/hooks/use-nba-teams';
import { useTeamFilters } from '@/hooks/use-team-filters';
import { TAILWIND_CLASSES } from '@/lib/constants/colors';
import type { ITeamResponse } from '@/lib/types';

export default function NBATeamsPage() {
  const { teams, loading, error, refetch } = useNBATeams({
    forceRealData: true,
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
      const conference = team.leagues?.standard?.conference || 'Unknown';
      if (!acc[conference]) {
        acc[conference] = [];
      }
      acc[conference].push(team);
      return acc;
    }, {});

    // Sort teams within each conference by name
    Object.keys(grouped).forEach(conference => {
      grouped[conference].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [filteredTeams]);

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

      {/* Team Filters */}
      <TeamFilters
        filters={filters}
        filterOptions={filterOptions}
        showAdvancedFilters={showAdvancedFilters}
        hasActiveFilters={hasActiveFilters}
        totalTeams={teams.length}
        filteredTeamsCount={filteredTeams.length}
        onUpdateFilter={updateFilter}
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
          Object.entries(teamsByConference).map(([conference, conferenceTeams]) => (
            <div key={conference} className="space-y-4">
              {conferenceTeams.map(team => (
                <TeamCard key={team.id || `team-${team.name}-${team.code}`} team={team} />
              ))}
            </div>
          ))
        )}
      </div>
    </SportsPageLayout>
  );
}
