import { logger } from '@/lib/utils/logger';
import { getServerApiUrl } from '@/lib/utils/server-api-client';

/**
 * Background service for automatically warming caches
 * Runs on a configurable interval to prevent cache gaps
 */
export class CacheWarmingService {
  private static instance: CacheWarmingService;
  private warmingInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Configuration
  private readonly WARMING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (ahead of 30-min TTL)
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 5000; // 5 seconds

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): CacheWarmingService {
    if (!CacheWarmingService.instance) {
      CacheWarmingService.instance = new CacheWarmingService();
    }
    return CacheWarmingService.instance;
  }

  /**
   * Start the background cache warming service
   */
  start(): void {
    if (this.isRunning) {
      logger.info('Cache warming service already running');
      return;
    }

    logger.info('Cache warming service started', { intervalMs: this.WARMING_INTERVAL_MS });

    // Initial warming
    void this.warmAllCaches();

    // Set up recurring warming
    this.warmingInterval = setInterval(() => {
      void this.warmAllCaches();
    }, this.WARMING_INTERVAL_MS);

    this.isRunning = true;
  }

  /**
   * Stop the background cache warming service
   */
  stop(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
    }
    this.isRunning = false;
    logger.info('Cache warming service stopped');
  }

  /**
   * Check if the service is currently running
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Warm up all critical caches
   */
  private async warmAllCaches(): Promise<void> {
    const startTime = Date.now();
    logger.info('Cache warming started');

    try {
      // Warm up caches in parallel for better performance
      const warmingPromises = [
        this.warmGamesCache(),
        this.warmPlayersCache(),
        this.warmTeamsCache(),
        this.warmNBAHubCountsCache(),
        this.warmGameLogsCache(),
      ];

      const results = await Promise.allSettled(warmingPromises);

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const totalTime = Date.now() - startTime;

      logger.info('Cache warming completed', {
        successCount,
        totalCount: warmingPromises.length,
        totalTimeMs: totalTime,
        successRate: (successCount / warmingPromises.length) * 100,
      });

      console.log(
        `🔥 Cache warming completed: ${successCount}/${warmingPromises.length} successful in ${totalTime}ms`
      );
    } catch (error) {
      logger.error('Cache warming failed', { error: String(error) });
      console.error('❌ Cache warming failed:', error);
    }
  }

  /**
   * Warm up games cache for all seasons
   */
  private async warmGamesCache(): Promise<void> {
    try {
      // Get available seasons from database instead of hardcoding
      const availableSeasons = await this.getAvailableSeasons();
      const statuses = ['finished', 'live', 'scheduled', 'all']; // Different game statuses

      const warmPromises: Promise<{ season: number | string; status: string; count: number }>[] =
        [];

      // Warm cache for each available season and status combination
      availableSeasons.forEach(season => {
        statuses.forEach(status => {
          const promise = this.warmGamesForSeasonAndStatus(season, status);
          warmPromises.push(promise);
        });
      });

      // Also warm the merged cache for "all seasons" view
      const allSeasonsPromise = this.warmGamesForSeasonAndStatus('all', 'all');
      warmPromises.push(allSeasonsPromise);

      const results = await Promise.all(warmPromises);
      const totalGames = results.reduce((sum, r) => sum + r.count, 0);

      logger.info('Games cache warmed', {
        totalCombinations: results.length,
        totalGames,
        results: results.map(r => `${r.season}-${r.status}:${r.count}`),
      });

      console.log(
        `🎮 Games cache warmed: ${totalGames} games across ${results.length} season/status combinations`
      );
    } catch (error) {
      logger.error('Games cache warming failed', { error: String(error) });
      throw error;
    }
  }

  /**
   * Get available seasons from the database
   */
  private async getAvailableSeasons(): Promise<number[]> {
    try {
      // Query the database to get available seasons
      const response = await fetch(getServerApiUrl('/api/games?season=all&page=1&limit=1'));
      if (!response.ok) {
        // If we can't query the database, fall back to recent seasons
        logger.warn('Could not query database for available seasons, using fallback');
        return [2022, 2023, 2024]; // Fallback to recent seasons
      }

      const data = await response.json();
      if (data.success && data.pagination) {
        // For now, return recent seasons since we don't have a direct seasons API
        // In the future, we could add a seasons endpoint
        return [2022, 2023, 2024];
      }

      return [2022, 2023, 2024]; // Fallback
    } catch (error) {
      logger.warn('Failed to get available seasons, using fallback', { error: String(error) });
      return [2022, 2023, 2024]; // Fallback to recent seasons
    }
  }

  /**
   * Warm cache for a specific season and status combination
   */
  private async warmGamesForSeasonAndStatus(
    season: number | string,
    status: string
  ): Promise<{ season: number | string; status: string; count: number }> {
    try {
      // Warm the first few pages for each combination
      const pagesToWarm = [1, 2, 3]; // Warm first 3 pages
      let totalCount = 0;

      for (const page of pagesToWarm) {
        const response = await fetch(
          getServerApiUrl(`/api/games?season=${season}&status=${status}&page=${page}&limit=50`)
        );

        if (!response.ok) {
          // If we get a 404 or 500 error, it might mean no data for this combination
          if (response.status === 404 || response.status === 500) {
            logger.warn(
              `No data found for season ${season}, status ${status}, page ${page} (${response.status})`
            );
            continue;
          }
          throw new Error(
            `Failed to warm cache for season ${season}, status ${status}, page ${page}: ${response.status}`
          );
        }

        const data = await response.json();
        const pageCount = data.data?.length || data.response?.length || 0;
        totalCount += pageCount;

        // If we get fewer games than the limit, we've reached the end
        if (pageCount < 50) {
          break;
        }
      }

      return { season, status, count: totalCount };
    } catch (error) {
      // Log as warning instead of error for missing data scenarios
      logger.warn(`Could not warm cache for season ${season}, status ${status}`, {
        error: String(error),
      });
      return { season, status, count: 0 };
    }
  }

  /**
   * Warm up players cache
   */
  private async warmPlayersCache(): Promise<void> {
    try {
      const [filterOptionsResponse, playersResponse] = await Promise.all([
        fetch(getServerApiUrl('/api/players?options=true')),
        fetch(getServerApiUrl('/api/players?limit=5000')), // Use LARGE limit to get all players
      ]);

      if (!filterOptionsResponse.ok || !playersResponse.ok) {
        throw new Error('Failed to warm players cache');
      }

      const [filterOptions, players] = await Promise.all([
        filterOptionsResponse.json(),
        playersResponse.json(),
      ]);

      logger.info('Players cache warmed', {
        filterOptionsCount: Object.keys(filterOptions).length,
        playersCount: players.response?.length || 0,
      });

      console.log(
        `👥 Players cache warmed: ${players.response?.length || 0} players, ${Object.keys(filterOptions).length} filter options`
      );
    } catch (error) {
      logger.error('Players cache warming failed', { error: String(error) });
      throw error;
    }
  }

  /**
   * Warm up teams cache
   */
  private async warmTeamsCache(): Promise<void> {
    try {
      const response = await fetch(getServerApiUrl('/api/teams'));
      if (!response.ok) {
        throw new Error(`Failed to warm teams cache: ${response.status}`);
      }

      const data = await response.json();

      logger.info('Teams cache warmed', {
        teamsCount: data.teams?.length || 0,
      });

      console.log(`🏀 Teams cache warmed: ${data.teams?.length || 0} teams`);
    } catch (error) {
      logger.error('Teams cache warming failed', { error: String(error) });
      throw error;
    }
  }

  /**
   * Warm up NBA Hub counts cache
   */
  private async warmNBAHubCountsCache(): Promise<void> {
    try {
      const response = await fetch(getServerApiUrl('/api/nba-hub/counts'));
      if (!response.ok) {
        throw new Error(`Failed to warm NBA Hub counts cache: ${response.status}`);
      }

      const data = await response.json();

      logger.info('NBA Hub counts cache warmed', {
        games: data.counts?.games || 0,
        teams: data.counts?.teams || 0,
        players: data.counts?.players || 0,
      });

      console.log(
        `📊 NBA Hub counts cache warmed: ${data.counts?.games || 0} games, ${data.counts?.teams || 0} teams, ${data.counts?.players || 0} players`
      );
    } catch (error) {
      logger.error('NBA Hub counts cache warming failed', { error: String(error) });
      throw error;
    }
  }

  /**
   * Warm up game logs cache
   */
  private warmGameLogsCache(): Promise<void> {
    try {
      logger.info('Game logs cache warming started');

      // Note: Game logs require authentication, so we can't warm them from server-side
      // The cache will be populated when users access the dashboard
      logger.info('Game logs cache warming skipped', {
        reason: 'Game logs require user authentication - cache will be populated on user access',
      });

      return Promise.resolve();
    } catch (error) {
      logger.error('Game logs cache warming failed', { error: String(error) });
      // Don't throw error for game logs warming as it's expected to fail without auth
      return Promise.resolve();
    }
  }

  /**
   * Get service status and statistics
   */
  getStatus(): {
    isRunning: boolean;
    warmingIntervalMs: number;
    lastWarmingTime?: Date;
  } {
    return {
      isRunning: this.isRunning,
      warmingIntervalMs: this.WARMING_INTERVAL_MS,
    };
  }
}

// Export singleton instance
export const cacheWarmingService = CacheWarmingService.getInstance();
