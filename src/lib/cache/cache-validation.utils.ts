import { getAppUrl } from '@/lib/config/app.config';
import { logger } from '@/lib/utils/logger';

import { simpleCacheService } from './simple-cache-service';

/**
 * Cache validation utilities to ensure data consistency
 * Prevents stale cache issues by validating cache data against database
 */
export class CacheValidationUtils {
  /**
   * Validate players cache consistency
   * Checks if cached player count matches database count
   */
  static async validatePlayersCache(): Promise<{
    isValid: boolean;
    cachedCount: number;
    databaseCount: number;
    needsRefresh: boolean;
  }> {
    try {
      // Get cached players count
      const cachedData = simpleCacheService.get('players:all');
      const cachedCount = (cachedData as { response?: unknown[] })?.response?.length || 0;

      // Get database count from NBA Hub counts API
      const response = await fetch(`${getAppUrl()}/api/nba-hub/counts`);
      const data = await response.json();
      const databaseCount = data.counts?.players || 0;

      const isValid = cachedCount === databaseCount;
      const needsRefresh = !isValid && cachedCount > 0; // Only refresh if we have cached data but it's wrong

      logger.info('Players cache validation', {
        cachedCount,
        databaseCount,
        isValid,
        needsRefresh,
      });

      return {
        isValid,
        cachedCount,
        databaseCount,
        needsRefresh,
      };
    } catch (error) {
      logger.error('Players cache validation failed', { error: String(error) });
      return {
        isValid: false,
        cachedCount: 0,
        databaseCount: 0,
        needsRefresh: true,
      };
    }
  }

  /**
   * Validate games cache consistency
   */
  static async validateGamesCache(): Promise<{
    isValid: boolean;
    cachedCount: number;
    databaseCount: number;
    needsRefresh: boolean;
  }> {
    try {
      // Get cached games count
      const cachedData = simpleCacheService.get('games:all');
      const cachedCount = (cachedData as { response?: unknown[] })?.response?.length || 0;

      // Get database count from NBA Hub counts API
      const response = await fetch(`${getAppUrl()}/api/nba-hub/counts`);
      const data = await response.json();
      const databaseCount = data.counts?.games || 0;

      const isValid = cachedCount === databaseCount;
      const needsRefresh = !isValid && cachedCount > 0;

      logger.info('Games cache validation', {
        cachedCount,
        databaseCount,
        isValid,
        needsRefresh,
      });

      return {
        isValid,
        cachedCount,
        databaseCount,
        needsRefresh,
      };
    } catch (error) {
      logger.error('Games cache validation failed', { error: String(error) });
      return {
        isValid: false,
        cachedCount: 0,
        databaseCount: 0,
        needsRefresh: true,
      };
    }
  }

  /**
   * Validate teams cache consistency
   */
  static async validateTeamsCache(): Promise<{
    isValid: boolean;
    cachedCount: number;
    databaseCount: number;
    needsRefresh: boolean;
  }> {
    try {
      // Get cached teams count
      const cachedData = simpleCacheService.get('teams:all');
      const cachedCount = (cachedData as { response?: unknown[] })?.response?.length || 0;

      // Get database count from NBA Hub counts API
      const response = await fetch(`${getAppUrl()}/api/nba-hub/counts`);
      const data = await response.json();
      const databaseCount = data.counts?.teams || 0;

      const isValid = cachedCount === databaseCount;
      const needsRefresh = !isValid && cachedCount > 0;

      logger.info('Teams cache validation', {
        cachedCount,
        databaseCount,
        isValid,
        needsRefresh,
      });

      return {
        isValid,
        cachedCount,
        databaseCount,
        needsRefresh,
      };
    } catch (error) {
      logger.error('Teams cache validation failed', { error: String(error) });
      return {
        isValid: false,
        cachedCount: 0,
        databaseCount: 0,
        needsRefresh: true,
      };
    }
  }

  /**
   * Validate NBA Hub counts cache consistency
   */
  static async validateNBAHubCountsCache(): Promise<{
    isValid: boolean;
    needsRefresh: boolean;
  }> {
    try {
      // Test if NBA Hub counts API is working and returning data
      const response = await fetch(`${getAppUrl()}/api/nba-hub/counts`);
      const data = await response.json();

      // Check if we got valid counts data
      const hasValidCounts =
        data.success &&
        data.counts &&
        typeof data.counts.games === 'number' &&
        typeof data.counts.teams === 'number' &&
        typeof data.counts.players === 'number';

      // NBA Hub counts are considered valid if the API is working and returning data
      const isValid = hasValidCounts;
      const needsRefresh = !hasValidCounts;

      logger.info('NBA Hub counts cache validation', {
        hasValidCounts,
        counts: data.counts,
        isValid,
        needsRefresh,
      });

      return {
        isValid,
        needsRefresh,
      };
    } catch (error) {
      logger.error('NBA Hub counts cache validation failed', { error: String(error) });
      return {
        isValid: false,
        needsRefresh: true,
      };
    }
  }

  /**
   * Validate game logs cache consistency
   */
  static validateGameLogsCache(): Promise<{
    isValid: boolean;
    needsRefresh: boolean;
  }> {
    try {
      // Game logs require authentication, so we can't validate them from server-side
      // This is expected behavior - the cache will be validated when users access the dashboard

      logger.info('Game logs cache validation skipped', {
        reason: 'Game logs require user authentication - validation will occur on user access',
      });

      // Consider game logs cache as valid since it's user-dependent
      return Promise.resolve({
        isValid: true,
        needsRefresh: false,
      });
    } catch (error) {
      logger.error('Game logs cache validation failed', { error: String(error) });
      return Promise.resolve({
        isValid: true, // Don't mark as invalid since it's auth-dependent
        needsRefresh: false,
      });
    }
  }

  /**
   * Validate all caches and refresh if needed
   */
  static async validateAndRefreshAllCaches(): Promise<{
    players: { isValid: boolean; needsRefresh: boolean };
    games: { isValid: boolean; needsRefresh: boolean };
    teams: { isValid: boolean; needsRefresh: boolean };
    nbaHubCounts: { isValid: boolean; needsRefresh: boolean };
    gameLogs: { isValid: boolean; needsRefresh: boolean };
    refreshedCaches: string[];
  }> {
    const results = await Promise.all([
      this.validatePlayersCache(),
      this.validateGamesCache(),
      this.validateTeamsCache(),
      this.validateNBAHubCountsCache(),
      this.validateGameLogsCache(),
    ]);

    const [players, games, teams, nbaHubCounts, gameLogs] = results;
    const refreshedCaches: string[] = [];

    // Refresh invalid caches
    if (players.needsRefresh) {
      await this.refreshPlayersCache();
      refreshedCaches.push('players');
    }

    if (games.needsRefresh) {
      await this.refreshGamesCache();
      refreshedCaches.push('games');
    }

    if (teams.needsRefresh) {
      await this.refreshTeamsCache();
      refreshedCaches.push('teams');
    }

    if (nbaHubCounts.needsRefresh) {
      await this.refreshNBAHubCountsCache();
      refreshedCaches.push('nbaHubCounts');
    }

    if (gameLogs.needsRefresh) {
      await this.refreshGameLogsCache();
      refreshedCaches.push('gameLogs');
    }

    logger.info('Cache validation and refresh completed', {
      players: { isValid: players.isValid, needsRefresh: players.needsRefresh },
      games: { isValid: games.isValid, needsRefresh: games.needsRefresh },
      teams: { isValid: teams.isValid, needsRefresh: teams.needsRefresh },
      nbaHubCounts: { isValid: nbaHubCounts.isValid, needsRefresh: nbaHubCounts.needsRefresh },
      gameLogs: { isValid: gameLogs.isValid, needsRefresh: gameLogs.needsRefresh },
      refreshedCaches,
    });

    return {
      players: { isValid: players.isValid, needsRefresh: players.needsRefresh },
      games: { isValid: games.isValid, needsRefresh: games.needsRefresh },
      teams: { isValid: teams.isValid, needsRefresh: teams.needsRefresh },
      nbaHubCounts: { isValid: nbaHubCounts.isValid, needsRefresh: nbaHubCounts.needsRefresh },
      gameLogs: { isValid: gameLogs.isValid, needsRefresh: gameLogs.needsRefresh },
      refreshedCaches,
    };
  }

  /**
   * Refresh players cache by fetching fresh data
   */
  private static async refreshPlayersCache(): Promise<void> {
    try {
      logger.info('Refreshing players cache...');

      // Clear existing cache
      simpleCacheService.invalidate({ pattern: 'players:*' });

      // Fetch fresh data with bypass cache
      const response = await fetch(`${getAppUrl()}/api/players?limit=5000&bypass-cache=true`);
      if (!response.ok) {
        throw new Error(`Failed to refresh players cache: ${response.status}`);
      }

      logger.info('Players cache refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh players cache', { error: String(error) });
      throw error;
    }
  }

  /**
   * Refresh games cache by fetching fresh data
   */
  private static async refreshGamesCache(): Promise<void> {
    try {
      logger.info('Refreshing games cache...');

      // Clear existing cache
      simpleCacheService.invalidate({ pattern: 'games:*' });

      // Fetch fresh data with bypass cache
      const response = await fetch(`${getAppUrl()}/api/games?limit=20000&bypass-cache=true`);
      if (!response.ok) {
        throw new Error(`Failed to refresh games cache: ${response.status}`);
      }

      logger.info('Games cache refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh games cache', { error: String(error) });
      throw error;
    }
  }

  /**
   * Refresh teams cache by fetching fresh data
   */
  private static async refreshTeamsCache(): Promise<void> {
    try {
      logger.info('Refreshing teams cache...');

      // Clear existing cache
      simpleCacheService.invalidate({ pattern: 'teams:*' });

      // Fetch fresh data with bypass cache
      const response = await fetch(`${getAppUrl()}/api/teams?bypass-cache=true`);
      if (!response.ok) {
        throw new Error(`Failed to refresh teams cache: ${response.status}`);
      }

      logger.info('Teams cache refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh teams cache', { error: String(error) });
      throw error;
    }
  }

  /**
   * Refresh NBA Hub counts cache by fetching fresh data
   */
  private static async refreshNBAHubCountsCache(): Promise<void> {
    try {
      logger.info('Refreshing NBA Hub counts cache...');

      // Clear existing cache
      simpleCacheService.invalidate({ pattern: 'nbaHub:*' });

      // Fetch fresh data with bypass cache
      const response = await fetch('http://localhost:3000/api/nba-hub/counts?bypass-cache=true');
      if (!response.ok) {
        throw new Error(`Failed to refresh NBA Hub counts cache: ${response.status}`);
      }

      logger.info('NBA Hub counts cache refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh NBA Hub counts cache', { error: String(error) });
      throw error;
    }
  }

  /**
   * Refresh game logs cache by fetching fresh data
   */
  private static async refreshGameLogsCache(): Promise<void> {
    try {
      logger.info('Refreshing game logs cache...');

      // Import GameLogsService dynamically to avoid circular dependencies
      const { GameLogsService } = await import('@/lib/services/game-logs.service');

      // Clear existing cache
      simpleCacheService.invalidate({ pattern: 'gameLogs:*' });

      // Fetch fresh data with bypass cache
      await GameLogsService.getGameLogs({}, { page: 1, limit: 20 }, { useCache: false });

      logger.info('Game logs cache refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh game logs cache', { error: String(error) });
      throw error;
    }
  }
}
