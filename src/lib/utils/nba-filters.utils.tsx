import { Users, Building2, Target, Trophy } from 'lucide-react';
import React from 'react';

import { getCurrentNbaSeason, getSeasonFilterOptions } from './season-filter.utils';

// Conference filter options
export const getConferenceFilterOptions = () => [
  { value: 'all', label: 'All Conferences', icon: <Users className="w-4 h-4" /> },
  { value: 'East', label: 'Eastern Conference', icon: <Users className="w-4 h-4" /> },
  { value: 'West', label: 'Western Conference', icon: <Users className="w-4 h-4" /> },
];

// Division filter options
export const getDivisionFilterOptions = () => [
  { value: 'all', label: 'All Divisions', icon: <Building2 className="w-4 h-4" /> },
  { value: 'Atlantic', label: 'Atlantic Division', icon: <Building2 className="w-4 h-4" /> },
  { value: 'Central', label: 'Central Division', icon: <Building2 className="w-4 h-4" /> },
  { value: 'Southeast', label: 'Southeast Division', icon: <Building2 className="w-4 h-4" /> },
  { value: 'Northwest', label: 'Northwest Division', icon: <Building2 className="w-4 h-4" /> },
  { value: 'Pacific', label: 'Pacific Division', icon: <Building2 className="w-4 h-4" /> },
  { value: 'Southwest', label: 'Southwest Division', icon: <Building2 className="w-4 h-4" /> },
];

// League filter options
export const getLeagueFilterOptions = () => [
  { value: 'standard', label: 'NBA', icon: <Trophy className="w-4 h-4" /> },
  { value: 'summer', label: 'Summer League', icon: <Trophy className="w-4 h-4" /> },
  { value: 'g-league', label: 'G League', icon: <Trophy className="w-4 h-4" /> },
];

// Simple versions without icons for components that don't render icons
export const getConferenceFilterOptionsSimple = () => [
  { value: 'all', label: 'All Conferences', icon: null },
  { value: 'East', label: 'Eastern Conference', icon: null },
  { value: 'West', label: 'Western Conference', icon: null },
];

export const getDivisionFilterOptionsSimple = () => [
  { value: 'all', label: 'All Divisions', icon: null },
  { value: 'Atlantic', label: 'Atlantic Division', icon: null },
  { value: 'Central', label: 'Central Division', icon: null },
  { value: 'Southeast', label: 'Southeast Division', icon: null },
  { value: 'Northwest', label: 'Northwest Division', icon: null },
  { value: 'Pacific', label: 'Pacific Division', icon: null },
  { value: 'Southwest', label: 'Southwest Division', icon: null },
];

export const getLeagueFilterOptionsSimple = () => [
  { value: 'standard', label: 'NBA', icon: null },
  { value: 'summer', label: 'Summer League', icon: null },
  { value: 'g-league', label: 'G League', icon: null },
];

// Team filter options generator (requires teams data)
export const getTeamFilterOptions = (
  teams: Array<{ id: number | string; name: string }> | null,
  loading = false
) => {
  if (!teams || loading) {
    return [{ value: 'all', label: 'All Teams', icon: <Target className="w-4 h-4" /> }];
  }

  return [
    { value: 'all', label: 'All Teams', icon: <Target className="w-4 h-4" /> },
    ...teams.map(team => ({
      value: String(team.id),
      label: team.name,
      icon: <Target className="w-4 h-4" />,
    })),
  ];
};

export const getTeamFilterOptionsSimple = (
  teams: Array<{ id: number | string; name: string }> | null,
  loading = false
) => {
  if (!teams || loading) {
    return [{ value: 'all', label: 'All Teams', icon: null }];
  }

  return [
    { value: 'all', label: 'All Teams', icon: null },
    ...teams.map(team => ({
      value: String(team.id),
      label: team.name,
      icon: null,
    })),
  ];
};

// Default filter values
export const getDefaultNbaFilters = () => ({
  season: getCurrentNbaSeason().toString(), // Use current season as default
  conference: 'all',
  division: 'all',
  team: 'all',
  league: 'standard',
});

// All filter options combined
export const getAllNbaFilterOptions = (
  teams: Array<{ id: number | string; name: string }> | null,
  teamsLoading = false
) => ({
  season: getSeasonFilterOptions(11, false),
  conference: getConferenceFilterOptions(),
  division: getDivisionFilterOptions(),
  team: getTeamFilterOptions(teams, teamsLoading),
  league: getLeagueFilterOptions(),
});

export const getAllNbaFilterOptionsSimple = (
  teams: Array<{ id: number | string; name: string }> | null,
  teamsLoading = false
) => ({
  season: getSeasonFilterOptions(11, false),
  conference: getConferenceFilterOptionsSimple(),
  division: getDivisionFilterOptionsSimple(),
  team: getTeamFilterOptionsSimple(teams, teamsLoading),
  league: getLeagueFilterOptionsSimple(),
});
