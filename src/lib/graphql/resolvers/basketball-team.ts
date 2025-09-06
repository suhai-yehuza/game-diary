import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { TARGET_TYPES } from '@/lib/constants';
import { db } from '@/lib/db';
import { basketball_teams, publicComments, publicReactions } from '@/lib/db/schema';
import type { GraphQLContext } from '@/types';

// Team Query Resolvers
export const teamQueryResolvers = {
  // Get team by ID
  team: async (_parent: unknown, args: { id: string }, _context: GraphQLContext) => {
    const team = await db()?.query.basketball_teams.findFirst({
      where: eq(basketball_teams.id, args.id),
    });

    if (!team) {
      return null;
    }

    // Return optimized team data - JSONB fields contain comprehensive information
    // No need for separate queries when JSONB fields are available
    return {
      id: team.id,
      name: team.name,
      nickname: team.nickname,
      code: team.code,
      city: team.city,
      logo: team.logo,
      all_star: team.all_star,
      nba_franchise: team.nba_franchise,
      conference: team.conference,
      leagues: team.leagues,
      created_at: team.created_at,
      updated_at: team.updated_at,
    };
  },

  // Get basketball_teams with filters and pagination
  basketball_teams: async (
    _parent: unknown,
    args: {
      filters?: {
        searchTerm?: string;
        conferenceFilter?: string;
        divisionFilter?: string;
        leagueFilter?: string;
        sortBy?: string;
        sortDirection?: string;
      };
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    _context: GraphQLContext
  ) => {
    const { filters, pagination } = args;
    const limit = pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    const whereConditions = [];

    // Search term - search in name, nickname, city, or code
    if (filters?.searchTerm?.trim()) {
      const term = `%${filters.searchTerm.trim()}%`;
      whereConditions.push(
        or(
          ilike(basketball_teams.name, term),
          ilike(basketball_teams.nickname, term),
          ilike(basketball_teams.city, term),
          ilike(basketball_teams.code, term)
        )
      );
    }

    // Conference filter - search in conference field or leagues JSONB
    if (filters?.conferenceFilter && filters.conferenceFilter !== 'all') {
      whereConditions.push(
        or(
          ilike(basketball_teams.conference, `%${filters.conferenceFilter}%`),
          ilike(basketball_teams.leagues, `%${filters.conferenceFilter}%`)
        )
      );
    }

    // Division filter - search in leagues JSONB
    if (filters?.divisionFilter && filters.divisionFilter !== 'all') {
      whereConditions.push(ilike(basketball_teams.leagues, `%${filters.divisionFilter}%`));
    }

    // League filter - search in leagues JSONB
    if (filters?.leagueFilter && filters.leagueFilter !== 'all') {
      whereConditions.push(ilike(basketball_teams.leagues, `%${filters.leagueFilter}%`));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Build ORDER BY clause
    let orderBy;
    switch (filters?.sortBy) {
      case 'name':
        orderBy = [
          filters.sortDirection === 'desc' ? desc(basketball_teams.name) : basketball_teams.name,
        ];
        break;
      case 'city':
        orderBy = [
          filters.sortDirection === 'desc' ? desc(basketball_teams.city) : basketball_teams.city,
        ];
        break;
      case 'conference':
        orderBy = [
          filters.sortDirection === 'desc'
            ? desc(basketball_teams.conference)
            : basketball_teams.conference,
        ];
        break;
      default:
        orderBy = [basketball_teams.name];
    }

    // Get the paginated results
    const basketball_teamsData = await db()?.query.basketball_teams.findMany({
      where: whereClause,
      limit,
      orderBy,
    });

    // No need to fetch additional data separately - JSONB fields contain comprehensive information

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(basketball_teams)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      basketball_teamsData?.map(team => ({
        cursor: team.id,
        node: {
          id: team.id,
          name: team.name,
          nickname: team.nickname,
          code: team.code,
          city: team.city,
          logo: team.logo,
          all_star: team.all_star,
          nba_franchise: team.nba_franchise,
          conference: team.conference,
          leagues: team.leagues,
          created_at: team.created_at,
          updated_at: team.updated_at,
        },
      })) || [];

    return {
      edges,
      pageInfo: {
        hasNextPage: edges.length === limit,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: totalCount,
    };
  },
};

// Team Type Resolvers
export const teamResolver = {
  // Get public comments for a team
  publicComments: async (
    parent: { id: string },
    args: {
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    _context: GraphQLContext
  ) => {
    const limit = args.pagination?.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;

    const comments = await db()?.query.publicComments.findMany({
      where: and(
        eq(publicComments.parent_id, parent.id),
        eq(publicComments.parent_type, TARGET_TYPES.BASKETBALL_TEAM)
      ),
      limit,
      orderBy: [desc(publicComments.created_at)],
      with: {
        user: true,
      },
    });

    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicComments)
      .where(
        and(
          eq(publicComments.parent_id, parent.id),
          eq(publicComments.parent_type, TARGET_TYPES.BASKETBALL_TEAM)
        )
      );
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      comments?.map(comment => ({
        cursor: comment.id,
        node: {
          id: comment.id,
          content: comment.content,
          user: comment.user
            ? {
                id: comment.user.id,
                username: comment.user.username,
                first_name: comment.user.first_name,
                last_name: comment.user.last_name,
                image_url: comment.user.image_url,
              }
            : null,
          user_id: comment.user_id,
          anonymous_name: comment.anonymous_name,
          anonymous_email: comment.anonymous_email,
          parent_id: comment.parent_id,
          parent_type: comment.parent_type,
          depth: comment.depth,
          is_approved: comment.is_approved,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          deleted_at: comment.deleted_at,
        },
      })) || [];

    return {
      edges,
      pageInfo: {
        hasNextPage: edges.length === limit,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: totalCount,
    };
  },

  // Get total public comment count for a team
  totalPublicCommentCount: async (
    parent: { id: string },
    _args: unknown,
    _context: GraphQLContext
  ) => {
    const result = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicComments)
      .where(
        and(
          eq(publicComments.parent_id, parent.id),
          eq(publicComments.parent_type, TARGET_TYPES.BASKETBALL_TEAM)
        )
      );
    return result?.[0]?.count ?? 0;
  },

  // Get public reactions for a team
  publicReactions: async (parent: { id: string }, _args: unknown, _context: GraphQLContext) => {
    const reactions = await db()?.query.publicReactions.findMany({
      where: and(
        eq(publicReactions.target_id, parent.id),
        eq(publicReactions.target_type, TARGET_TYPES.BASKETBALL_TEAM)
      ),
      with: {
        user: true,
      },
    });

    return (
      reactions?.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        user: reaction.user
          ? {
              id: reaction.user.id,
              username: reaction.user.username,
              first_name: reaction.user.first_name,
              last_name: reaction.user.last_name,
              image_url: reaction.user.image_url,
            }
          : null,
        user_id: reaction.user_id,
        anonymous_name: reaction.anonymous_name,
        anonymous_email: reaction.anonymous_email,
        target_id: reaction.target_id,
        target_type: reaction.target_type,
        is_approved: reaction.is_approved,
        created_at: reaction.created_at,
        updated_at: reaction.updated_at,
        deleted_at: reaction.deleted_at,
      })) || []
    );
  },

  // Get total public reaction count for a team
  totalPublicReactionCount: async (
    parent: { id: string },
    _args: unknown,
    _context: GraphQLContext
  ) => {
    const result = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(publicReactions)
      .where(
        and(
          eq(publicReactions.target_id, parent.id),
          eq(publicReactions.target_type, TARGET_TYPES.BASKETBALL_TEAM)
        )
      );
    return result?.[0]?.count ?? 0;
  },
};
