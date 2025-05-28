// This file is intentionally left empty

import { format } from 'date-fns';

import { SearchGame, GameQueryResult, ProcessedGameData } from '@/lib/types/game.types';

// Pure function to check if a string contains the search term
const containsTerm = (str: string | null | undefined, term: string): boolean =>
  str ? str.toLowerCase().includes(term.toLowerCase()) : false;

// Pure function to get searchable fields from a game
const getSearchableFields = (game: SearchGame): (string | null | undefined)[] => [
  game.teams.visitors.name,
  game.teams.home.name,
  game.teams.visitors.nickname,
  game.teams.home.nickname,
  game.arena.name,
  game.arena.city,
  game.arena.state,
  game.status.long,
  format(new Date(game.date.start), 'MMMM d, yyyy'),
];

// Pure function to check if a game matches the search term
const gameMatchesTerm = (game: SearchGame, term: string): boolean =>
  getSearchableFields(game).some(field => containsTerm(field, term));

// Pure function to sort games by date
const sortGamesByDate = (games: SearchGame[]): SearchGame[] =>
  [...games].sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime());

// Pure function to ensure arena data is never null
const ensureArenaData = (game: SearchGame): SearchGame => ({
  ...game,
  arena: {
    name: game.arena.name || '',
    city: game.arena.city || '',
    state: game.arena.state || '',
    country: game.arena.country || '',
  },
});

// Pure function to process game data
export const processGameData = (queries: GameQueryResult[]): ProcessedGameData => ({
  isLoading: queries.some(query => query.loading),
  hasError: queries.some(query => query.error),
  games: sortGamesByDate(
    queries.flatMap(query => query.data?.games?.items.map(edge => ensureArenaData(edge)) || [])
  ),
});

// Pure function to filter games
export const filterGames = (games: SearchGame[], searchTerm: string): SearchGame[] =>
  searchTerm ? games.filter(game => gameMatchesTerm(game, searchTerm)) : games;

// Pure function to get season range
export const getSeasonRange = (years: number): string[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: years }, (_, i) => (currentYear - i).toString());
};
