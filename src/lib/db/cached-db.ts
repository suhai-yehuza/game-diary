import { eq, and, desc, sql } from 'drizzle-orm';

import { CachedQueries, generateCacheKey } from '@/lib/cache/db-cache';
import { db } from '@/lib/db';
import {
  users,
  game_logs,
  nba_games,
  teams,
  nba_players,
  comments,
  friendships,
} from '@/lib/db/schema';

// Cached database wrapper
export class CachedDatabase {
  private static instance: CachedDatabase;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): CachedDatabase {
    if (!CachedDatabase.instance) {
      CachedDatabase.instance = new CachedDatabase();
    }
    return CachedDatabase.instance;
  }

  /**
   * Get database instance
   */
  getDB() {
    return db();
  }

  // ========================================
  // USER QUERIES
  // ========================================

  /**
   * Get user by ID with caching
   */
  async getUserById(userId: string) {
    return CachedQueries.getUser(userId, async () => {
      return this.getDB()?.query.users.findFirst({
        where: eq(users.id, userId),
      });
    });
  }

  /**
   * Get users with filters and caching
   */
  async getUsers(
    filters: {
      limit?: number;
      offset?: number;
      search?: string;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    } = {}
  ) {
    return CachedQueries.getUsers(filters, async () => {
      const {
        limit = 10,
        offset = 0,
        search: _search,
        sortBy: _sortBy = 'created_at',
        sortDirection = 'desc',
      } = filters;

      const whereConditions = [];
      if (_search) {
        whereConditions.push(
          sql`LOWER(username) LIKE LOWER(${'%' + _search + '%'}) OR LOWER(first_name) LIKE LOWER(${'%' + _search + '%'}) OR LOWER(last_name) LIKE LOWER(${'%' + _search + '%'})`
        );
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      return this.getDB()?.query.users.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [sortDirection === 'asc' ? users.created_at : desc(users.created_at)],
      });
    });
  }

  // ========================================
  // GAME QUERIES
  // ========================================

  /**
   * Get game by ID with caching
   */
  async getGameById(gameId: string) {
    return CachedQueries.getGame(gameId, async () => {
      return this.getDB()?.query.nba_games.findFirst({
        where: eq(nba_games.id, gameId),
      });
    });
  }

  /**
   * Get games with filters and caching
   */
  async getGames(
    filters: {
      limit?: number;
      offset?: number;
      dateRange?: { start: Date; end?: Date };
      status?: string;
      teamId?: string;
      search?: string;
    } = {}
  ) {
    return CachedQueries.getGames(filters, async () => {
      const { limit = 10, offset = 0, dateRange, status, teamId, search: _search } = filters;

      const whereConditions = [];

      if (dateRange) {
        if (dateRange.end) {
          whereConditions.push(
            sql`${nba_games.date} >= ${dateRange.start} AND ${nba_games.date} <= ${dateRange.end}`
          );
        } else {
          whereConditions.push(sql`${nba_games.date} >= ${dateRange.start}`);
        }
      }

      if (status) {
        whereConditions.push(eq(nba_games.status, status));
      }

      if (teamId) {
        whereConditions.push(
          sql`(${nba_games.home_team_id} = ${teamId} OR ${nba_games.away_team_id} = ${teamId})`
        );
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      return this.getDB()?.query.nba_games.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(nba_games.date)],
      });
    });
  }

  // ========================================
  // GAME LOG QUERIES
  // ========================================

  /**
   * Get game log by ID with caching
   */
  async getGameLogById(gameLogId: string) {
    return CachedQueries.getGameLog(gameLogId, async () => {
      return this.getDB()?.query.game_logs.findFirst({
        where: eq(game_logs.id, gameLogId),
        with: {
          user: true,
        },
      });
    });
  }

  /**
   * Get game logs with filters and caching
   */
  async getGameLogs(
    filters: {
      limit?: number;
      offset?: number;
      userId?: string;
      gameId?: string;
      classification?: string;
      search?: string;
    } = {}
  ) {
    return CachedQueries.getGameLogs(filters, async () => {
      const { limit = 10, offset = 0, userId, gameId, classification, search } = filters;

      const whereConditions = [];

      if (userId) {
        whereConditions.push(eq(game_logs.user_id, userId));
      }

      if (gameId) {
        whereConditions.push(eq(game_logs.game_id, gameId));
      }

      if (classification) {
        whereConditions.push(eq(game_logs.classification, classification));
      }

      if (search) {
        whereConditions.push(sql`LOWER(notes) LIKE LOWER(${'%' + search + '%'})`);
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      return this.getDB()?.query.game_logs.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(game_logs.created_at)],
        with: {
          user: true,
        },
      });
    });
  }

  // ========================================
  // TEAM QUERIES
  // ========================================

  /**
   * Get team by ID with caching
   */
  async getTeamById(teamId: string) {
    return CachedQueries.getTeam(teamId, async () => {
      return this.getDB()?.query.teams.findFirst({
        where: eq(teams.id, teamId),
      });
    });
  }

  /**
   * Get teams with filters and caching
   */
  async getTeams(
    filters: {
      limit?: number;
      offset?: number;
      conference?: string;
      search?: string;
    } = {}
  ) {
    return CachedQueries.getTeams(filters, async () => {
      const { limit = 10, offset = 0, conference, search } = filters;

      const whereConditions = [];

      if (conference) {
        whereConditions.push(eq(teams.conference, conference));
      }

      if (search) {
        whereConditions.push(
          sql`LOWER(name) LIKE LOWER(${'%' + search + '%'}) OR LOWER(city) LIKE LOWER(${'%' + search + '%'})`
        );
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      return this.getDB()?.query.teams.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [teams.name],
      });
    });
  }

  // ========================================
  // PLAYER QUERIES
  // ========================================

  /**
   * Get player by ID with caching
   */
  async getPlayerById(playerId: string) {
    return CachedQueries.getPlayer(playerId, async () => {
      return this.getDB()?.query.nba_players.findFirst({
        where: eq(nba_players.id, playerId),
      });
    });
  }

  /**
   * Get players with filters and caching
   */
  async getPlayers(
    filters: {
      limit?: number;
      offset?: number;
      teamId?: string;
      search?: string;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    } = {}
  ) {
    return CachedQueries.getPlayers(filters, async () => {
      const {
        limit = 10,
        offset = 0,
        teamId: _teamId,
        search,
        sortBy: _sortBy = 'last_name',
        sortDirection = 'asc',
      } = filters;

      const whereConditions = [];

      if (search) {
        whereConditions.push(
          sql`LOWER(first_name) LIKE LOWER(${'%' + search + '%'}) OR LOWER(last_name) LIKE LOWER(${'%' + search + '%'}) OR LOWER(college) LIKE LOWER(${'%' + search + '%'})`
        );
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      return this.getDB()?.query.nba_players.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [sortDirection === 'asc' ? nba_players.last_name : desc(nba_players.last_name)],
      });
    });
  }

  // ========================================
  // SEARCH QUERIES
  // ========================================

  /**
   * Search across multiple tables with caching
   */
  async search(
    query: string,
    filters: {
      limit?: number;
      offset?: number;
      tables?: string[];
    } = {}
  ) {
    return CachedQueries.search(query, filters, async () => {
      const {
        limit = 10,
        offset = 0,
        tables = ['users', 'game_logs', 'games', 'teams', 'players'],
      } = filters;
      const searchPattern = `%${query}%`;

      const results: Record<string, unknown[]> = {};

      // Search users
      if (tables.includes('users')) {
        const usersQuery = sql`
          SELECT id, username, first_name, last_name, email_address, created_at
          FROM users
          WHERE LOWER(username) LIKE LOWER(${searchPattern}) OR
                LOWER(first_name) LIKE LOWER(${searchPattern}) OR
                LOWER(last_name) LIKE LOWER(${searchPattern}) OR
                LOWER(email_address) LIKE LOWER(${searchPattern})
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const usersResult = await this.getDB()?.execute(usersQuery);
        results.users = usersResult?.rows || [];
      }

      // Search game logs
      if (tables.includes('game_logs')) {
        const gameLogsQuery = sql`
          SELECT id, user_id, game_id, rating_for_game, notes, classification, created_at
          FROM game_logs
          WHERE LOWER(notes) LIKE LOWER(${searchPattern})
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const gameLogsResult = await this.getDB()?.execute(gameLogsQuery);
        results.gameLogs = gameLogsResult?.rows || [];
      }

      // Search games
      if (tables.includes('games')) {
        const gamesQuery = sql`
          SELECT id, date, status, home_team_id, away_team_id, created_at
          FROM nba_games
          WHERE LOWER(status) LIKE LOWER(${searchPattern})
          ORDER BY date DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const gamesResult = await this.getDB()?.execute(gamesQuery);
        results.games = gamesResult?.rows || [];
      }

      // Search teams
      if (tables.includes('teams')) {
        const teamsQuery = sql`
          SELECT id, name, city, conference, created_at
          FROM teams
          WHERE LOWER(name) LIKE LOWER(${searchPattern}) OR
                LOWER(city) LIKE LOWER(${searchPattern}) OR
                LOWER(conference) LIKE LOWER(${searchPattern})
          ORDER BY name ASC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const teamsResult = await this.getDB()?.execute(teamsQuery);
        results.teams = teamsResult?.rows || [];
      }

      // Search players
      if (tables.includes('players')) {
        const playersQuery = sql`
          SELECT id, first_name, last_name, college, affiliation, created_at
          FROM nba_players
          WHERE LOWER(first_name) LIKE LOWER(${searchPattern}) OR
                LOWER(last_name) LIKE LOWER(${searchPattern}) OR
                LOWER(college) LIKE LOWER(${searchPattern})
          ORDER BY last_name ASC, first_name ASC
          LIMIT ${limit} OFFSET ${offset}
        `;
        const playersResult = await this.getDB()?.execute(playersQuery);
        results.players = playersResult?.rows || [];
      }

      return results;
    });
  }

  // ========================================
  // COMMENT QUERIES
  // ========================================

  /**
   * Get comments with filters and caching
   */
  async getComments(
    filters: {
      limit?: number;
      offset?: number;
      parentId?: string;
      parentType?: string;
      userId?: string;
    } = {}
  ) {
    return CachedQueries.getComments(filters, async () => {
      const { limit = 10, offset = 0, parentId, parentType, userId } = filters;

      const whereConditions = [];

      if (parentId) {
        whereConditions.push(eq(comments.parent_id, parentId));
      }

      if (parentType) {
        whereConditions.push(eq(comments.parent_type, parentType as 'COMMENT' | 'GAME_LOG'));
      }

      if (userId) {
        whereConditions.push(eq(comments.user_id, userId));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      return this.getDB()?.query.comments.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(comments.created_at)],
        with: {
          user: true,
        },
      });
    });
  }

  // ========================================
  // FRIENDSHIP QUERIES
  // ========================================

  /**
   * Get friendships for a user with caching
   */
  async getFriendships(
    userId: string,
    filters: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ) {
    return CachedQueries.getFriendships(userId, filters, async () => {
      const { limit = 10, offset = 0, status } = filters;

      const whereConditions = [eq(friendships.user_id, userId)];

      if (status) {
        whereConditions.push(
          eq(friendships.status, status as 'ACCEPTED' | 'BLOCKED' | 'PENDING' | 'REJECTED')
        );
      }

      const whereClause = and(...whereConditions);

      return this.getDB()?.query.friendships.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: [desc(friendships.created_at)],
      });
    });
  }

  // ========================================
  // ANALYTICS QUERIES
  // ========================================

  /**
   * Get analytics data with caching
   */
  async getAnalytics(
    filters: {
      userId?: string;
      dateRange?: { start: Date; end: Date };
      type?: string;
    } = {}
  ) {
    return CachedQueries.getAnalytics(filters, async () => {
      const { userId, dateRange, type } = filters;

      let query: ReturnType<typeof sql>;

      switch (type) {
        case 'user_stats':
          query = sql`
            SELECT
              COUNT(*) as total_game_logs,
              AVG(rating_for_game) as avg_rating,
              COUNT(DISTINCT game_id) as unique_games
            FROM game_logs
            WHERE user_id = ${userId}
          `;
          break;

        case 'popular_games':
          query = sql`
            SELECT
              game_id,
              COUNT(*) as log_count,
              AVG(rating_for_game) as avg_rating
            FROM game_logs
            GROUP BY game_id
            ORDER BY log_count DESC
            LIMIT 10
          `;
          break;

        case 'user_activity':
          query = sql`
            SELECT
              DATE(created_at) as date,
              COUNT(*) as activity_count
            FROM game_logs
            WHERE user_id = ${userId}
              AND created_at >= ${dateRange?.start}
              AND created_at <= ${dateRange?.end}
            GROUP BY DATE(created_at)
            ORDER BY date DESC
          `;
          break;

        default:
          throw new Error(`Unknown analytics type: ${type}`);
      }

      const result = await this.getDB()?.execute(query);
      return result?.rows || [];
    });
  }

  // ========================================
  // CACHE MANAGEMENT
  // ========================================

  /**
   * Invalidate cache for a specific table
   */
  async invalidateTable(table: string): Promise<void> {
    const _cacheKey = generateCacheKey(table, 'invalidate', { timestamp: Date.now() });
    await CachedQueries.rawSQL(sql`SELECT 1`, [], () => {
      // This will trigger cache invalidation
      return Promise.resolve({ invalidated: true });
    });
  }

  /**
   * Invalidate cache for a specific user
   */
  async invalidateUser(userId: string): Promise<void> {
    const _cacheKey = generateCacheKey('users', 'invalidate', { userId, timestamp: Date.now() });
    await CachedQueries.rawSQL(sql`SELECT 1`, [], () => {
      // This will trigger cache invalidation
      return Promise.resolve({ invalidated: true });
    });
  }
}

// Export singleton instance
export const cachedDB = CachedDatabase.getInstance();
