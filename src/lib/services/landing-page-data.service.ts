import { sql } from 'drizzle-orm';

import { simpleCacheService, CACHE_CONFIG } from '@/lib/cache';
import { db } from '@/lib/db';
import { getGameEngagementQuery } from '@/lib/db/queries';
import { logger } from '@/lib/utils/logger';
import type {
  ITrendingGameLog,
  IRecentGame,
  IPopularGame,
  ILandingPageData,
  IGameTeamsDataService,
  IGameScoresData,
} from '@/types';

/**
 * Service for fetching landing page data
 * Handles database queries and data transformation for the landing page
 */
export class LandingPageDataService {
  private readonly logger = logger;

  /**
   * Debug method to check what data exists in the database
   * This helps diagnose why we're getting empty results
   */
  async debugDatabaseContent(): Promise<{
    totalGameLogs: number;
    publicGameLogs: number;
    totalComments: number;
    totalReactions: number;
    sampleGameLogs: Record<string, unknown>[];
  }> {
    try {
      const database = db();
      if (!database) {
        throw new Error('Database connection not available');
      }

      // Check total game logs
      const totalGameLogsQuery = sql`SELECT COUNT(*) as count FROM game_logs WHERE deleted_at IS NULL`;
      const totalGameLogsResult = await database.execute(totalGameLogsQuery);
      const totalGameLogs = totalGameLogsResult.rows?.[0]?.count || 0;

      // Check public game logs
      const publicGameLogsQuery = sql`SELECT COUNT(*) as count FROM game_logs WHERE classification = 'PUBLIC' AND deleted_at IS NULL`;
      const publicGameLogsResult = await database.execute(publicGameLogsQuery);
      const publicGameLogs = publicGameLogsResult.rows?.[0]?.count || 0;

      // Check total comments
      const totalCommentsQuery = sql`SELECT COUNT(*) as count FROM comments WHERE deleted_at IS NULL`;
      const totalCommentsResult = await database.execute(totalCommentsQuery);
      const totalComments = totalCommentsResult.rows?.[0]?.count || 0;

      // Check total reactions
      const totalReactionsQuery = sql`SELECT COUNT(*) as count FROM reactions WHERE deleted_at IS NULL`;
      const totalReactionsResult = await database.execute(totalReactionsQuery);
      const totalReactions = totalReactionsResult.rows?.[0]?.count || 0;

      // Get sample game logs
      const sampleGameLogsQuery = sql`
        SELECT
          gl.id,
          gl.classification,
          gl.created_at,
          u.username
        FROM game_logs gl
        LEFT JOIN users u ON gl.user_id = u.id
        WHERE gl.deleted_at IS NULL
        ORDER BY gl.created_at DESC
        LIMIT 10
      `;
      const sampleGameLogsResult = await database.execute(sampleGameLogsQuery);
      const sampleGameLogs = sampleGameLogsResult.rows || [];

      return {
        totalGameLogs: Number(totalGameLogs),
        publicGameLogs: Number(publicGameLogs),
        totalComments: Number(totalComments),
        totalReactions: Number(totalReactions),
        sampleGameLogs,
      };
    } catch (error) {
      this.logger.error('Failed to debug database content', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to debug database content: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Debug method to check what NBA games data exists in the database
   * This helps diagnose why we're getting empty results for recent games
   */
  async debugNbaGamesContent(): Promise<{
    totalGames: number;
    finishedGames: number;
    gameStatuses: string[];
    sampleGames: Record<string, unknown>[];
    simpleTestGames: Record<string, unknown>[];
    anyGames: Record<string, unknown>[];
  }> {
    try {
      const database = db();
      if (!database) {
        throw new Error('Database connection not available');
      }

      // Check total NBA games
      const totalGamesQuery = sql`SELECT COUNT(*) as count FROM basketball_games WHERE deleted_at IS NULL`;
      const totalGamesResult = await database.execute(totalGamesQuery);
      const totalGames = totalGamesResult.rows?.[0]?.count || 0;

      // Check finished games with different status patterns
      const finishedGamesQuery = sql`
        SELECT status, COUNT(*) as count
        FROM basketball_games
        WHERE deleted_at IS NULL
        GROUP BY status
        ORDER BY count DESC
      `;
      const finishedGamesResult = await database.execute(finishedGamesQuery);
      const gameStatuses = (finishedGamesResult.rows || [])
        .map((row: Record<string, unknown>) => row.status as string)
        .filter(Boolean);

      // Count games that might be considered "finished"
      const finishedCountQuery = sql`
        SELECT COUNT(*) as count
        FROM basketball_games
        WHERE deleted_at IS NULL
        AND (status LIKE '%FT%' OR status LIKE '%Finish%' OR status IN ('Final', 'COMPLETED'))
      `;
      const finishedCountResult = await database.execute(finishedCountQuery);
      const finishedGames = finishedCountResult.rows?.[0]?.count || 0;

      // Get sample games with different statuses
      const sampleGamesQuery = sql`
        SELECT
          g.id,
          g.status,
          g.date,
          g.teams,
          g.scores
        FROM basketball_games g
        WHERE g.deleted_at IS NULL
        ORDER BY g.date DESC
        LIMIT 10
      `;
      const sampleGamesResult = await database.execute(sampleGamesQuery);
      const sampleGames = sampleGamesResult.rows || [];

      // Very simple test - just get any NBA games without joins
      const simpleTestQuery = sql`
        SELECT id, status, date, teams
        FROM basketball_games
        WHERE deleted_at IS NULL
        ORDER BY date DESC
        LIMIT 5
      `;
      const simpleTestResult = await database.execute(simpleTestQuery);
      const simpleTestGames = simpleTestResult.rows || [];

      // Even simpler test - get ANY games, including soft-deleted ones
      const anyGamesQuery = sql`
        SELECT id, status, date, deleted_at
        FROM basketball_games
        ORDER BY date DESC
        LIMIT 5
      `;
      const anyGamesResult = await database.execute(anyGamesQuery);
      const anyGames = anyGamesResult.rows || [];

      return {
        totalGames: Number(totalGames),
        finishedGames: Number(finishedGames),
        gameStatuses,
        sampleGames,
        simpleTestGames,
        anyGames,
      };
    } catch (error) {
      this.logger.error('Failed to debug NBA games content', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to debug NBA games content: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get top public game logs by engagement score
   * Uses optimized query with proper indexing
   */
  async getTopPublicGameLogs(): Promise<ITrendingGameLog[]> {
    try {
      const startTime = Date.now();

      // Optimized query for public game logs with engagement scoring
      // Simplified joins for better performance
      const publicGameLogsQuery = sql`
        SELECT
          gl.id,
          gl.rating_for_game,
          gl.created_at,
          u.username,
          u.image_url,
          g.teams,
          -- Count reactions on the game log itself
          COALESCE(gl_reactions.count, 0) as direct_reactions,
          -- Count top-level comments
          COALESCE(top_comments.count, 0) as top_level_comments,
          -- Count reactions on top-level comments
          COALESCE(top_comments.reaction_count, 0) as top_level_reactions
        FROM game_logs gl
        LEFT JOIN users u ON gl.user_id = u.id
        LEFT JOIN basketball_games g ON gl.game_id = g.id
        -- Teams data is now in JSONB, no need for joins

        -- Count reactions on the game log itself (simplified)
        LEFT JOIN (
          SELECT target_id, COUNT(*) as count
          FROM reactions
          WHERE target_type = 'GAME_LOG' AND deleted_at IS NULL
          GROUP BY target_id
        ) gl_reactions ON gl.id = gl_reactions.target_id

        -- Count top-level comments and their reactions (simplified)
        LEFT JOIN (
          SELECT
            c.parent_id,
            COUNT(c.id) as count,
            COALESCE(SUM(comment_reactions.count), 0) as reaction_count
          FROM comments c
          LEFT JOIN (
            SELECT target_id, COUNT(*) as count
            FROM reactions
            WHERE target_type = 'COMMENT' AND deleted_at IS NULL
            GROUP BY target_id
          ) comment_reactions ON c.id = comment_reactions.target_id
          WHERE c.parent_type = 'GAME_LOG' AND c.deleted_at IS NULL
          GROUP BY c.parent_id
        ) top_comments ON gl.id = top_comments.parent_id

        WHERE gl.classification = 'PUBLIC'
          AND gl.deleted_at IS NULL
          AND u.deleted_at IS NULL
          AND g.deleted_at IS NULL
        ORDER BY
          (COALESCE(gl_reactions.count, 0) + COALESCE(top_comments.count, 0) * 2) DESC,
          gl.created_at DESC
        LIMIT 10
      `;

      const database = db();
      if (!database) {
        throw new Error('Database connection not available');
      }

      const result = await database.execute(publicGameLogsQuery);
      if (!result) {
        throw new Error('Database query returned null result');
      }

      const queryTime = Date.now() - startTime;

      this.logger.database('query', 'getTopPublicGameLogs', queryTime, {
        resultCount: result.rows?.length || 0,
      });

      // Transform database rows to typed objects
      const gameLogs = (result.rows || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        rating: row.rating_for_game as number,
        totalComments: row.top_level_comments as number,
        totalReactions: (row.direct_reactions as number) + (row.top_level_reactions as number),
        trendingScore:
          (row.rating_for_game as number) * 0.4 +
          ((row.direct_reactions as number) + (row.top_level_reactions as number)) * 0.3 +
          (row.top_level_comments as number) * 0.3,
        created_at: row.created_at as string,
        user: {
          username: row.username as string,
          image_url: row.image_url as string | undefined,
        },
        game: {
          teams: row.teams as IGameTeamsDataService,
          // Add legacy format for component compatibility
          home_team: (row.teams as IGameTeamsDataService)?.home,
          away_team: (row.teams as IGameTeamsDataService)?.visitors,
        },
      }));

      this.logger.info('Successfully fetched top public game logs', {
        count: gameLogs.length,
        queryTime,
      });

      return gameLogs as ITrendingGameLog[];
    } catch (error) {
      this.logger.error('Failed to fetch top public game logs', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to fetch top public game logs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get recent finished NBA games
   * Optimized query for recent game data
   */
  async getRecentFinishedGames(): Promise<IRecentGame[]> {
    try {
      const startTime = Date.now();

      // Simple query for recent games - get any recent games first, then filter by status
      const recentGamesQuery = sql`
        SELECT
          g.id,
          g.date,
          g.status,
          g.teams,
          g.scores,
          g.arena
        FROM basketball_games g
        WHERE g.deleted_at IS NULL
        ORDER BY g.date DESC
        LIMIT 20
      `;

      const database = db();
      if (!database) {
        throw new Error('Database connection not available');
      }

      const result = await database.execute(recentGamesQuery);
      if (!result) {
        throw new Error('Database query returned null result');
      }

      const queryTime = Date.now() - startTime;

      this.logger.database('query', 'getRecentFinishedGames', queryTime, {
        resultCount: result.rows?.length || 0,
      });

      // Transform database rows to typed objects and filter for finished games
      const allGames = (result.rows || []).map((row: Record<string, unknown>) => {
        // Handle JSONB arena field properly
        let arenaData: { name: string; city: string } | null = null;
        if (row.arena && typeof row.arena === 'object' && row.arena !== null) {
          const arena = row.arena as Record<string, unknown>;
          const arenaName = arena.name;
          const arenaCity = arena.city;
          if (arenaName && arenaCity) {
            arenaData = {
              name:
                typeof arenaName === 'string'
                  ? arenaName
                  : (arenaName as { toString?: () => string })?.toString?.() || 'Unknown Arena',
              city:
                typeof arenaCity === 'string'
                  ? arenaCity
                  : (arenaCity as { toString?: () => string })?.toString?.() || 'Unknown City',
            };
          }
        }

        return {
          id: row.id as string,
          date: row.date as string,
          status: row.status,
          teams: row.teams as IGameTeamsDataService,
          scores: row.scores as IGameScoresData,
          arena: arenaData || undefined,
        };
      });

      // Filter for finished games based on status
      const games = allGames
        .filter(game => {
          const status = game.status;
          if (typeof status === 'string') {
            return status.toLowerCase() === 'finished';
          }
          if (typeof status === 'object' && status !== null) {
            const statusObj = status as Record<string, unknown>;
            const longStatus =
              typeof statusObj.long === 'string' ? statusObj.long.toLowerCase() : '';
            const shortStatus =
              typeof statusObj.short === 'string' ? statusObj.short.toLowerCase() : '';
            return longStatus === 'finished' || shortStatus === 'finished';
          }
          return false;
        })
        .slice(0, 10); // Take only the first 10 finished games

      this.logger.info('Successfully fetched recent finished games', {
        count: games.length,
        queryTime,
      });

      return games as IRecentGame[];
    } catch (error) {
      this.logger.error('Failed to fetch recent finished games', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to fetch recent finished games: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get most popular games based on ratings
   * Uses industry-standard Bayesian average for popularity scoring
   */
  async getPopularGames(): Promise<{
    topRated: IPopularGame[];
    mostRated: IPopularGame[];
    mostPopular: IPopularGame[];
    debug?: { [key: string]: unknown };
  }> {
    try {
      const startTime = Date.now();

      const database = db();
      if (!database) {
        throw new Error('Database connection not available');
      }

      // Start simple: just count all rows in game_ratings
      const totalCountQuery = sql`
        SELECT COUNT(*) as total_count
        FROM game_ratings
      `;

      const totalCountResult = await database.execute(totalCountQuery);
      console.log(
        '🔍 Total game_ratings count:',
        totalCountResult.rows?.[0]?.total_count || 'No result'
      );

      this.logger.info('Total game_ratings count', {
        totalCount: totalCountResult.rows?.[0]?.total_count || 0,
      });

      // Now let's see some sample rows to understand the data structure
      const sampleRowsQuery = sql`
        SELECT *
        FROM game_ratings
        LIMIT 3
      `;

      const sampleRowsResult = await database.execute(sampleRowsQuery);
      console.log('🔍 Sample game_ratings rows:', sampleRowsResult.rows || 'No rows');

      this.logger.info('Sample game_ratings rows', {
        sampleRows: sampleRowsResult.rows || [],
        sampleRowCount: sampleRowsResult.rows?.length || 0,
      });

      // Now let's try to get popular game IDs
      const popularGameIdsQuery = sql`
        SELECT game_id, average_rating, total_ratings
        FROM game_ratings
        WHERE deleted_at IS NULL
        ORDER BY average_rating DESC, total_ratings DESC
        LIMIT 10
      `;

      const popularGameIdsResult = await database.execute(popularGameIdsQuery);
      console.log('🔍 Popular game IDs result:', {
        rowCount: popularGameIdsResult.rows?.length || 0,
        rows: popularGameIdsResult.rows || [],
      });

      this.logger.info('Popular game IDs result', {
        rowCount: popularGameIdsResult.rows?.length || 0,
        rows: popularGameIdsResult.rows || [],
      });

      if (!popularGameIdsResult.rows || popularGameIdsResult.rows.length === 0) {
        this.logger.warn('No popular game IDs found');
        return {
          topRated: [],
          mostRated: [],
          mostPopular: [],
          debug: {
            totalCount: totalCountResult.rows?.[0]?.total_count || 0,
            sampleRows: sampleRowsResult.rows || [],
            popularGameIdsCount: 0,
            popularGameIdsResult: [],
          },
        };
      }

      // Extract the game IDs
      const popularGameIds = popularGameIdsResult.rows.map(row => row.game_id as string);
      console.log('🔍 Extracted game IDs:', popularGameIds);

      // First, let's check if these games exist in basketball_games without any joins
      const simpleExistenceQuery = sql`
        SELECT id, date, status, teams, deleted_at
        FROM basketball_games
        WHERE id IN (${popularGameIds.map(id => `'${id}'`).join(', ')})
      `;

      const simpleExistenceResult = await database.execute(simpleExistenceQuery);
      console.log('🔍 Simple existence result:', {
        rowCount: simpleExistenceResult.rows?.length || 0,
        rows: simpleExistenceResult.rows || [],
      });

      this.logger.info('Simple existence result', {
        rowCount: simpleExistenceResult.rows?.length || 0,
        rows: simpleExistenceResult.rows || [],
      });

      // Let's also test a simple basketball_teams query to see what's in there
      const basketball_teamsTestQuery = sql`
        SELECT id, name, logo, deleted_at
        FROM basketball_teams
        WHERE id IN ('1', '2', '9', '10', '11', '23', '26', '27', '30')
        LIMIT 5
      `;

      const basketball_teamsTestResult = await database.execute(basketball_teamsTestQuery);
      console.log('🔍 Teams test result:', {
        rowCount: basketball_teamsTestResult.rows?.length || 0,
        rows: basketball_teamsTestResult.rows || [],
      });

      this.logger.info('Teams test result', {
        rowCount: basketball_teamsTestResult.rows?.length || 0,
        rows: basketball_teamsTestResult.rows || [],
      });

      // Now let's fetch the actual game data using these IDs - one by one for reliability
      const games: Record<string, unknown>[] = [];
      console.log('🔍 Starting individual game queries for', popularGameIds.length, 'games');

      for (const gameId of popularGameIds) {
        try {
          const query = sql`SELECT * FROM basketball_games WHERE id = ${gameId}`;
          const result = await database.execute(query);

          if (result.rows?.[0]) {
            games.push(result.rows[0]);
            console.log(`✅ Found game ${gameId}`);
          } else {
            console.log(`❌ No game found for ${gameId}`);
          }
        } catch (error) {
          console.log(`❌ Error querying game ${gameId}:`, error);
        }
      }

      console.log('🔍 Individual queries completed. Found', games.length, 'games');

      this.logger.info('Individual game queries completed', {
        requestedGames: popularGameIds.length,
        foundGames: games.length,
        games: games.map(g => ({ id: g.id, date: g.date, status: g.status })),
      });

      // Now let's enrich each game with team information and ratings
      const enrichedGames: IPopularGame[] = [];

      for (const game of games) {
        try {
          // Teams data is now in JSONB, no need for separate queries
          const teamsData = game.teams as IGameTeamsDataService;

          // Teams data is now in JSONB
          const homeTeam = teamsData?.home;
          const awayTeam = teamsData?.visitors;

          // Get rating information for this specific game
          const ratingQuery = sql`SELECT average_rating, total_ratings FROM game_ratings WHERE game_id = ${game.id}`;
          const ratingResult = await database.execute(ratingQuery);
          const rating = ratingResult.rows?.[0];

          // Get public comment and reaction counts for this game using centralized query
          const engagement = await getGameEngagementQuery(String(game.id));

          // Parse arena data
          let arenaData: { name: string; city: string } | null = null;
          if (game.arena && typeof game.arena === 'object') {
            try {
              const arena = typeof game.arena === 'string' ? JSON.parse(game.arena) : game.arena;
              if (arena?.name && arena?.city) {
                arenaData = {
                  name: String(arena.name),
                  city: String(arena.city),
                };
              }
            } catch (_e) {
              console.log(`⚠️ Could not parse arena data for game ${String(game.id)}`);
            }
          }

          // Create enriched game object with proper type casting
          const enrichedGame: IPopularGame = {
            id: String(game.id),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            date: String(game.date),
            status: {
              short: (game.status as string) || 'FT',
              long: 'Finished',
            },
            homeTeam: {
              id: (homeTeam?.id as string) || '',
              name: homeTeam?.name
                ? typeof homeTeam.name === 'string'
                  ? homeTeam.name
                  : (homeTeam.name as { toString?: () => string })?.toString?.() || 'Unknown Team'
                : 'Unknown Team',
              code: (homeTeam?.code as string) || 'TBD',
              logo: homeTeam?.logo
                ? typeof homeTeam.logo === 'string'
                  ? homeTeam.logo
                  : (homeTeam.logo as { toString?: () => string })?.toString?.() || undefined
                : undefined,
              score: teamsData?.home?.points || undefined,
            },
            awayTeam: {
              id: (awayTeam?.id as string) || '',
              name: awayTeam?.name
                ? typeof awayTeam.name === 'string'
                  ? awayTeam.name
                  : (awayTeam.name as { toString?: () => string })?.toString?.() || 'Unknown Team'
                : 'Unknown Team',
              code: (awayTeam?.code as string) || 'TBD',
              logo: awayTeam?.logo
                ? typeof awayTeam.logo === 'string'
                  ? awayTeam.logo
                  : (awayTeam.logo as { toString?: () => string })?.toString?.() || undefined
                : undefined,
              score: teamsData?.visitors?.points || undefined,
            },
            rating: {
              average: rating?.average_rating ? Number(rating.average_rating) : 0,
              totalRatings: rating?.total_ratings ? Number(rating.total_ratings) : 0,
              popularityScore: 0, // We'll calculate this below
            },
            gameLogCount: engagement?.total_game_logs ? Number(engagement.total_game_logs) : 0,
            commentCount: engagement?.total_all_comments
              ? Number(engagement.total_all_comments)
              : 0,
            reactionCount: engagement?.total_all_reactions
              ? Number(engagement.total_all_reactions)
              : 0,
            arena: arenaData || undefined,
          };

          enrichedGames.push(enrichedGame);
          console.log(
            `✅ Enriched game ${String(game.id)} with team, rating, and engagement data (${enrichedGame.commentCount} comments, ${enrichedGame.reactionCount} reactions)`
          );
        } catch (error) {
          console.log(`❌ Error enriching game ${String(game.id)}:`, error);
        }
      }

      console.log('🔍 Game enrichment completed. Enriched', enrichedGames.length, 'games');

      // Calculate popularity scores using multiple algorithms for rich UI experience
      const C = 3.0; // Prior mean (average rating across all games)
      const m = 2; // Prior confidence (minimum ratings before considering)

      enrichedGames.forEach((game, _index) => {
        const R = game.rating.average;
        const v = game.rating.totalRatings;
        const comments = game.commentCount;
        const reactions = game.reactionCount;
        const gameLogs = game.gameLogCount;

        // Use engagement data that's already stored in the game object
        // Since we don't have detailed engagement breakdown in the game object,
        // we'll use the total counts for the popularity calculation
        const publicComments = 0; // We don't have this breakdown in the current structure
        const publicReactions = 0; // We don't have this breakdown in the current structure
        const allComments = comments;
        const allReactions = reactions;
        const uniqueUsers = 0; // We don't have this data in the current structure
        const uniquePublicUsers = 0; // We don't have this data in the current structure
        const recentActivity = 0; // Will be enhanced in future iteration

        // Algorithm 1: Bayesian Average - balances rating and number of ratings
        const bayesianScore = (v * R + m * C) / (v + m);

        // Algorithm 2: Wilson Score Interval - confidence-based ranking
        const z = 1.96; // 95% confidence
        const p = R / 5; // Convert to 0-1 scale
        const wilsonScore =
          (p + (z * z) / (2 * v) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * v)) / v)) /
          (1 + (z * z) / v);

        // Algorithm 3: Enhanced Engagement Score
        // Public engagement (weighted more heavily for discoverability)
        const publicEngagementScore = publicComments * 2 + publicReactions * 1;

        // Total engagement (including private - shows overall interest)
        const totalEngagementScore = allComments * 1.5 + allReactions * 0.8;

        // User diversity score (more unique users = more popular)
        const userDiversityScore = Math.log(uniqueUsers + 1) * 2;

        // Public user diversity score (public engagement reach)
        const publicUserDiversityScore = Math.log(uniquePublicUsers + 1) * 1.5;

        // Game log volume score (more people logged this game)
        const gameLogVolumeScore = Math.log(gameLogs + 1) * 1.5;

        // Recent activity score (recent engagement indicates current popularity)
        const _recentActivityScore = Math.log(recentActivity + 1) * 3;

        // Algorithm 4: Comprehensive popularity score
        // Rating quality (20%) + Public engagement (25%) + Total engagement (20%) +
        // User diversity (15%) + Public user diversity (10%) + Game log volume (5%) + Wilson confidence (5%)
        const combinedScore =
          bayesianScore * 0.2 +
          Math.log(publicEngagementScore + 1) * 0.25 +
          Math.log(totalEngagementScore + 1) * 0.2 +
          userDiversityScore * 0.15 +
          publicUserDiversityScore * 0.1 +
          gameLogVolumeScore * 0.05 +
          wilsonScore * 5 * 0.05;

        game.rating.popularityScore = combinedScore;
      });

      // Sort by different criteria for rich UI experience
      const topRated = [...enrichedGames].sort((a, b) => b.rating.average - a.rating.average);
      const mostRated = [...enrichedGames].sort(
        (a, b) => b.rating.totalRatings - a.rating.totalRatings
      );
      // Most Popular now considers comprehensive engagement as primary factor
      const mostPopular = [...enrichedGames].sort((a, b) => {
        // Primary sort: total engagement score (all comments + reactions)
        const aTotalEngagement = a.commentCount + a.reactionCount;
        const bTotalEngagement = b.commentCount + b.reactionCount;

        if (aTotalEngagement !== bTotalEngagement) {
          return bTotalEngagement - aTotalEngagement;
        }

        // Secondary sort: popularity score (includes rating quality and user diversity)
        return b.rating.popularityScore - a.rating.popularityScore;
      });

      const endTime = Date.now();
      this.logger.info('Popular games processed successfully', {
        totalGames: enrichedGames.length,
        topRatedCount: topRated.length,
        mostRatedCount: mostRated.length,
        mostPopularCount: mostPopular.length,
        processingTimeMs: endTime - startTime,
      });

      return {
        topRated: topRated.slice(0, 5), // Top 5 by average rating
        mostRated: mostRated.slice(0, 5), // Top 5 by number of ratings
        mostPopular: mostPopular.slice(0, 5), // Top 5 by combined popularity score
        debug: {
          totalCount: totalCountResult.rows?.[0]?.total_count || 0,
          sampleRows: sampleRowsResult.rows || [],
          popularGameIdsCount: popularGameIds.length,
          popularGameIdsResult: popularGameIdsResult.rows || [],
          extractedGameIds: popularGameIds,
          simpleExistenceCount: simpleExistenceResult.rows?.length || 0,
          simpleExistenceResult: simpleExistenceResult.rows || [],
          basketball_teamsTestCount: basketball_teamsTestResult.rows?.length || 0,
          basketball_teamsTestResult: basketball_teamsTestResult.rows || [],
          gamesDataCount: games.length,
          gamesDataResult: games,
          enrichedGamesCount: enrichedGames.length,
          processingTimeMs: endTime - startTime,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch popular games', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to fetch popular games: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get landing page data with all sections populated
   */
  async getLandingPageData(): Promise<{
    trendingContent: {
      topGameLogs: ITrendingGameLog[];
      mostActiveGameLog: ITrendingGameLog | null;
    };
    latestResults: { latestGames: IRecentGame[]; latestFinishedGame: IRecentGame | null };
    recentGames: { finishedGames: IRecentGame[]; currentGame: IRecentGame | null };
  }> {
    try {
      // Fetch all data in parallel for better performance
      const [topGameLogs, latestGames] = await Promise.all([
        this.getTopPublicGameLogs(),
        this.getRecentFinishedGames(),
      ]);

      // Process trending content
      const trendingContent = {
        topGameLogs,
        mostActiveGameLog: topGameLogs.length > 0 ? topGameLogs[0] : null,
      };

      // Process latest results
      const latestResults = {
        latestGames,
        latestFinishedGame: latestGames.length > 0 ? latestGames[0] : null,
      };

      // Process recent games
      const finishedGames = latestGames.filter(game => {
        // Handle different status formats safely
        if (typeof game.status === 'string') {
          return game.status.toLowerCase() === 'ft' || game.status.toLowerCase() === 'finished';
        }

        // Handle object status format
        if (game.status && typeof game.status === 'object') {
          const shortStatus = game.status.short;
          const longStatus = game.status.long;

          // Check if short/long are strings before calling toLowerCase
          const isShortFinished =
            typeof shortStatus === 'string' &&
            (shortStatus.toLowerCase() === 'ft' || shortStatus.toLowerCase() === 'finished');
          const isLongFinished =
            typeof longStatus === 'string' && longStatus.toLowerCase() === 'finished';

          return isShortFinished || isLongFinished;
        }

        return false;
      });

      const recentGames = {
        finishedGames,
        currentGame: finishedGames.length > 0 ? finishedGames[0] : null,
      };

      return {
        trendingContent,
        latestResults,
        recentGames,
      };
    } catch (error) {
      this.logger.error('Failed to get landing page data', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to get landing page data: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get trending content with granular caching
   */
  async getTrendingContentWithCache(): Promise<{
    topGameLogs: ITrendingGameLog[];
    mostActiveGameLog: ITrendingGameLog | null;
  }> {
    try {
      const cacheKey = 'landingPage:landing-page-data:trendingContent';
      const cachedData = simpleCacheService.get(cacheKey);

      if (
        cachedData !== null &&
        typeof cachedData === 'object' &&
        'topGameLogs' in cachedData &&
        'mostActiveGameLog' in cachedData
      ) {
        const cached = cachedData as {
          topGameLogs: ITrendingGameLog[];
          mostActiveGameLog: ITrendingGameLog | null;
        };
        this.logger.cache('hit', cacheKey);
        return cached;
      }

      const data = await this.getTopPublicGameLogs();
      const result = {
        topGameLogs: data,
        mostActiveGameLog: data.length > 0 ? data[0] : null,
      };

      simpleCacheService.set(cacheKey, result, {
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE,
        tags: ['landing-page', 'trending-content'],
      });
      this.logger.cache('miss', cacheKey);

      return result;
    } catch (error) {
      this.logger.error('Failed to get trending content with cache', { error });
      throw error;
    }
  }

  /**
   * Get latest results with granular caching
   */
  async getLatestResultsWithCache(): Promise<{
    latestGames: IRecentGame[];
    latestFinishedGame: IRecentGame | null;
  }> {
    try {
      const cacheKey = 'landingPage:landing-page-data:latestResults';
      const cachedData = simpleCacheService.get(cacheKey);

      if (
        cachedData !== null &&
        typeof cachedData === 'object' &&
        'latestGames' in cachedData &&
        'latestFinishedGame' in cachedData
      ) {
        const cached = cachedData as {
          latestGames: IRecentGame[];
          latestFinishedGame: IRecentGame | null;
        };
        this.logger.cache('hit', cacheKey);
        return cached;
      }

      const data = await this.getRecentFinishedGames();
      const result = {
        latestGames: data,
        latestFinishedGame: data.length > 0 ? data[0] : null,
      };

      simpleCacheService.set(cacheKey, result, {
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE,
        tags: ['landing-page', 'latest-results'],
      });
      this.logger.cache('miss', cacheKey);

      return result;
    } catch (error) {
      this.logger.error('Failed to get latest results with cache', { error });
      throw error;
    }
  }

  /**
   * Get recent games with granular caching
   */
  async getRecentGamesWithCache(): Promise<{
    finishedGames: IRecentGame[];
    currentGame: IRecentGame | null;
  }> {
    try {
      const cacheKey = 'landingPage:landing-page-data:recentGames';
      const cachedData = simpleCacheService.get(cacheKey);

      if (
        cachedData !== null &&
        typeof cachedData === 'object' &&
        'finishedGames' in cachedData &&
        'currentGame' in cachedData
      ) {
        const cached = cachedData as {
          finishedGames: IRecentGame[];
          currentGame: IRecentGame | null;
        };
        this.logger.cache('hit', cacheKey);
        return cached;
      }

      const data = await this.getRecentFinishedGames();
      const finishedGames = data.filter(game => {
        // Handle different status formats safely
        if (typeof game.status === 'string') {
          return game.status.toLowerCase() === 'ft' || game.status.toLowerCase() === 'finished';
        }

        // Handle object status format
        if (game.status && typeof game.status === 'object') {
          const shortStatus = game.status.short;
          const longStatus = game.status.long;

          // Check if short/long are strings before calling toLowerCase
          const isShortFinished =
            typeof shortStatus === 'string' &&
            (shortStatus.toLowerCase() === 'ft' || shortStatus.toLowerCase() === 'finished');
          const isLongFinished =
            typeof longStatus === 'string' && longStatus.toLowerCase() === 'finished';

          return isShortFinished || isLongFinished;
        }

        return false;
      });

      const result = {
        finishedGames,
        currentGame: finishedGames.length > 0 ? finishedGames[0] : null,
      };

      simpleCacheService.set(cacheKey, result, {
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE,
        tags: ['landing-page', 'recent-games'],
      });
      this.logger.cache('miss', cacheKey);

      return result;
    } catch (error) {
      this.logger.error('Failed to get recent games with cache', { error });
      throw error;
    }
  }

  /**
   * Get popular games with granular caching
   */
  async getPopularGamesWithCache(): Promise<{
    topRated: IPopularGame[];
    mostRated: IPopularGame[];
    mostPopular: IPopularGame[];
    debug?: { [key: string]: unknown };
  }> {
    try {
      const cacheKey = 'landingPage:landing-page-data:popularGames';
      const cachedData = simpleCacheService.get(cacheKey);

      if (
        cachedData !== null &&
        typeof cachedData === 'object' &&
        'topRated' in cachedData &&
        'mostRated' in cachedData &&
        'mostPopular' in cachedData
      ) {
        const cached = cachedData as {
          topRated: IPopularGame[];
          mostRated: IPopularGame[];
          mostPopular: IPopularGame[];
          debug?: { [key: string]: unknown };
        };
        this.logger.cache('hit', cacheKey);
        return cached;
      }

      const data = await this.getPopularGames();

      simpleCacheService.set(cacheKey, data, {
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE * 2, // 10 minutes for trending content
        tags: ['landing-page', 'popular-games'],
      });
      this.logger.cache('miss', cacheKey);

      return data;
    } catch (error) {
      this.logger.error('Failed to get popular games with cache', { error });
      throw error;
    }
  }

  /**
   * Get popular teams directly from database
   */
  async getPopularTeams(): Promise<{
    mostPopular: Array<{
      id: string;
      name: string;
      city: string;
      logo: string;
      totalGameLogs: number;
      publicGameLogs: number;
      totalComments: number;
      totalReactions: number;
      popularityScore: number;
    }>;
  }> {
    try {
      const database = db();
      if (!database) {
        throw new Error('Database connection not available');
      }

      // Get teams with basic engagement data - use nickname when name is empty
      const teamsQuery = sql`
        SELECT
          t.id,
          CASE
            WHEN t.name IS NOT NULL AND t.name != '' THEN t.name
            ELSE t.nickname
          END as name,
          t.city,
          t.logo,
          0 as total_game_logs,
          0 as public_game_logs,
          0 as total_comments,
          0 as total_reactions
        FROM basketball_teams t
        WHERE t.deleted_at IS NULL
        ORDER BY
          CASE
            WHEN t.name IS NOT NULL AND t.name != '' THEN t.name
            ELSE t.nickname
          END
        LIMIT 10
      `;

      const teamsResult = await database.execute(teamsQuery);
      const teams = teamsResult.rows || [];

      const mostPopular = teams.map((team: Record<string, unknown>) => {
        const totalGameLogs = parseInt(String(team.total_game_logs)) || 0;
        const publicGameLogs = parseInt(String(team.public_game_logs)) || 0;
        const totalComments = parseInt(String(team.total_comments)) || 0;
        const totalReactions = parseInt(String(team.total_reactions)) || 0;
        const popularityScore = totalGameLogs + totalComments + totalReactions;

        return {
          id: String(team.id),
          name: String(team.name),
          city: String(team.city),
          logo: team.logo && typeof team.logo === 'string' ? team.logo : '',
          totalGameLogs,
          publicGameLogs,
          totalComments,
          totalReactions,
          popularityScore,
        };
      });

      return { mostPopular };
    } catch (error) {
      this.logger.error('Failed to get popular teams', { error });
      throw error;
    }
  }

  /**
   * Get popular teams with caching
   */
  async getPopularTeamsWithCache(): Promise<{
    mostPopular: Array<{
      id: string;
      name: string;
      city: string;
      logo: string;
      totalGameLogs: number;
      publicGameLogs: number;
      totalComments: number;
      totalReactions: number;
      popularityScore: number;
    }>;
  }> {
    try {
      const cacheKey = 'landingPage:landing-page-data:popularTeams';
      const cachedData = simpleCacheService.get(cacheKey);

      if (cachedData !== null && typeof cachedData === 'object' && 'mostPopular' in cachedData) {
        const cached = cachedData as {
          mostPopular: Array<{
            id: string;
            name: string;
            city: string;
            logo: string;
            totalGameLogs: number;
            publicGameLogs: number;
            totalComments: number;
            totalReactions: number;
            popularityScore: number;
          }>;
        };
        this.logger.cache('hit', cacheKey);
        return cached;
      }

      // Use direct implementation instead of API call to avoid circular dependency
      const data = await this.getPopularTeams();

      simpleCacheService.set(cacheKey, data, {
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE * 2, // 10 minutes
        tags: ['landing-page', 'popular-teams'],
      });
      this.logger.cache('miss', cacheKey);

      return data;
    } catch (error) {
      this.logger.error('Failed to get popular teams with cache', { error });
      throw error;
    }
  }

  /**
   * Get popular players with caching
   */
  async getPopularPlayersWithCache(): Promise<{
    mostPopular: Array<{
      id: string;
      name: string;
      position: string;
      currentTeam: string;
      teamLogo: string;
      totalGameLogs: number;
      publicGameLogs: number;
      totalComments: number;
      totalReactions: number;
      popularityScore: number;
    }>;
  }> {
    try {
      const cacheKey = 'landingPage:landing-page-data:popularPlayers';
      const cachedData = simpleCacheService.get(cacheKey);

      if (cachedData !== null && typeof cachedData === 'object' && 'mostPopular' in cachedData) {
        const cached = cachedData as {
          mostPopular: Array<{
            id: string;
            name: string;
            position: string;
            currentTeam: string;
            teamLogo: string;
            totalGameLogs: number;
            publicGameLogs: number;
            totalComments: number;
            totalReactions: number;
            popularityScore: number;
          }>;
        };
        this.logger.cache('hit', cacheKey);
        return cached;
      }

      // Fetch from API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/landing-page/data/popularPlayers`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch popular players: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch popular players');
      }

      const data = { mostPopular: result.data.mostPopular || [] };

      simpleCacheService.set(cacheKey, data, {
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE * 2, // 10 minutes
        tags: ['landing-page', 'popular-players'],
      });
      this.logger.cache('miss', cacheKey);

      return data;
    } catch (error) {
      this.logger.error('Failed to get popular players with cache', { error });
      throw error;
    }
  }

  /**
   * Get active fans with caching
   */
  async getActiveFansWithCache(): Promise<{
    mostActive: Array<{
      id: string;
      username: string;
      avatar: string;
      totalGameLogs: number;
      publicGameLogs: number;
      totalComments: number;
      totalReactions: number;
      receivedComments: number;
      receivedReactions: number;
      activityScore: number;
    }>;
  }> {
    try {
      const cacheKey = 'landingPage:landing-page-data:activeFans';
      const cachedData = simpleCacheService.get(cacheKey);

      if (cachedData !== null && typeof cachedData === 'object' && 'mostActive' in cachedData) {
        const cached = cachedData as {
          mostActive: Array<{
            id: string;
            username: string;
            avatar: string;
            totalGameLogs: number;
            publicGameLogs: number;
            totalComments: number;
            totalReactions: number;
            receivedComments: number;
            receivedReactions: number;
            activityScore: number;
          }>;
        };
        this.logger.cache('hit', cacheKey);
        return cached;
      }

      // Fetch from API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/landing-page/data/activeFans`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch active fans: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch active fans');
      }

      const data = { mostActive: result.data.mostActive || [] };

      simpleCacheService.set(cacheKey, data, {
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE * 2, // 10 minutes
        tags: ['landing-page', 'active-fans'],
      });
      this.logger.cache('miss', cacheKey);

      return data;
    } catch (error) {
      this.logger.error('Failed to get active fans with cache', { error });
      throw error;
    }
  }

  /**
   * Invalidate specific cache sections based on tags or keys
   */
  invalidateCacheSection(
    section:
      | 'trending-content'
      | 'latest-results'
      | 'recent-games'
      | 'popular-games'
      | 'popular-teams'
      | 'popular-players'
      | 'active-fans'
      | 'all'
  ): Promise<void> {
    try {
      if (section === 'all') {
        // Invalidate all landing page caches
        simpleCacheService.clear();
        this.logger.info('Invalidated all landing page caches');
        return Promise.resolve();
      }

      // Invalidate specific section
      const tagMap = {
        'trending-content': 'landing-page',
        'latest-results': 'landing-page',
        'recent-games': 'landing-page',
        'popular-games': 'landing-page',
        'popular-teams': 'landing-page',
        'popular-players': 'landing-page',
        'active-fans': 'landing-page',
      };

      simpleCacheService.invalidate({ pattern: `${tagMap[section]}:*` });
      this.logger.info(`Invalidated cache section: ${section}`);
      return Promise.resolve();
    } catch (error) {
      this.logger.error('Failed to invalidate cache section', { section, error });
      throw error;
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    trendingContent: { key: string; ttl: number; tags: string[] };
    latestResults: { key: string; ttl: number; tags: string[] };
    recentGames: { key: string; ttl: number; tags: string[] };
    popularGames: { key: string; ttl: number; tags: string[] };
    popularTeams: { key: string; ttl: number; tags: string[] };
    popularPlayers: { key: string; ttl: number; tags: string[] };
    activeFans: { key: string; ttl: number; tags: string[] };
  } {
    return {
      trendingContent: {
        key: 'landingPage:landing-page-data:trendingContent',
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE,
        tags: ['landing-page', 'trending-content'],
      },
      latestResults: {
        key: 'landingPage:landing-page-data:latestResults',
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE,
        tags: ['landing-page', 'latest-results'],
      },
      recentGames: {
        key: 'landingPage:landing-page-data:recentGames',
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE,
        tags: ['landing-page', 'recent-games'],
      },
      popularGames: {
        key: 'landingPage:landing-page-data:popularGames',
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE * 2, // 10 minutes for trending content
        tags: ['landing-page', 'popular-games'],
      },
      popularTeams: {
        key: 'landingPage:landing-page-data:popularTeams',
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE * 2, // 10 minutes
        tags: ['landing-page', 'popular-teams'],
      },
      popularPlayers: {
        key: 'landingPage:landing-page-data:popularPlayers',
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE * 2, // 10 minutes
        tags: ['landing-page', 'popular-players'],
      },
      activeFans: {
        key: 'landingPage:landing-page-data:activeFans',
        ttl: CACHE_CONFIG.TTL.LANDING_PAGE * 2, // 10 minutes
        tags: ['landing-page', 'active-fans'],
      },
    };
  }

  /**
   * Get landing page data with granular caching - now much more efficient
   */
  async getLandingPageDataWithGranularCache(): Promise<ILandingPageData> {
    try {
      // Fetch all sections in parallel with their individual caching
      const [trendingContent, latestResults, recentGames, popularGames] = await Promise.all([
        this.getTrendingContentWithCache(),
        this.getLatestResultsWithCache(),
        this.getRecentGamesWithCache(),
        this.getPopularGamesWithCache(),
      ]);

      return {
        id: 'landing-page-data',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        trendingContent: {
          topGameLogs: trendingContent.topGameLogs.map(log => ({
            id: log.id,
            type: 'gameLog' as const,
            title: `Game Log by ${log.user.username}`,
            description: `Rating: ${log.rating}/10`,
            score: log.trendingScore,
            url: `/game-logs/${log.id}`,
          })) as ITrendingGameLog[],
          mostActiveGameLog: null,
        },
        latestResults: {
          latestGames: latestResults.latestGames,
          latestFinishedGame: null,
        },
        recentGames: recentGames.finishedGames,
        popularGames: popularGames,
        timestamp: new Date().toISOString(),
        source: 'cache',
      };
    } catch (error) {
      this.logger.error('Failed to get landing page data with granular cache', { error });
      throw error;
    }
  }
}
