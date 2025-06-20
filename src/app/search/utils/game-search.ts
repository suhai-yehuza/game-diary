import { format, isToday, isYesterday, isTomorrow } from 'date-fns';

import type { ISearchGame } from '@src/lib/types';

// Pure function to check if a string contains the search term
const containsSearchTerm = (str: string | undefined, searchTerm: string): boolean => {
  return str ? str.toLowerCase().includes(searchTerm.toLowerCase()) : false;
};

// Pure function to filter games based on search query
export const filterGames = (games: ISearchGame[], searchQuery: string): ISearchGame[] => {
  if (!searchQuery.trim()) return games;

  const lowerQuery = searchQuery.toLowerCase();

  return games.filter(game => {
    // Search in team names
    if (containsSearchTerm(game.teams.home.name, lowerQuery)) return true;
    if (containsSearchTerm(game.teams.visitors.name, lowerQuery)) return true;

    // Search in arena information
    if (game.arena) {
      if (typeof game.arena === 'string') {
        if (containsSearchTerm(game.arena, lowerQuery)) return true;
      } else {
        if (containsSearchTerm(game.arena.name, lowerQuery)) return true;
        if (containsSearchTerm(game.arena.city, lowerQuery)) return true;
        if (containsSearchTerm(game.arena.state || '', lowerQuery)) return true;
      }
    }

    // Search in game date (format: "MMM d, yyyy")
    const dateString = typeof game.date === 'string' ? game.date : game.date.start;
    const formattedDate = format(new Date(dateString), 'MMM d, yyyy');
    if (containsSearchTerm(formattedDate, lowerQuery)) return true;

    // Search in game status
    if (containsSearchTerm(game.status.long, lowerQuery)) return true;

    // Search in specific date patterns
    if (containsSearchTerm(format(new Date(dateString), 'MMMM'), lowerQuery)) return true; // Full month name
    if (containsSearchTerm(new Date(dateString).getFullYear().toString(), lowerQuery)) return true; // Year

    // Special searches
    if (lowerQuery === 'today' && isToday(new Date(dateString))) return true;
    if (lowerQuery === 'yesterday' && isYesterday(new Date(dateString))) return true;
    if (lowerQuery === 'tomorrow' && isTomorrow(new Date(dateString))) return true;
    if (
      lowerQuery === 'finals' &&
      game.arena &&
      typeof game.arena === 'object' &&
      containsSearchTerm(game.arena.name, 'finals')
    )
      return true;
    if (
      lowerQuery === 'playoffs' &&
      game.arena &&
      typeof game.arena === 'object' &&
      containsSearchTerm(game.arena.name, 'playoffs')
    )
      return true;
    if (
      (lowerQuery === 'overtime' || lowerQuery === 'ot') &&
      game.arena &&
      game.arena &&
      typeof game.arena === 'object' &&
      containsSearchTerm(game.arena.name, 'overtime')
    )
      return true;

    return false;
  });
};

// Pure function to get season range
export const getSeasonRange = (years: number): string[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: years }, (_, i) => (currentYear - i).toString());
};
