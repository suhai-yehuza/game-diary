import { hybridCacheService, CACHE_CONFIG } from '@/lib/cache';
import {
  getGameEngagementQuery,
  debugDatabaseContentQuery,
  debugNbaGamesContentQuery,
  getTopPublicGameLogsQuery,
  getRecentFinishedGamesQuery,
  getPopularGamesQuery,
  getPopularTeamsQuery,
  getPopularPlayersQuery,
} from '@/lib/db/queries';
import { logger } from '@/lib/utils/logger';
import { getServerApiUrl } from '@/lib/utils/server-api-client';
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
      return await debugDatabaseContentQuery();
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
      return await debugNbaGamesContentQuery();
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

      const result = await getTopPublicGameLogsQuery();
      if (!result) {
        throw new Error('Database query returned null result');
      }

      const queryTime = Date.now() - startTime;

      this.logger.database('query', 'getTopPublicGameLogs', queryTime, {
        resultCount: result.length || 0,
      });

      // Transform database rows to typed objects
      const gameLogs = result.map((row: Record<string, unknown>) => ({
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

      const result = await getRecentFinishedGamesQuery();
      if (!result) {
        throw new Error('Database query returned null result');
      }

      const queryTime = Date.now() - startTime;

      this.logger.database('query', 'getRecentFinishedGames', queryTime, {
        resultCount: result.length || 0,
      });

      // Transform database rows to typed objects and filter for finished games
      const allGames = result
        .filter((row: Record<string, unknown>) => {
          // Only include games with valid dates
          return row.date && !isNaN(new Date(row.date as string).getTime());
        })
        .map((row: Record<string, unknown>) => {
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

      const { totalCount, popularGameIds, games } = await getPopularGamesQuery();

      this.logger.info('Total game_ratings count', {
        totalCount,
      });

      this.logger.info('Popular game IDs result', {
        rowCount: popularGameIds.length,
      });

      if (popularGameIds.length === 0) {
        this.logger.warn('No popular game IDs found');
        return {
          topRated: [],
          mostRated: [],
          mostPopular: [],
          debug: {
            totalCount,
            popularGameIdsCount: 0,
            popularGameIdsResult: [],
          },
        };
      }

      this.logger.info('Individual game queries completed', {
        requestedGames: popularGameIds.length,
        foundGames: games.length,
        games: games.map(g => ({ id: g.id, date: g.date, status: g.status })),
      });

      // Get engagement data for all games in a single batch query
      const gameIds = games.map(g => String(g.id));
      const engagementPromises = gameIds.map(gameId => getGameEngagementQuery(gameId));
      const engagementResults = await Promise.all(engagementPromises);
      const engagementMap = new Map();
      gameIds.forEach((gameId, index) => {
        engagementMap.set(gameId, engagementResults[index]);
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

          // Rating information is already included in the main query
          const rating = {
            average_rating: game.average_rating,
            total_ratings: game.total_ratings,
          };

          // Get engagement data from the batch result
          const engagement = engagementMap.get(String(game.id));

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
            publicCommentCount: engagement?.total_public_comments
              ? Number(engagement.total_public_comments)
              : 0,
            publicReactionCount: engagement?.total_public_reactions
              ? Number(engagement.total_public_reactions)
              : 0,
            arena: arenaData || undefined,
          };

          enrichedGames.push(enrichedGame);
          console.log(
            `✅ Enriched game ${String(game.id)} with team, rating, and engagement data (${enrichedGame.commentCount} total comments, ${enrichedGame.reactionCount} total reactions, ${enrichedGame.publicCommentCount} public comments, ${enrichedGame.publicReactionCount} public reactions)`
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
        const publicComments = game.publicCommentCount;
        const publicReactions = game.publicReactionCount;
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
      // Most Popular prioritizes comprehensive engagement including game ratings
      const mostPopular = [...enrichedGames].sort((a, b) => {
        // Primary sort: comprehensive engagement score (comments + reactions + weighted ratings)
        // Game ratings are weighted by both quantity and quality (totalRatings × averageRating)
        const aTotalEngagement =
          a.commentCount + a.reactionCount + a.rating.totalRatings * a.rating.average;
        const bTotalEngagement =
          b.commentCount + b.reactionCount + b.rating.totalRatings * b.rating.average;

        if (aTotalEngagement !== bTotalEngagement) {
          return bTotalEngagement - aTotalEngagement;
        }

        // Secondary sort: public engagement score (public comments + reactions)
        // This breaks ties by considering public community discussion
        const aPublicEngagement = a.publicCommentCount + a.publicReactionCount;
        const bPublicEngagement = b.publicCommentCount + b.publicReactionCount;

        if (aPublicEngagement !== bPublicEngagement) {
          return bPublicEngagement - aPublicEngagement;
        }

        // Tertiary sort: average rating quality (higher rated games break ties)
        if (a.rating.average !== b.rating.average) {
          return b.rating.average - a.rating.average;
        }

        // Final sort: popularity score (includes user diversity and other factors)
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
          totalCount,
          popularGameIdsCount: popularGameIds.length,
          popularGameIdsResult: popularGameIds,
          extractedGameIds: popularGameIds,
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
      const cachedData = await hybridCacheService.get(cacheKey);

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

      await hybridCacheService.set(cacheKey, result, {
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
      const cachedData = await hybridCacheService.get(cacheKey);

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

      await hybridCacheService.set(cacheKey, result, {
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
      const cachedData = await hybridCacheService.get(cacheKey);

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

      await hybridCacheService.set(cacheKey, result, {
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
      const cachedData = await hybridCacheService.get(cacheKey);

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

      await hybridCacheService.set(cacheKey, data, {
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
   * Get popular teams based on engagement data
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
      publicComments: number;
      publicReactions: number;
      popularityScore: number;
    }>;
  }> {
    try {
      const startTime = Date.now();

      const teams = await getPopularTeamsQuery();

      // Transform teams data and apply comprehensive engagement sorting
      const enrichedTeams = teams.map(team => ({
        id: String(team.id),
        name: String(team.name),
        city: String(team.city),
        logo: team.logo && typeof team.logo === 'string' ? team.logo : '',
        totalGameLogs: Number(team.total_game_logs) || 0,
        publicGameLogs: Number(team.public_game_logs) || 0,
        totalComments: Number(team.total_comments) || 0,
        totalReactions: Number(team.total_reactions) || 0,
        publicComments: Number(team.total_public_comments) || 0,
        publicReactions: Number(team.total_public_reactions) || 0,
        popularityScore: 0, // Will be calculated below
      }));

      // Calculate popularity scores using similar algorithm to games and players
      enrichedTeams.forEach(team => {
        const publicComments = team.publicComments;
        const publicReactions = team.publicReactions;
        const allComments = team.totalComments;
        const allReactions = team.totalReactions;
        const gameLogs = team.totalGameLogs;

        // Calculate popularity score using hybrid approach: current method + public data emphasis
        const publicEngagementScore = publicComments * 2 + publicReactions * 1;
        const totalEngagementScore = allComments * 1.5 + allReactions * 0.8;
        const gameLogVolumeScore = Math.log(gameLogs + 1) * 1.5;

        const popularityScore =
          Math.log(publicEngagementScore + 1) * 0.5 + // Increased weight for public data
          Math.log(totalEngagementScore + 1) * 0.3 + // Reduced weight for total data
          gameLogVolumeScore * 0.2;

        team.popularityScore = popularityScore;
      });

      // Sort by comprehensive engagement score (same formula as games and players)
      const mostPopular = [...enrichedTeams]
        .sort((a, b) => {
          // Primary sort: total engagement score (comments + reactions)
          const aTotalEngagement = a.totalComments + a.totalReactions;
          const bTotalEngagement = b.totalComments + b.totalReactions;

          if (aTotalEngagement !== bTotalEngagement) {
            return bTotalEngagement - aTotalEngagement;
          }

          // Secondary sort: public engagement score (public comments + reactions)
          const aPublicEngagement = a.publicComments + a.publicReactions;
          const bPublicEngagement = b.publicComments + b.publicReactions;

          if (aPublicEngagement !== bPublicEngagement) {
            return bPublicEngagement - aPublicEngagement;
          }

          // Tertiary sort: popularity score (includes user diversity and other factors)
          return b.popularityScore - a.popularityScore;
        })
        .slice(0, 10);

      const endTime = Date.now();
      this.logger.info('Popular teams processed successfully', {
        totalTeams: enrichedTeams.length,
        mostPopular: mostPopular.length,
        processingTimeMs: endTime - startTime,
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
      const cachedData = await hybridCacheService.get(cacheKey);

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

      await hybridCacheService.set(cacheKey, data, {
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
      const cachedData = await hybridCacheService.get(cacheKey);

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

      // Fetch directly from database
      const players = await getPopularPlayersQuery();

      // Transform players data with real engagement data
      const enrichedPlayers = players.map(player => {
        const totalComments = Number(player.total_comments) || 0;
        const totalReactions = Number(player.total_reactions) || 0;
        const totalEngagement = totalComments + totalReactions;

        return {
          id: String(player.id),
          name: String(player.name),
          position: String(player.position),
          currentTeam: 'Unknown Team',
          teamLogo: '',
          totalGameLogs: 0,
          publicGameLogs: 0,
          totalComments,
          totalReactions,
          popularityScore: totalEngagement, // Use real engagement as popularity score
        };
      });

      // Sort by popularity score (total engagement)
      const sortedPlayers = enrichedPlayers.sort((a, b) => b.popularityScore - a.popularityScore);

      const data = { mostPopular: sortedPlayers };

      await hybridCacheService.set(cacheKey, data, {
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
      const cachedData = await hybridCacheService.get(cacheKey);

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

      // Fetch from internal API endpoint
      const response = await fetch(getServerApiUrl('/api/landing-page/data/activeFans'));
      if (!response.ok) {
        throw new Error(`Failed to fetch active fans: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch active fans');
      }

      const data = { mostActive: result.data.mostActive || [] };

      await hybridCacheService.set(cacheKey, data, {
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
  async invalidateCacheSection(
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
        await hybridCacheService.clear();
        this.logger.info('Invalidated all landing page caches');
        return;
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

      await hybridCacheService.invalidate({ pattern: `${tagMap[section]}:*` });
      this.logger.info(`Invalidated cache section: ${section}`);
      return;
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
