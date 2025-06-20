import { and, eq, gt, lt, or, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

import * as schema from '@src/lib/db/schema';
import { BusinessLogicError } from '@src/lib/graphql/errors';
import { createConnection, handleResolverError } from '@src/lib/graphql/utils';
import type { IContext, IPaginationArgs, IPlayerFilters } from '@src/lib/types';

// Helper function to map player data
const mapPlayerData = (player: InferSelectModel<typeof schema.nba_players>) => ({
  id: player.id,
  firstName: player.firstName,
  lastName: player.lastName,
  birth: player.birth,
  nba: player.nba,
  height: player.height,
  weight: player.weight,
  college: player.college,
  affiliation: player.affiliation,
  jersey: player.jersey,
  active: player.active,
  position: player.pos,
  seasonsActive: player.seasonsActive,
  createdAt: player.createdAt,
  updatedAt: player.updatedAt,
  // Initialize empty arrays for related data
  stats: [],
  games: [],
});

export const players = async (
  _parent: unknown,
  args: IPaginationArgs & { filters?: IPlayerFilters },
  { db }: IContext
) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const { first = 10, after, last, before, filters } = args;

    // Build the query
    const conditions = [];
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${schema.nba_players.firstName} ILIKE ${searchTerm}`,
          sql`${schema.nba_players.lastName} ILIKE ${searchTerm}`
        )
      );
    }
    if (filters?.teamId) {
      conditions.push(eq(schema.nba_players.id, filters.teamId));
    }
    if (filters?.position) {
      conditions.push(eq(schema.nba_players.pos, filters.position));
    }
    if (filters?.active !== undefined) {
      if (filters.active !== null) {
        conditions.push(eq(schema.nba_players.active, filters.active));
      }
    }
    if (after) {
      conditions.push(gt(schema.nba_players.id, after));
    }
    if (before) {
      conditions.push(lt(schema.nba_players.id, before));
    }

    const limit = last || first || 10;
    const query = db
      .select()
      .from(schema.nba_players)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.nba_players.lastName)
      .limit(limit + 1);

    // Execute query
    const items = await query;

    // Check if there are more items
    const hasNextPage = items.length > limit;
    const actualItems = hasNextPage ? items.slice(0, -1) : items;

    const mappedPlayers = actualItems.map(mapPlayerData);

    return createConnection(mappedPlayers, actualItems.length, args);
  } catch (error) {
    handleResolverError(error, 'fetch players');
  }
};

export const player = async (_parent: unknown, { id }: { id: string }, { db }: IContext) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const player = await db
      .select()
      .from(schema.nba_players)
      .where(eq(schema.nba_players.id, id))
      .limit(1)
      .then((rows: InferSelectModel<typeof schema.nba_players>[]) => rows[0]);

    if (!player) throw new BusinessLogicError(`Player with id ${id} not found`, 'PLAYER_NOT_FOUND');

    return mapPlayerData(player);
  } catch (error) {
    handleResolverError(error, 'fetch player');
  }
};

export const playerStats = async (
  _parent: unknown,
  { playerId, gameId }: { playerId: string; gameId: string },
  { db }: IContext
) => {
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    const stats = await db
      .select()
      .from(schema.nba_player_stats)
      .where(
        and(
          eq(schema.nba_player_stats.playerId, playerId),
          eq(schema.nba_player_stats.gameId, gameId)
        )
      )
      .limit(1)
      .then((rows: InferSelectModel<typeof schema.nba_player_stats>[]) => rows[0]);

    if (!stats) {
      return {
        playerId,
        gameId,
        points: 0,
        assists: 0,
        rebounds: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fouls: 0,
        minutes: '0:00',
        fieldGoals: { made: 0, attempted: 0, percentage: '0.000' },
        threePointers: { made: 0, attempted: 0, percentage: '0.000' },
        freeThrows: { made: 0, attempted: 0, percentage: '0.000' },
      };
    }

    return {
      playerId: stats.playerId,
      gameId: stats.gameId,
      points: stats.points,
      assists: stats.assists,
      rebounds: stats.rebounds,
      steals: stats.steals,
      blocks: stats.blocks,
      turnovers: stats.turnovers,
      fouls: stats.fouls,
      minutes: stats.minutes,
      fieldGoals: {
        made: stats.fieldGoalsMade,
        attempted: stats.fieldGoalsAttempted,
        percentage:
          stats.fieldGoalsMade && stats.fieldGoalsAttempted
            ? ((stats.fieldGoalsMade / stats.fieldGoalsAttempted) * 100).toFixed(3)
            : '0.000',
      },
      threePointers: {
        made: stats.threePointersMade,
        attempted: stats.threePointersAttempted,
        percentage:
          stats.threePointersMade && stats.threePointersAttempted
            ? ((stats.threePointersMade / stats.threePointersAttempted) * 100).toFixed(3)
            : '0.000',
      },
      freeThrows: {
        made: stats.freeThrowsMade,
        attempted: stats.freeThrowsAttempted,
        percentage:
          stats.freeThrowsMade && stats.freeThrowsAttempted
            ? ((stats.freeThrowsMade / stats.freeThrowsAttempted) * 100).toFixed(3)
            : '0.000',
      },
    };
  } catch (error) {
    handleResolverError(error, 'fetch player stats');
  }
};
