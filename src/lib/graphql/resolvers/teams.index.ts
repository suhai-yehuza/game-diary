import { and, eq, gt, lt, or, sql, type InferSelectModel } from 'drizzle-orm';

import * as schema from '@/lib/db/schema';
import { BusinessLogicError } from '@/lib/graphql/errors';
import { createConnection } from '@/lib/graphql/utils';
import type { Context } from '@/lib/types/component.types';
import type { PaginationArgs, TeamFilters } from '@/lib/types/resolver.types';

import { handleResolverError } from '../utils';

// Helper function to map team data
const mapTeamData = (team: InferSelectModel<typeof schema.teams>) => ({
  id: team.id,
  name: team.name,
  city: team.city,
  state: team.state,
  country: team.country,
  conference: team.conference,
  division: team.division,
  logoUrl: team.logoUrl,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
  // Additional fields for GraphQL type
  code: team.code,
  logo: team.logoUrl,
  nickname: team.name,
  // Initialize empty arrays for related data
  players: [],
  homeGames: [],
  awayGames: [],
  h2hRecords: [],
});

export const teams = async (
  _parent: unknown,
  args: PaginationArgs & { filters?: TeamFilters },
  { db }: Context
) => {
  try {
    const { first = 10, after, last, before, filters } = args;

    // Build the query
    const conditions = [];
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${schema.teams.name} ILIKE ${searchTerm}`,
          sql`${schema.teams.city} ILIKE ${searchTerm}`,
          sql`${schema.teams.code} ILIKE ${searchTerm}`
        )
      );
    }
    if (filters?.conference) {
      conditions.push(eq(schema.teams.conference, filters.conference));
    }
    if (filters?.division) {
      conditions.push(eq(schema.teams.division, filters.division));
    }
    if (filters?.city) {
      conditions.push(eq(schema.teams.city, filters.city));
    }
    if (filters?.code) {
      conditions.push(eq(schema.teams.code, filters.code));
    }
    if (after) {
      conditions.push(gt(schema.teams.id, after));
    }
    if (before) {
      conditions.push(lt(schema.teams.id, before));
    }

    const limit = last || first || 10;
    const query = db
      .select()
      .from(schema.teams)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.teams.name)
      .limit(limit + 1);

    // Execute query
    const items = await query;

    // Check if there are more items
    const hasNextPage = items.length > limit;
    const actualItems = hasNextPage ? items.slice(0, -1) : items;

    const mappedTeams = actualItems.map(mapTeamData);

    return createConnection(mappedTeams, actualItems.length, args);
  } catch (error) {
    handleResolverError(error, 'fetch teams');
  }
};

export const team = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  try {
    const team = await db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.id, id))
      .limit(1)
      .then(rows => rows[0]);

    if (!team) throw new BusinessLogicError(`Team with id ${id} not found`, 'TEAM_NOT_FOUND');

    return mapTeamData(team);
  } catch (error) {
    handleResolverError(error, 'fetch team');
  }
};

export const teamH2H = async (
  _parent: unknown,
  { teamId, opponentId }: { teamId: string; opponentId: string },
  { db }: Context
) => {
  try {
    const h2h = await db
      .select()
      .from(schema.team_h2h)
      .where(
        and(
          or(
            and(eq(schema.team_h2h.team1Id, teamId), eq(schema.team_h2h.team2Id, opponentId)),
            and(eq(schema.team_h2h.team1Id, opponentId), eq(schema.team_h2h.team2Id, teamId))
          )
        )
      )
      .limit(1)
      .then(rows => rows[0]);

    if (!h2h) {
      return {
        teamId,
        opponentId,
        wins: 0,
        losses: 0,
        winPercentage: '0.000',
        lastTenGames: [],
      };
    }

    return {
      teamId: h2h.team1Id,
      opponentId: h2h.team2Id,
      wins: h2h.team1Wins,
      losses: h2h.team2Wins,
      winPercentage: (h2h.team1Wins / (h2h.team1Wins + h2h.team2Wins)).toFixed(3),
      lastTenGames: h2h.last5Games || [],
    };
  } catch (error) {
    handleResolverError(error, 'fetch team head-to-head record');
  }
};
