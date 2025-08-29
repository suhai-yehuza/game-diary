import { sql } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { AuthorizationError } from '@/lib/graphql/errors';
import { FRIENDSHIP_STATUS, CLASSIFICATION } from '@/lib/types';
import type { GraphQLContext } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

// Optimized Game Log Query Resolvers
export const optimizedGameLogQueryResolvers = {
  // Optimized game logs query with single JOIN query
  gameLogs: async (
    _parent: unknown,
    args: {
      filters?: {
        userId?: string;
        gameId?: string;
        dateRange?: { start: Date; end?: Date };
        classification?: string;
        search?: string;
        searchText?: string;
        minRating?: number;
        maxRating?: number;
        watchedSetting?: string;
        watchedLocation?: string;
        tags?: string[];
        hasNotes?: boolean;
        watchedDateRange?: { start: Date; end?: Date };
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
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { filters, pagination } = args;
    const limit = pagination?.first ?? API_CONFIG.pagination.DEFAULT_GAME_LOG_PAGE_SIZE;

    // Build WHERE conditions
    const whereConditions = ['gl.deleted_at IS NULL'];

    if (filters?.userId) {
      whereConditions.push(`gl.user_id = '${filters.userId}'`);
    }

    if (filters?.gameId) {
      whereConditions.push(`gl.game_id = '${filters.gameId}'`);
    }

    if (filters?.classification) {
      whereConditions.push(`gl.classification = '${filters.classification}'`);
    }

    if (filters?.minRating) {
      whereConditions.push(`gl.rating_for_game >= ${filters.minRating}`);
    }

    if (filters?.maxRating) {
      whereConditions.push(`gl.rating_for_game <= ${filters.maxRating}`);
    }

    if (filters?.watchedSetting) {
      whereConditions.push(`gl.watched_setting = '${filters.watchedSetting}'`);
    }

    if (filters?.hasNotes) {
      whereConditions.push(`gl.notes IS NOT NULL AND gl.notes != ''`);
    }

    // Add cursor condition for pagination
    if (pagination?.after) {
      whereConditions.push(
        `gl.created_at < (SELECT created_at FROM game_logs WHERE id = '${pagination.after}')`
      );
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count first
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM game_logs gl
      ${whereClause}
    `;

    const totalCountResult = await db()?.execute(sql.raw(countQuery));
    const totalCount = parseInt(
      (totalCountResult?.rows?.[0] as { total_count?: string })?.total_count || '0'
    );

    // Main optimized query with JOINs
    const mainQuery = `
      SELECT
        gl.id,
        gl.user_id,
        gl.game_id,
        gl.rating_for_game,
        gl.notes,
        gl.tags,
        gl.watched_date,
        gl.watched_setting,
        gl.watched_location,
        gl.watched_scope,
        gl.classification,
        gl.created_at,
        gl.updated_at,
        gl.deleted_at,

        -- User data
        u.id as user_id_full,
        u.username,
        u.first_name,
        u.last_name,
        u.image_url,

        -- Game data
        g.id as game_id_full,
        g.date as game_date,
        g.status as game_status,
        g.game_type,
        g.nba_game_id,
        g.home_team_id,
        g.away_team_id,
        g.home_team_score,
        g.away_team_score,
        g.average_rating,
        g.total_ratings,
        g.created_at as game_created_at,
        g.updated_at as game_updated_at,

        -- Home team data
        ht.id as ht_id,
        ht.name as ht_name,
        ht.nickname as ht_nickname,
        ht.code as ht_code,
        ht.city as ht_city,
        ht.logo as ht_logo,
        ht.all_star as ht_all_star,
        ht.nba_franchise as ht_nba_franchise,
        ht.conference as ht_conference,
        ht.created_at as ht_created_at,
        ht.updated_at as ht_updated_at,

        -- Away team data
        at.id as at_id,
        at.name as at_name,
        at.nickname as at_nickname,
        at.code as at_code,
        at.city as at_city,
        at.logo as at_logo,
        at.all_star as at_all_star,
        at.nba_franchise as at_nba_franchise,
        at.conference as at_conference,
        at.created_at as at_created_at,
        at.updated_at as at_updated_at
      FROM game_logs gl
      LEFT JOIN users u ON gl.user_id = u.id
      LEFT JOIN nba_games g ON gl.game_id = g.id
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      ${whereClause}
      ORDER BY gl.created_at DESC
      LIMIT ${limit + 1}
    `;

    const startTime = Date.now();
    const result = await db()?.execute(sql.raw(mainQuery));
    const queryDuration = Date.now() - startTime;

    // Log slow queries
    if (queryDuration > 1000) {
      console.warn(`Slow game logs query detected: ${queryDuration}ms`);
    }

    const rows = result?.rows || [];
    const hasNextPage = rows.length > limit;
    const paginatedRows = hasNextPage ? rows.slice(0, limit) : rows;

    // Transform the flat result into the expected GraphQL structure
    const edges = paginatedRows.map(row => ({
      cursor: row.id,
      node: {
        id: row.id,
        game_id: row.game_id,
        rating_for_game: row.rating_for_game,
        notes: row.notes,
        tags: row.tags || [],
        watched_date: row.watched_date ? new Date(row.watched_date as string) : undefined,
        watched_setting: row.watched_setting,
        watched_location: row.watched_location,
        watched_scope: row.watched_scope,
        classification: row.classification,
        created_at: row.created_at ? new Date(row.created_at as string) : undefined,
        updated_at: row.updated_at ? new Date(row.updated_at as string) : undefined,
        deleted_at: row.deleted_at ? new Date(row.deleted_at as string) : undefined,
        user: {
          id: row.user_id_full || '',
          username: row.username || '',
          first_name: row.first_name || '',
          last_name: row.last_name || '',
          email_address: null,
          phone_number: null,
          image_url: row.image_url || null,
        },
        game: row.game_id_full
          ? {
              id: row.game_id_full,
              date: row.game_date ? new Date(row.game_date as string) : undefined,
              status: row.game_status,
              game_type: row.game_type,
              nba_game_id: row.nba_game_id,
              home_team_id: row.home_team_id,
              away_team_id: row.away_team_id,
              home_team: row.ht_id
                ? {
                    id: row.ht_id,
                    name: row.ht_name,
                    nickname: row.ht_nickname,
                    code: row.ht_code,
                    city: row.ht_city,
                    logo: row.ht_logo,
                    all_star: row.ht_all_star,
                    nba_franchise: row.ht_nba_franchise,
                    conference: row.ht_conference,
                    created_at: row.ht_created_at
                      ? new Date(row.ht_created_at as string)
                      : undefined,
                    updated_at: row.ht_updated_at
                      ? new Date(row.ht_updated_at as string)
                      : undefined,
                  }
                : null,
              away_team: row.at_id
                ? {
                    id: row.at_id,
                    name: row.at_name,
                    nickname: row.at_nickname,
                    code: row.at_code,
                    city: row.at_city,
                    logo: row.at_logo,
                    all_star: row.at_all_star,
                    nba_franchise: row.at_nba_franchise,
                    conference: row.at_conference,
                    created_at: row.at_created_at
                      ? new Date(row.at_created_at as string)
                      : undefined,
                    updated_at: row.at_updated_at
                      ? new Date(row.at_updated_at as string)
                      : undefined,
                  }
                : null,
              home_team_score: row.home_team_score,
              away_team_score: row.away_team_score,
              average_rating: row.average_rating ? Number(row.average_rating) : undefined,
              total_ratings: row.total_ratings,
              created_at: row.game_created_at ? new Date(row.game_created_at as string) : undefined,
              updated_at: row.game_updated_at ? new Date(row.game_updated_at as string) : undefined,
            }
          : null,
        totalCommentCount: 0, // Will be fetched separately if needed
        totalReactionCount: 0, // Will be fetched separately if needed
      },
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!pagination?.after,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount,
    };
  },

  // Optimized friends game logs query
  friendsGameLogs: async (
    _parent: unknown,
    args: {
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { pagination } = args;
    const limit = pagination?.first ?? API_CONFIG.pagination.DEFAULT_GAME_LOG_PAGE_SIZE;

    try {
      // Single query to get friends' game logs with all related data
      const friendsGameLogsQuery = `
        SELECT
          gl.id,
          gl.user_id,
          gl.game_id,
          gl.rating_for_game,
          gl.notes,
          gl.tags,
          gl.watched_date,
          gl.watched_setting,
          gl.watched_location,
          gl.watched_scope,
          gl.classification,
          gl.created_at,
          gl.updated_at,
          gl.deleted_at,

          -- User data
          u.id as user_id_full,
          u.username,
          u.first_name,
          u.last_name,
          u.image_url,

          -- Game data
          g.id as game_id_full,
          g.date as game_date,
          g.status as game_status,
          g.game_type,
          g.nba_game_id,
          g.home_team_id,
          g.away_team_id,
          g.home_team_score,
          g.away_team_score,
          g.average_rating,
          g.total_ratings,
          g.created_at as game_created_at,
          g.updated_at as game_updated_at,

          -- Home team data
          ht.id as ht_id,
          ht.name as ht_name,
          ht.nickname as ht_nickname,
          ht.code as ht_code,
          ht.city as ht_city,
          ht.logo as ht_logo,
          ht.all_star as ht_all_star,
          ht.nba_franchise as ht_nba_franchise,
          ht.conference as ht_conference,
          ht.created_at as ht_created_at,
          ht.updated_at as ht_updated_at,

          -- Away team data
          at.id as at_id,
          at.name as at_name,
          at.nickname as at_nickname,
          at.code as at_code,
          at.city as at_city,
          at.logo as at_logo,
          at.all_star as at_all_star,
          at.nba_franchise as at_nba_franchise,
          at.conference as at_conference,
          at.created_at as at_created_at,
          at.updated_at as at_updated_at
        FROM game_logs gl
        LEFT JOIN users u ON gl.user_id = u.id
        LEFT JOIN nba_games g ON gl.game_id = g.id
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        WHERE gl.deleted_at IS NULL
          AND gl.classification = '${CLASSIFICATION.PROTECTED}'
          AND gl.user_id IN (
            SELECT DISTINCT
              CASE
                WHEN f.user_id = '${context.user.id}' THEN f.friend_id
                WHEN f.friend_id = '${context.user.id}' THEN f.user_id
              END
            FROM friendships f
            WHERE f.status = '${FRIENDSHIP_STATUS.ACCEPTED}'
              AND (f.user_id = '${context.user.id}' OR f.friend_id = '${context.user.id}')
          )
          ${pagination?.after ? `AND gl.created_at < (SELECT created_at FROM game_logs WHERE id = '${pagination.after}')` : ''}
        ORDER BY gl.created_at DESC
        LIMIT ${limit + 1}
      `;

      const startTime = Date.now();
      const result = await db()?.execute(sql.raw(friendsGameLogsQuery));
      const queryDuration = Date.now() - startTime;

      if (queryDuration > 1000) {
        console.warn(`Slow friends game logs query detected: ${queryDuration}ms`);
      }

      const rows = result?.rows || [];
      const hasNextPage = rows.length > limit;
      const paginatedRows = hasNextPage ? rows.slice(0, limit) : rows;

      // Get total count
      const totalCountQuery = `
        SELECT COUNT(*) as total_count
        FROM game_logs gl
        WHERE gl.deleted_at IS NULL
          AND gl.classification = '${CLASSIFICATION.PROTECTED}'
          AND gl.user_id IN (
            SELECT DISTINCT
              CASE
                WHEN f.user_id = '${context.user.id}' THEN f.friend_id
                WHEN f.friend_id = '${context.user.id}' THEN f.user_id
              END
            FROM friendships f
            WHERE f.status = '${FRIENDSHIP_STATUS.ACCEPTED}'
              AND (f.user_id = '${context.user.id}' OR f.friend_id = '${context.user.id}')
          )
      `;

      const totalCountResult = await db()?.execute(sql.raw(totalCountQuery));
      const totalCount = parseInt(
        (totalCountResult?.rows?.[0] as { total_count?: string })?.total_count || '0'
      );

      const edges = paginatedRows.map(row => ({
        cursor: row.id,
        node: {
          id: row.id,
          game_id: row.game_id,
          rating_for_game: row.rating_for_game,
          notes: row.notes,
          tags: row.tags || [],
          watched_date: row.watched_date ? new Date(row.watched_date as string) : undefined,
          watched_setting: row.watched_setting,
          watched_location: row.watched_location,
          watched_scope: row.watched_scope,
          classification: row.classification,
          created_at: row.created_at ? new Date(row.created_at as string) : undefined,
          updated_at: row.updated_at ? new Date(row.updated_at as string) : undefined,
          deleted_at: row.deleted_at ? new Date(row.deleted_at as string) : undefined,
          user: {
            id: row.user_id_full || '',
            username: row.username || '',
            first_name: row.first_name || '',
            last_name: row.last_name || '',
            email_address: null,
            phone_number: null,
            image_url: row.image_url || null,
          },
          game: row.game_id_full
            ? {
                id: row.game_id_full,
                date: row.game_date ? new Date(row.game_date as string) : undefined,
                status: row.game_status,
                game_type: row.game_type,
                nba_game_id: row.nba_game_id,
                home_team_id: row.home_team_id,
                away_team_id: row.away_team_id,
                home_team: row.ht_id
                  ? {
                      id: row.ht_id,
                      name: row.ht_name,
                      nickname: row.ht_nickname,
                      code: row.ht_code,
                      city: row.ht_city,
                      logo: row.ht_logo,
                      all_star: row.ht_all_star,
                      nba_franchise: row.ht_nba_franchise,
                      conference: row.ht_conference,
                      created_at: row.ht_created_at
                        ? new Date(row.ht_created_at as string)
                        : undefined,
                      updated_at: row.ht_updated_at
                        ? new Date(row.ht_updated_at as string)
                        : undefined,
                    }
                  : null,
                away_team: row.at_id
                  ? {
                      id: row.at_id,
                      name: row.at_name,
                      nickname: row.at_nickname,
                      code: row.at_code,
                      city: row.at_city,
                      logo: row.at_logo,
                      all_star: row.at_all_star,
                      nba_franchise: row.at_nba_franchise,
                      conference: row.at_conference,
                      created_at: row.at_created_at
                        ? new Date(row.at_created_at as string)
                        : undefined,
                      updated_at: row.at_updated_at
                        ? new Date(row.at_updated_at as string)
                        : undefined,
                    }
                  : null,
                home_team_score: row.home_team_score,
                away_team_score: row.away_team_score,
                average_rating: row.average_rating ? Number(row.average_rating) : undefined,
                total_ratings: row.total_ratings,
                created_at: row.game_created_at
                  ? new Date(row.game_created_at as string)
                  : undefined,
                updated_at: row.game_updated_at
                  ? new Date(row.game_updated_at as string)
                  : undefined,
              }
            : null,
          totalCommentCount: 0,
          totalReactionCount: 0,
        },
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!pagination?.after,
          startCursor: edges[0]?.cursor || null,
          endCursor: edges[edges.length - 1]?.cursor || null,
        },
        totalCount,
      };
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'GraphQL Resolver',
        action: 'Fetch optimized friends game logs',
      });
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
  },
};
