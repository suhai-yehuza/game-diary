import { getCache } from '@/lib/cache';
import { BusinessLogicError } from '@/lib/graphql/errors';
import { CACHE_TTL } from '@/lib/types/cache.types';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import type { DatabaseRow } from '@/lib/types/database.types';
import type { GameStatus, ReactionEmojiType } from '@/lib/types/generated/graphql';

// Helper function to convert emoji character back to key
export const getEmojiKey = (emojiCharacter: string): ReactionEmojiType => {
  const entry = Object.entries(REACTION_EMOJIS).find(([, char]) => char === emojiCharacter);
  return (entry?.[0] || emojiCharacter) as ReactionEmojiType;
};

// Helper function to map game data to GraphQL type
export const mapGameData = (game: DatabaseRow) => {
  const arenaData = game.arena as
    | { name?: string; city?: string; state?: string | null; country?: string | null }
    | string
    | null;
  const teams = game.teams as { home: { id: string }; visitors: { id: string } } | null;

  return {
    id: game.id,
    date: {
      start:
        (game.date as { start?: string | null })?.start ||
        (game.date instanceof Date
          ? game.date.toISOString()
          : typeof game.date === 'string'
            ? new Date(game.date).toISOString()
            : ''),
      end: (game.date as { end?: string | null })?.end || null,
      duration: (game.date as { duration?: string | null })?.duration || null,
    },
    status: {
      clock:
        typeof game.status === 'object' && game.status !== null
          ? String((game.status as GameStatus).clock || '')
          : typeof game.status === 'string'
            ? game.status
            : '',
      halftime:
        typeof game.status === 'object' && game.status !== null
          ? Boolean((game.status as GameStatus).halftime)
          : false,
      long:
        typeof game.status === 'object' && game.status !== null
          ? String((game.status as GameStatus).long || '')
          : typeof game.status === 'string'
            ? game.status
            : '',
      short:
        typeof game.status === 'object' && game.status !== null
          ? String((game.status as GameStatus).short || '')
          : typeof game.status === 'string'
            ? game.status
            : '',
    },
    arena: {
      name:
        typeof arenaData === 'object' && arenaData !== null
          ? arenaData.name || ''
          : typeof arenaData === 'string'
            ? arenaData
            : '',
      city: typeof arenaData === 'object' && arenaData !== null ? arenaData.city || '' : '',
      state: typeof arenaData === 'object' && arenaData !== null ? arenaData.state : null,
      country: typeof arenaData === 'object' && arenaData !== null ? arenaData.country : null,
    },
    league: typeof game.league === 'string' ? game.league : String(game.league ?? ''),
    season: typeof game.season === 'number' ? game.season : Number(game.season ?? 0),
    stage: typeof game.stage === 'number' ? game.stage : Number(game.stage ?? 0),
    periods: game.periods ?? [],
    scores: game.scores ?? [],
    officials: Array.isArray(game.officials) ? game.officials.map(String) : [],
    timesTied: typeof game.timesTied === 'number' ? game.timesTied : null,
    leadChanges: typeof game.leadChanges === 'number' ? game.leadChanges : null,
    nugget: typeof game.nugget === 'string' ? game.nugget : null,
    createdAt: game.createdAt instanceof Date ? game.createdAt : new Date(game.createdAt as string),
    updatedAt: game.updatedAt instanceof Date ? game.updatedAt : new Date(game.updatedAt as string),
    homeTeamId: teams?.home?.id || '',
    awayTeamId: teams?.visitors?.id || '',
    teams: game.teams ?? {},
    is_completed: game.status === 'Finished',
  };
};

// Helper function to handle errors consistently
export const handleResolverError = (error: unknown, context: string) => {
  console.error(`Error in ${context}:`, error);
  if (error instanceof BusinessLogicError) {
    throw error;
  }
  throw new BusinessLogicError(
    error instanceof Error ? error.message : `Failed to ${context}`,
    `${context.toUpperCase()}_ERROR`
  );
};

// Helper function to get cached data
export const getCachedData = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.GAME // Default to game cache TTL
): Promise<T> => {
  const cache = getCache();
  await cache.initializeRedis();
  const cached = await cache.get(cacheKey);
  if (cached) return cached as T;

  const data = await fetchFn();
  await cache.set(cacheKey, data, ttl);
  return data;
};

// Helper function to map user data
export const mapUserData = (user: DatabaseRow) => ({
  id: user.id,
  username: user.username,
  emailAddress: user.emailAddress || '',
  imageUrl: user.imageUrl,
  avatarUrl: user.imageUrl,
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  deletedAt: user.deletedAt,
});
