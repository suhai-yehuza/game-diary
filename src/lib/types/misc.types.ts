import { type VariantProps } from 'class-variance-authority';
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { badgeVariants } from '@src/app/components/ui/badge';
import type { baseTableConfig } from '@src/lib/db/schema/base-types';
import type {
  gameStatusEnum,
  notificationTypeEnum,
  reactionTypeEnum,
  watchedSettingEnum,
} from '@src/lib/db/schema/enums';
import type {
  usersRelations,
  commentsRelations,
  reactionsRelations,
  gameLogsRelations,
} from '@src/lib/db/schema/relations';
import type {
  UsersTable,
  TeamsTable,
  CommentsTable,
  ReactionsTable,
  NotificationsTable,
  FriendshipsTable,
  GameLogsTable,
  GameRatingsTable,
  GamesTable,
  NBAGamesTable,
  TeamH2HTable,
  NBAPlayersTable,
  NBAPlayerStatsTable,
  GameStatsTable,
  SeasonsTable,
} from '@src/lib/db/schema/types';
import type { IGame } from '@src/lib/types/game.types';
import type { GameLog, CreateGameLogInput } from '@src/lib/types/generated/graphql';

// From src/lib/graphql/utils.ts, lines 10-24
export interface IEdge<T> {
  cursor: string;
  node: T;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface IConnection<T> {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

export interface IConnectionArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

// From src/app/search/utils/game-search.ts, line 8
export type GameQueryResult = import('@apollo/client').ApolloQueryResult<{
  games: { edges: { node: import('@src/lib/types').ISearchGame }[] };
}>;

// From src/app/search/utils/game-search.ts, line 36
export interface IProcessedGameData {
  isLoading: boolean;
  hasError: boolean;
  games: import('@src/lib/types').ISearchGame[];
}

// From scripts/performance/performance-measure.ts and scripts/performance/performance-report.ts, line 18
export interface IPerformanceMetrics {
  timestamp: string;
  buildTime: number;
  bundleSize: {
    total: number;
    pages: Record<string, number>;
    chunks: Record<string, number>;
  };
  dependencies: {
    production: number;
    development: number;
    total: number;
  };
  typecheck: {
    time: number;
    errors: number;
  };
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

// From scripts/performance/performance-report.ts, line 42
export interface IPerformanceTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'degrading' | 'stable';
}

// From scripts/db/drizzle-migrate.ts, line 37
export interface IRequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string | Buffer;
  signal?: AbortSignal;
}

// From scripts/utils/manage-deps.ts, line 8
export interface IPackage {
  name: string;
  version: string;
  latest?: string;
  type?: string;
  wanted?: string;
}

// From scripts/utils/manage-deps.ts, line 16
export interface IOutdatedPackage extends IPackage {
  current: string;
  latest: string;
  type: string;
  url: string;
}

// From lib/core/logger.ts, line 7
export interface ILoggerConfig {
  level: import('@lib/core/logger').LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
  prefix?: string;
  enableFileInfo: boolean;
}

// From lib/core/logger.ts, line 22
export interface IGraphQLErrorDetails {
  message?: string;
  location?: unknown;
  path?: string | string[];
  extensions?: Record<string, unknown>;
}

// From tests/e2e/utils/auth-utils.ts, line 3
export interface IClerkMock {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddresses: Array<{ emailAddress: string }>;
    imageUrl: string;
  };
  session: {
    id: string;
    token: string;
  };
  signOut: () => Promise<void>;
  getToken: () => Promise<string>;
}

// From tests/e2e/utils/auth-utils.ts, line 15
export type IExtendedWindow = Window & {
  Clerk?: IClerkMock;
};

// From src/lib/utils/time.ts
export interface IDateFields {
  createdAt: Date | string;
  updatedAt: Date | string;
}

// From src/lib/db/schema/shared-types.ts, line 1
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// From src/lib/db/schema/shared-types.ts, line 10
export type SoftDeletableTable = {
  id: { data: string; driverData: string };
  deletedAt: { data: Date | null; driverData: Date | null };
};

// From src/lib/db/schema/base-types.ts, line 11
export type BaseTable = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// From src/lib/db/schema/base-types.ts, line 18
export type BaseTableWithColumns = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: string | number | boolean | Date | null | undefined;
};

// From src/lib/db/schema/base-types.ts, line 33
export type BaseModel = import('drizzle-orm').InferModel<
  typeof import('../db/schema/base-types').baseTable
>;

// From src/app/protected/user/user-profile-layout.tsx
export interface IUserProfileLayoutProps {
  /** The title to display at the top of the profile page */
  title: string;
  /** The content to render inside the layout */
  children: React.ReactNode;
}

// From src/app/protected/user/components/error-boundary.tsx
export interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// From src/app/protected/user/components/friends/activity-timeline.tsx
export interface IActivityItem {
  id: string;
  title: string;
  description: string;
  type: 'game_logged' | 'friend_added' | 'achievement';
  timestamp: string;
  gameTitle?: string;
  score?: string | number;
  details?: Record<string, string | number>;
  user: {
    username: string;
    avatar?: string;
  };
  achievement?: string;
}

export interface IActivityTimelineProps {
  activities: IActivityItem[];
  isLoading?: boolean;
}

// From src/app/protected/user/components/friends/friend-activity.tsx
export interface IFriendActivityProps {
  activities: IActivityItem[];
  isLoading?: boolean;
}

// From src/app/protected/user/components/game-logs/game-logs-section.tsx
export interface IGameLogsSectionProps {
  userId: string;
  currentUserId: string;
}

// From src/app/protected/user/components/game-logs/game-log-modal.tsx
export interface IGameLogModalProps {
  mode: 'create' | 'update';
  gameId?: string;
  gameLog?: GameLog;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

// From src/app/protected/user/components/profile/user-header.tsx
export interface IUserHeaderProps {
  user: import('@src/lib/types/generated/graphql').DbUser;
  isOwnProfile: boolean;
  currentUserId: string;
  stats: {
    totalGames: number;
    totalFriends: number;
    totalHours: number;
  };
  onGameLogUpdate?: () => void;
  onFriendshipUpdate?: () => void;
}

// From src/app/protected/user/user-profile.tsx
export interface IUserProfileProps {
  targetUserId: string;
}

// From src/app/protected/user/components/friends/user-search.tsx
export interface IUserSearchProps {
  onUserSelect: (userId: string) => void;
  excludeIds?: string[];
  users?: import('@src/lib/types/social.types').IFriend[];
}

// From src/app/protected/user/components/friends/friend-profile.tsx
export interface IFriendProfileProps {
  friend: {
    id: string;
    username: string;
    avatar: string;
  };
}

// From src/app/protected/user/components/friends/friend-activity.tsx
export interface IActivity {
  id: string;
  type: 'game_logged' | 'friend_added' | 'achievement';
  user: import('@src/lib/types/social.types').IFriend;
  description: string;
  timestamp: string;
  gameTitle?: string;
  achievement?: string;
}

// From src/app/protected/user/components/game-logs/hooks/use-create-game-log.tsx
export interface IUseCreateGameLogProps {
  onSuccess?: () => void;
}

// From src/app/protected/user/components/profile/friendship-management.tsx
export interface IFriendshipManagementProps {
  currentUserId: string | null;
  targetUserId: string;
  friendship: import('@src/lib/types/generated/graphql').Friendship | null;
  onFriendshipUpdate: () => void;
}

// From src/app/protected/user/components/game-logs/basketball-game-search-section.tsx
export type IGameEdge = { cursor: string; node: import('@src/lib/types/game.types').IGame };

// From src/app/protected/user/components/game-logs/game-log-search-section.tsx
export type GameLogSortByType = 'CREATED_AT' | 'WATCHED_DATE' | 'RATING';
export type SortDirectionType = 'ASC' | 'DESC';

// From src/app/components/ui/form.tsx
export type FormFieldContextValue = {
  name: string;
};

export type FormItemContextValue = {
  id: string;
};

// From badge.tsx
export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

// From user-search-section.tsx
export interface IUserNode {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  email_verified: boolean;
  createdAt: string;
  gameLogs?: { id: string }[];
  friendships?: Array<{
    id: string;
    status: string;
    initiator: {
      id: string;
    };
  }>;
  initiatedFriendships?: Array<{
    id: string;
    status: string;
    recipient: {
      id: string;
    };
  }>;
}

// From game-log-view.tsx
export interface IGameLogProps {
  gameLogId: string;
}

// From game-log-actions.tsx
export interface IGameLogActionsProps {
  gameLog: GameLog;
  onSuccess?: () => void;
}

// From game-log-form.tsx
export interface IGameLogFormProps {
  formData: CreateGameLogInput;
  selectedGame: IGame | null;
  loading?: boolean;
  onSubmit: (formData: CreateGameLogInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export interface IReactDatePickerProps {
  selected: Date;
  onChange: (date: Date) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholderText?: string;
  dateFormat?: string;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  timeCaption?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

// From game-log-search-section.tsx
export interface IGameLogSearchSectionProps {
  userId: string;
  initialSearchText?: string;
}

// From src/lib/db/seed/optimized-application-seeder.ts
export type IUserInsert = typeof import('@src/lib/db/schema/user-schemas').users.$inferInsert;
export type IFriendshipInsert =
  typeof import('@src/lib/db/schema/user-schemas').friendships.$inferInsert;
export type IGameLogInsert =
  typeof import('@src/lib/db/schema/game-schemas').game_logs.$inferInsert;

// From src/lib/db/seed/optimized-external-seeder.ts
export interface ISeasonData {
  id: number;
  year: number;
  displayYear: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isPlayoffs: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// From src/lib/db/schema/types.ts
export interface ISchema {
  users: UsersTable & { relations: typeof usersRelations };
  teams: TeamsTable;
  comments: CommentsTable & { relations: typeof commentsRelations };
  reactions: ReactionsTable & { relations: typeof reactionsRelations };
  notifications: NotificationsTable;
  friendships: FriendshipsTable;
  game_logs: GameLogsTable & { relations: typeof gameLogsRelations };
  game_ratings: GameRatingsTable;
  games: GamesTable;
  nba_games: NBAGamesTable;
  team_h2h: TeamH2HTable;
  nba_players: NBAPlayersTable;
  nba_player_stats: NBAPlayerStatsTable;
  game_stats: GameStatsTable;
  seasons: SeasonsTable;
  enums: {
    game_status: typeof gameStatusEnum;
    notification_type: typeof notificationTypeEnum;
    reaction_type: typeof reactionTypeEnum;
    watchedSetting: typeof watchedSettingEnum;
  };
  base: typeof baseTableConfig;
}

export interface IRelations {
  users: typeof usersRelations;
  comments: typeof commentsRelations;
  reactions: typeof reactionsRelations;
  game_logs: typeof gameLogsRelations;
}

// From src/lib/validations/env.ts
export interface IEnvConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_CONNECTION_TIMEOUT?: string;
  DATABASE_POOL_SIZE?: string;
  DATABASE_RETRY_ATTEMPTS?: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  REDIS_URL?: string;
  NEXT_PUBLIC_RAPID_API_HOST: string;
  NEXT_PUBLIC_RAPID_API_KEY: string;
  NEXT_PUBLIC_RAPID_API_BASE_URL: string;
}

export interface IDbEnvConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_CONNECTION_TIMEOUT?: string;
  DATABASE_POOL_SIZE?: string;
  DATABASE_RETRY_ATTEMPTS?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  REDIS_URL?: string;
}

export interface IBuildEnvConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_CONNECTION_TIMEOUT?: string;
  DATABASE_POOL_SIZE?: string;
  DATABASE_RETRY_ATTEMPTS?: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  REDIS_URL?: string;
  NEXT_PUBLIC_RAPID_API_HOST?: string;
  NEXT_PUBLIC_RAPID_API_KEY?: string;
  NEXT_PUBLIC_RAPID_API_BASE_URL?: string;
}

// From src/lib/validations/team.ts
export interface ITeamInput {
  id?: string;
  name: string;
  city: string;
  code: string;
  conference: 'East' | 'West';
  division: string;
  logoUrl?: string;
}

// From src/lib/config/api.config.ts
export interface IRangeConfig {
  min: number;
  max: number;
  getRandom: () => number;
}

export interface IBatchSizeConfig {
  GAMES: number;
  GAME_STATS: number;
  PLAYERS: number;
}

export interface IRateLimitConfig {
  MAX_RETRIES: number;
  BASE_DELAY: number;
  MAX_DELAY: number;
  RATE_LIMIT_DELAY: number;
}

export interface IPaginationConfig {
  DEFAULT_PAGE_SIZE: number;
  HUGE_SIZE: number;
  MAX_CHILD_COMMENT_DEPTH: number;
  DEFAULT_SORT_DIRECTION: string;
}

export interface IDistributionFunctions {
  natural: (rand: number) => number;
  bellCurve: (u1: number, u2: number) => number;
  pareto: (rand: number, alpha?: number) => number;
  exponential: (rand: number) => number;
  powerLaw: (rand: number, exponent?: number) => number;
}

// From src/lib/config/db.config.ts
export interface IDatabaseIndex {
  name: string;
  table: string;
  columns: string[];
}

// From src/lib/utils/processing.ts
export interface IBatchProcessingOptions<T, R> {
  items: T[];
  batchSize: number;
  tableName?: string;
  processFn: (batch: T[], context?: Record<string, unknown>) => Promise<R>;
  context?: Record<string, unknown>;
  delayBetweenBatches?: number;
  maxRetries?: number;
  retryDelay?: number;
  concurrencyLimit?: number;
  dbPool?: NeonHttpDatabase<Record<string, unknown>>;
  useTransactions?: boolean;
  onProgress?: (progress: number) => void;
}

export interface IUuidGenerationOptions {
  namespace?: string;
  logProgress?: boolean;
  useV7?: boolean;
  maxRetries?: number;
  batchSize?: number;
}

// From src/lib/utils/game.ts
export interface IGameStats {
  team: string;
  points: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}
