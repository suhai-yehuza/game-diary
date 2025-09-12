import {
  Calendar,
  CheckCircle,
  Play,
  Clock,
  XCircle,
  List,
  Users,
  MapPin,
  GraduationCap,
  Building2,
} from 'lucide-react';

import { getSeasonFilterOptions } from '@/lib/utils/season-filter.utils';

// Common filter options for NBA pages
export const NBA_FILTERS = {
  // Page size options
  pageSizeOptions: [
    { value: '20', label: '20 items', icon: <List className="w-4 h-4" /> },
    { value: '25', label: '25 items', icon: <List className="w-4 h-4" /> },
    { value: '50', label: '50 items', icon: <List className="w-4 h-4" /> },
    { value: '75', label: '75 items', icon: <List className="w-4 h-4" /> },
    { value: '100', label: '100 items', icon: <List className="w-4 h-4" /> },
  ],

  // Game status options
  gameStatusOptions: [
    { value: 'all', label: 'All Games', icon: <List className="w-4 h-4" /> },
    { value: 'finished', label: 'Finished', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'live', label: 'Live', icon: <Play className="w-4 h-4" /> },
    { value: 'scheduled', label: 'Scheduled', icon: <Clock className="w-4 h-4" /> },
    { value: 'cancelled', label: 'Cancelled', icon: <XCircle className="w-4 h-4" /> },
  ],

  // Season options - Current season + 10 previous seasons (11 total)
  seasonOptions: getSeasonFilterOptions(11, true),

  // Player position options
  playerPositionOptions: [
    { value: 'all', label: 'All Positions', icon: <Users className="w-4 h-4" /> },
    { value: 'PG', label: 'Point Guard', icon: <Users className="w-4 h-4" /> },
    { value: 'SG', label: 'Shooting Guard', icon: <Users className="w-4 h-4" /> },
    { value: 'SF', label: 'Small Forward', icon: <Users className="w-4 h-4" /> },
    { value: 'PF', label: 'Power Forward', icon: <Users className="w-4 h-4" /> },
    { value: 'C', label: 'Center', icon: <Users className="w-4 h-4" /> },
  ],

  // Player year options
  playerYearOptions: [
    { value: 'all', label: 'All Players', icon: <Calendar className="w-4 h-4" /> },
    { value: 'rookie', label: 'Rookies', icon: <Calendar className="w-4 h-4" /> },
    { value: 'veteran', label: 'Veterans', icon: <Calendar className="w-4 h-4" /> },
  ],

  // Player college options
  playerCollegeOptions: [
    { value: 'all', label: 'All Colleges', icon: <GraduationCap className="w-4 h-4" /> },
    { value: 'Duke', label: 'Duke', icon: <GraduationCap className="w-4 h-4" /> },
    { value: 'Kentucky', label: 'Kentucky', icon: <GraduationCap className="w-4 h-4" /> },
    {
      value: 'North Carolina',
      label: 'North Carolina',
      icon: <GraduationCap className="w-4 h-4" />,
    },
    { value: 'Kansas', label: 'Kansas', icon: <GraduationCap className="w-4 h-4" /> },
    { value: 'UCLA', label: 'UCLA', icon: <GraduationCap className="w-4 h-4" /> },
  ],

  // Player country options
  playerCountryOptions: [
    { value: 'all', label: 'All Countries', icon: <MapPin className="w-4 h-4" /> },
    { value: 'USA', label: 'United States', icon: <MapPin className="w-4 h-4" /> },
    { value: 'Canada', label: 'Canada', icon: <MapPin className="w-4 h-4" /> },
    { value: 'France', label: 'France', icon: <MapPin className="w-4 h-4" /> },
    { value: 'Australia', label: 'Australia', icon: <MapPin className="w-4 h-4" /> },
    { value: 'Spain', label: 'Spain', icon: <MapPin className="w-4 h-4" /> },
  ],

  // Team conference options
  teamConferenceOptions: [
    { value: 'all', label: 'All Conferences', icon: <Building2 className="w-4 h-4" /> },
    { value: 'East', label: 'Eastern Conference', icon: <Building2 className="w-4 h-4" /> },
    { value: 'Internatio', label: 'International', icon: <Building2 className="w-4 h-4" /> },
    { value: 'Intl', label: 'International (Alt)', icon: <Building2 className="w-4 h-4" /> },
  ],

  // Team division options
  teamDivisionOptions: [
    { value: 'all', label: 'All Divisions', icon: <Building2 className="w-4 h-4" /> },
    { value: 'Atlantic', label: 'Atlantic Division', icon: <Building2 className="w-4 h-4" /> },
    { value: 'East', label: 'East Division', icon: <Building2 className="w-4 h-4" /> },
    { value: 'Southeast', label: 'Southeast Division', icon: <Building2 className="w-4 h-4" /> },
  ],

  // Sort options
  sortOptions: [
    { value: 'name', label: 'Name', icon: <List className="w-4 h-4" /> },
    { value: 'date', label: 'Date', icon: <Calendar className="w-4 h-4" /> },
    { value: 'conference', label: 'Conference', icon: <Building2 className="w-4 h-4" /> },
  ],
};

// Common icons for NBA pages
export const NBA_ICONS = {
  calendar: <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  games: <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  players: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  teams: <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  filters: <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
};
