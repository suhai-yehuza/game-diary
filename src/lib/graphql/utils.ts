import type { IGameScores } from '@/lib/types/game.types';
import { logger } from '@lib/core/logger';
import { getCache } from '@src/lib/cache';
import { BusinessLogicError } from '@src/lib/graphql/errors';
import { CACHE_TTL } from '@src/lib/types/cache.types';
import { REACTION_EMOJIS } from '@src/lib/types/config.types';
import type { IDatabaseRow } from '@src/lib/types/database.types';
import type { ReactionEmojiType } from '@src/lib/types/generated/graphql';
import type { IEdge, IPageInfo, IConnection, IConnectionArgs } from '@src/lib/types/misc.types';
import type { IPaginationArgs } from '@src/lib/types/resolver.types';

/**
 * Parse connection arguments and return pagination parameters
 */
export function parsePaginationArgs(args: IPaginationArgs): {
  limit: number;
  offset: number;
  isForward: boolean;
} {
  const { first, after, last, before } = args;

  // Default pagination settings
  const defaultLimit = 1000;
  const maxLimit = 5000;

  if (first !== null && first !== undefined) {
    // Forward pagination
    const limit = Math.min(first, maxLimit);
    const offset = after ? parseCursor(after) : 0;
    return { limit, offset, isForward: true };
  }

  if (last !== null && last !== undefined) {
    // Backward pagination
    const limit = Math.min(last, maxLimit);
    const offset = before ? Math.max(0, parseCursor(before) - limit) : 0;
    return { limit, offset, isForward: false };
  }

  // Default forward pagination
  return { limit: defaultLimit, offset: 0, isForward: true };
}

/**
 * Create a cursor from an offset
 */
export function createCursor(offset: number): string {
  return Buffer.from(offset.toString()).toString('base64');
}

/**
 * Parse a cursor to get the offset
 */
export function parseCursor(cursor: string): number {
  try {
    return parseInt(Buffer.from(cursor, 'base64').toString(), 10);
  } catch {
    return 0;
  }
}

/**
 * Create edges from items with offset-based cursors
 */
export function createEdges<T>(items: T[], offset: number): IEdge<T>[] {
  return items.map((item, index) => ({
    cursor: createCursor(offset + index),
    node: item,
  }));
}

/**
 * Create page info for the connection
 */
export function createPageInfo<T>(
  edges: IEdge<T>[],
  totalCount: number,
  limit: number,
  offset: number,
  isForward: boolean
): IPageInfo {
  const hasNextPage = isForward ? offset + edges.length < totalCount : false;
  const hasPreviousPage = isForward ? offset > 0 : offset + limit < totalCount;

  return {
    hasNextPage,
    hasPreviousPage,
    startCursor: edges.length > 0 ? edges[0].cursor : null,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
  };
}

/**
 * Create a complete connection from items and pagination info
 */
export function createConnection<T>(
  items: T[],
  totalCount: number,
  args: IConnectionArgs
): IConnection<T> {
  const { limit, offset, isForward } = parsePaginationArgs(args);

  // Take only the requested number of items
  const paginatedItems = items.slice(0, limit);

  const edges = createEdges(paginatedItems, offset);
  const pageInfo = createPageInfo<T>(edges, totalCount, limit, offset, isForward);

  return {
    edges,
    pageInfo,
    totalCount,
  };
}

/**
 * Create an empty connection
 */
export function createEmptyConnection<T>(): IConnection<T> {
  return {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 0,
  };
}

// Helper function to convert emoji character back to key
export const getEmojiKey = (emojiCharacter: string): ReactionEmojiType => {
  const entry = Object.entries(REACTION_EMOJIS).find(([, char]) => char === emojiCharacter);
  return (entry?.[0] || emojiCharacter) as ReactionEmojiType;
};

// Helper function to map game data to GraphQL type
export const mapGameData = (game: IDatabaseRow) => {
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
    scores:
      game.scores && typeof game.scores === 'object'
        ? {
            home: {
              win: Number((game.scores as IGameScores).home?.win) || 0,
              loss: Number((game.scores as IGameScores).home?.loss) || 0,
              series: {
                win: Number((game.scores as IGameScores).home?.series?.win) || 0,
                loss: Number((game.scores as IGameScores).home?.series?.loss) || 0,
              },
              linescore: ((game.scores as IGameScores).home?.linescore || []).map(
                (score: number) => {
                  const num = Number(score);
                  return isNaN(num) ? 0 : Math.floor(num);
                }
              ),
              points: Number((game.scores as IGameScores).home?.points) || 0,
            },
            visitors: {
              win: Number((game.scores as IGameScores).visitors?.win) || 0,
              loss: Number((game.scores as IGameScores).visitors?.loss) || 0,
              series: {
                win: Number((game.scores as IGameScores).visitors?.series?.win) || 0,
                loss: Number((game.scores as IGameScores).visitors?.series?.loss) || 0,
              },
              linescore: ((game.scores as IGameScores).visitors?.linescore || []).map(
                (score: number) => {
                  const num = Number(score);
                  return isNaN(num) ? 0 : Math.floor(num);
                }
              ),
              points: Number((game.scores as IGameScores).visitors?.points) || 0,
            },
          }
        : {
            home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
            visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
          },
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
