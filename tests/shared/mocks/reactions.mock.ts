import { REACTION_EMOJIS } from '@/lib/constants';
import type { IReaction, IGameLog, IGameResponse, IGamesApiResponse } from '@/lib/types';
import { ParentType } from '@/lib/types/generated/graphql';

// Mock user data
export const MOCK_USERS = {
  user1: {
    id: 'user-1',
    username: 'testuser1',
    first_name: 'Test',
    last_name: 'User1',
    email_address: 'test1@example.com',
    phone_number: null,
    image_url: 'https://example.com/avatar1.jpg',
    isAdmin: true,
  },
  user2: {
    id: 'user-2',
    username: 'testuser2',
    first_name: 'Test',
    last_name: 'User2',
    email_address: 'test2@example.com',
    phone_number: null,
    image_url: 'https://example.com/avatar2.jpg',
    isAdmin: false,
  },
  user3: {
    id: 'user-3',
    username: 'testuser3',
    first_name: 'Test',
    last_name: 'User3',
    email_address: 'test3@example.com',
    phone_number: null,
    image_url: undefined,
    isAdmin: false,
  },
};

// Mock team data
export const MOCK_TEAMS = {
  home: {
    id: 'team-home',
    name: 'Home Team',
    nickname: 'Home',
    code: 'HOME',
    logo: 'https://example.com/home-logo.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  away: {
    id: 'team-away',
    name: 'Away Team',
    nickname: 'Away',
    code: 'AWAY',
    logo: 'https://example.com/away-logo.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Mock game data
export const MOCK_GAME = {
  id: 'game-123',
  date: new Date().toISOString(),
  home_team_id: MOCK_TEAMS.home.id,
  away_team_id: MOCK_TEAMS.away.id,
  game_type: 'REGULAR',
  status: 'FINISHED',
  home_team_score: 110,
  away_team_score: 105,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  home_team: MOCK_TEAMS.home,
  away_team: MOCK_TEAMS.away,
};

// Helper function to create mock reactions
export const createMockReaction = (
  id: string,
  emoji: string,
  userId: string = MOCK_USERS.user1.id,
  targetId = 'test-target',
  targetType: ParentType = ParentType.GameLog
): IReaction => ({
  id,
  emoji,
  user_id: userId,
  target_id: targetId,
  target_type: targetType,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  user: MOCK_USERS[userId as keyof typeof MOCK_USERS] || MOCK_USERS.user1,
});

// Helper function to create mock game logs
export const createMockGameLog = (
  id: string,
  commentCount = 0,
  reactionCount = 0,
  rating = 5,
  userId: string = MOCK_USERS.user1.id
): IGameLog => ({
  id,

  game_id: MOCK_GAME.id,
  classification: 'PUBLIC',
  rating_for_game: rating,
  totalCommentCount: commentCount,
  totalReactionCount: reactionCount,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  user: MOCK_USERS[userId as keyof typeof MOCK_USERS] || MOCK_USERS.user1,
  game: MOCK_GAME as any,
});

// Helper function to create mock games
export const createMockGame = (
  id: number,
  date: string,
  status = 'FT',
  homeScore = 110,
  awayScore = 105
): IGameResponse => ({
  id,
  league: 'NBA',
  season: 2024,
  date: {
    start: date,
    end: new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    duration: '2:00',
  },
  stage: 2,
  status: {
    clock: undefined,
    halftime: false,
    short: status,
    long: status === 'FT' ? 'Finished' : 'Live',
  },
  periods: {
    current: 4,
    total: 4,
    endOfPeriod: false,
  },
  arena: {
    name: 'Test Arena',
    city: 'Test City',
    state: 'TS',
    country: 'USA',
  },
  teams: {
    home: {
      id: 583,
      name: 'Test Home Team',
      nickname: 'Home',
      code: 'HOME',
      logo: 'https://example.com/home-logo.png',
    },
    visitors: {
      id: 584,
      name: 'Test Away Team',
      nickname: 'Away',
      code: 'AWAY',
      logo: 'https://example.com/away-logo.png',
    },
  },
  scores: {
    home: {
      win: 15,
      loss: 12,
      series: { win: 0, loss: 0 },
      linescore: [25, 30, 28, 27],
      points: homeScore,
    },
    visitors: {
      win: 14,
      loss: 13,
      series: { win: 0, loss: 0 },
      linescore: [28, 25, 30, 22],
      points: awayScore,
    },
  },
  officials: ['Official 1', 'Official 2', 'Official 3'],
  timesTied: 5,
  leadChanges: 8,
});

// Helper function to create mock API response
export const createMockApiResponse = (games: IGameResponse[]): IGamesApiResponse => ({
  get: 'games',
  parameters: {
    season: '2024',
    // league: 'standard',
  },
  errors: [],
  results: games.length,
  response: games,
});

// Mock reactions for different scenarios
export const MOCK_REACTIONS = {
  // Single reaction
  single: createMockReaction('reaction-1', REACTION_EMOJIS.THUMBS_UP),

  // Multiple reactions on same target
  multiple: [
    createMockReaction('reaction-1', REACTION_EMOJIS.THUMBS_UP),
    createMockReaction('reaction-2', REACTION_EMOJIS.LOVE),
    createMockReaction('reaction-3', REACTION_EMOJIS.FIRE),
  ],

  // Reactions from different users
  multiUser: [
    createMockReaction('reaction-1', REACTION_EMOJIS.THUMBS_UP, MOCK_USERS.user1.id),
    createMockReaction('reaction-2', REACTION_EMOJIS.THUMBS_UP, MOCK_USERS.user2.id),
    createMockReaction('reaction-3', REACTION_EMOJIS.LOVE, MOCK_USERS.user3.id),
  ],

  // Reactions on different targets
  multiTarget: [
    createMockReaction('reaction-1', REACTION_EMOJIS.THUMBS_UP, MOCK_USERS.user1.id, 'target-1'),
    createMockReaction('reaction-2', REACTION_EMOJIS.LOVE, MOCK_USERS.user1.id, 'target-2'),
    createMockReaction('reaction-3', REACTION_EMOJIS.FIRE, MOCK_USERS.user1.id, 'target-3'),
  ],

  // Reactions on comments
  commentReactions: [
    createMockReaction(
      'reaction-1',
      REACTION_EMOJIS.THUMBS_UP,
      MOCK_USERS.user1.id,
      'comment-1',
      ParentType.Comment
    ),
    createMockReaction(
      'reaction-2',
      REACTION_EMOJIS.LOVE,
      MOCK_USERS.user2.id,
      'comment-1',
      ParentType.Comment
    ),
  ],

  // Invalid reactions (for testing constraints)
  invalid: [
    createMockReaction('reaction-invalid-1', '🦄' as any),
    createMockReaction('reaction-invalid-2', '🌈' as any),
    createMockReaction('reaction-invalid-3', '🍕' as any),
  ],
};

// Mock game logs for different scenarios
export const MOCK_GAME_LOGS = {
  // Single game log
  single: createMockGameLog('game-log-1', 5, 10, 4),

  // Multiple game logs with different activity levels
  multiple: [
    createMockGameLog('game-log-1', 15, 25, 5), // High activity
    createMockGameLog('game-log-2', 8, 12, 4), // Medium activity
    createMockGameLog('game-log-3', 3, 5, 3), // Low activity
  ],

  // Game logs with no activity
  inactive: [createMockGameLog('game-log-1', 0, 0, 5), createMockGameLog('game-log-2', 0, 0, 4)],

  // Game logs with null activity counts
  nullActivity: [
    {
      ...createMockGameLog('game-log-1', 5, 10, 4),
      totalCommentCount: undefined,
      totalReactionCount: undefined,
    },
    {
      ...createMockGameLog('game-log-2', 8, 12, 5),
      totalCommentCount: undefined,
      totalReactionCount: undefined,
    },
  ],

  // Game logs from different users
  multiUser: [
    createMockGameLog('game-log-1', 10, 15, 4, MOCK_USERS.user1.id),
    createMockGameLog('game-log-2', 8, 12, 5, MOCK_USERS.user2.id),
    createMockGameLog('game-log-3', 5, 8, 3, MOCK_USERS.user3.id),
  ],
};

// Mock games for different scenarios
export const MOCK_GAMES = {
  // Single game
  single: createMockGame(1, '2024-12-23T19:30:00.000Z'),

  // Multiple games with different dates
  multiple: [
    createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT', 110, 105), // Newest
    createMockGame(2, '2024-12-22T19:30:00.000Z', 'FT', 95, 98), // Middle
    createMockGame(3, '2024-12-21T19:30:00.000Z', 'FT', 120, 115), // Oldest
  ],

  // Live games
  live: [
    createMockGame(1, '2024-12-23T19:30:00.000Z', 'Q3', 85, 82),
    createMockGame(2, '2024-12-23T20:00:00.000Z', 'Q2', 45, 48),
  ],

  // Games with different statuses
  mixedStatus: [
    createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT', 110, 105), // Finished
    createMockGame(2, '2024-12-23T20:00:00.000Z', 'Q3', 85, 82), // Live
    createMockGame(3, '2024-12-23T21:00:00.000Z', 'NS', 0, 0), // Not started
  ],

  // Games with missing data
  incomplete: [
    {
      ...createMockGame(1, '2024-12-23T19:30:00.000Z'),
      teams: {
        home: {
          ...createMockGame(1, '2024-12-23T19:30:00.000Z').teams.home,
          logo: null,
        },
        visitors: {
          ...createMockGame(1, '2024-12-23T19:30:00.000Z').teams.visitors,
          logo: null,
        },
      },
    },
  ],
};

// Mock grouped reactions for testing
export const createMockGroupedReactions = (reactions: IReaction[]) => {
  const grouped = new Map<string, { emoji: string; count: number; hasUserReacted: boolean }>();

  reactions.forEach(reaction => {
    const existing = grouped.get(reaction.emoji);
    if (existing) {
      existing.count++;
      if (reaction.user_id === MOCK_USERS.user1.id) {
        existing.hasUserReacted = true;
      }
    } else {
      grouped.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        hasUserReacted: reaction.user_id === MOCK_USERS.user1.id,
      });
    }
  });

  return Array.from(grouped.values());
};

// Mock GraphQL query results
export const MOCK_GRAPHQL_RESULTS = {
  // Empty result
  empty: {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  },

  // Loading state
  loading: {
    data: null,
    loading: true,
    error: null,
    refetch: () => Promise.resolve(),
  },

  // Error state
  error: {
    data: null,
    loading: false,
    error: new Error('Test error'),
    refetch: () => Promise.resolve(),
  },

  // Success with game logs
  gameLogs: (gameLogs: IGameLog[]) => ({
    data: {
      gameLogs: {
        edges: gameLogs.map(gameLog => ({ node: gameLog })),
      },
    },
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  }),

  // Success with reactions
  reactions: (reactions: IReaction[]) => ({
    data: {
      reactions,
    },
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  }),
};

// Mock API responses for different scenarios
export const MOCK_API_RESPONSES = {
  // Success response
  success: (data: any) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  }),

  // Error response
  error: (status = 500, message = 'Internal Server Error') => ({
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ error: message }),
  }),

  // Network error
  networkError: () => {
    const error = new Error('Network error');
    error.name = 'TypeError';
    throw error;
  },

  // Invalid JSON response
  invalidJson: () => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve('invalid json'),
  }),
};

// Mock environment variables for testing
export const MOCK_ENV = {
  development: {
    NODE_ENV: 'development',
    MOCK_MODE: 'true',
    CI: 'false',
    VITEST: 'false',
  },
  test: {
    NODE_ENV: 'test',
    MOCK_MODE: 'false',
    CI: 'true',
    VITEST: 'true',
  },
  production: {
    NODE_ENV: 'production',
    MOCK_MODE: 'false',
    CI: 'false',
    VITEST: 'false',
  },
};

// Mock window object for testing
export const MOCK_WINDOW = {
  __API_MOCK_MODE__: true,
  __PLAYWRIGHT_TEST__: false,
};

// Mock fetch responses for different scenarios
export const MOCK_FETCH_RESPONSES = {
  // Mock server response
  mockServer: (data: any) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data }),
  }),

  // Real API response
  realApi: (data: any) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  }),

  // Error responses
  notFound: () => ({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: () => Promise.resolve({ error: 'Not Found' }),
  }),

  serverError: () => ({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    json: () => Promise.resolve({ error: 'Internal Server Error' }),
  }),

  unauthorized: () => ({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    json: () => Promise.resolve({ error: 'Unauthorized' }),
  }),
};

// Export all mock data
export default {
  MOCK_USERS,
  MOCK_TEAMS,
  MOCK_GAME,
  MOCK_REACTIONS,
  MOCK_GAME_LOGS,
  MOCK_GAMES,
  MOCK_GRAPHQL_RESULTS,
  MOCK_API_RESPONSES,
  MOCK_ENV,
  MOCK_WINDOW,
  MOCK_FETCH_RESPONSES,
  createMockReaction,
  createMockGameLog,
  createMockGame,
  createMockApiResponse,
  createMockGroupedReactions,
};
