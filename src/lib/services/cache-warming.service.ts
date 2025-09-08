import { logger } from '@/lib/utils/logger';

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
      const seasons = [2020, 2021, 2022, 2023, 2024]; // Recent seasons
      const warmPromises = seasons.map(async season => {
        const response = await fetch(`http://localhost:3000/api/games?season=${season}&limit=5000`);
        if (!response.ok) {
          throw new Error(`Failed to warm games cache for season ${season}: ${response.status}`);
        }
        const data = await response.json();
        return { season, count: data.response?.length || 0 };
      });

      // Also warm the merged cache for "all seasons" view
      const mergedResponse = await fetch('http://localhost:3000/api/games?season=all&limit=20000');
      if (!mergedResponse.ok) {
        throw new Error(`Failed to warm merged games cache: ${mergedResponse.status}`);
      }
      const mergedData = await mergedResponse.json();

      const results = await Promise.all(warmPromises);
      const totalGames = results.reduce((sum, r) => sum + r.count, 0);
      const mergedGames = mergedData.response?.length || 0;

      logger.info('Games cache warmed', {
        seasons: results.map(r => r.season),
        totalGames,
        mergedGames,
      });

      console.log(
        `🎮 Games cache warmed: ${totalGames} games across ${seasons.length} seasons + ${mergedGames} merged games`
      );
    } catch (error) {
      logger.error('Games cache warming failed', { error: String(error) });
      throw error;
    }
  }

  /**
   * Warm up players cache
   */
  private async warmPlayersCache(): Promise<void> {
    try {
      const [filterOptionsResponse, playersResponse] = await Promise.all([
        fetch('http://localhost:3000/api/players?options=true'),
        fetch('http://localhost:3000/api/players?limit=5000'), // Use LARGE limit to get all players
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
      const response = await fetch('http://localhost:3000/api/teams');
      if (!response.ok) {
        throw new Error(`Failed to warm teams cache: ${response.status}`);
      }

      const data = await response.json();

      logger.info('Teams cache warmed', {
        teamsCount: data.response?.length || 0,
      });

      console.log(`🏀 Teams cache warmed: ${data.response?.length || 0} teams`);
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
      const response = await fetch('http://localhost:3000/api/nba-hub/counts');
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
