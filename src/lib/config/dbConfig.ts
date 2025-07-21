import { API_CONFIG } from '@/lib/config/app.config';

export const DB_CONFIG = {
  seeding: {
    // External API data seeding
    external: {
      CONCURRENT_OPERATIONS: API_CONFIG.databaseSeeding.CONCURRENT_OPERATIONS,
      BATCH_SIZE: {
        GAMES: 8,
        PLAYERS: 3,
        STATS: 15,
      },
      RETRY: {
        MAX_ATTEMPTS: 5,
        BASE_DELAY: 1000,
        MAX_DELAY: 8000,
      },
    },
    // Internal application data seeding
    internal: {
      CONCURRENT_OPERATIONS: API_CONFIG.databaseSeeding.CONCURRENT_OPERATIONS,
      BATCH_SIZE: API_CONFIG.databaseSeeding.BATCH_SIZE,
      MAX_RETRIES: API_CONFIG.databaseSeeding.MAX_RETRIES,
      RETRY_DELAY: API_CONFIG.databaseSeeding.RETRY_DELAY,
      USER_COUNT: API_CONFIG.databaseSeeding.USER_COUNT,
      DEFAULT_SAMPLE_COUNT: API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT,
    },
    // Table names for truncation
    tables: {
      external: [
        'nba_games',
        'teams',
        'players',
        'player_game_stats',
        'player_season_stats',
        'team_season_stats',
        'team_h2h',
        'seasons',
      ],
      internal: ['users', 'friendships', 'game_logs', 'comments', 'reactions', 'game_ratings'],
    },
  },
  // Database indexes for performance
  indexes: [
    {
      name: 'idx_game_logs_userId',
      table: 'game_logs',
      columns: ['userId'],
    },
    {
      name: 'idx_comments_parentId',
      table: 'comments',
      columns: ['parentId'],
    },
    {
      name: 'idx_reactions_targetId',
      table: 'reactions',
      columns: ['targetId'],
    },
    {
      name: 'idx_nba_games_season',
      table: 'nba_games',
      columns: ['season'],
    },
    {
      name: 'idx_nba_players_seasons',
      table: 'nba_players',
      columns: ['seasonsActive'],
    },
  ],
} as const;
