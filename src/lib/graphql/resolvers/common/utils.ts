import { getCache } from '@/lib/cache';
import { BusinessLogicError } from '@/lib/graphql/errors';
import { logger } from '@/lib/logger';
import { CACHE_TTL } from '@/lib/types/cache.types';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import type { DatabaseRow } from '@/lib/types/database.types';
import type { ReactionEmojiType } from '@/lib/types/generated/graphql';
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

  // Parse the date field
  let [dateStart, dateEnd, dateDuration] = ['', '', ''];
  if (typeof game.date === 'object' && game.date !== null) {
    const dateObj = game.date as { start?: string; end?: string | null; duration?: string };
    if ('start' in dateObj) {
      try {
        dateStart = dateObj.start ? new Date(dateObj.start).toISOString() : '';
      } catch {
        dateStart = '';
      }
      try {
        // Only try to parse end date if it exists and is not null/undefined
        if (dateObj.end && dateObj.end !== 'null' && dateObj.end !== 'undefined') {
          const endDate = new Date(dateObj.end);
          dateEnd = !isNaN(endDate.getTime()) ? endDate.toISOString() : '';
        }
      } catch {
        dateEnd = '';
      }
      dateDuration = dateObj.duration || '';
    } else if (game.date instanceof Date) {
      try {
        dateStart = game.date.toISOString();
      } catch {
        dateStart = '';
      }
    }
  } else if (typeof game.date === 'string') {
    try {
      dateStart = new Date(game.date).toISOString();
    } catch {
      dateStart = '';
    }
  }

  // Handle the case where date is a string in the external API response
  if (!dateStart && typeof game.date === 'string') {
    try {
      dateStart = new Date(game.date).toISOString();
    } catch {
      dateStart = '';
    }
  }

  return {
    id: game.id,
    date: {
      start: dateStart,
      end: dateEnd || null,
      duration: dateDuration || null,
    },
    status: {
      long:
        typeof game.status === 'string'
          ? game.status
          : (game.status as { long?: string })?.long || '',
      short:
        typeof game.status === 'string'
          ? game.status
          : (game.status as { short?: string })?.short || '',
      clock:
        typeof game.status === 'string'
          ? null
          : (game.status as { clock?: string | null })?.clock || null,
      halftime:
        typeof game.status === 'string'
          ? false
          : (game.status as { halftime?: boolean })?.halftime || false,
    },
    arena: {
      name: typeof arenaData === 'string' ? arenaData : arenaData?.name || '',
      city: typeof arenaData === 'string' ? '' : arenaData?.city || '',
      state: typeof arenaData === 'string' ? undefined : arenaData?.state || undefined,
      country: typeof arenaData === 'string' ? undefined : arenaData?.country || undefined,
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
  logger.error(`Error in ${context}:`, error);
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
