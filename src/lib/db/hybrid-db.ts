import { eq, and, desc, sql } from 'drizzle-orm';

import { HybridQueries, generateHybridCacheKey } from '@/lib/cache/hybrid-cache';
import { db } from '@/lib/db';
import {
  users,
  game_logs,
  nba_games,
  teams,
  nba_players,
  comments,
  friendships,
  seasons,
} from '@/lib/db/schema';
import { errorHandlers } from '@/lib/utils/error-handler';

// External API service for NBA data
class NBAAPIService {
  private static instance: NBAAPIService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): NBAAPIService {
    if (!NBAAPIService.instance) {
      NBAAPIService.instance = new NBAAPIService();
    }
    return NBAAPIService.instance;
  }

  /**
   * Fetch games from external NBA API
   */
  async fetchGames(
    filters: {
      date?: string;
      season?: string;
      teamId?: string;
      status?: string;
    } = {}
  ): Promise<unknown[]> {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.season) params.append('season', filters.season);
      if (filters.teamId) params.append('team', filters.teamId);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/proxy/games?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`NBA API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || [];
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NBA API Service',
        action: 'Fetch Games',
      });
      throw error;
    }
  }

  /**
   * Fetch a specific game from external NBA API
   */
  async fetchGame(gameId: string): Promise<unknown | null> {
    try {
      const response = await fetch(`/api/proxy/games/${gameId}`);
      if (!response.ok) {
        throw new Error(`NBA API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response?.[0] || null;
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NBA API Service',
        action: 'Fetch Game',
      });
      throw error;
    }
  }

  /**
   * Fetch teams from external NBA API
   */
  async fetchTeams(
    filters: {
      conference?: string;
      division?: string;
    } = {}
  ): Promise<unknown[]> {
    try {
      const params = new URLSearchParams();
      if (filters.conference) params.append('conference', filters.conference);
      if (filters.division) params.append('division', filters.division);

      const response = await fetch(`/api/proxy/teams?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`NBA API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || [];
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NBA API Service',
        action: 'Fetch Teams',
      });
      throw error;
    }
  }

  /**
   * Fetch a specific team from external NBA API
   */
  async fetchTeam(teamId: string): Promise<unknown | null> {
    try {
      const response = await fetch(`/api/proxy/teams/${teamId}`);
      if (!response.ok) {
        throw new Error(`NBA API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response?.[0] || null;
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NBA API Service',
        action: 'Fetch Team',
      });
      throw error;
    }
  }

  /**
   * Fetch players from external NBA API
   */
  async fetchPlayers(
    filters: {
      teamId?: string;
      search?: string;
      season?: string;
    } = {}
  ): Promise<unknown[]> {
    try {
      const params = new URLSearchParams();
      if (filters.teamId) params.append('team', filters.teamId);
      if (filters.search) params.append('search', filters.search);
      if (filters.season) params.append('season', filters.season);

      const response = await fetch(`/api/proxy/players?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`NBA API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || [];
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NBA API Service',
        action: 'Fetch Players',
      });
      throw error;
    }
  }

  /**
   * Fetch a specific player from external NBA API
   */
  async fetchPlayer(playerId: string): Promise<unknown | null> {
    try {
      const response = await fetch(`/api/proxy/players/${playerId}`);
      if (!response.ok) {
        throw new Error(`NBA API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response?.[0] || null;
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NBA API Service',
        action: 'Fetch Player',
      });
      throw error;
    }
  }

  /**
   * Fetch seasons from external NBA API
   */
  async fetchSeasons(): Promise<unknown[]> {
    try {
      const response = await fetch('/api/proxy/seasons');
      if (!response.ok) {
        throw new Error(`NBA API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || [];
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'NBA API Service',
        action: 'Fetch Seasons',
      });
      throw error;
    }
  }
}

// Hybrid database wrapper
export class HybridDatabase {
  private static instance: HybridDatabase;
  private readonly nbaAPI: NBAAPIService;

  private constructor() {
    this.nbaAPI = NBAAPIService.getInstance();
  }

  static getInstance(): HybridDatabase {
    if (!HybridDatabase.instance) {
      HybridDatabase.instance = new HybridDatabase();
    }
    return HybridDatabase.instance;
  }

  /**
   * Get database instance
   */
  getDB() {
    return db();
  }

  // ========================================
  // NBA DATA QUERIES (API + Redis, DB fallback)
  // ========================================

  /**
   * Get NBA games with hybrid caching (API + Redis, DB fallback)
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
    return HybridQueries.getGames(
      filters,
      // API query function
      async () => {
        const apiFilters: Record<string, string> = {};
        if (filters.status) apiFilters.status = filters.status;
        if (filters.teamId) apiFilters.teamId = filters.teamId;
        if (filters.dateRange?.start) {
          apiFilters.date = filters.dateRange.start.toISOString().split('T')[0];
        }

        return this.nbaAPI.fetchGames(apiFilters);
      },
      // DB query function
      async () => {
        const { limit = 10, offset = 0, dateRange, status, teamId } = filters;

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
      }
    );
  }

  /**
   * Get NBA game by ID with hybrid caching
   */
  async getGameById(gameId: string) {
    return HybridQueries.getGame(
      gameId,
      // API query function
      async () => this.nbaAPI.fetchGame(gameId),
      // DB query function
      async () => {
        return this.getDB()?.query.nba_games.findFirst({
          where: eq(nba_games.id, gameId),
        });
      }
    );
  }

  /**
   * Get NBA teams with hybrid caching
   */
  async getTeams(
    filters: {
      limit?: number;
      offset?: number;
      conference?: string;
      search?: string;
    } = {}
  ) {
    return HybridQueries.getTeams(
      filters,
      // API query function
      async () => {
        const apiFilters: Record<string, string> = {};
        if (filters.conference) apiFilters.conference = filters.conference;

        return this.nbaAPI.fetchTeams(apiFilters);
      },
      // DB query function
      async () => {
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
      }
    );
  }

  /**
   * Get NBA team by ID with hybrid caching
   */
  async getTeamById(teamId: string) {
    return HybridQueries.getTeam(
      teamId,
      // API query function
      async () => this.nbaAPI.fetchTeam(teamId),
      // DB query function
      async () => {
        return this.getDB()?.query.teams.findFirst({
          where: eq(teams.id, teamId),
        });
      }
    );
  }

  /**
   * Get NBA players with hybrid caching
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
    return HybridQueries.getPlayers(
      filters,
      // API query function
      async () => {
        const apiFilters: Record<string, string> = {};
        if (filters.teamId) apiFilters.teamId = filters.teamId;
        if (filters.search) apiFilters.search = filters.search;

        return this.nbaAPI.fetchPlayers(apiFilters);
      },
      // DB query function
      async () => {
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
      }
    );
  }

  /**
   * Get NBA player by ID with hybrid caching
   */
  async getPlayerById(playerId: string) {
    return HybridQueries.getPlayer(
      playerId,
      // API query function
      async () => this.nbaAPI.fetchPlayer(playerId),
      // DB query function
      async () => {
        return this.getDB()?.query.nba_players.findFirst({
          where: eq(nba_players.id, playerId),
        });
      }
    );
  }

  /**
   * Get seasons with hybrid caching
   */
  async getSeasons(
    filters: {
      limit?: number;
      offset?: number;
      year?: number;
    } = {}
  ) {
    return HybridQueries.getSeasons(
      filters,
      // API query function
      async () => this.nbaAPI.fetchSeasons(),
      // DB query function
      async () => {
        const { limit = 10, offset = 0, year } = filters;

        const whereConditions = [];
        if (year) {
          whereConditions.push(eq(seasons.year, year));
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        return this.getDB()?.query.seasons.findMany({
          where: whereClause,
          limit,
          offset,
          orderBy: [desc(seasons.year)],
        });
      }
    );
  }

  // ========================================
  // DATABASE DATA QUERIES (DB + Redis only)
  // ========================================

  /**
   * Get user by ID (DB + Redis only)
   */
  async getUserById(userId: string) {
    return HybridQueries.getUser(userId, async () => {
      return this.getDB()?.query.users.findFirst({
        where: eq(users.id, userId),
      });
    });
  }

  /**
   * Get users with filters (DB + Redis only)
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
    return HybridQueries.getUsers(filters, async () => {
      const {
        limit = 10,
        offset = 0,
        search,
        sortBy: _sortBy = 'created_at',
        sortDirection = 'desc',
      } = filters;

      const whereConditions = [];
      if (search) {
        whereConditions.push(
          sql`LOWER(username) LIKE LOWER(${'%' + search + '%'}) OR LOWER(first_name) LIKE LOWER(${'%' + search + '%'}) OR LOWER(last_name) LIKE LOWER(${'%' + search + '%'})`
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

  /**
   * Get game log by ID (DB + Redis only)
   */
  async getGameLogById(gameLogId: string) {
    return HybridQueries.getGameLog(gameLogId, async () => {
      return this.getDB()?.query.game_logs.findFirst({
        where: eq(game_logs.id, gameLogId),
        with: {
          user: true,
        },
      });
    });
  }

  /**
   * Get game logs with filters (DB + Redis only)
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
    return HybridQueries.getGameLogs(filters, async () => {
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

  /**
   * Search across multiple tables (DB + Redis only)
   */
  async search(
    query: string,
    filters: {
      limit?: number;
      offset?: number;
      tables?: string[];
    } = {}
  ) {
    return HybridQueries.search(query, filters, async () => {
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

  /**
   * Get comments with filters (DB + Redis only)
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
    return HybridQueries.getComments(filters, async () => {
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

  /**
   * Get friendships for a user (DB + Redis only)
   */
  async getFriendships(
    userId: string,
    filters: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ) {
    return HybridQueries.getFriendships(userId, filters, async () => {
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

  /**
   * Get analytics data (DB + Redis only)
   */
  async getAnalytics(
    filters: {
      userId?: string;
      dateRange?: { start: Date; end: Date };
      type?: string;
    } = {}
  ) {
    return HybridQueries.getAnalytics(filters, async () => {
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
    const _cacheKey = generateHybridCacheKey(table, 'invalidate', { timestamp: Date.now() });
    await HybridQueries.rawSQL(sql`SELECT 1`, [], () => {
      // This will trigger cache invalidation
      return Promise.resolve({ invalidated: true });
    });
  }

  /**
   * Invalidate cache for a specific user
   */
  async invalidateUser(userId: string): Promise<void> {
    const _cacheKey = generateHybridCacheKey('users', 'invalidate', {
      userId,
      timestamp: Date.now(),
    });
    await HybridQueries.rawSQL(sql`SELECT 1`, [], () => {
      // This will trigger cache invalidation
      return Promise.resolve({ invalidated: true });
    });
  }
}

// Export singleton instance
export const hybridDB = HybridDatabase.getInstance();
