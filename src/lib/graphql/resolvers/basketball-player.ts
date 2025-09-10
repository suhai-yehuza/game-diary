import { eq, and, desc, sql, ilike, or } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { basketball_players, publicComments, publicReactions } from '@/lib/db/schema';
import { mapUserForGraphQL } from '@/lib/graphql/resolvers/utils/user-mapping';
import type { GraphQLContext } from '@/types';

// NBA Player Query Resolvers
export const nbaPlayerQueryResolvers = {
  // Get NBA player by ID
  nbaPlayer: async (_parent: unknown, args: { id: string }, _context: GraphQLContext) => {
    const player = await db()?.query.basketball_players.findFirst({
      where: eq(basketball_players.id, args.id),
    });

    if (!player) {
      return null;
    }

    // Return optimized player data - JSONB fields contain comprehensive information
    // No need for separate queries when JSONB fields are available
    return {
      id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      birth: player.birth,
      nba: player.nba,
      height: player.height,
      weight: player.weight,
      college: player.college,
      affiliation: player.affiliation,
      teams: player.teams,
      leagues: player.leagues,
      image_url: player.image_url,
      created_at: player.created_at,
      updated_at: player.updated_at,
    };
  },

  // Get NBA players with filters and pagination
  nbaPlayers: async (
    _parent: unknown,
    args: {
      filters?: {
        searchTerm?: string;
        positionFilter?: string;
        teamFilter?: string;
        collegeFilter?: string;
        countryFilter?: string;
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

    // Search term - search in first name, last name, or college
    if (filters?.searchTerm?.trim()) {
      const term = `%${filters.searchTerm.trim()}%`;
      whereConditions.push(
        or(
          ilike(basketball_players.first_name, term),
          ilike(basketball_players.last_name, term),
          ilike(basketball_players.college, term)
        )
      );
    }

    // College filter
    if (filters?.collegeFilter && filters.collegeFilter !== 'all') {
      whereConditions.push(ilike(basketball_players.college, `%${filters.collegeFilter}%`));
    }

    // Position filter - search in leagues JSON
    if (filters?.positionFilter && filters.positionFilter !== 'all') {
      whereConditions.push(ilike(basketball_players.leagues, `%${filters.positionFilter}%`));
    }

    // Team filter - search in teams JSON
    if (filters?.teamFilter && filters.teamFilter !== 'all') {
      whereConditions.push(ilike(basketball_players.teams, `%${filters.teamFilter}%`));
    }

    // Country filter - search in birth JSON for country
    if (filters?.countryFilter && filters.countryFilter !== 'all') {
      whereConditions.push(ilike(basketball_players.birth, `%${filters.countryFilter}%`));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Build ORDER BY clause
    let orderBy;
    switch (filters?.sortBy) {
      case 'name':
        orderBy = [
          filters.sortDirection === 'desc'
            ? desc(basketball_players.last_name)
            : basketball_players.last_name,
          filters.sortDirection === 'desc'
            ? desc(basketball_players.first_name)
            : basketball_players.first_name,
        ];
        break;
      case 'college':
        orderBy = [
          filters.sortDirection === 'desc'
            ? desc(basketball_players.college)
            : basketball_players.college,
        ];
        break;
      default:
        orderBy = [basketball_players.last_name, basketball_players.first_name];
    }

    // Get the paginated results
    const players = await db()?.query.basketball_players.findMany({
      where: whereClause,
      limit,
      orderBy,
    });

    // No need to fetch additional data separately - JSONB fields contain comprehensive information

    // Get the total count for pagination
    const totalCountResult = await db()
      ?.select({ count: sql<number>`count(*)` })
      .from(basketball_players)
      .where(whereClause ?? undefined);
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      players?.map(player => ({
        cursor: player.id,
        node: {
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          birth: player.birth,
          nba: player.nba,
          height: player.height,
          weight: player.weight,
          college: player.college,
          affiliation: player.affiliation,
          teams: player.teams,
          leagues: player.leagues,
          image_url: player.image_url,
          created_at: player.created_at,
          updated_at: player.updated_at,
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

// NBA Player Type Resolvers
export const nbaPlayerResolver = {
  // Get public comments for a player
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
        eq(publicComments.parent_type, 'BASKETBALL_PLAYER')
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
          eq(publicComments.parent_type, 'BASKETBALL_PLAYER')
        )
      );
    const totalCount = totalCountResult?.[0]?.count ?? 0;

    const edges =
      comments?.map(comment => ({
        cursor: comment.id,
        node: {
          id: comment.id,
          content: comment.content,
          user: mapUserForGraphQL(comment.user),
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

  // Get total public comment count for a player
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
          eq(publicComments.parent_type, 'BASKETBALL_PLAYER')
        )
      );
    return result?.[0]?.count ?? 0;
  },

  // Get public reactions for a player
  publicReactions: async (parent: { id: string }, _args: unknown, _context: GraphQLContext) => {
    const reactions = await db()?.query.publicReactions.findMany({
      where: and(
        eq(publicReactions.target_id, parent.id),
        eq(publicReactions.target_type, 'BASKETBALL_PLAYER')
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

  // Get total public reaction count for a player
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
          eq(publicReactions.target_type, 'BASKETBALL_PLAYER')
        )
      );
    return result?.[0]?.count ?? 0;
  },
};
