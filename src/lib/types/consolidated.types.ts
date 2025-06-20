// This file contains all type definitions from the types directory

import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import type { schema as dbSchema } from '@src/lib/db/schema';
import type { DataProcessor } from '@src/lib/db/seed/data-processor';
import type { OptimizedAPIClient } from '@src/lib/db/seed/utils/api-client';
import type { DbUser, Friendship, GameLog } from '@src/lib/types/generated/graphql';

export type Schema = {
  [key: string]: unknown;
};

// Type Definitions
export type CommonConferenceType = 'east' | 'west';
export type CommonDivisionType =
  | 'atlantic'
  | 'central'
  | 'southeast'
  | 'northwest'
  | 'pacific'
  | 'southwest';
export type SocialSortDirection = 'asc' | 'desc';
export type ScalarDate = Date;
export type ScalarJSON = Record<string, unknown>;
export type MiscAnyScalar = unknown;

// Interface Definitions
export interface INextData {
  props: Record<string, unknown>;
  page: string;
  query: Record<string, string>;
  buildId: string;
}

export interface IGame {
  id: string;
  league: string;
  season: string;
  status: IGameStatus;
  date: IGameDate;
  teams: IGameTeams;
  scores: IGameScores;
  periods: IGamePeriods;
  arena: GameArena;
  createdAt: Date;
  updatedAt: Date;
  officials?: string[];
  nugget?: string;
  timesTied?: number;
  leadChanges?: number;
}

export interface IProcessedGames {
  live: IGame[];
  scheduled: IGame[];
  completed: IGame[];
}

export interface IAPIConfig {
  baseUrl: string;
  endpoints: {
    [key: string]: string;
  };
  headers: {
    [key: string]: string;
  };
  timeout: number;
  retries: number;
  cacheTTL: number;
}

export interface IActivity {
  id: string;
  userId: string;
  message: string;
  targetType: string;
  targetId: string;
  createdAt: Date;
  read: boolean;
  type: string;
  title: string;
  description: string;
  timestamp: Date | string;
  gameTitle?: string;
  details?: Record<string, unknown>;
  score?: number | string;
  achievement?: string;
  user?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    avatar?: string;
  };
}

export interface IApiActivityTimelineProps {
  gameLogs: Array<{
    id: string;
    createdAt: string;
    ratingForGame: number;
    watchedSetting: string;
    notes?: string;
    game: {
      season: string;
      teams: {
        visitors: { name: string };
        home: { name: string };
      };
    };
  }>;
}

export interface IApiFriendActivityProps {
  friendId: string;
}

export interface IComponentGameLogFormProps {
  onSubmit: (data: IGameLogInput) => void;
  initialData?: Partial<IGameLogInput>;
}

export interface IComponentFriendProfileProps {
  friendId: string;
  onClose: () => void;
}

export interface IComponentNavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
}

export interface IComponentReactionPickerProps {
  onSelect: (reaction: string) => void;
  onClose: () => void;
}

export interface IComponentPropsNavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
}

export interface IComponentPropsReactionPicker {
  onSelect: (reaction: string) => void;
  onClose: () => void;
}

export interface IGameTeamStatistic {
  points: number;
  fgm: number;
  fga: number;
  fgp: number;
  ftm: number;
  fta: number;
  ftp: number;
  tpm: number;
  tpa: number;
  tpp: number;
  offReb: number;
  defReb: number;
  totReb: number;
  assists: number;
  pFouls: number;
  steals: number;
  turnovers: number;
  blocks: number;
  plusMinus: number;
  min: string;
  fastBreakPoints: number;
  pointsInPaint: number;
  biggestLead: number;
  secondChancePoints: number;
  pointsOffTurnovers: number;
  longestRun: number;
}

export interface IGameLogFormProps {
  onSubmit: (data: IGameLogInput) => void;
  initialData?: Partial<IGameLogInput>;
}

export interface IGameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
}

export interface IGameLogDatePickerProps {
  selected: Date;
  onChange: (date: Date) => void;
}

export interface IUserFriend {
  id: string;
  name: string;
  avatar?: string;
}

export interface IUserFriendGroup {
  id: string;
  name: string;
  friends: IUserFriend[];
}

export interface IUserFriendGroupsProps {
  groups: IUserFriendGroup[];
  onGroupSelect: (groupId: string) => void;
}

export interface ICacheConfig {
  ttl: number;
  maxSize: number;
}

export interface IDatabaseUuidOptions {
  version: number;
  namespace: string;
}

export interface IDatabaseRow {
  id: string;
  date: IGameDate;
  status: IGameStatus;
  arena: GameArena;
  league: string;
  season: number;
  stage: number;
  periods: IGamePeriods;
  scores: IGameScores;
  teams: IGameTeams;
  officials: Array<{ id: string; name: string; position: string }>;
  timesTied: number | null;
  leadChanges: number | null;
  nugget: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  awayTeamScore: number;
  homeTeamScore: number;
  gameType: string;
  nbaGameId: string;
}

export interface IEdge<T> {
  node: T;
  cursor: string;
}

export interface IGameEdge {
  node: IGame;
  cursor: string;
}

export interface IGameConnection {
  edges: IGameEdge[];
  pageInfo: IPageInfo;
  totalCount: number;
}

export interface IGameQueryResponse {
  games: IGameConnection;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

export interface IConnection<T> {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
  totalCount?: number;
}

export interface IConnectionArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface IPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ISearchParams {
  query: string;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortDirection?: SocialSortDirection;
}

export interface INotificationConfig {
  type: string;
  message: string;
  duration?: number;
}

export interface IResolverContext {
  user?: IAuthUser;
  request?: IExtendedNextApiRequest;
}

export interface IPaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface IMiscDateTimeScalar {
  toISOString(): string;
  getTime(): number;
}

export interface IChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }>;
}

// Global Type Declarations
declare global {
  interface IWindow extends Window {
    __NEXT_DATA__: INextData;
  }
}

// Additional types from misc.types.ts
export interface IClientsConfig {
  rapidApi: {
    baseUrl: string;
    key: string;
  };
  nbaApi: {
    baseUrl: string;
    key: string;
  };
}

export interface IPlayerWithTeams {
  id: string;
  name: string;
  player: {
    id: string;
    firstname: string;
    lastname: string;
    birth: {
      date: string;
      country: string;
    };
    nba: {
      start: number;
      pro: number;
    };
    height: {
      feets: string;
      inches: string;
      meters: string;
    };
    weight: {
      pounds: string;
      kilograms: string;
    };
    jersey: string;
    active: boolean;
    pos: string;
    team: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      city: string;
    };
  };
  teams: Set<string>;
}

export interface ISeasonActive {
  season: number;
  teamIds: string[];
  [Symbol.iterator](): Iterator<{ season: number; teamIds: string[] }>;
  findIndex(
    predicate: (
      value: { season: number; teamIds: string[] },
      index: number,
      array: { season: number; teamIds: string[] }[]
    ) => boolean
  ): number;
  map<U>(
    callbackfn: (
      value: { season: number; teamIds: string[] },
      index: number,
      array: { season: number; teamIds: string[] }[]
    ) => U
  ): U[];
  length: number;
  push(...items: { season: number; teamIds: string[] }[]): number;
  pop(): { season: number; teamIds: string[] } | undefined;
  concat(
    ...items: ({ season: number; teamIds: string[] } | { season: number; teamIds: string[] }[])[]
  ): { season: number; teamIds: string[] }[];
}

export type ISeasonActiveArray = ISeasonActive[];

export interface IDBGameStats {
  gameId: string;
  teamId: string;
  playerId: string;
  stats: Record<string, number>;
}

export interface IOptimizationConfig {
  batchSize: number;
  maxRetries: number;
  timeout: number;
}

export interface IPerformanceThresholds {
  responseTime: number;
  errorRate: number;
  successRate: number;
}

export type IGameStatus = {
  clock: string | null;
  halftime: boolean;
  long: string;
  short: string | number;
};

// export type INotificationTypeValue = 'info' | 'success' | 'warning' | 'error';
export type INotificationTypeValue =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'GAME_UPDATE'
  | 'COMMENT'
  | 'REACTION';

export interface IEnvConfig {
  nodeEnv: string;
  port: number;
  host: string;
}

export interface IDbEnvConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface IBuildEnvConfig {
  mode: 'development' | 'production';
  target: string;
}

export interface IGlobalWithGC {
  gc?: () => void;
}

export interface ITeamInput {
  name: string;
  city: string;
  code: string;
  abbreviation: string;
  conference: CommonConferenceType | string;
  division: CommonDivisionType | string;
  id?: string;
  logoUrl?: string;
}

export interface IContext {
  user?: IAuthUser;
  request?: IExtendedNextApiRequest;
  db?: IDatabaseClient;
  redis?: {
    client: unknown;
    isRedisAvailable: boolean;
    initializationPromise: Promise<unknown>;
    clientType: string;
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown, ttl?: number) => Promise<void>;
    del: (key: string) => Promise<void>;
    clear: () => Promise<void>;
    // Add other Cache properties as needed
    [key: string]: unknown;
  };
  loaders?: {
    reactionLoader: {
      load: (id: string) => Promise<unknown>;
      loadMany: (ids: string[]) => Promise<unknown[]>;
      clear: (id: string) => void;
      clearAll: () => void;
    };
    userLoader: {
      load: (id: string) => Promise<unknown>;
      loadMany: (ids: string[]) => Promise<unknown[]>;
      clear: (id: string) => void;
      clearAll: () => void;
    };
    gameLoader: {
      load: (id: string) => Promise<unknown>;
      loadMany: (ids: string[]) => Promise<unknown[]>;
      clear: (id: string) => void;
      clearAll: () => void;
    };
    gameLogLoader: {
      load: (id: string) => Promise<unknown>;
      loadMany: (ids: string[]) => Promise<unknown[]>;
      clear: (id: string) => void;
      clearAll: () => void;
    };
  };
}

export interface IMigrationVersion {
  id: number;
  name: string;
  checksum: string;
  executed_at: string;
  execution_time_ms: number;
  status: 'success' | 'failed' | 'rolled_back';
  error_message: string | null;
  rollback_script: string | null;
  rollback_executed: boolean;
  verification?: IMigrationVerification;
}

export interface IRequestInfo {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface IViewportSize {
  width: number;
  height: number;
}

// API Response Types
export interface ISeasonApiResponse {
  response: {
    response: Array<{
      season: number;
      current: boolean;
    }>;
  };
  status: number;
}

export interface IGameApiResponse {
  get?: string;
  parameters?: Record<string, unknown>;
  errors?: unknown[];
  results?: number;
  data?: unknown[];
  response: Array<{
    id: string;
    date:
      | {
          start: string;
          end?: string;
          duration?: string;
        }
      | string;
    season: string;
    league?: string;
    stage?: number;
    teams: {
      visitors: {
        id: string;
        name: string;
        nickname?: string;
        code?: string;
        logo?: string;
        score: number;
      };
      home: {
        id: string;
        name: string;
        nickname?: string;
        code?: string;
        logo?: string;
        score: number;
      };
    };
    status:
      | {
          clock?: string;
          halftime?: boolean;
          short?: string;
          long?: string;
        }
      | string;
    period?: number;
    periods?: {
      current?: number;
      total?: number;
      endOfPeriod?: boolean;
    };
    arena?: {
      name?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    scores?: {
      home: {
        win?: number;
        loss?: number;
        points?: number;
        linescore?: number[];
        series?: {
          win?: number;
          loss?: number;
        };
      };
      visitors: {
        win?: number;
        loss?: number;
        points?: number;
        linescore?: number[];
        series?: {
          win?: number;
          loss?: number;
        };
      };
    };
    officials?: string[];
    timesTied?: number;
    leadChanges?: number;
    nugget?: string;
    time?: string;
  }>;
}

export interface ITeamApiResponse {
  response: Array<{
    id: string;
    name: string;
    nickname: string;
    code: string;
    city: string;
    logo: string;
    conference: string;
    division: string;
    allStar?: boolean;
    nbaFranchise?: boolean;
    leagues?: {
      standard?: {
        jersey?: string;
        active?: boolean;
        pos?: string;
      };
    };
  }>;
}

export interface IPlayerApiResponse {
  response: {
    response: Array<{
      id: string;
      firstname: string;
      lastname: string;
      birth: {
        date: string;
        country: string;
      };
      nba: {
        start: number;
        pro: number;
      };
      height: {
        feets: string;
        inches: string;
        meters: string;
      };
      weight: {
        pounds: string;
        kilograms: string;
      };
      jersey: string;
      active: boolean;
      pos: string;
      college?: string;
      affiliation?: string;
      leagues?: {
        standard?: {
          jersey?: string;
          active?: boolean;
          pos?: string;
        };
      };
      team: {
        id: string;
        name: string;
        nickname: string;
        code: string;
        city: string;
      };
    }>;
  };
}

export interface ISeasonData {
  id: number;
  year: number;
  displayYear: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isPlayoffs: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// Missing types that are being imported
export interface IApplicationSeederOptions {
  concurrency?: number;
  batchSize?: number;
  seasons?: number[];
  enableMonitoring?: boolean;
  db?: IDatabaseClient;
  apiClient?: OptimizedAPIClient;
  processor?: DataProcessor;
  env?: string;
  appendingData?: boolean;
  shouldResetDb?: boolean;
  shouldTruncateTables?: boolean;
  skipExternalDb?: boolean;
  skipApplicationDb?: boolean;
  skipUsers?: boolean;
  startDate?: string;
  tables?: string[];
}

export type IDatabaseClient = NeonHttpDatabase<typeof dbSchema>;

export interface IGameResponseData {
  response?: unknown[];
  id?: string;
  date?: unknown;
  status?: unknown;
  arena?: unknown;
  league?: unknown;
  season?: unknown;
  stage?: unknown;
  periods?: unknown;
  scores?: unknown;
  teams?: unknown;
  officials?: unknown;
  timesTied?: unknown;
  leadChanges?: unknown;
  nugget?: unknown;
  isCompleted?: boolean;
  awayTeamScore?: number;
  homeTeamScore?: number;
  gameType?: string;
  nbaGameId?: string;
}

export interface IResolvers {
  Query?: unknown;
  Mutation?: unknown;
  [key: string]: unknown;
}

export interface ITeamFilters {
  conference?: string;
  division?: string;
  city?: string;
  name?: string;
  search?: string;
  code?: string;
}

export interface IUserFilters {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  search?: string;
}

export interface IUserSearchFilters {
  searchTerm?: string;
  isActive?: boolean;
  joinedAfter?: Date;
  joinedBefore?: Date;
  isVerified?: boolean;
  hasGameLogs?: boolean;
  minGameLogs?: number;
  orderBy?: string;
}

export interface IUserSearchSectionProps {
  className?: string;
}

export interface IUserNode {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  gameLogs?: unknown[];
  friendships?: Array<{
    id: string;
    status: string;
    initiator: {
      id: string;
    };
    recipient: {
      id: string;
    };
  }>;
  initiatedFriendships?: Array<{
    id: string;
    status: string;
    initiator: {
      id: string;
    };
    recipient: {
      id: string;
    };
  }>;
}

export interface IExtendedNextApiRequest {
  body: unknown;
  query: unknown;
  method: string;
  selectedFields?: unknown;
  pagination?: unknown;
}

export interface IMonitoringMetrics {
  timestamp: Date;
  queryPerformance: {
    [key: string]: {
      count: number;
      totalTime: number;
      avgTime: number;
    };
  };
  apiMetrics: {
    [key: string]: {
      count: number;
      totalTime: number;
      avgTime: number;
      errors: number;
      failure: number;
      success: number;
      avgResponseTime: number;
    };
  };
  errors: {
    [key: string]: number;
  };
  cpuUsage: number;
  memoryUsage?: number;
  activeConnections?: number;
  requestCount?: number;
  errorCount?: number;
  averageResponseTime?: number;
  apiCalls?: { [key: string]: number };
  cacheMetrics?: {
    hits?: number;
    misses?: number;
    size?: number;
  };
}

export interface IAPIConfigOptions {
  timeout?: number;
  retries?: number;
  baseUrl?: string;
  host?: string;
  retryAttempts?: number;
  headers?: Record<string, string>;
  method?: string;
  body?: unknown;
  retryDelay?: number;
  apiKey?: string;
}

export interface IGameTeams {
  home: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  visitors: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
}

export interface IDBGameRecord {
  id: string;
  date: IGameDate;
  status: IGameStatus;
  arena: GameArena;
  league: string;
  season: number;
  stage: number;
  periods: IGamePeriods;
  scores: IGameScores;
  teams: IGameTeams;
  officials: Array<{ id: string; name: string; position: string }>;
  timesTied: number | null;
  leadChanges: number | null;
  nugget: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  awayTeamScore: number;
  homeTeamScore: number;
  gameType: string;
  nbaGameId: string;
}

export interface IDBPlayer {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  birthCountry: string;
  nbaStart: number;
  nbaPro: number;
  heightFeet: string;
  heightInches: string;
  heightMeters: string;
  weightPounds: string;
  weightKilograms: string;
  jersey: string;
  active: boolean;
  position: string;
  teamId: string;
  college?: string;
  createdAt: Date;
  updatedAt: Date;
  leagues?: {
    standard?: {
      pos?: string;
      active?: boolean;
      teamId?: string;
      seasonsWithTeam?: number;
    };
    vegas?: {
      pos?: string;
      active?: boolean;
      teamId?: string;
    };
    utah?: {
      pos?: string;
      active?: boolean;
      teamId?: string;
    };
    sacramento?: {
      pos?: string;
      active?: boolean;
      teamId?: string;
    };
  };
}

export type DBPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  active: boolean;
  isActive?: boolean;
  teamId?: string;
  pos?: string;
  position?: string;
  jersey?: string;
  jerseyNumber?: string;
  college?: string | null;
  affiliation?: string | null;
  birth?: {
    date?: string;
    country?: string;
  };
  nba?: {
    start?: number;
    pro?: number;
  };
  height?: {
    feets?: string;
    inches?: string;
    meters?: string;
  };
  weight?: {
    pounds?: string;
    kilograms?: string;
  };
  seasonsActive?: Array<{
    season: number;
    teamIds: string[];
  }>;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IBatchProcessingOptions<T = unknown, R = unknown> {
  items?: T[];
  batchSize: number;
  concurrency?: number;
  timeout?: number;
  tableName?: string;
  processFn?: (batch: T[], context?: Record<string, unknown>) => Promise<R>;
  processor?: (item: T) => Promise<R>;
  context?: Record<string, unknown>;
  delayBetweenBatches?: number;
  maxRetries?: number;
  retryDelay?: number;
  concurrencyLimit?: number;
  dbPool?: IDatabaseClient;
  useTransactions?: boolean;
}

export interface IUuidGenerationOptions {
  prefix?: string;
  version?: number;
  useV7?: boolean;
  maxRetries?: number;
  batchSize?: number;
  logProgress?: boolean;
}

export interface IDateFields {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IClerkMock {
  user: IAuthUser | null;
  session?: Record<string, unknown> | null;
  signIn?: () => void;
  signOut: () => void;
  getToken?: () => Promise<string>;
  isLoaded?: boolean;
  isSignedIn?: boolean;
}

export interface IExtendedWindow extends Window {
  Clerk?: IClerkMock;
}

// Additional missing types from errors
export interface IMigration {
  version: string;
  name: string;
  status: string;
  path?: string;
  content?: string;
  checksum?: string;
}

export interface IMigrationVerification {
  version: string;
  isValid: boolean;
  tables?: string[];
  functions?: string[];
  triggers?: string[];
  indexes?: string[];
  added?: {
    tables?: string[];
    functions?: string[];
    triggers?: string[];
    indexes?: string[];
  };
  removed?: {
    tables?: string[];
    functions?: string[];
    triggers?: string[];
    indexes?: string[];
  };
}

export interface IPerformanceMetrics {
  timestamp: string;
  buildTime: number;
  bundleSize: {
    total: number;
    pages: Record<string, number>;
    chunks: Record<string, number>;
  };
  typecheck: {
    time: number;
    errors: number;
  };
  dependencies: {
    production: number;
    development: number;
    total: number;
  };
}

export interface IPerformanceTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'degrading' | 'stable';
}

export interface ITriggerSetupOptions {
  dropExisting?: boolean;
  skipVerification?: boolean;
}

export interface IScriptOptions {
  environment: string;
  dryRun: boolean;
  runTests?: boolean;
  verbose?: boolean;
}

export interface IOutdatedPackage {
  name: string;
  current: string;
  wanted: string;
  latest: string;
}

export interface IClerkUserData {
  id: string;
  username?: string;
  email_addresses?: Array<{
    id: string;
    email_address: string;
    verification: {
      status: string;
      strategy: string;
    };
  }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  updated_at?: string;
  created_at?: string;
  last_sign_in_at?: string;
  password_enabled?: boolean;
  two_factor_enabled?: boolean;
  external_id?: string;
  external_accounts?: Array<{
    id: string;
    provider: string;
    email_address: string;
  }>;
  profile_image_url?: string;
  primary_email_address_id?: string;
}

export interface IClerkDeletedUserData {
  id: string;
  deleted: boolean;
  deletedAt: string;
}

export interface IAuthModalProps {
  children?: React.ReactNode;
}

export interface ICommentForDisplay {
  id: string;
  content: string;
  createdAt: string;
  depth: number;
  user: {
    id: string;
    username: string;
    imageUrl?: string;
  };
  childComments?: {
    totalCount: number;
    edges: Array<{
      node: ICommentForDisplay;
    }>;
  };
  reactions?: Array<{
    id: string;
    emoji: string;
    userId: string;
  }>;
}

export interface ICommentItemProps {
  comment: ICommentForDisplay;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  refetchComments?: (variables?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  maxDepth?: number;
}

export interface ICommentsSectionProps {
  parentId: string;
  parentType: string;
  initialExpanded?: boolean;
  embedded?: boolean;
}

export interface IReactionsData {
  reactions: {
    edges: Array<{
      node: {
        id: string;
        emoji: string;
        userId: string;
        targetId: string;
        targetType: string;
        createdAt: string;
        updatedAt: string;
        user: {
          id: string;
          username: string;
          emailAddress: string;
          imageUrl?: string;
          __typename: string;
        };
        __typename: string;
      };
      __typename: string;
      cursor: string;
    }>;
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    __typename: string;
  };
}

export interface INavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
  subItems?: INavItem[];
  isNew?: boolean;
}

export interface IBadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children?: React.ReactNode;
}

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export interface IFormFieldContextValue {
  name: string;
}

export interface IFormItemContextValue {
  id: string;
}

export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete?: string;
  spellCheck?: boolean;
}

export interface IStarRatingProps {
  ratingForGame: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onRatingChange?: (rating: number) => void;
}

export interface ILiveGameEdge {
  node: IExtendedGame;
  cursor: string;
}

export interface ILiveGamesData {
  liveGames: {
    edges: Array<{
      node: IExtendedGame;
    }>;
  };
}

export interface IExtendedGame {
  id: string;
  status: {
    clock?: string;
    halftime?: boolean;
    short?: string;
    long?: string;
  };
  score: {
    home: {
      points: number;
    };
    visitors: {
      points: number;
    };
  };
  scores: {
    home: {
      points: number;
      win?: number;
      loss?: number;
    };
    visitors: {
      points: number;
      win?: number;
      loss?: number;
    };
  };
  teams: {
    home: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      logo?: string;
    };
    visitors: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      logo?: string;
    };
  };
  periods?: {
    current: number;
    total?: number;
  };
  arena?: {
    name: string;
    city?: string;
    state?: string;
  };
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface ILoggerConfig {
  level: LogLevel;
  silent?: boolean;
  enableTimestamp?: boolean;
  enableColors?: boolean;
  enableFileInfo?: boolean;
  prefix?: string;
}

export type ExportNameAndLocation = {
  exportName: string;
  location: string;
};

export type UnusedExportsResult = {
  file: string;
  exports: string[];
};

export type ArgType = string | number | boolean;

// Scalar types for GraphQL
export interface IAnyScalar {
  value: unknown;
}

export interface IJsonScalar {
  value: Record<string, unknown>;
}

export interface IDateTimeScalar {
  value: Date | string;
}

// Additional missing validation types
export interface ITeamValidationInput {
  name: string;
  city: string;
  code: string;
  abbreviation?: string;
  conference: string;
  division: string;
}

// Database Insert Types for Seeding
export interface IUserInsert {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  imageUrl?: string;
  inboundFriendshipIds?: string[];
  outboundFriendshipIds?: string[];
  banned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  last_sign_in_at?: Date | null;
  password_enabled?: boolean;
  two_factor_enabled?: boolean;
  email_verified?: boolean;
  email_verification_strategy?: string | null;
  external_id?: string | null;
  external_accounts?: Record<string, unknown>[];
  deletedAt?: Date | null;
}

export interface IFriendshipInsert {
  id: string;
  friendId: string;
  userId: string;
  status: IFriendshipStatusValue;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGameLogInsert {
  id: string;
  userId: string;
  gameId: string;
  watchedDate?: Date;
  ratingForGame: number;
  watchedSetting?: IWatchedSettingValue;
  watchedScope?: IWatchedScopeValue;
  watchedLocation?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  tags?: string[];
  classification?: string;
}

// Missing enum value types
export type IFriendshipStatusValue = 'Accepted' | 'Blocked' | 'Pending' | 'Rejected';
export type IWatchedSettingValue = 'Arena' | 'TV' | 'Phone' | 'Laptop' | 'Bar' | 'Home' | 'Other';
export type IWatchedScopeValue = 'Full Game' | 'Highlights' | 'Quarter' | 'Half' | 'Overtime';

// Missing types that are being imported
export interface IGameStatistics {
  id: string;
  gameId: string;
  playerId?: string;
  teamId?: string;
  points?: number;
  assists?: number;
  rebounds?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;
  minutes?: string;
  fieldGoals?: {
    made: number;
    attempted: number;
  };
  threePointers?: {
    made: number;
    attempted: number;
  };
  freeThrows?: {
    made: number;
    attempted: number;
  };
}

export interface ITeamResponseData {
  id: string;
  name: string;
  nickname: string;
  code: string;
  city: string;
  logo: string;
  conference: string;
  division: string;
  allStar?: boolean;
  nbaFranchise?: boolean;
  leagues?: Record<string, unknown>;
}

// Add a new type for season selection
export interface ISeasonOption {
  value: number;
  label: string;
  isCurrent?: boolean;
}

// Add a type for season range
export interface ISeasonRange {
  start: number;
  end: number;
  current: number;
}

export type ISortDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

export interface IGameLog {
  [key: string]: unknown; // Add index signature for Apollo Client StoreObject compatibility
  __typename?: 'GameLog' | undefined;
  __ref?: string; // Add __ref for Apollo Client Reference compatibility
  id: string;
  gameId: string;
  // User watching properties (primary use case) - required properties for GraphQL compatibility
  userId?: string;
  watchedSetting: string | null;
  watchedScope: string | null;
  watchedDate: Date | string | null;
  watchedLocation: string | null;
  ratingForGame: number;
  notes: string | null;
  tags: string[] | null;
  classification: 'Private' | 'Protected' | 'Public';
  deletedAt: Date | null;
  // Player stats properties (secondary use case) - all optional
  playerId?: string;
  teamId?: string;
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fouls?: number;
  minutes?: number;
  fgMade?: number;
  fgAttempted?: number;
  threePointMade?: number;
  threePointAttempted?: number;
  ftMade?: number;
  ftAttempted?: number;
  plusMinus?: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  game?: {
    id: string;
    date: string;
    status: string;
    arena: string;
    league: string;
    season: number;
    stage: number;
    teams: unknown;
    scores: unknown;
    officials: unknown;
    timesTied: number | null;
    leadChanges: number | null;
    nugget: string | null;
    createdAt: string;
    updatedAt: string;
  };
  comments?: {
    edges: Array<{ node: unknown; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
  reactions?: Array<{
    id: string;
    emoji: string;
    userId: string;
    user: { id: string; username: string; imageUrl: string | null };
  }>;
}

export interface IComment {
  id: string;
  content: string;
  userId: string;
  gameId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    imageUrl: string;
  };
  game: {
    id: string;
    homeTeam: {
      id: string;
      name: string;
    };
    awayTeam: {
      id: string;
      name: string;
    };
    date: Date;
  };
}

export interface IReaction {
  id: string;
  emoji: string;
  userId: string;
  targetId: string;
  targetType: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    imageUrl?: string;
  };
}

export type IParentType = 'game_log' | 'comment';

export interface ICommentConnection {
  edges: Array<{
    node: IComment;
    cursor: string;
  }>;
  pageInfo: IPageInfo;
  totalCount: number;
}

export interface ICreateCommentInput {
  content: string;
  parentId: string;
  parentType: IParentType;
}

export interface ITeamStatisticsResponseData {
  team: {
    id: string;
    name: string;
    nickname: string;
    code: string;
    city: string;
  };
  statistics: IGameTeamStatistic[];
}

export type DBGameStats = {
  id: string;
  gameId: string;
  teamId: string;
  seasonId: number;
  status: string;
  homeTeamId?: string;
  awayTeamId?: string;
  gameDate?: Date;
  homeTeamScore?: number;
  awayTeamScore?: number;
  points: number;
  fgm: number;
  fga: number;
  fgp: number;
  ftm: number;
  fta: number;
  ftp: number;
  tpm: number;
  tpa: number;
  tpp: number;
  offReb: number;
  defReb: number;
  totReb: number;
  assists: number;
  pFouls: number;
  steals: number;
  turnovers: number;
  blocks: number;
  plusMinus: number;
  min: string;
  fastBreakPoints: number;
  pointsInPaint: number;
  biggestLead: number;
  secondChancePoints: number;
  pointsOffTurnovers: number;
  longestRun: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface ITeam {
  id: string;
  name: string;
  nickname: string;
  code: string;
  city: string;
  country: string;
  conference: string;
  division: string;
  league: string;
  season: number;
  h2h: boolean;
  logo: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IReactionEmojiType =
  | 'THUMBS_UP'
  | 'THUMBS_DOWN'
  | 'LOVE'
  | 'LAUGH'
  | 'WOW'
  | 'SAD'
  | 'ANGRY'
  | 'FIRE'
  | 'CLAP'
  | 'EYES'
  | 'ROCKET'
  | 'MUSCLE'
  | 'GOAT'
  | 'BULLSEYE'
  | 'BASKETBALL'
  | 'SOCCER'
  | 'FOOTBALL'
  | 'BASEBALL'
  | 'TENNIS'
  | 'GOLF';

export type SoftDeletableTable = {
  deletedAt: Date | null;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type IGameDate = {
  start: string;
  end: string | null;
  duration: string | null;
};

export type IGameScores = {
  home: {
    win: number;
    loss: number;
    series: {
      win: number;
      loss: number;
    };
    linescore: (string | number)[];
    points: number;
  };
  visitors: {
    win: number;
    loss: number;
    series: {
      win: number;
      loss: number;
    };
    linescore: (string | number)[];
    points: number;
  };
};

export type IGamePeriods = {
  current: number;
  total: number;
  endOfPeriod: boolean;
};

export type GameArena = string | IGameArena;

export interface IGameArena {
  name: string;
  city: string;
  state: string | null;
  country: string | null;
}

export type RedisClientType = 'upstash' | 'ioredis' | null;

export interface IDatabaseSeedingConfig {
  CONCURRENT_OPERATIONS?: number;
  BATCH_SIZE: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  USER_COUNT: number;
  DEFAULT_SAMPLE_COUNT: number;
  batchSize?: number;
  concurrency?: number;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  seasons?: string[];
  enableMonitoring?: boolean;
  shouldResetDb?: boolean;
  shouldTruncateTables?: boolean;
  skipExternalDb?: boolean;
  skipApplicationDb?: boolean;
  skipUsers?: boolean;
  startDate?: string;
  tables?: string[];
}

export interface IUseSearchFiltersOptions {
  filterConfig: Record<
    string,
    {
      defaultValue: string | number | boolean;
      type?: 'string' | 'number' | 'boolean';
      label?: string;
      options?: Array<{ value: string | number; label: string }>;
    }
  >;
  additionalFilters?: Record<string, unknown>;
  initialFilters?: Record<string, unknown>;
  defaultValues?: Record<string, unknown>;
  onFilterChange?: (filters: Record<string, unknown>) => void;
  debounceTime?: number;
}

export interface IQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, unknown>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export type IGameStatusValue = 'Scheduled' | 'Live' | 'Finished' | 'Cancelled' | 'Postponed';

export interface IUseUserProfileProps {
  userId?: string;
  targetUserId?: string;
  initialData?: {
    user?: IAuthUser;
    gameLogs?: IGameLog[];
    friends?: IFriend[];
  };
}

export interface IUseUserProfileReturn {
  user: IAuthUser | null;
  gameLogs: IGameLog[];
  friends: IFriend[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  targetUser: IAuthUser | null;
  dbUserId?: string | null;
  currentUserDbId?: string | null;
  friendshipStatus?: IFriendshipStatusValue | null;
  currentFriendship?: IFriendRequest | null;
  isOwnProfile?: boolean;
  handleSendFriendRequest?: () => void;
  handleAcceptFriendRequest?: () => void;
  handleRemoveFriend?: () => void;
  sendingRequest?: boolean;
  acceptingRequest?: boolean;
  removingFriend?: boolean;
}

// --- Type stubs for missing types to unblock typecheck ---
export interface IGameListProps {
  games: IGame[];
  isLoading: boolean;
  hasError: boolean;
}
export type ISearchGame = IGame;
export type ITeamDisplayStats = object;
export interface IUserProfileLayoutProps {
  title: string;
  children: React.ReactNode;
}

export interface IUserProfileProps {
  targetUserId: string;
}
export interface IAuthContextType {
  user?: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    email?: string;
  } | null;
  userId?: string;
  isLoaded?: boolean;
  isSignedIn?: boolean;
  isAuthenticated?: boolean;
  loading?: boolean;
}

export interface IAppNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  readAt: Date | null;
  deletedAt: Date | null;
  userId?: string;
  timestamp?: Date;
  resolved?: boolean;
  description?: string;
  metadata?: {
    avatar?: string;
    [key: string]: unknown;
  };
}

export interface INotificationContextType {
  notifications: IAppNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<
      IAppNotification,
      'id' | 'createdAt' | 'updatedAt' | 'read' | 'readAt' | 'deletedAt'
    >
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export interface IUseGameDataReturn {
  games: IGame[];
  loading: boolean;
  error?: Error | null;
  refetch: () => Promise<void>;
  processedGames?: IProcessedGames;
  isFetchingMore?: boolean;
  hasShownInitialLoad?: boolean;
  currentSeason?: string | number;
  hasMoreSeasons?: boolean;
  showUpcomingGames?: boolean;
  setShowUpcomingGames?: (value: boolean) => void;
  handleLoadMore?: () => void;
  canLoadMore?: boolean;
}

export interface IUseGameDataProps {
  initialSeason?: number;
  initialFilters?: Record<string, unknown>;
}
export interface IPaginationHookOptions<T> {
  pageSize: number;
  fetchMore: (options: {
    variables: {
      first: number;
      after: string | null;
      filters?: Record<string, unknown>;
    };
    updateQuery: (
      prev: unknown,
      { fetchMoreResult }: { fetchMoreResult: IPaginationFetchResult }
    ) => unknown;
  }) => Promise<unknown>;
  data?: {
    edges?: Array<{ node: T }>;
  };
  hasNextPage?: boolean;
  filters?: Record<string, unknown>;
}

export interface IPaginationFetchResult {
  games?: {
    edges?: Array<{ node: unknown }>;
    pageInfo?: {
      endCursor?: string | null;
    };
  };
  gameLogs?: {
    edges?: Array<{ node: unknown }>;
    pageInfo?: {
      endCursor?: string | null;
    };
  };
}

// Add missing component interface definitions
export interface IFriendshipManagementProps {
  userId?: string;
  currentUserId?: string;
  targetUserId?: string;
  friendship?: IFriendRequest | null;
  onFriendshipUpdate?: (friendship: IFriendRequest | null) => void;
}

export interface IUserHeaderProps {
  user: IAuthUser;
  currentUserId?: string;
  isOwnProfile?: boolean;
  stats?: {
    totalGames: number;
    totalFriends: number;
    totalHours: number;
  };
  onGameLogUpdate?: () => void;
  onFriendshipUpdate?: (friendship: IFriendRequest | null) => void;
}

export interface IGameLogInput {
  gameId: string;
  ratingForGame: number;
  notes?: string;
  tags?: string[];
  watchedDate?: Date;
  watchedSetting?: string;
  watchedLocation?: string;
  watchedScope?: string;
  classification: string;
}

export interface IUseCreateGameLogProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface IUserSearchProps {
  users: DbUser[];
  onFilteredUsersChange?: (users: DbUser[]) => void;
  onUserSelect?: (userId: string) => void;
  excludeIds?: string[];
}

export interface IUsersTableProps {
  users: DbUser[];
  loading?: boolean;
}

export interface IUserPageProps {
  params: {
    id: string;
  };
}

export interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface IActivityTimelineProps {
  activities: IActivity[];
  isLoading?: boolean;
  loading?: boolean;
}

export interface IFriendActivityProps {
  userId: string;
  limit?: number;
  activities?: IActivity[];
  isLoading?: boolean;
}

export interface IFriend {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  avatar?: string;
}

export interface IFriendGroup {
  id: string;
  name: string;
  members?: IFriend[];
  friends?: string[] | IFriend[];
  description?: string;
  color?: string;
  imageUrl?: string;
}

export interface IFriendGroupsProps {
  groups: IFriendGroup[];
  friends?: IFriend[];
  onGroupSelect?: (groupId: string) => void;
  onGroupUpdate?: (groupId: string, updates: Partial<IFriendGroup>) => void;
}

export interface IFriendProfileProps {
  friendId: string;
  currentUserId: string;
  friend?: IFriend;
}

export interface IGetFriendshipsForUserResponse {
  friendships: Friendship[];
  totalCount: number;
}

export interface IFriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: IFriendshipStatusValue;
  createdAt: string;
  updatedAt: string;
  initiator: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    avatar?: string;
  };
  fromUser: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    avatar?: string;
  };
  toUser: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    avatar?: string;
  };
  sender: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    avatar?: string;
  };
  mutualFriends?: Array<{
    id: string;
    username: string;
    avatar?: string;
  }>;
}

// Game-related component interfaces
export interface IGameCardProps {
  game: IGame;
  onClick?: (game: IGame) => void;
  showActions?: boolean;
  className?: string;
  index?: number;
  imageErrors?: Set<string>;
  onImageError?: (gameId: string) => void;
}

export interface IAuthUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  isAuthenticated?: boolean;
  // Additional authentication fields
  last_sign_in_at?: string | number;
  createdAt?: string | number;
  email_verified?: boolean;
  emailAddresses?: Array<{
    emailAddress: string;
    id?: string;
    verification?: {
      status: string;
      strategy: string;
    };
  }>;
  friendships?: Array<{
    id: string;
    status: string;
    initiator: { id: string };
    recipient: { id: string };
  }>;
  comments?: unknown[];
  gameLogs?: unknown[];
  initiatedFriendships?: unknown[];
}

export interface IGameLogActionsProps {
  gameLog: GameLog;
  onEdit?: (gameLog: GameLog) => void;
  onDelete?: (gameLogId: string) => void;
  currentUser?: IAuthUser;
  onSuccess?: (variables?: Partial<{ [key: string]: unknown }>) => Promise<{ data?: unknown }>;
}

export interface IGameLogSearchSectionProps {
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  initialFilters?: Record<string, unknown>;
  userId?: string;
  initialSearchText?: string;
}

export interface IGameLogProps {
  gameLog: IGameLog;
  showActions?: boolean;
  onEdit?: (gameLog: IGameLog) => void;
  onDelete?: (gameLogId: string) => void;
  gameLogId?: string;
}

export interface IGameLogsSectionProps {
  userId: string;
  showHeader?: boolean;
  maxItems?: number;
  currentUserId?: string;
}

export type IDBTeam = {
  id: string;
  name: string;
  city: string;
  conference: string | null;
  division: string | null;
  code: string;
  logoUrl: string | null;
  logo: string | null;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GameLogSortByType = 'CREATED_AT' | 'WATCHED_DATE' | 'RATING';

// Utility function to map DbUser to IAuthUser
export function mapDbUserToAuthUser(dbUser: DbUser): IAuthUser {
  return {
    id: dbUser.id,
    username: dbUser.username,
    firstName: dbUser.firstName || undefined,
    lastName: dbUser.lastName || undefined,
    email: dbUser.emailAddress || undefined,
    imageUrl: dbUser.imageUrl || undefined,
    isAuthenticated: true,
  };
}
