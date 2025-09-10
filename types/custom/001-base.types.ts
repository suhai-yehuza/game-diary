/**
 * Consolidated Types
 * Optimized type definitions extending from generated GraphQL types
 *
 * This file consolidates all application types, using generated GraphQL types as the base
 * and extending them where necessary for application-specific functionality.
 */
// Additional imports for database types
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { z } from 'zod';
import type * as schema from '@/lib/db/schema';

// Import base types from generated GraphQL
import type {
  Scalars,
  UserSummary,
  Game,
  GameLog,
  Comment,
  Reaction,
  Friendship,
  FriendshipStatus,
  ParentType,
  PublicComment,
  PublicReaction,
} from '../generated/graphql';

// Create type aliases for consistency
export type IPublicComment = PublicComment;
export type IPublicReaction = PublicReaction;

import {
  CLASSIFICATION,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  TARGET_TYPES,
  REACTION_EMOJIS,
  RESOURCES,
  SORT_DIRECTION,
  FRIENDSHIP_STATUS,
  GAME_STAGE_LABELS,
  GAME_STAGE_VALUES,
  GAME_STATUS_VALUES,
} from '@/lib/constants';

// Import core types - now consolidated in this file

// Generated from constants
export type IClassificationType = (typeof CLASSIFICATION)[keyof typeof CLASSIFICATION];
export type IWatchedScopeType = (typeof WATCHED_SCOPE)[keyof typeof WATCHED_SCOPE];
export type ITargetTypeType = (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES];
export type IReactionEmojiType = (typeof REACTION_EMOJIS)[keyof typeof REACTION_EMOJIS];
export type IResourceType = (typeof RESOURCES)[keyof typeof RESOURCES];
export type ISortDirectionType = (typeof SORT_DIRECTION)[keyof typeof SORT_DIRECTION];
export type IGameStageType = (typeof GAME_STAGE_VALUES)[keyof typeof GAME_STAGE_VALUES];
export type IGameStageLabelType = (typeof GAME_STAGE_LABELS)[keyof typeof GAME_STAGE_LABELS];
export type IGameStatusType = (typeof GAME_STATUS_VALUES)[keyof typeof GAME_STATUS_VALUES];

// Type aliases for backward compatibility - moved to core.types.ts

// ========================================
// BASE TYPES & UTILITIES
// ========================================
export type Timestamp = Scalars['DateTime']['output'];
export type ID = Scalars['ID']['output'];
export type String = Scalars['String']['output'];
export type Int = Scalars['Int']['output'];
export type Float = Scalars['Float']['output'];
export type Boolean = Scalars['Boolean']['output'];

// Base entity interface
export interface IBaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
}

// ========================================
// USER TYPES
// ========================================
export interface IUser extends Omit<UserSummary, 'first_name' | 'last_name' | 'isAdmin'> {
  // Additional application-specific properties
  preferences?: IUserPreferences;
  lastActiveAt?: Timestamp;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    browser: string;
  };
  location?: {
    country: string;
    city: string;
    timezone: string;
  };
  // Additional properties for compatibility
  firstName?: string;
  lastName?: string;
  email?: string;
  permissions?: string[];
  roles?: string[];
  first_name?: string;
  last_name?: string;
  isAdmin?: boolean;
}

// User data mapping interface for GraphQL resolvers
export interface UserData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  image_url: string | null;
}

export interface IUserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    gameLogVisibility: 'public' | 'friends' | 'private';
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

export interface IUserProfile extends IUser {
  // Additional profile-specific properties
  can_view_details?: boolean;
  is_friend?: boolean;
  is_own_profile?: boolean;
}

export interface IFriendshipStatus {
  status: string;
  friendshipId?: string;
  isInitiator?: boolean;
}

// ========================================
// GAME TYPES
// ========================================
export interface IGame extends Game {
  // Additional application-specific properties
  displayName?: string;
  formattedDate?: string;
  isLive?: boolean;
  isFinished?: boolean;
}

// Game status interface
export interface IGameStatus {
  short: string;
  long: string;
}

// Arena interface
export interface IArena {
  name: string;
  city: string;
  state?: string;
  country?: string;
  capacity?: number;
  surface?: string;
}

// ========================================
// GAME LOG TYPES
// ========================================
export interface IGameLog
  extends Omit<
    GameLog,
    'classification' | 'game_id' | 'rating_for_game' | 'totalCommentCount' | 'totalReactionCount'
  > {
  // Override classification with our union type
  classification: IClassificationType;
  // Additional application-specific properties
  displayStatus?: string;
  formattedWatchedDate?: string;
  isPublic?: boolean;
  game_id?: string;
  rating_for_game?: number;
  user_id?: string;
  // Count fields for comments and reactions
  totalCommentCount?: number;
  totalReactionCount?: number;
  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;
}

// Form data interfaces
export interface ICreateGameLogFormData {
  gameId: string;
  rating_for_game: number;
  notes?: string;
  tags?: string[];
  watched_date?: string;
  watched_setting?: string;
  watched_location?: string;
  watched_scope?: string;
  classification: IClassificationType;
}

export const createGameLogSchema = z.object({
  gameId: z.string().min(1, 'Game is required'),
  rating_for_game: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  watched_date: z.string().optional(),
  watched_setting: z.string().optional(),
  watched_location: z.string().optional(),
  watched_scope: z.string().optional(),
  classification: z.nativeEnum(CLASSIFICATION).optional(),
});

export interface IUpdateGameLogFormData {
  rating_for_game?: number;
  notes?: string;
  tags?: string[];
  watched_date?: string;
  watched_setting?: string;
  watched_location?: string;
  watched_scope?: string;
  classification?: IClassificationType;
}

export const updateGameLogSchema = z.object({
  rating_for_game: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  watched_date: z.string().optional(),
  watched_setting: z.string().optional(),
  watched_location: z.string().optional(),
  watched_scope: z.string().optional(),
  classification: z.nativeEnum(CLASSIFICATION).optional(),
});

// ========================================
// COMMENT TYPES
// ========================================
export interface IComment extends Comment {
  // Additional application-specific properties
  isEdited?: boolean;
  editHistory?: ICommentEdit[];
  canEdit?: boolean;
  canDelete?: boolean;
  canReply?: boolean;
}

export interface ICommentEdit {
  id: string;
  content: string;
  editedAt: Timestamp;
  editedBy: string;
  reason?: string;
}

// Form data interfaces

// ========================================
// REACTION TYPES
// ========================================
export interface IReaction extends Reaction {
  // Additional application-specific properties
  canRemove?: boolean;
}

export interface IReactionGroup {
  emoji: string;
  count: number;
  reactions: IReaction[];
  users: Array<{
    id: string;
    username: string;
    imageUrl?: string | null;
  }>;
  hasUserReacted: boolean;
}

// ========================================
// FRIENDSHIP TYPES
// ========================================
export interface IFriendship extends Friendship {
  // Additional application-specific properties
  canAccept?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
  canRemove?: boolean;
}

// ========================================
// SEARCH TYPES
// ========================================
export interface ISearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'game' | 'player' | 'team' | 'user' | 'gameLog';
  url: string;
  metadata?: {
    imageUrl?: string;
    subtitle?: string;
    tags?: string[];
    score?: number;
    [key: string]: unknown;
  };
}

export interface ISearchResponse<T = ISearchResult> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  query: string;
  filters?: Record<string, unknown>;
  facets?: {
    [key: string]: Array<{
      value: string;
      count: number;
    }>;
  };
  suggestions?: string[];
  took?: number;
}

export interface ISearchFilters {
  type?: 'user' | 'game' | 'gameLog' | 'team' | 'player';
  dateFrom?: string;
  dateTo?: string;
  classification?: IClassificationType;
  minRating?: number;
  maxRating?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface ISearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: ISortDirectionType;
  includeMetadata?: boolean;
}

// ========================================
// UI COMPONENT TYPES
// ========================================
export type INotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'reaction_added'
  | 'reaction_removed'
  | 'reaction_updated'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_deleted'
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'friend_removed';

export interface INotificationData {
  userId?: string;
  gameLogId?: string;
  commentId?: string;
  reactionId?: string;
  friendshipId?: string;
  url?: string;
  [key: string]: unknown;
}

export interface IAppNotification {
  id: string;
  userId: string;
  type: INotificationType;
  title: string;
  message: string;
  data?: INotificationData;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  expiresAt?: Date | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  image_url?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
  resolved?: boolean;
  description?: string;
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
  refreshNotifications: () => void;
  loading?: boolean;
  error?: Error | null;
  notificationsQueryTime?: number;
  unreadCountQueryTime?: number;
  isNotificationsSlow?: boolean;
  isUnreadCountSlow?: boolean;
}

// ========================================
// LANDING PAGE TYPES
// ========================================
export interface IBaseUser extends UserSummary {
  // Additional properties for landing page
}

export interface IBaseTeam {
  id: string;
  name: string;
  code: string;
  logo?: string;
  nickname?: string;
  city?: string;
  score?: number;
  points?: number;
}

export interface IGameTeamsData {
  home?: IBaseTeam & { points?: number };
  away?: IBaseTeam & { points?: number };
  visitors?: IBaseTeam & { points?: number };
}

export interface IBaseGame extends IBaseEntity {
  date: string | { start: string };
  status: IGameStatus;
  homeTeam: IBaseTeam;
  awayTeam: IBaseTeam;
  arena?: IArena;
  teams?: {
    home: IBaseTeam;
    visitors: IBaseTeam;
  };
  scores?: {
    home: { points: number };
    visitors: { points: number };
  };
  nugget?: string;
}

export interface IRecentGame extends Omit<IBaseGame, 'status'> {
  status: string | { short: string; long: string };
  finishedGames?: IRecentGame[];
}

export interface IEngagementMetrics {
  gameLogCount: number;
  commentCount: number;
  reactionCount: number;
}

export interface IRating {
  average: number;
  totalRatings: number;
  popularityScore: number;
}

export interface IPopularGame extends IBaseGame, IEngagementMetrics {
  rating: IRating;
  topRated?: IPopularGame[];
  mostRated?: IPopularGame[];
  mostPopular?: IPopularGame[];
}

export interface IFeaturedGame extends IBaseGame {
  featuredUntil?: string;
  priority?: number;
  category?: string;
}

export interface ILiveGame extends IBaseGame {}

export interface IBaseGameLog extends GameLog {
  // Additional properties for landing page
  rating: number;
  notes?: string;
  tags?: string[];
  totalReactions: number;
  totalComments: number;
  user: IBaseUser;
}

export interface ITrendingGameLog extends IBaseGameLog {
  trendingScore: number;
}

export interface IPopularGameLog extends IBaseGameLog {}

export type ContentType = 'game' | 'player' | 'team' | 'gameLog' | 'user';
export type ActivityType = 'gameLog' | 'comment' | 'reaction';

export interface IFeaturedContent extends IBaseEntity {
  type: ContentType;
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
  metadata?: {
    category?: string;
    tags?: string[];
    featuredUntil?: string;
    priority?: number;
  };
}

export interface IRecentActivity extends IBaseEntity {
  type: ActivityType;
  user: IBaseUser;
  content: string;
  timestamp: string;
}

export interface ITrendingContent extends IBaseEntity {
  type: ContentType;
  title: string;
  description?: string;
  score: number;
  url: string;
}

export interface ITopPerformer extends IBaseEntity {
  name: string;
  count: number;
  metric: string;
}

export interface ILandingPageStatistics {
  totals: {
    users: number;
    gameLogs: number;
    games: number;
    comments: number;
    reactions: number;
  };
  daily: {
    activeUsers: number;
    newGameLogs: number;
  };
  topPerformers: {
    mostActiveUsers: Array<ITopPerformer & { username: string; gameLogCount: number }>;
    mostCommentedGames: Array<ITopPerformer & { name: string; commentCount: number }>;
    mostReactedGameLogs: Array<ITopPerformer & { title: string; reactionCount: number }>;
  };
}

export interface ILandingPageData extends IBaseEntity {
  type?: 'user' | 'game' | 'gameLog';
  title?: string;
  description?: string;
  score?: number;
  url?: string;
  recentGames?: IRecentGame[];
  popularGames?: {
    topRated: IPopularGame[];
    mostRated: IPopularGame[];
    mostPopular: IPopularGame[];
  };
  featuredGames?: IFeaturedGame[];
  trendingGameLogs?: ITrendingGameLog[];
  popularGameLogs?: IPopularGameLog[];
  featuredContent?: IFeaturedContent[];
  recentActivity?: IRecentActivity[];
  trendingContent?: {
    topGameLogs: ITrendingGameLog[];
    mostActiveGameLog: ITrendingGameLog | null;
  };
  statistics?: ILandingPageStatistics;
  lastUpdated?: string;
  timestamp?: string;
  source?: string;
  latestResults?: {
    latestGames: IRecentGame[];
    latestFinishedGame: IRecentGame | null;
  };
}

// ========================================
// SYSTEM TYPES
// ========================================
export interface ISession {
  id: string;
  userId: string;
  status: 'active' | 'expired' | 'revoked';
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
}

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: IUser | null;
  session: ISession | null;
  organization: IOrganization | null;
  organizationMembership: IOrganizationMembership | null;
  isAuthStable?: boolean;
  authError?: string | null;
  retryAuth?: () => void;
}

export interface IAuthContextResult {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: IUser | null;
  session: ISession | null;
  isAuthenticated?: boolean;
  authSource?: string;
  userId?: string;
  error?: string | null;
}

// Auth context value interface
export interface IAuthContextValue extends IAuthContextResult {
  // Additional auth context methods and properties
  isLoading?: boolean;
  authError?: string | null;
  hasPermission?: (permission: string) => boolean;
  refreshAuth?: () => Promise<void>;
  logout?: () => Promise<void>;
}

// Auth permission and role types
export enum Permission {
  READ_OWN_PROFILE = 'READ_OWN_PROFILE',
  UPDATE_OWN_PROFILE = 'UPDATE_OWN_PROFILE',
  DELETE_OWN_PROFILE = 'DELETE_OWN_PROFILE',
  READ_OWN_GAME_LOGS = 'READ_OWN_GAME_LOGS',
  CREATE_GAME_LOG = 'CREATE_GAME_LOG',
  UPDATE_GAME_LOG = 'UPDATE_GAME_LOG',
  DELETE_GAME_LOG = 'DELETE_GAME_LOG',
  READ_PUBLIC_GAME_LOGS = 'READ_PUBLIC_GAME_LOGS',
  READ_PROTECTED_GAME_LOGS = 'READ_PROTECTED_GAME_LOGS',
  CREATE_COMMENTS = 'CREATE_COMMENTS',
  UPDATE_OWN_COMMENTS = 'UPDATE_OWN_COMMENTS',
  DELETE_OWN_COMMENTS = 'DELETE_OWN_COMMENTS',
  MODERATE_CONTENT = 'MODERATE_CONTENT',
  MODERATE_COMMENTS = 'MODERATE_COMMENTS',
  BAN_USERS = 'BAN_USERS',
  ADMIN_READ_ALL = 'ADMIN_READ_ALL',
  ADMIN_UPDATE_ALL = 'ADMIN_UPDATE_ALL',
  ADMIN_DELETE_ALL = 'ADMIN_DELETE_ALL',
  ADMIN_MANAGE_USERS = 'ADMIN_MANAGE_USERS',
  ADMIN_VIEW_AUDIT_LOGS = 'ADMIN_VIEW_AUDIT_LOGS',
}

export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

// ========================================
// PAGE TYPES
// ========================================
export interface IPageMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  author?: string;
  ogImage?: string;
  canonical?: string;
}

export interface IPageProps {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
}

export interface ISignInPageProps extends IPageProps {}
export interface ISignUpPageProps extends IPageProps {}
export interface IGameLogDetailPageProps extends IPageProps {
  gameLogId: string;
}
export interface IGameDetailPageProps extends IPageProps {
  gameId: string;
}
export interface IPlayerDetailPageProps extends IPageProps {
  playerId: string;
}
export interface ITeamDetailPageProps extends IPageProps {
  teamId: string;
}

export interface IPageLayout {
  header?: boolean;
  footer?: boolean;
  sidebar?: boolean;
  navigation?: boolean;
}

export interface IPageConfig {
  metadata: IPageMetadata;
  layout: IPageLayout;
  auth?: {
    required: boolean;
    roles?: string[];
    permissions?: string[];
  };
  seo?: {
    robots?: string;
    noindex?: boolean;
    nofollow?: boolean;
  };
}

// ========================================
// ADMIN TYPES
// ========================================
export interface IAdminAuthContext {
  user: IUser | null;
  isAdmin: boolean;
  permissions: string[];
  loading: boolean;
  error: string | null;
  userId?: string;
  userEmail?: string;
}

export interface ITestItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// ========================================
// HOOK TYPES
// ========================================
export interface IAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface IUseSearchOptions {
  debounceMs?: number;
  searchPath?: string;
  adminSearchPath?: string;
}

export interface IReactionState {
  reactions: IReaction[];
  loading: boolean;
  error: string | null;
  adding: boolean;
  removing: boolean;
}

export interface ISuccessState {
  isSuccess: boolean;
  message?: string;
  data?: unknown;
}

// ========================================
// UTILITY TYPES
// ========================================
export interface IErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface IPaginationParams {
  limit: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  first?: number;
  after?: string;
  [key: string]: unknown;
}

export interface IPaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IConnection<T> {
  edges: Array<{ node: T; cursor: string }>;
  pageInfo: IPaginationInfo;
  totalCount: number;
}

// ========================================
// TYPE GUARDS
// ========================================
export const isUser = (entity: unknown): entity is IUser => {
  return isObject(entity) && 'username' in entity && 'emailAddress' in entity;
};

export const isGame = (entity: unknown): entity is IGame => {
  return isObject(entity) && 'date' in entity && 'status' in entity;
};

export const isGameLog = (entity: unknown): entity is IGameLog => {
  return isObject(entity) && 'gameId' in entity && 'userId' in entity && 'ratingForGame' in entity;
};

export const isComment = (entity: unknown): entity is IComment => {
  return isObject(entity) && 'content' in entity && 'userId' in entity;
};

export const isReaction = (entity: unknown): entity is IReaction => {
  return isObject(entity) && 'emoji' in entity && 'userId' in entity;
};

export const isFriendship = (entity: unknown): entity is IFriendship => {
  return (
    isObject(entity) && 'initiatorId' in entity && 'recipientId' in entity && 'status' in entity
  );
};

export const isNotification = (entity: unknown): entity is IAppNotification => {
  return isObject(entity) && 'userId' in entity && 'type' in entity && 'title' in entity;
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

export const isDate = (value: unknown): value is Date => {
  return value instanceof Date;
};

export const isNull = (value: unknown): value is null => {
  return value === null;
};

export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

export const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

// ========================================
// CONSTANTS
// ========================================
export const DEFAULT_LANDING_PAGE_CONFIG = {
  maxRecentGames: 10,
  maxPopularGames: 8,
  maxTrendingGameLogs: 6,
  maxFeaturedContent: 4,
  cacheTtl: 300,
  refreshThreshold: 240,
} as const;

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  game: 'Game',
  player: 'Player',
  team: 'Team',
  gameLog: 'Game Log',
  user: 'User',
} as const;

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  gameLog: 'Game Log',
  comment: 'Comment',
  reaction: 'Reaction',
} as const;

// ========================================
// COMPONENT TYPES
// ========================================
export interface ILabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export interface IBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export interface ITabsProps {
  defaultValue?: string;
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface ITabsListProps {
  children: React.ReactNode;
  className?: string;
}

// Card Component Types
export interface ICardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface ICardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface ICardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children: React.ReactNode;
}

export interface ICardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export interface ICardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface ICardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface ITabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface ITabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Form Component Props
export interface IGamesFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  children?: React.ReactNode;
  gameParams: any;
  setGameParams: (params: any) => void;
  loading: boolean;
  seasons: any[];
  teams: any[];
}

export interface IGameStatsFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  children?: React.ReactNode;
  gameStatsId: string;
  setGameStatsId: (id: string) => void;
  loading: boolean;
}

export interface ITeamsFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  children?: React.ReactNode;
  teamParams: any;
  setTeamParams: (params: any) => void;
  loading: boolean;
  seasons: any[];
  teams: any[];
}

export interface ITeamStatsFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  children?: React.ReactNode;
  teamStatsParams: any;
  setTeamStatsParams: (params: any) => void;
  loading: boolean;
  seasons: any[];
  teams: any[];
}

export interface IPlayersFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  children?: React.ReactNode;
  playerParams: any;
  setPlayerParams: (params: any) => void;
  loading: boolean;
  seasons: any[];
  teams: any[];
}

export interface IPlayerStatsFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  children?: React.ReactNode;
  playerStatsParams: any;
  setPlayerStatsParams: (params: any) => void;
  loading: boolean;
  seasons: any[];
  teams: any[];
}

export interface IStandingsFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  children?: React.ReactNode;
  standingsParams: any;
  setStandingsParams: (params: any) => void;
  loading: boolean;
  seasons: any[];
}

// Search Component Props
export interface ITeamSearchResultProps {
  team: any;
  onClick?: (team: any) => void;
  className?: string;
}

export interface IUserSearchResultProps {
  user: any;
  onClick?: (user: any) => void;
  className?: string;
}

// Sports Component Props
export interface IGameResponse {
  id: string;
  date:
    | string
    | {
        start: string;
      };
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  status:
    | string
    | {
        short: string;
        long?: string;
        clock?: string;
      };
  teams?: {
    home: {
      id?: string | number;
      name: string;
      code: string;
      logo: string;
      nickname?: string;
    };
    visitors: {
      id?: string | number;
      name: string;
      code: string;
      logo: string;
      nickname?: string;
    };
    away: {
      id?: string | number;
      name: string;
      code: string;
      logo: string;
      nickname?: string;
    };
  };
  scores?: {
    home: {
      points: number;
    };
    visitors: {
      points: number;
    };
  };
  season?: string;
  period?: number;
  periods?: {
    current: number;
    total: number;
  };
  time?: string;
  venue?: string;
  attendance?: number;
  officials?: string[];
  weather?: string;
  notes?: string;
  arena?: {
    name: string;
    city: string;
    state: string;
  };
  nugget?: string;
  stage?: number;
  timesTied?: number;
  leadChanges?: number;
}

export interface ISportsEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export interface IGameCardProps {
  game: any;
  onClick?: (game: any) => void;
  className?: string;
}

export interface IGameFiltersProps {
  filters: any;
  filterOptions: any;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  totalGames: number;
  filteredGamesCount: number;
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  onToggleAdvancedFilters: () => void;
  onRefresh: () => void;
  className?: string;
}

export interface INBANewsItem {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  url: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
}

export interface INBANewsProps {
  news: INBANewsItem[];
  loading?: boolean;
  error?: string;
  limit?: number;
  className?: string;
}

export interface ISportsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  totalCount?: number;
  pageSize?: number;
}

export interface IPlayerCardProps {
  player: any;
  onClick?: (player: any) => void;
  className?: string;
}

export interface IPlayerFiltersProps {
  filters: any;
  filterOptions: any;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  totalPlayers: number;
  filteredPlayersCount: number;
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  onToggleAdvancedFilters: () => void;
  onRefresh: () => void;
  className?: string;
}

// Player filters type
export interface IPlayerFilters {
  search?: string;
  searchTerm?: string;
  team?: string;
  yearFilter?: string;
  position?: string;
  positionFilter?: string;
  collegeFilter?: string;
  countryFilter?: string;
  conference?: string;
  division?: string;
  season?: string;
  status?: string;
  limit?: number;
  offset?: number;
  minGames?: number;
  maxGames?: number;
  minMinutes?: number;
  maxMinutes?: number;
  minPoints?: number;
  maxPoints?: number;
  minRebounds?: number;
  maxRebounds?: number;
  minAssists?: number;
  maxAssists?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  sortDirection?: 'asc' | 'desc';
}

export interface ISimpleSportsPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export interface ISportsPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showLiveGamesButton?: boolean;
  showSportButtons?: boolean;
  sportButtons?: Array<{
    name: string;
    fullName: string;
    href: string;
    color: string;
    icon: string;
  }>;
  className?: string;
}

export interface ISportsTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    href?: string;
  }>;
  defaultTab?: string;
  showLiveGamesTab?: boolean;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

// Sports tab properties
export interface ISportTab {
  id: string;
  label: string;
  href: string;
  name?: string;
  color?: string;
}

export interface ITeamCardProps {
  team: any;
  onClick?: (team: any) => void;
  className?: string;
}

export interface ITeamFiltersProps {
  filters: any;
  filterOptions: any;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  totalTeams: number;
  filteredTeamsCount: number;
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  onToggleAdvancedFilters: () => void;
  onRefresh: () => void;
  className?: string;
}

// Admin Component Props
export interface IAdminButtonProps extends IButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export interface ITableWithSearchProps<T = any> {
  endpoint?: string;
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  itemLabel: string;
  tableName: string;
}

export interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
  componentName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface IErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
  title?: string;
  variant?: 'default' | 'destructive' | 'warning';
  showRetry?: boolean;
}

export interface IPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  loading: boolean;
  onPageChange: (page: number) => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  className?: string;
}

export interface IPaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  totalCount: number;
  itemsPerPage: number;
  pageSize: number;
  itemLabel: string;
  className?: string;
}

export type ISortDirection = 'asc' | 'desc' | null;

export interface ISortConfig {
  key: string | null;
  direction: ISortDirection | null;
}

export interface ISortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey?: string;
  currentSortDirection?: ISortDirection | null;
  onSort: (key: string, direction?: ISortDirection | null) => void;
  label?: string;
  sortConfig?: ISortConfig;
  disabled?: boolean;
  className?: string;
}

export interface IUseSortingReturn {
  sortConfig: ISortConfig;
  handleSort: (key: string, direction: ISortDirection) => void;
  clearSort: () => void;
  getSortParams: () => { sortKey: string | null; sortDirection: ISortDirection | null };
}

export interface ITableSearchProps {
  searchTerm: string;
  onSearchChange: (term: string, field?: string) => void;
  searchFields: Array<{
    key: string;
    label: string;
    value?: string;
  }>;
  searchField?: string;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export interface IErrorState {
  hasError: boolean;
  error?: Error | string;
  message?: string;
}

export interface IUseErrorHandlerReturn {
  error: IErrorState;
  handleError: (error: Error | string) => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>;
  handleSyncError: <T>(syncFn: () => T) => T | undefined;
  clearError: () => void;
  setError: (error: Error | string) => void;
}

export interface IPaginationOptions {
  query: string;
  variables: Record<string, unknown>;
  onDataReceived: (data: unknown) => void;
  onError: (error: string) => void;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// User Component Props
export interface IFriendRequestCardProps {
  friendship: any;
  request?: any;
  onAccept: (friendshipId: string) => void;
  onReject: (friendshipId: string) => void;
  loading?: boolean;
  className?: string;
}

export interface IFriendshipCardProps {
  friendship: any;
  currentUserId?: string;
  onRemove: (friendshipId: string) => void;
  loading?: boolean;
  className?: string;
}

export interface IPendingFriendshipCardProps {
  pending: any;
  onWithdraw: (friendshipId: string, context?: 'cancel-request' | 'remove-friend') => Promise<void>;
  loading: boolean;
  onSendRequest: (friendId: string) => Promise<void>;
}

export interface IUserSearchResultCardProps {
  user: any;
  currentUserId: string;
  onSendRequest: (friendId: string, refetchStatus?: () => void) => Promise<void>;
  onRemoveFriend: (
    friendshipId: string,
    context?: 'cancel-request' | 'remove-friend'
  ) => Promise<void>;
  loading: boolean;
}

// Hook Types
export interface IUseAsyncStateReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  execute: (asyncFn: () => Promise<T>) => Promise<T | undefined>;
}

export interface IPaginatedState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
}

export interface IUsePaginatedStateReturn<T> {
  state: IPaginatedState<T>;
  loadMore: () => void;
  refresh: () => void;
  setData: (data: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  execute: (asyncFn: () => Promise<{ data: T[]; totalCount: number }>) => Promise<T[] | undefined>;
}

export interface ICentralizedErrorHandlerOptions {
  onError?: (error: Error, context: IErrorContext) => void;
  logErrors?: boolean;
  showNotifications?: boolean;
  showToast?: boolean;
  toastMessage?: string;
  context?: {
    component: string;
    action: string;
  };
}

// Error Types
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  DATABASE = 'database',
  API = 'api',
  UI = 'ui',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// API Response Types
export interface IApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IPlayerResponse {
  id: string;
  name: string;
  position: string;
  team: any;
  [key: string]: any;
}

export interface IPlayersApiResponse {
  success: boolean;
  get: string;
  parameters: {
    league: string;
    season: string;
    search?: string;
    position?: string;
    team?: string;
    college?: string;
  };
  errors: any[];
  results: number;
  response: any[];
  timestamp: string;
  // Pagination fields
  players?: IPlayerResponse[];
  total?: number;
  page?: number;
  limit?: number;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  cacheInfo?: {
    hit: boolean;
    ttl?: number;
    key?: string;
  };
  requestId?: string;
}

export interface ITeamResponse {
  id: string;
  name: string;
  city: string;
  nickname: string;
  [key: string]: any;
}

// Filter Types
export interface IPlayerFilterState {
  searchTerm: string;
  positionFilter: string;
  activeFilter: string;
  countryFilter: string;
  collegeFilter: string;
  sortBy: 'name' | 'position' | 'age' | 'height' | 'weight' | 'experience';
  sortDirection: 'asc' | 'desc';
}

export interface IEnhancedPlayerFilterState {
  searchTerm: string;
  positionFilter: string;
  teamFilter: string;
  activeFilter: string;
  countryFilter: string;
  collegeFilter: string;
  sortBy: 'name' | 'position' | 'age' | 'height' | 'weight' | 'experience';
  sortDirection: 'asc' | 'desc';
  customFilters: Record<string, any>;
}

export interface IEnhancedPlayerFilterOptions {
  positions: string[];
  teams: string[];
  countries: string[];
  colleges: string[];
  customFilterOptions: Record<string, any>;
}

// Admin Types
export interface IAuditLog {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  category?: string;
  severity?: string;
  description?: string;
  success?: boolean;
}

export interface IFilters {
  [key: string]: any;
}

export type AuditLogSearchField =
  | 'action'
  | 'userId'
  | 'timestamp'
  | 'details'
  | 'category'
  | 'severity'
  | 'user_id'
  | 'description'
  | 'all';

// ========================================
// NAVIGATION COMPONENT TYPES
// ========================================
export interface INavItemExtendedProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isStacked?: boolean;
  closeMenu?: () => void;
  'aria-current'?: 'page' | undefined;
}

export interface INavigationLinksProps {
  isActive: (path: string) => boolean;
  _isMenuExpanded: boolean;
  _setIsMenuExpanded: (expanded: boolean) => void;
  closeMenu?: () => void;
  isStacked?: boolean;
}

export interface INavigationContainerProps {
  isMenuExpanded: boolean;
  isActive: (path: string) => boolean;
  setIsMenuExpanded: (expanded: boolean) => void;
  closeMenu?: () => void;
  isStacked?: boolean;
  onMenuToggle: () => void;
}

// ========================================
// PROVIDER COMPONENT TYPES
// ========================================
export interface IClientProvidersProps {
  children: React.ReactNode;
}

export interface IMenuContextType {
  isMenuExpanded: boolean;
  setIsMenuExpanded: (expanded: boolean) => void;
}

// ========================================
// REACTION COMPONENT TYPES
// ========================================
export interface IReactionButtonProps {
  emoji: string;
  count: number;
  hasReacted: boolean;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export interface IMemoizedReactionButtonProps {
  group: IReactionGroup;
  onClick: (emoji: string) => void;
  loading?: boolean;
  sizeClasses: string;
  showCount: boolean;
}

export interface IReactionCountProps {
  count?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface IReactionPickerProps {
  targetId: string;
  targetType: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  onReactionSelect?: (emoji: string) => void;
}

// ========================================
// SEARCH COMPONENT TYPES
// ========================================
export type IResultType = 'all' | 'users' | 'games' | 'gameLogs' | 'teams' | 'players';

export interface ISearchEvent {
  query: string;
  resultsCount: number;
  searchTime: number;
  category?: string;
  filters?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

export interface ISearchAnalyticsProps {
  query: string;
  resultsCount: number;
  searchTime: number;
  category?: string;
  filters?: Record<string, any>;
  children: React.ReactNode;
}

export interface ISearchEmptyStateProps {
  hasQuery: boolean;
}

export interface ISearchResultsProps {
  results: {
    results: Array<{
      id: string;
      type: string;
      [key: string]: any;
    }>;
    total: number;
    page?: number;
    limit?: number;
  };
  query: string;
}

export interface IGameLogSearchResultProps {
  gameLog: any;
  onClick?: (gameLog: any) => void;
  className?: string;
}

export interface IGameLogsSearchProps {
  onSearchChange: (term: string, field: string) => void;
  onClear: () => void;
  searchTerm: string;
  searchField: string;
}

export interface IGameLogsSortProps {
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  onSort: (key: string, direction: 'asc' | 'desc' | null) => void;
  displayedCount: number;
  totalCount: number;
  classification?: string;
}

export interface IGameLogsTabsProps {
  selectedTab: string | AdminTabValue;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export interface IGameSearchProps {
  onSearchChange?: (term: string) => void;
  onClear?: () => void;
  searchTerm?: string;
  placeholder?: string;
  className?: string;
  onGameSelect: (gameId: string, gameName: string) => void;
  onClose: () => void;
}

export interface IGameLogSearchResult {
  id: string;
  name: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  arena: string;
  season: number;
  status: string;
}

export interface IRatingStarsProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface IGameSearchResultProps {
  game: any;
  onClick?: (game: any) => void;
  className?: string;
}

export interface IPlayerSearchResultProps {
  player: IPlayerResponse;
  onClick?: (player: IPlayerResponse) => void;
  className?: string;
}

// Update ISearchSuggestion to match usage
export interface ISearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  category?: string;
  icon?: React.ReactNode;
}

// Update ISearchSuggestionsProps to match usage
export interface ISearchSuggestionsProps {
  query: string;
  onSuggestionSelect: (suggestion: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

// Experimental Component Props
export interface NavigationTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  selectedTab: string | AdminTabValue;
  setSelectedTab: (tab: string | AdminTabValue) => void;
}

export interface SimpleEndpointsProps {
  endpoints: Array<{
    name: string;
    url: string;
    method: string;
  }>;
  selectedTab: string | AdminTabValue;
  loading: boolean;
  handleFetch: (
    endpoint: string,
    params: Record<string, string>,
    requiredFields?: string[]
  ) => Promise<void>;
}

export interface GamesSectionProps {
  games: any[];
  loading?: boolean;
  error?: string;
}

export interface TeamsSectionProps {
  teams: any[];
  loading?: boolean;
  error?: string;
}

export interface PlayersSectionProps {
  players: any[];
  loading?: boolean;
  error?: string;
}

export interface IDbRefreshProgress {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
  // Additional properties used by components
  stepNumber?: number;
  totalSteps?: number;
  currentStep?: string;
  details?: string;
  startTime?: string | number;
  estimatedTimeRemaining?: number;
}

// Dynamic Form Types
export interface IDynamicFormProps {
  fields: IFieldConfig[];
  onSubmit: (data: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  loading?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  className?: string;
}

export interface IFieldConfig {
  name: string;
  label: string;
  id?: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'date';
  required?: boolean;
  placeholder?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
  disabled?: boolean;
  readonly?: boolean;
}

export interface DataDisplayProps {
  data: any;
  title?: string;
  className?: string;
  loading: boolean;
  error: any;
  selectedTab: string | AdminTabValue;
}

export interface IDataDisplayProps extends DataDisplayProps {
  // Alias for consistency with naming convention
}

// Mock Server Types
export interface MockServerConfig {
  port: number;
  delay: number;
  enableLogging: boolean;
  host?: string;
  cors?: boolean;
  latency?: {
    min: number;
    max: number;
  };
  errorRate?: number;
}

export interface MockDatabaseSchema {
  users: MockUser[];
  gameLogs: MockGameLog[];
  friendships: MockFriendship[];
  comments: MockComment[];
  reactions: MockReaction[];
  notifications: MockNotification[];
  gameRatings: MockGameRating[];
  seasons?: any[];
  basketball_games?: any[];
  teams?: any[];
  basketball_players?: any[];
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  imageUrl?: string;
  isAdmin?: boolean;
  createdAt: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockGameLog {
  id: string;
  userId: string;
  title: string;
  content: string;
  classification: IClassificationType;
  game_id?: string;
  gameId?: string;
  rating?: number;
  createdAt: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockFriendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  user_id?: string;
  friend_id?: string;
  status: FriendshipStatus;
  createdAt: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockComment {
  id: string;
  userId: string;
  gameLogId: string;
  game_log_id?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  createdAt: string;
}

export interface MockReaction {
  id: string;
  userId: string;
  targetId: string;
  targetType: ITargetTypeType;
  game_log_id?: string;
  type?: IReactionEmojiType;
  emoji: string;
  createdAt: string;
  created_at?: string;
}

export interface MockNotification {
  id: string;
  userId: string;
  type: IResourceType;
  title?: string;
  message: string;
  read: boolean;
  created_at?: string;
  createdAt: string;
}

export interface MockGameRating {
  id: string;
  userId: string;
  gameLogId: string;
  gameId?: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
  createdAt: string;
}

// External API Types
export interface ExternalAPIResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success?: boolean;
  error?: string;
  timestamp?: Date;
  latency?: number;
}

export interface IGamesApiResponse {
  games: any[];
  total: number;
  page: number;
  limit: number;
  get?: string;
  parameters?: any;
  errors?: any[];
  response?: any[];
  results?: number;
}

export interface IGameStatisticsApiResponse {
  statistics: any[];
  total: number;
  success?: boolean;
  data?: any;
  timestamp?: string;
}

export interface ILeaguesApiResponse {
  leagues: any[];
  total: number;
  success?: boolean;
  data?: any;
  timestamp?: string;
}

export interface IPlayerStatisticsApiResponse {
  statistics: any[];
  total: number;
  success?: boolean;
  data?: any;
  timestamp?: string;
}

export interface ISeasonsApiResponse {
  seasons: any[];
  total: number;
  get?: string;
  parameters?: any;
  errors?: any[];
  results?: number;
  response?: any[];
  success?: boolean;
  timestamp?: string;
  requestId?: string;
}

export interface IStandingsApiResponse {
  standings: any[];
  total: number;
  success?: boolean;
  data?: any;
  timestamp?: string;
}

export interface ITeamsApiResponse {
  teams: any[];
  total: number;
  page: number;
  limit: number;
  success?: boolean;
  timestamp?: string;
  requestId?: string;
  get?: string;
  parameters?: any;
  errors?: any[];
  response?: any[];
  results?: number;
}

export interface ITeamStatisticsApiResponse {
  statistics: any[];
  total: number;
  get?: string;
  parameters?: any;
  errors?: any[];
  results?: number;
  success?: boolean;
  timestamp?: string;
  requestId?: string;
  response?: any[];
}

// Service Types
export interface ISlackMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  blocks?: any[];
}

export interface IAnalyticsProperties {
  [key: string]: any;
}

export interface IRapidAPIConfig {
  apiKey: string;
  baseUrl: string;
  host: string;
  timeout: number;
  retries?: number;
  headers?: Record<string, string>;
  endpoints?: Record<string, string>;
  cacheTTL?: number;
}

export interface IEncryptedField {
  encrypted: string;
  iv: string;
  tag: string;
}

export interface IErrorHandlerConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  logLevel: string;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  showUserFriendlyMessages?: boolean;
}

export type IdGeneratorType = 'uuidv7' | 'ulid' | 'nanoid' | 'cuid2' | 'uuid';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface ILogContext {
  userId?: string;
  requestId?: string;
  component?: string;
  [key: string]: any;
}

// Seed interfaces for database seeding
export interface ISeedUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number?: string;
  image_url?: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface ISeedFriendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface ISeedGameLog {
  id: string;
  user_id: string;
  game_id: string;
  rating_for_game: number;
  notes?: string;
  tags?: string[];
  watched_date?: Date;
  watched_setting?: string;
  watched_location?: string;
  watched_scope?: string;
  classification: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface ISeedComment {
  id: string;
  user_id: string;
  parent_id: string;
  parent_type: string;
  content: string;
  depth: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface ISeedReaction {
  id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  emoji: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface ISeedPublicComment {
  id: string;
  user_id?: string | null;
  anonymous_name?: string | null;
  anonymous_email?: string | null;
  parent_id: string;
  parent_type: string;
  content: string;
  depth: number;
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface ISeedPublicReaction {
  id: string;
  user_id?: string | null;
  anonymous_name?: string | null;
  anonymous_email?: string | null;
  target_id: string;
  target_type: string;
  emoji: string;
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface ICacheHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  hitRate: number;
  missRate: number;
  errorRate: number;
  averageResponseTime: number;
  lastChecked: string;
}

export interface ICacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  averageResponseTime: number;
  memoryUsage: number | Record<string, unknown>;
  keyCount: number;
  evictions: number;
  timestamp: string;
  memoryHits?: number;
  redisHits?: number;
  databaseHits?: number;
  memoryMisses?: number;
  redisMisses?: number;
  databaseMisses?: number;
  redisUsage?: number;
  // Additional properties used by GameLogsPerformanceMonitor
  namespace?: string;
  cacheKeys?: Record<string, unknown>;
  totalKeys?: Record<string, unknown> | number;
  health?: {
    redis?: boolean;
    memory?: boolean;
    database?: boolean;
    status?: string;
  };
}

export interface IPerformanceMetrics {
  duration?: number;
  memory?: number;
  cpu?: number;
  timestamp?: string;
  loadTime?: number;
  domContentLoaded?: number;
  windowLoad?: number;
  renderTime?: number;
  memoryUsage?: number;
  avgCacheTime?: number;
  avgQueryTime?: number;
  uptime?: number;
  componentCount?: number;
  reRenderCount?: number;
  bundleSize?: {
    total: number;
    gzipped: number;
    js?: number;
    css?: number;
    images?: number;
  };
  totalQueries?: number;
  averageQueryTime?: number;
  slowQueries?: Array<{
    query: string;
    duration: number;
    timestamp: string | number;
  }>;
  errorRate?: number;
  recommendations?: string[];
  cacheHitRate?: number;
  // Additional performance metrics
  apiResponseTime?: number;
  dataSize?: number;
  queryComplexity?: number;
}

export interface IQueryMetrics {
  query: string;
  duration: number;
  rows: number;
  timestamp: string | number;
  success?: boolean;
  queryName: string;
  variables?: any;
  errorMessage?: string;
  executionTime: number;
  cacheHit: boolean;
  resultCount: number;
  errorCount: number;
}

export interface IPerformanceReport {
  metrics: IPerformanceMetrics[];
  summary: {
    averageDuration: number;
    totalQueries: number;
    slowestQuery: string;
  };
  totalQueries?: number;
  averageQueryTime?: number;
  slowQueries?: Array<{
    query: string;
    duration: number;
    timestamp: string | number;
  }>;
  errorRate?: number;
  recommendations?: string[];
}

// Environment Types
export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(),
  NODE_ENV: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_KEY: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_HOST: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_BASE_URL: z.string().url().optional(),
});

export interface IEnv {
  DATABASE_URL: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  NODE_ENV?: string;
  NEXT_PUBLIC_RAPID_API_KEY?: string;
  NEXT_PUBLIC_RAPID_API_HOST?: string;
  NEXT_PUBLIC_RAPID_API_BASE_URL?: string;
  [key: string]: string | undefined;
}

// Additional missing types
export interface IUserParent {
  id: string;
  name: string;
  email_address?: string;
  phone_number?: string;
}

export interface IUserArgs {
  id: string;
  limit?: number;
  after?: string;
}

export interface IAdminAuthContext {
  user: IUser | null;
  permissions: string[];
  loading: boolean;
  error: string | null;
}

export interface MockServerResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
  latency?: number;
  mock?: boolean;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string | Date;
  uptime: number;
  version?: string;
}

export interface StatsResponse {
  totalUsers: number;
  totalGameLogs: number;
  totalComments: number;
  totalReactions: number;
  uptime?: number;
  memory?: any;
  requests?: number;
  errors?: number;
}

// Error handling types (using the one defined above)
export interface IErrorContext {
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component?: string;
  requestId?: string;
  timestamp?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  stack?: string;
  message?: string;
  details?: Record<string, any>;
}

export interface ITrendingGameLog {
  id: string;
  type: string;
  title: string;
  description: string;
  score: number;
  url: string;
}

// ========================================
// DATABASE TYPES
// ========================================
export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface DatabaseQuery {
  sql: string;
  params?: any[];
  timeout?: number;
}

export interface DatabaseResult<T = any> {
  rows: T[];
  rowCount: number;
  fields: any[];
}

export interface DatabaseTransaction {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<DatabaseResult<T>>;
}

export interface DatabasePool {
  connect(): Promise<DatabaseConnection>;
  query<T = any>(sql: string, params?: any[]): Promise<DatabaseResult<T>>;
  end(): Promise<void>;
}

export interface DatabaseMigration {
  version: string;
  name: string;
  up: string;
  down: string;
  executedAt?: Date;
}

export interface DatabaseSchema {
  tables: DatabaseTable[];
  indexes: DatabaseIndex[];
  constraints: DatabaseConstraint[];
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  primaryKey?: string[];
  foreignKeys?: DatabaseForeignKey[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

export interface DatabaseIndex {
  name: string;
  table: string;
  columns: string[];
  unique: boolean;
}

export interface DatabaseConstraint {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  table: string;
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
}

export interface DatabaseForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

// Additional types for audit logging
export interface IAuditLogData {
  id?: string;
  action: string;
  userId?: string;
  timestamp?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  category?: string;
  severity?: string;
  description?: string;
  success?: boolean;
  sessionId?: string;
  resourceType?: string;
  resourceId?: string;
  tableName?: string;
  columnName?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  errorCode?: string;
  durationMs?: number;
  complianceTags?: string[];
}

export interface IKeyRotationLogData {
  id: string;
  keyId: string;
  rotationDate: string;
  oldKeyHash: string;
  newKeyHash: string;
  rotatedBy: string;
  success: boolean;
  errorMessage?: string;
  keyVersion?: string;
  environment?: string;
  rotationType?: string;
  previousKeyId?: string;
  newKeyId?: string;
  rotationReason?: string;
  affectedRecordsCount?: number;
  reEncryptionRequired?: boolean;
  reEncryptionCompleted?: boolean;
  rotationStartedAt?: Date;
  rotationCompletedAt?: Date;
  reEncryptionStartedAt?: Date;
  reEncryptionCompletedAt?: Date;
  status?: string;
  details?: Record<string, any>;
}

export interface IRLSAccessLogData {
  id: string;
  userId: string;
  tableName: string;
  operation: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  requestingUserId?: string;
  targetUserId?: string;
  rlsContextSet?: boolean;
  rlsPolicyApplied?: boolean;
  accessGranted?: boolean;
  rowsAffected?: number;
  sensitiveFieldsAccessed?: string[];
  requestId?: string;
  endpoint?: string;
  queryHash?: string;
  queryDurationMs?: number;
  details?: Record<string, any>;
  description?: string;
}

// ========================================
// MISSING COMPONENT PROP TYPES
// ========================================
export interface IBottomNavItem {
  id?: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
  action?: () => void;
  isAction?: boolean;
}

export interface IMobileMenuButtonProps {
  onToggle: () => void;
  className?: string;
}

export interface IMobileMenuSheetProps {
  isActive: (path: string) => boolean;
  className?: string;
}

export interface IHeaderRightSectionProps {
  className?: string;
  isMenuExpanded?: boolean;
}

export interface ILogoProps {
  isMenuExpanded: boolean;
}

// Auth Component Props
export interface IEnhancedAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  fallbackUrl?: string;
  showRetryButton?: boolean;
}

export interface ISignInModalTriggerProps {
  children: React.ReactNode;
  className?: string;
  autoTrigger?: boolean;
}

// Comment Component Props
export interface ICommentProps {
  comment: any;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
  showReplies?: boolean;
  maxDepth?: number;
}

export interface INestedCommentProps {
  comment: any;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
  depth?: number;
  maxDepth?: number;
}

export interface IEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'info' | 'warning';
  className?: string;
}

export interface ILoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'muted' | 'white';
  className?: string;
  ariaLabel?: string;
}

export interface IThemeToggleProps {
  className?: string;
}

export interface IDbRefreshJob {
  id: string;
  name?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  startTime?: Date;
  endTime?: Date;
}

export interface IClassificationIconProps {
  classification: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface IDeleteGameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameLog: any;
  onSuccess?: () => void;
}

export interface IGameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  gameLog?: any;
  preSelectedGame?: any;
  onSuccess?: (gameLog: any) => void;
}

export interface IGameLogsContentProps {
  gameLogs: any[];
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  tabValue?: string;
  logs?: any[];
  loadingMore?: boolean;
  totalCount?: number;
  showActions?: boolean;
  onEdit?: (gameLog: any) => void;
  onDelete?: (gameLog: any) => void;
  filteredAndSortedLogs?: any[];
}

export interface IGameLogsFiltersState {
  teamName: string;
  username: string;
  tags: string;
  watchedDateFrom: string;
  watchedDateTo: string;
  gameDateFrom: string;
  gameDateTo: string;
  rating: string;
  watchedSetting: string;
  watchedScope: string;
}

export interface IGameLogsFiltersProps {
  searchTerm?: string;
  searchField?: string;
  sortConfig?: any;
  displayedCount?: number;
  totalCount?: number;
  classification?: any;
  onSearchChange?: (term: string, field: string) => void;
  onSearchClear?: () => void;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;
  filters?: any;
  onFiltersChange?: (filters: any) => void;
  initialFilters?: Partial<IGameLogsFiltersState>;
  className?: string;
}

export interface IGameLogsHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  onCreateClick?: () => void;
  className?: string;
}

export interface ICommentFormProps {
  onSubmit?: (content: string) => void;
  onSuccess?: (comment: any) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  initialContent?: string;
  loading?: boolean;
  className?: string;
  // Additional properties used by components
  parentId?: string;
  parentType?: string;
  autoFocus?: boolean;
  commentId?: string;
}

export interface ICommentListProps {
  comments: any[];
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  loading?: boolean;
  showLoadMore?: boolean;
}

export interface ICommentRepliesProps {
  replies?: any[];
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
  commentId?: string;
  maxDepth?: number;
}

export interface IGameLogCommentsProps {
  gameLogId?: string;
  gameLog?: IGameLog;
  comments?: any[];
  showComments?: boolean;
  onAddComment?: (content: string) => void;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

// Admin Component Props
export interface IDbRefreshButtonSimpleProps {
  onRefresh: () => void;
  onProgressChange?: (progress: IDbRefreshProgress) => void;
  loading?: boolean;
  className?: string;
}

export interface IDbRefreshProgressTrackerProps {
  progress: IDbRefreshProgress;
  isVisible?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
  onTerminate?: () => void;
  isTerminating?: boolean;
  className?: string;
}

// Clerk Webhook Types
export interface IClerkUserData {
  id: string;
  object: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  phone_numbers: Array<{
    phone_number: string;
    id: string;
  }>;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string;
  profile_image_url?: string;
  has_image?: boolean;
  primary_email_address_id?: string;
  primary_phone_number_id?: string;
  external_id?: string;
  last_active_at?: number;
  last_sign_in_at?: number;
  created_at: number;
  updated_at: number;
}

export interface IClerkDeletedUserData {
  id: string;
  deleted: boolean;
  deleted_at: number;
}

// Experimental Component Props
export interface IGamesSectionProps {
  gamesSubTab?: string;
  setGamesSubTab?: (tab: string) => void;
  gameParams?: any;
  setGameParams?: (params: any) => void;
  gameStatsId?: string;
  setGameStatsId?: (id: string) => void;
  handleFetchGames?: () => void;
  handleFetchGameStats?: () => void;
  handleFetch?: () => void;
  seasons?: any[];
  teams?: any[];
  loading?: boolean;
}

export interface ITeamsSectionProps {
  teamsSubTab?: string;
  setTeamsSubTab?: (tab: string) => void;
  teamParams?: any;
  setTeamParams?: (params: any) => void;
  teamStatsParams?: any;
  setTeamStatsParams?: (params: any) => void;
  handleFetchTeams?: () => void;
  handleFetchTeamStats?: () => void;
  handleFetch?: () => void;
  seasons?: any[];
  loading?: boolean;
}

// ========================================
// GLOBAL TYPE EXTENSIONS
// ========================================

// Extend Window interface for Playwright testing
declare global {
  interface Window {
    __PLAYWRIGHT_TEST__?: boolean;
  }
}

// ========================================
// ANALYTICS TYPES
// ========================================
export type AnalyticsEvent =
  | 'page_view'
  | 'game_log_created'
  | 'game_log_updated'
  | 'game_log_deleted'
  | 'game_log_viewed'
  | 'search_performed'
  | 'user_signed_up'
  | 'user_signed_in'
  | 'live_game_viewed'
  | 'sport_page_viewed'
  | 'comment_added'
  | 'reaction_added'
  | 'friend_added'
  | 'profile_updated'
  | 'settings_changed'
  | 'error_occurred'
  | 'performance_metric'
  | 'feature_used'
  | 'scroll_depth'
  | 'time_on_page'
  | 'click';

// ========================================
// RATE LIMITING TYPES
// ========================================

export type RateLimitConfig = {
  tokensPerInterval: number;
  intervalMs: number;
};

// ========================================
// COVERAGE TYPES
// ========================================
export interface ICoverageThresholds {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  base?: number;
}

export interface IFileThresholds {
  global: ICoverageThresholds;
  local: ICoverageThresholds;
  [key: string]: ICoverageThresholds;
}

export interface ICoverageConfig {
  thresholds: IFileThresholds;
  exclude: string[];
  include: string[];
  reporter: string[];
  reportsDirectory: string;
  global?: ICoverageThresholds;
  files?: IFileThresholds;
}

export interface IE2ECoverageTarget {
  name: string;
  path: string;
  threshold: number;
  category?: string;
  target?: number;
  testFiles?: string[];
  description?: string;
}

export interface IE2ETestCategory {
  name: string;
  description: string;
  targets: IE2ECoverageTarget[];
  priority?: string;
  userJourneys?: string[];
  testFiles?: string[];
}

export interface IE2ECoverageConfig {
  categories: IE2ETestCategory[];
  globalThreshold: number;
  reportPath: string;
  targets?: IE2ECoverageTarget[];
  thresholds?: Record<string, unknown>;
}

// Tab Types
export type TabKey = 'my-logs' | 'public-logs' | 'friends-logs';
export type TabValue = 'My Logs' | 'Public Logs' | 'Friends Logs';
export type AdminTabValue =
  | 'seasons'
  | 'leagues'
  | 'games'
  | 'teams'
  | 'players'
  | 'standings'
  | 'search'
  | 'database'
  | 'cache';

export const ADMIN_TABS = {
  SEASONS: 'seasons' as const,
  LEAGUES: 'leagues' as const,
  GAMES: 'games' as const,
  TEAMS: 'teams' as const,
  PLAYERS: 'players' as const,
  STANDINGS: 'standings' as const,
  SEARCH: 'search' as const,
  DATABASE: 'database' as const,
  CACHE: 'cache' as const,
} as const;

// Admin Experimental Component Props
export interface AdminGamesSectionProps {
  gamesSubTab?: string;
  setGamesSubTab?: (tab: string) => void;
  gameParams?: Record<string, string>;
  setGameParams?: (params: Record<string, string>) => void;
  gameStatsId?: string;
  setGameStatsId?: (id: string) => void;
  loading?: boolean;
  handleFetchGames?: () => Promise<void>;
  handleFetchGameStats?: () => Promise<void>;
  handleFetch?: (endpoint: string, params: Record<string, string>) => Promise<void>;
  seasons?: Array<{ value: string; label: string }>;
  teams?: Array<{ value: string; label: string }>;
}

export interface AdminTeamsSectionProps {
  teamsSubTab?: string;
  setTeamsSubTab?: (tab: string) => void;
  teamParams?: Record<string, string>;
  setTeamParams?: (params: Record<string, string>) => void;
  teamStatsParams?: Record<string, string>;
  setTeamStatsParams?: (params: Record<string, string>) => void;
  loading?: boolean;
  handleFetchTeams?: () => Promise<void>;
  handleFetchTeamStats?: () => Promise<void>;
  seasons?: Array<{ value: string; label: string }>;
  teams?: Array<{ value: string; label: string }>;
}

export interface AdminPlayersSectionProps {
  playersSubTab?: string;
  setPlayersSubTab?: (tab: string) => void;
  playerParams?: Record<string, string>;
  setPlayerParams?: (params: Record<string, string>) => void;
  playerStatsParams?: Record<string, string>;
  setPlayerStatsParams?: (params: Record<string, string>) => void;
  loading?: boolean;
  handleFetchPlayers?: () => Promise<void>;
  handleFetchPlayerStats?: () => Promise<void>;
  seasons?: Array<{ value: string; label: string }>;
  teams?: Array<{ value: string; label: string }>;
}

// Filter Types
export interface IFilterState {
  searchTerm: string;
  statusFilter: string;
  seasonFilter: string;
  dateRange: string;
  customStartDate?: string;
  customEndDate?: string;
  teamFilter?: string;
  conferenceFilter?: string;
  divisionFilter?: string;
  arenaFilter: string;
  sortBy: string;
  sortDirection: string;
}

export interface IFilterOptions {
  arenas: Array<{ value: string; label: string }>;
  status: Array<{ value: string; label: string }>;
  season: Array<{ value: string; label: string }>;
  teams: Array<{ value: string; label: string }>;
  team?: Array<{ value: string; label: string }>;
  conference?: Array<{ value: string; label: string }>;
  division?: Array<{ value: string; label: string }>;
}

// Session Types
export interface ISessionData {
  userId: string;
  sessionId: string;
  expiresAt: Date;
  data: Record<string, unknown>;
  lastActivity?: number;
  permissions?: string[];
  deviceInfo?: Record<string, unknown>;
}

// Cache Types
export interface ICacheOptions {
  ttl?: number;
  prefix?: string;
  namespace?: string;
  tags?: string[];
  strategy?: 'memory' | 'redis' | 'database' | 'hybrid';
  priority?: 'low' | 'medium' | 'high';
}

// Cache entry interface
export interface ICacheEntry<T = unknown> {
  key: string;
  value: T;
  data: T;
  ttl: number;
  createdAt: Date;
  accessedAt: Date;
  lastAccessed?: number;
  timestamp: number;
  hitCount: number;
  accessCount?: number;
  size?: number;
}

// Cache invalidation options
export interface ICacheInvalidationOptions {
  pattern?: string;
  tags?: string[];
  namespace?: string;
  force?: boolean;
  all?: boolean;
}

// Hook Return Types
export interface IUseLandingPageDataReturn {
  data: ILandingPageData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<any>;
}

export interface ILatestGamesOptions {
  limit?: number;
  includeLive?: boolean;
  forceRealData?: boolean;
  forceRefresh?: boolean;
  seasons?: string[];
  skip?: boolean;
}

export interface IUseLiveGamesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialData?: IGamesApiResponse;
}

export interface IUseLiveGamesReturn {
  games: IGameResponse[];
  liveGames: IGameResponse[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<any>;
  hasLiveGames?: boolean;
  currentPollingInterval?: number;
  timeSinceLastLiveGames?: string | null;
}

export interface INBAHubCounts {
  totalGames: number;
  totalTeams: number;
  totalPlayers: number;
  liveGames: number;
}

export interface IUseNBAHubCountsReturn {
  counts: INBAHubCounts;
  loading: boolean;
  error: string | null;
  refresh?: () => Promise<void>;
  lastUpdated?: Date;
  source?: string;
}

export interface IUseNBAPlayersOptions {
  skip?: boolean;
  forceRealData?: boolean;
  teamId?: string;
  season?: string;
}

export interface IUseNBATeamsOptions {
  skip?: boolean;
  forceRealData?: boolean;
  forceRefresh?: boolean;
  season?: string;
}

export interface IMutationOptions<TData = unknown, TVariables = Record<string, unknown>> {
  enableOptimisticUpdates?: boolean;
  refetchQueries?: import('@apollo/client').InternalRefetchQueriesInclude;
  awaitRefetchQueries?: boolean;
  context?: Record<string, unknown>;
  onSuccess?: (data: TData, variables?: TVariables) => void;
  onError?: (
    error: Error | import('@apollo/client').ApolloError | unknown,
    variables?: TVariables
  ) => void;
  onCompleted?: (data: TData) => void;
}

export interface IPlayerFilterOptions {
  positions: string[];
  colleges: string[];
  countries: string[];
}

export interface IReactionOptions {
  targetId?: string;
  targetType?: ParentType;
  skip?: boolean;
}

export interface IUseResponsivePaginationOptions {
  totalItems: number;
  minItemsPerPage?: number;
  maxItemsPerPage?: number;
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
}

export interface IUseScrollAnimationProps {
  speed?: number;
  pauseOnHover?: boolean;
  autoStart?: boolean;
  mobileSpeed?: number;
}

export interface ITeamFilterState {
  searchTerm: string;
  conferenceFilter: string;
  divisionFilter: string;
  franchiseFilter: string;
  sortBy: string;
  sortDirection: string;
}

export interface ITeamFilterOptions {
  conferences: string[];
  divisions: string[];
  franchises: string[];
}

// Game Logs Types
export interface IGameLogsPaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  loadMoreText?: string;
  loading?: boolean;
}

export interface IFriendsGameLogsResponse {
  friendsGameLogs: {
    edges: Array<{
      node: IGameLog;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage?: boolean;
      endCursor?: string | null;
      startCursor?: string | null;
    };
    totalCount: number;
  };
}

export interface IGameLogsResponse {
  gameLogs: {
    edges: Array<{
      node: IGameLog;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage?: boolean;
      endCursor?: string | null;
      startCursor?: string | null;
    };
    totalCount: number;
  };
}

// Performance Dashboard Types
export interface IPerformanceDashboardProps {
  className?: string;
  showMetrics?: boolean;
  showDetails?: boolean;
}

export interface IGameLogsPerformanceMetrics {
  totalQueries?: number;
  uptime?: number;
  cacheHitRate?: number;
  avgCacheTime?: number;
  avgQueryTime?: number;
  cacheTime?: number;
  queryTime?: number;
  totalTime?: number;
  duration?: number;
  memory?: number;
  cpu?: number;
  timestamp?: string;
}

// API Types
export type ApiLimitType = 'games' | 'players' | 'teams' | 'gameLogs' | 'comments' | 'reactions';
export type RequestTimeoutType = 'short' | 'medium' | 'long';
export type SeasonType = 'regular' | 'playoffs' | 'preseason';

// ========================================
// COLOR TYPES
// ========================================
export type SportKey = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer';
export type SportsConfigKey = keyof typeof import('@/lib/constants/colors').SPORTS_CONFIG;
export type StatusType = 'success' | 'warning' | 'error' | 'info';
export type BrandColor = 'primary' | 'secondary' | 'accent';
export type ThemeColor = 'light' | 'dark';
export type CssColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'gray';

// ========================================
// BUTTON VARIANT TYPES
// ========================================
export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'primary'
  | 'primaryInline';

// ========================================
// UI COMPONENT TYPES
// ========================================

// ========================================
// DATABASE TYPES
// ========================================

// Database type for drizzle operations
export type Database = NeonHttpDatabase<typeof schema>;

// Seeding configuration types
export interface ISeedingConfig {
  users?: number;
  userCount?: number;
  gameLogs?: number;
  gameLogsPerUser?: { min: number; max: number };
  commentsPerGameLog?: { min: number; max: number };
  reactionsPerGameLog?: { min: number; max: number };
  reactionsPerComment?: { min: number; max: number };
  friendshipsPerUser?: { min: number; max: number };
  comments?: number;
  reactions?: number;
  friendships?: number;
  publicComments?: number;
  publicReactions?: number;
  notifications?: number;
  childCommentChance?: number;
}

export interface IStatisticalSeedingConfig {
  // Pattern control flags
  enableRealisticPatterns?: boolean;
  enableViralContent?: boolean;
  enablePowerUsers?: boolean;
  enableTimeDecay?: boolean;

  // Distribution configurations
  userEngagement?: IDistributionConfig;
  userActivityFrequency?: IDistributionConfig;
  userFriendCount?: IDistributionConfig;
  userContentQuality?: IDistributionConfig;
  userActivityAge?: IDistributionConfig;
  gameRating?: IDistributionConfig;
  commentCount?: IDistributionConfig;
  reactionCount?: IDistributionConfig;
  activityAge?: IDistributionConfig;
  responseTime?: IDistributionConfig;
  sessionDuration?: IDistributionConfig;
  gameLogsPerUser?: IDistributionConfig;

  // Probability settings
  userFriendshipProbability?: number;
  userGameLogProbability?: number;
  gameLogGameProbability?: number;
  gameLogReactionProbability?: number;
  commentReactionProbability?: number;
  contentViralProbability?: IDistributionConfig;
  gameLogClassification?: IDistributionConfig;
  gameLogTags?: IDistributionConfig;
  friendshipStatus?: IDistributionConfig;
  notificationFrequency?: IDistributionConfig;

  distributions?: {
    ratings?: number[];
    gameLogLengths?: number[];
    commentLengths?: number[];
  };
  weights?: {
    popularGames?: number;
    activeUsers?: number;
  };
}

// Additional seeding types
export interface IDistributionConfig {
  name?: string;
  type:
    | 'normal'
    | 'pareto'
    | 'exponential'
    | 'uniform'
    | 'power-law'
    | 'poisson'
    | 'beta'
    | 'custom';
  parameters: Record<string, number>;
  customFunction?: (config: IDistributionConfig) => number;
}

export type DistributionConfigPreset =
  | 'high_engagement'
  | 'balanced'
  | 'organic_growth'
  | 'viral_content';

// External API seeding configuration
export interface IExternalApiSeedingConfig {
  enableApiCalls: boolean;
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  rateLimitDelay: number;
  specificSeasons?: number[];
  startSeason?: number;
  endSeason?: number;
}

// Database refresh progress callback
export interface IDbRefreshProgressCallback {
  (progress: IDbRefreshProgress): void;
}

// Scenario key type for seeding
export type ScenarioKey = 'SMALL' | 'MEDIUM' | 'LARGE' | 'CUSTOM';

// Missing app config types
export interface IRangeConfig {
  min: number;
  max: number;
  getRandom?: () => number;
}

export interface IBatchSizeConfig {
  default: number;
  min: number;
  max: number;
  GAMES?: number;
  [key: string]: number | undefined;
}

export interface IClassificationWeights {
  [key: string]: number;
}

export interface IPaginationConstants {
  defaultLimit: number;
  maxLimit: number;
  minLimit: number;
  DEFAULT_PAGE_SIZE?: number;
  DEFAULT_SORT_DIRECTION?: string;
  [key: string]: number | string | undefined;
}

export interface IDistributionFunctions {
  [key: string]: (params: Record<string, number>) => number;
}

// ========================================
// CONSOLIDATED TYPES FROM SEPARATE FILES
// ========================================

/**
 * API Response Types - Consolidated from api-responses.ts
 */

// Comment Response Types
export interface ICreateCommentResponse {
  createComment?: {
    comment?: Record<string, unknown>;
    errors?: Array<{ message: string; code?: string; field?: string }>;
  };
}

export interface IUpdateCommentResponse {
  updateComment?: {
    comment?: Record<string, unknown>;
    errors?: Array<{ message: string; code?: string; field?: string }>;
  };
}

export interface IDeleteCommentResponse {
  deleteComment?: {
    success?: boolean;
    errors?: Array<{ message: string; code?: string; field?: string }>;
  };
}

// Friendship Response Types
export interface IUserFriendshipsResponse {
  userFriendships?: {
    edges: Array<{ node: IFriendship; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

export interface IFriendshipStatusResponse {
  friendshipStatus?: {
    status: string;
    friendshipId: string | null;
    isInitiator: boolean | null;
  };
}

export interface IFriendshipRequestsResponse {
  friendshipRequests?: {
    edges: Array<{ node: IFriendship; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

export interface ISearchUsersResponse {
  searchUsers?: {
    edges: Array<{ node: UserSummary; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

export interface IFriendshipMutationResponse {
  friendship?: IFriendship;
  errors?: Array<{ message: string; code?: string; field?: string }>;
}

export interface IRemoveFriendResponse {
  success?: boolean;
  errors?: Array<{ message: string; code?: string; field?: string }>;
}

/**
 * Game-related Types - Consolidated from game-types.ts
 */

// Database Game Types (from games API route)
export interface IDatabaseGame {
  id: string;
  season: string | null;
  date: Date;
  status: unknown;
  stage: number | null;
  teams: unknown;
  periods: unknown;
  arena: unknown;
  scores: unknown;
  officials: string[] | null;
  times_tied: number | null;
  lead_changes: number | null;
  nugget: string | null;
}

export interface IDatabaseTeam {
  id: string;
  name: string;
  nickname: string | null;
  code: string | null;
  logo: string | null;
}

// JSONB Data Structure Types
export interface ITeamData {
  id: string | number;
  name?: string;
  nickname?: string;
  code?: string;
  logo?: string;
}

export interface IStatusData {
  clock?: string;
  halftime?: boolean;
  short?: string;
  long?: string;
  periods?: {
    current?: number;
    total?: number;
    endOfPeriod?: boolean;
  };
}

export interface IArenaData {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
}

// Game Teams and Scores Data (from landing page service)
export interface IGameTeamsDataService {
  home?: IBaseTeam;
  visitors?: IBaseTeam;
}

export interface IGameScoresData {
  home?: { points: number };
  visitors?: { points: number };
}

// Game Log with Relations (from game-logs API route)
export interface IGameLogWithRelations {
  id: string;
  user_id: string;
  game_id: string;
  classification: string;
  watched_setting: string;
  watched_scope: string;
  watched_date: Date;
  watched_location: string | null;
  rating_for_game: number;
  notes: string | null;
  tags: string[] | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  user?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url: string | null;
  };
  game?: {
    id: string;
    date: string;
    status?: {
      long?: string;
      short?: string;
    };
    teams?: {
      home: {
        name: string;
        nickname?: string;
        code?: string;
        logo?: string;
      };
      visitors: {
        name: string;
        nickname?: string;
        code?: string;
        logo?: string;
      };
    };
    arena?: {
      name?: string;
      city?: string;
    };
    scores?: unknown;
  };
}

/**
 * GraphQL Resolver Types - Consolidated from graphql-resolver-types.ts
 */

// Team Data Types (from game-log-clean.ts resolver)
export interface ITeamDataResolver {
  id?: string;
  name?: string;
  nickname?: string;
  code?: string;
  city?: string;
  conference?: string;
  division?: string;
  logo_url?: string;
}

export interface ITeamsData {
  home?: ITeamDataResolver;
  away?: ITeamDataResolver;
}

// Game Teams Data (from basketball-game.ts resolver)
export interface IGameTeamsDataResolver {
  home?: IBaseTeam;
  away?: IBaseTeam;
}

/**
 * Mock Server Types - Consolidated from mock-types.ts
 */

// Mock Server Configuration
export interface IMockServerConfig {
  port: number; // Server port (default: 3001)
  latency: {
    min: number; // Minimum latency in ms (default: 50)
    max: number; // Maximum latency in ms (default: 300)
  };
  errorRate: number; // Error rate as decimal (default: 0.05)
  enableLogging: boolean; // Enable debug logging (default: true)
}

// Mock Data Types
export interface IMockUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt: string;
  isVerified: boolean;
  stats: {
    totalGames: number;
    totalGameLogs: number;
    averageRating: number;
    favoriteTeam?: string;
  };
}

export interface IMockGameLog {
  id: string;
  userId: string;
  gameId: string;
  rating: number;
  notes?: string;
  tags: string[];
  watchedDate: string;
  watchedSetting: string;
  watchedLocation?: string;
  classification: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMockNBAGame {
  id: string;
  date: string;
  status: string;
  homeTeam: {
    id: string;
    name: string;
    nickname: string;
    code: string;
    logo?: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    nickname: string;
    code: string;
    logo?: string;
    score?: number;
  };
  arena: {
    name: string;
    city: string;
    state: string;
  };
  season: string;
  stage: number;
}

/**
 * Utility Types - Consolidated from utility-types.ts
 */

// Extended Window interface for mock mode and testing
export interface IExtendedWindow extends Window {
  __MOCK_MODE__?: boolean;
  __API_MOCK_MODE__?: boolean;
  __E2E_MOCK_MODE__?: boolean;
  __PLAYWRIGHT_TEST__?: boolean;
}

// Failure Cache Types
export type FailureRecord = { lastFailedAt: number; error?: string };

// Pagination State Types
export interface IPaginationState<T> {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  currentItems: T[];
}

// ========================================
// END OF APPLICATION-SPECIFIC TYPES
// ========================================

// ========================================
// COMPONENT TYPES (from component.types.ts)
// ========================================

import { ReactNode } from 'react';

// Base component types
export interface IBaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface IBaseSearchResultProps {
  children: ReactNode;
  onClick: () => void;
  gradient?: string;
  badgeColor?: string;
  badgeText?: string;
  badgeIcon?: ReactNode;
}

export interface IBaseFormComponentProps extends IBaseComponentProps {
  name?: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// Modal component types
export interface IModalProps extends IBaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean;
}

export interface IModalHeaderProps extends IBaseComponentProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  closable?: boolean;
}

export interface IModalBodyProps extends IBaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface IModalFooterProps extends IBaseComponentProps {
  align?: 'left' | 'center' | 'right';
  gap?: 'sm' | 'md' | 'lg';
}

// Button component types
export interface IButtonProps extends IBaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'default';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  href?: string;
  target?: string;
}

// Input component types
export interface IInputProps extends IBaseFormComponentProps {
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'textarea'
    | 'checkbox'
    | 'radio';
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
}

export interface ITextareaProps extends IBaseFormComponentProps {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  maxLength?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export interface ISelectProps extends IBaseFormComponentProps {
  options: ISelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

export interface ICustomSelectProps {
  options: ISelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export interface ISelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
}

// Card component types
export interface ICardProps extends IBaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export interface ICardHeaderProps extends IBaseComponentProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export interface ICardBodyProps extends IBaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface ICardFooterProps extends IBaseComponentProps {
  align?: 'left' | 'center' | 'right';
  gap?: 'sm' | 'md' | 'lg';
}

// Table component types
export interface ITableProps extends IBaseComponentProps {
  data: any[];
  columns: ITableColumn[];
  loading?: boolean;
  empty?: ReactNode;
  pagination?: ITablePagination;
  sortable?: boolean;
  selectable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onSelect?: (selectedRows: any[]) => void;
}

export interface ITableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: any, index: number) => ReactNode;
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface ITablePagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  onChange?: (page: number, pageSize: number) => void;
}

// Loading component types
export interface ILoadingProps extends IBaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  overlay?: boolean;
}

// Alert component types
export interface IAlertProps extends IBaseComponentProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message?: string;
  closable?: boolean;
  onClose?: () => void;
  action?: ReactNode;
}

// Tooltip component types
export interface ITooltipProps extends IBaseComponentProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  disabled?: boolean;
}

// Dropdown component types
export interface IDropdownProps extends IBaseComponentProps {
  trigger: ReactNode;
  menu: IDropdownMenuItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  triggerType?: 'hover' | 'click' | 'contextMenu';
  disabled?: boolean;
}

export interface IDropdownMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
  children?: IDropdownMenuItem[];
}

// Game Log Modal types
export interface IBaseGameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (gameLog: unknown) => void;
}

export interface ICreateGameLogModalProps extends IBaseGameLogModalProps {
  mode?: 'create';
  preSelectedGame?: unknown;
  gameLog?: never;
}

export interface IEditGameLogModalProps extends IBaseGameLogModalProps {
  mode?: 'edit';
  gameLog: unknown;
  preSelectedGame?: never;
}

export type UnifiedGameLogModalProps = ICreateGameLogModalProps | IEditGameLogModalProps;

// Skeleton component types
export interface ISkeletonProps {
  className?: string;
  children?: ReactNode;
}

export interface ISkeletonLoaderProps {
  count?: number;
  className?: string;
  variant?: 'card' | 'list' | 'table';
}

// Filter component types
export interface IFilterOption {
  value: string;
  label: string;
  icon: ReactNode;
}

export interface IQuickFiltersProps {
  title: string;
  icon: ReactNode;
  totalCount: number;
  filters: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: IFilterOption[];
    className?: string;
  }>;
}

// NBA Page Layout types
export interface INBAPageLayoutProps<T> {
  title: string;
  description: string;
  items: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  } | null;
  cacheInfo: {
    cached?: boolean;
    source?: string;
    hit?: boolean;
    key?: string;
    ttl?: number;
    status?: string;
  } | null;
  pageSize: number;
  onPageSizeChange: (newPageSize: string) => void;
  onForceRefresh: () => void;
  forceRefresh: boolean;
  onPageChange: (page: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  renderEmptyState?: () => ReactNode;
  gridClassName?: string;
  showPagination?: boolean;
  cacheTitle: string;
  cacheTTL: string;
  pageSizeOptions: Array<{
    value: string;
    label: string;
    icon: ReactNode;
  }>;
  filtersTitle: string;
  filtersIcon: ReactNode;
  filters: Array<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{
      value: string;
      label: string;
      icon: ReactNode;
    }>;
    className?: string;
  }>;
  onBackClick?: () => void;
  // Navigation props
  showGamesButton?: boolean;
  showPlayersButton?: boolean;
  showTeamsButton?: boolean;
  backButtonText?: string;
  showBackButton?: boolean;
  className?: string;
}

// Cache Status Dashboard types
export interface ICacheStatusDashboardProps {
  title: string;
  cacheInfo: {
    cached?: boolean;
    source?: string;
    hit?: boolean;
    key?: string;
    ttl?: number;
    status?: string;
  } | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  } | null;
  pageSize: number;
  onPageSizeChange: (newPageSize: string) => void;
  onForceRefresh: () => void;
  forceRefresh: boolean;
  pageSizeOptions: Array<{
    value: string;
    label: string;
    icon: ReactNode;
  }>;
  cacheTTL: string;
}

// Game Logs Filters types - already defined above

// ========================================
// CORE TYPES (from core.types.ts)
// ========================================

// Re-export types from constants to maintain the same interface
// These types are defined in src/lib/constants/index.ts to avoid circular dependencies
export type {
  IReactionEmojiKey,
  IReactionEmojiValue,
  IGraphQLReactionEmojiType,
  IFriendshipStatusType,
  IWatchedSettingType,
} from '@/lib/constants';

// Game status information
export interface IGameStatusInfo {
  status: string;
  isFinished: boolean;
  isLive: boolean;
  isScheduled: boolean;
}

// ========================================
// DATABASE TYPES (from db.types.ts)
// ========================================

// Database connection types
export interface IDatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  ssl?: boolean;
  poolSize?: number;
  timeout?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  pool?: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
}

// Query types
export interface IQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: Record<string, any>;
  select?: string[];
  include?: string[];
}

export interface IQueryResult<T = any> {
  data: T[];
  count: number;
  total: number;
  page: number;
  limit: number;
}

// Migration types
export interface IMigration {
  version: string;
  name: string;
  up: string;
  down: string;
  timestamp: number;
}

export interface IMigrationStatus {
  version: string;
  applied: boolean;
  appliedAt?: Date;
  checksum?: string;
}

// Seed data types
export interface ISeedData {
  table: string;
  data: any[];
  dependencies?: string[];
  order?: number;
}

export interface ISeedConfig {
  tables: ISeedData[];
  truncate?: boolean;
  resetSequences?: boolean;
}

// Transaction types
export interface ITransaction {
  id: string;
  startTime: Date;
  queries: string[];
  rollback?: () => Promise<void>;
}

export interface ITransactionOptions {
  isolation?: 'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable';
  timeout?: number;
  retries?: number;
}

// Index types
export interface IIndexDefinition {
  name: string;
  table: string;
  columns: string[];
  unique?: boolean;
  partial?: string;
  concurrent?: boolean;
}

// Constraint types
export interface IConstraintDefinition {
  name: string;
  table: string;
  type: 'primary-key' | 'foreign-key' | 'unique' | 'check' | 'not-null';
  columns: string[];
  references?: {
    table: string;
    columns: string[];
  };
  onDelete?: 'cascade' | 'restrict' | 'set-null' | 'no-action';
  onUpdate?: 'cascade' | 'restrict' | 'set-null' | 'no-action';
}

// Database utility types
export interface IDatabaseStats {
  connections: number;
  activeQueries: number;
  slowQueries: number;
  cacheHitRatio: number;
  uptime: number;
}

export interface IQueryPerformance {
  query: string;
  duration: number;
  rows: number;
  timestamp: Date;
  slow?: boolean;
}

// Service-specific types
export interface IGameLogsServiceOptions {
  page?: number;
  limit?: number;
  search?: string;
  classification?: string;
  userId?: string;
  sortBy?: any;
  sortDirection?: any;
  teamName?: string;
  username?: string;
  tags?: string;
  watchedDateFrom?: string;
  watchedDateTo?: string;
  gameDateFrom?: string;
  gameDateTo?: string;
  rating?: string;
  watchedSetting?: string;
  watchedScope?: string;
}

export interface IGameLogsServiceResult {
  gameLogs: any[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ========================================
// HOOK TYPES (from hooks.types.ts)
// ========================================

// Pagination hook interfaces
export interface IPaginatedTeamsOptions {
  search?: string;
  conference?: string;
  division?: string;
  sortBy?: 'name' | 'city' | 'conference';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  skip?: boolean;
  forceRefresh?: boolean;
}

export interface IPaginatedTeamsReturn {
  teams: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  } | null;
  cacheInfo: {
    cached: boolean;
    timestamp: number;
    ttl: number;
  } | null;
  refetch: () => Promise<any>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: 'name' | 'city' | 'conference') => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setConference: (conference: string) => void;
  setDivision: (division: string) => void;
}

export interface IPaginatedPlayersOptions {
  search?: string;
  position?: string;
  year?: string;
  college?: string;
  country?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  skip?: boolean;
  forceRefresh?: boolean;
}

export interface IPaginatedPlayersResponse {
  success: boolean;
  get: string;
  parameters: Record<string, unknown>;
  errors: string[];
  results: number;
  response: any[];
  timestamp: string;
  requestId: string;
  players: any[];
  total: number;
  page: number;
  limit: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
  cacheInfo?: {
    hit: boolean;
    ttl?: number;
    key?: string;
  };
}

export interface IPaginatedPlayersReturn {
  players: any[];
  loading: boolean;
  error: string | null;
  pagination: IPaginatedPlayersResponse['pagination'] | null;
  cacheInfo: IPaginatedPlayersResponse['cacheInfo'] | null;
  refetch: () => Promise<any>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setPosition: (position: string) => void;
  setYear: (year: string) => void;
  setCollege: (college: string) => void;
  setCountry: (country: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setLimit: (limit: number) => void;
}

export interface IPaginatedGamesOptions {
  season?: string;
  status?: 'all' | 'finished' | 'live' | 'scheduled' | 'cancelled';
  page?: number;
  limit?: number;
  skip?: boolean;
  forceRefresh?: boolean;
}

export interface IPaginatedGamesResponse {
  success: boolean;
  response: any[];
  data: any[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    season: string;
    status: string;
  };
  cacheInfo: {
    hit: boolean;
    key: string;
    ttl: number;
    status: string;
  };
}

export interface IPaginatedGamesReturn {
  games: any[];
  loading: boolean;
  error: string | null;
  pagination: IPaginatedGamesResponse['pagination'] | null;
  cacheInfo: IPaginatedGamesResponse['cacheInfo'] | null;
  refetch: () => Promise<any>;
  setPage: (page: number) => void;
  setStatus: (status: 'all' | 'finished' | 'live' | 'scheduled' | 'cancelled') => void;
  setSeason: (season: string) => void;
  setLimit: (limit: number) => void;
}

export interface IPaginatedGameLogsOptions {
  userId?: string;
  tab: 'my-logs' | 'friends-logs' | 'public-logs';
  page?: number;
  limit?: number;
}

export interface IPaginatedGameLogsReturn {
  gameLogs: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  } | null;
  cacheInfo: {
    cached?: boolean;
    source?: string;
    hit?: boolean;
    key?: string;
    ttl?: number;
    status?: string;
  } | null;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTab: (tab: 'my-logs' | 'friends-logs' | 'public-logs') => void;
  refetch: () => void;
}

// REST API Game Logs interfaces
export interface IPaginatedGameLogsRestOptions {
  userId?: string;
  tab: 'my-logs' | 'friends-logs' | 'public-logs';
  page?: number;
  limit?: number;
  search?: string;
  classification?: string;
  sortBy?: any;
  sortDirection?: any;
  forceRefresh?: boolean;
  teamName?: string;
  username?: string;
  tags?: string;
  watchedDateFrom?: string;
  watchedDateTo?: string;
  gameDateFrom?: string;
  gameDateTo?: string;
  rating?: string;
  watchedSetting?: string;
  watchedScope?: string;
}

export interface IPaginatedGameLogsRestReturn {
  gameLogs: any[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  cacheInfo: {
    cached?: boolean;
    source?: string;
    hit?: boolean;
    key?: string;
    ttl?: number;
    status?: string;
  } | null;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTab: (tab: 'my-logs' | 'friends-logs' | 'public-logs') => void;
  setSearch: (search: string) => void;
  setClassification: (classification: string) => void;
  setSortBy: (sortBy: any) => void;
  setSortDirection: (sortDirection: any) => void;
  refetch: () => void;
}

// Optimized Paginated Players interfaces
export interface IOptimizedPaginatedPlayersOptions {
  search?: string;
  position?: string;
  year?: string;
  college?: string;
  country?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  skip?: boolean;
  forceRefresh?: boolean;
  useOptimizedAPI?: boolean;
}

export interface IOptimizedPaginatedPlayersResponse {
  success: boolean;
  get: string;
  parameters: Record<string, unknown>;
  errors: string[];
  results: number;
  response: any[];
  timestamp: string;
  requestId: string;
  players: any[];
  total: number;
  page: number;
  limit: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  cacheInfo?: {
    hit: boolean;
    ttl?: number;
    key?: string;
  };
}

export interface IOptimizedPaginatedPlayersReturn {
  players: any[];
  loading: boolean;
  error: string | null;
  pagination: IOptimizedPaginatedPlayersResponse['pagination'] | null;
  cacheInfo: IOptimizedPaginatedPlayersResponse['cacheInfo'] | null;
  refetch: () => Promise<any>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setPosition: (position: string) => void;
  setYear: (year: string) => void;
  setCollege: (college: string) => void;
  setCountry: (country: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setLimit: (limit: number) => void;
  performanceMetrics: {
    apiResponseTime: number;
    renderTime: number;
    cacheHitRate: number;
    dataSize: number;
    queryComplexity: number;
  } | null;
}

// NBA Page State interfaces
export interface INBAPageState {
  forceRefresh: boolean;
  pageSize: number;
  currentPage: number;
}

export interface INBAPageActions {
  setForceRefresh: (refresh: boolean) => void;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  handlePageChange: (newPage: number) => void;
  handlePageSizeChange: (newPageSize: string) => void;
  handleForceRefresh: () => void;
}

// Debounced Search interface
export interface IUseDebouncedSearchOptions {
  delay?: number;
  minLength?: number;
  onSearch?: (query: string) => void;
}

// ========================================
// UTILITY TYPES (from utils.types.ts)
// ========================================

// Generic utility types
export interface IApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ISortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface IFilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

// Error handling types
export interface IErrorDetails {
  message: string;
  code?: string;
  field?: string;
  stack?: string;
}

export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

// Cache-related types
export interface ICacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
  namespace?: string;
  strategy?: 'memory' | 'redis' | 'database' | 'hybrid';
  priority?: 'low' | 'medium' | 'high';
}

// Form utility types
export interface IFormField {
  name: string;
  value: any;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export interface IFormState {
  fields: Record<string, IFormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Date/time utility types
export interface IDateRange {
  start: Date;
  end: Date;
}

export interface ITimeFormat {
  format: '12h' | '24h';
  timezone?: string;
}

// String utility types
export interface IStringTransform {
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  trim?: boolean;
  replace?: Array<{ from: string; to: string }>;
}

// Object utility types
export interface IObjectPath {
  path: string;
  value: any;
}

export interface IDeepMergeOptions {
  arrays?: 'replace' | 'merge' | 'concat';
  objects?: 'replace' | 'merge';
  primitives?: 'replace' | 'keep-first' | 'keep-last';
}

// Performance monitoring types - merged with the main IPerformanceMetrics interface above

// ============================================================================
// COMPONENT-RELATED TYPE DEFINITIONS
// ============================================================================

// Public Game Comments Component Props
export interface IPublicGameCommentsProps {
  gameId: string;
  showComments?: boolean;
}

// Public Comment Viewer Component Props
export interface IPublicCommentViewerProps {
  commentId: string;
  className?: string;
}

// Comment Viewer Component Props
export interface ICommentViewerProps {
  commentId: string;
  className?: string;
}

// Public Reaction Picker Component Props
export interface IPublicReactionPickerProps {
  targetId: string;
  targetType: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  showPicker?: boolean;
  onReactionSelect: (emoji: string) => void;
}

// ============================================================================
// DATABASE-RELATED TYPE DEFINITIONS
// ============================================================================

// Query Performance Monitoring Types
export interface QueryMetrics {
  queryName: string;
  executionTime: number;
  resultCount: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface PerformanceStats {
  totalQueries: number;
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  successRate: number;
  totalResultCount: number;
}

// ============================================================================
// GRAPHQL-RELATED TYPE DEFINITIONS
// ============================================================================

import DataLoader from 'dataloader';
import { FetchMoreQueryOptions } from '@apollo/client';

// DataLoader Context Type moved to 002-graphql.types.ts to avoid circular dependencies

// ============================================================================
// HOOK-RELATED TYPE DEFINITIONS
// ============================================================================

// Optimized Reactions Hook Types
export interface IUseOptimizedReactionsOptions {
  skip?: boolean;
}

export interface IUseOptimizedReactionsReturn {
  reactions: IReaction[];
  reactionGroups: IReactionGroup[];
  loading: boolean;
  error: any;
  refetch: () => Promise<any>;
}

// Optimized Public Reactions Hook Types
export interface IUseOptimizedPublicReactionsOptions {
  skip?: boolean;
}

export interface IUseOptimizedPublicReactionsReturn {
  reactions: IPublicReaction[];
  reactionGroups: IPublicReactionGroup[];
  loading: boolean;
  error: any;
  refetch: () => Promise<any>;
}

// Optimized Public Comments Hook Types
export interface IUseOptimizedPublicCommentsOptions {
  limit?: number;
  skip?: boolean;
  useCountsOnly?: boolean;
  useDetailed?: boolean;
}

export interface IUseOptimizedPublicCommentsReturn {
  comments: IPublicComment[];
  totalCommentCount: number;
  totalReactionCount: number;
  loading: boolean;
  error: any;
  hasNextPage: boolean;
  endCursor: string | null;
  refetch: () => Promise<any>;
  loadMore: () => Promise<any>;
  commentCounts: Map<string, { totalChildCommentCount: number; totalReactionCount: number }>;
}

// Optimized Public Comment Replies Hook Types
export interface IUseOptimizedPublicCommentRepliesOptions {
  commentId?: string;
  limit?: number;
  skip?: boolean;
  useDetailed?: boolean;
}

export interface IUseOptimizedPublicCommentRepliesReturn {
  replies: IPublicComment[];
  totalChildCommentCount: number;
  totalReactionCount: number;
  loading: boolean;
  error: any;
  hasNextPage: boolean;
  endCursor: string | null;
  refetch: () => Promise<any>;
  loadMore: () => Promise<any>;
  replyCounts: Map<string, { totalChildCommentCount: number; totalReactionCount: number }>;
}

// Optimized NBA Hub Counts Hook Types
export interface IUseOptimizedNBAHubCountsOptions {
  skip?: boolean;
}

export interface IUseOptimizedNBAHubCountsReturn {
  counts: {
    totalGames: number;
    totalTeams: number;
    totalPlayers: number;
  };
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  performanceMetrics?: {
    queryTime: number;
    dataSize: number;
  };
}

// Optimized Landing Page Data Hook Types
export interface IUseOptimizedLandingPageDataOptions {
  limit?: number;
  skip?: boolean;
}

export interface IUseOptimizedLandingPageDataReturn {
  data: {
    trendingContent: any[];
    latestGames: any[];
    popularGames: any[];
  };
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  performanceMetrics?: {
    queryTime: number;
    dataSize: number;
  };
}

// Optimized Game Log Comments Hook Types
export interface IUseGameLogCommentsOptions {
  limit?: number;
  skip?: boolean;
  useCountsOnly?: boolean;
  useDetailed?: boolean;
}

export interface IUseGameLogCommentsReturn {
  comments: IComment[];
  totalCommentCount: number;
  totalReactionCount: number;
  loading: boolean;
  error: any;
  hasNextPage: boolean;
  endCursor: string | null;
  refetch: () => Promise<any>;
  loadMore: () => Promise<any>;
  commentCounts: Map<string, { totalChildCommentCount: number; totalReactionCount: number }>;
}

// Optimized Comment Replies Hook Types
export interface IUseOptimizedCommentRepliesOptions {
  limit?: number;
  skip?: boolean;
  useDetailed?: boolean;
}

export interface IUseOptimizedCommentRepliesReturn {
  replies: IComment[];
  totalChildCommentCount: number;
  totalReactionCount: number;
  loading: boolean;
  error: any;
  hasNextPage: boolean;
  endCursor: string | null;
  refetch: () => Promise<any>;
  loadMore: () => Promise<any>;
  replyCounts: Map<string, { totalChildCommentCount: number; totalReactionCount: number }>;
}

// Optimized Comment Hook Types
export interface IUseCommentOptions {
  commentId?: string;
  limit?: number;
  skip?: boolean;
  useDetailed?: boolean;
}

export interface IUseCommentReturn {
  replies: IComment[];
  reactions: IReaction[];
  reactionGroups: IReactionGroup[];
  totalReplyCount: number;
  totalReactionCount: number;
  hasNextPage: boolean;
  endCursor: string | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<any>;
  loadMore: () => Promise<any>;
  replyCounts: Map<string, { totalChildCommentCount: number; totalReactionCount: number }>;
}

// Optimized Public Comment Hook Types
export interface IUsePublicCommentOptions {
  commentId: string;
  limit?: number;
  skip?: boolean;
  useDetailed?: boolean;
}

export interface IUsePublicCommentReturn {
  replies: IPublicComment[];
  reactions: IPublicReaction[];
  reactionGroups: IPublicReactionGroup[];
  totalReplyCount: number;
  totalReactionCount: number;
  hasNextPage: boolean;
  endCursor: string | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<any>;
  loadMore: () => Promise<any>;
  replyCounts: Map<string, { totalChildCommentCount: number; totalReactionCount: number }>;
}

// Optimized Friendships Hook Types
export interface IUseOptimizedFriendshipsOptions {
  limit?: number;
  skip?: boolean;
  useCountsOnly?: boolean;
  useDetailed?: boolean;
}

export interface IUseOptimizedFriendshipsReturn {
  friendships: IFriendship[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  totalCount: number;
  queryTime: boolean;
  isSlowQuery: boolean;
}

// Optimized Friendship Requests Hook Types
export interface IUseOptimizedFriendshipRequestsOptions {
  limit?: number;
  skip?: boolean;
  useCountsOnly?: boolean;
  useDetailed?: boolean;
}

export interface IUseOptimizedFriendshipRequestsReturn {
  requests: IFriendship[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  totalCount: number;
  queryTime: boolean;
  isSlowQuery: boolean;
}

// Optimized User Search Hook Types
export interface IUseOptimizedUserSearchOptions {
  limit?: number;
  skip?: boolean;
  useCountsOnly?: boolean;
  useDetailed?: boolean;
}

export interface IUseOptimizedUserSearchReturn {
  users: UserSummary[];
  loading: boolean;
  error: Error | null;
  search: (searchTerm: string) => Promise<void>;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  totalCount: number;
  queryTime: boolean;
  isSlowQuery: boolean;
}

// Public Reaction Group Type (extends the base IReactionGroup)
export interface IPublicReactionGroup {
  emoji: string;
  count: number;
  reactions: IPublicReaction[];
  users: Array<{
    id: string;
    username: string;
    imageUrl?: string | null;
  }>;
  hasUserReacted: boolean;
}

// ========================================
// SEARCH DATA PARSER TYPES
// ========================================

// Type definitions for player data used in search parsing
export interface IPlayerData {
  feets?: number;
  inches?: number;
  meters?: number;
  pounds?: number;
  kilograms?: number;
  // Allow additional properties for compatibility with IPlayerResponse
  [key: string]: unknown;
}

// ========================================
// COMPONENT PROPS INTERFACES
// ========================================

// Popular Games interfaces
export interface IPopularGamesData {
  topRated: IPopularGame[];
  mostRated: IPopularGame[];
  mostPopular: IPopularGame[];
}

export interface IPopularGamesProps {
  data?: IPopularGamesData;
}

// Trending Content interfaces
export interface ITrendingContentData {
  topGameLogs: GameLog[];
  mostActiveGameLog: GameLog | null;
}

export interface IIntegratedGameLogsProps {
  data?: ITrendingContentData;
}

export interface IIntegratedGamesProps {
  data?: IRecentGame[];
}

export interface ILandingPageClientFallbackProps {
  serverData?: {
    trendingContent?: ITrendingContentData;
    recentGames?: IRecentGame[];
    popularGames?: IPopularGamesData;
  } | null;
}

// Database result interfaces
export interface IDatabaseGameResult {
  id: string;
  date: Date;
  status: unknown; // JSONB field
  teams: unknown; // JSONB field
  scores: unknown; // JSONB field
  arena: unknown; // JSONB field
  periods: unknown; // JSONB field
  season: string | null;
  stage: number | null;
  nugget: string | null;
  average_rating: string;
  total_ratings: number;
}

// ============================================================================
// OPTIMIZATION & PERFORMANCE INTERFACES
// ============================================================================

/**
 * Optimized query options interface
 */
export interface IOptimizedQueryOptions {
  fetchPolicy?: 'cache-first' | 'cache-only' | 'network-only' | 'no-cache';
  errorPolicy?: 'none' | 'ignore' | 'all';
  notifyOnNetworkStatusChange?: boolean;
  pollInterval?: number;
  skip?: boolean;
  debounceMs?: number;
  retryCount?: number;
  retryDelay?: number;
  context?: Record<string, any>;
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Cache options interface
 */
export interface ICacheOptions {
  ttl?: number;
  tags?: string[];
  namespace?: string;
  strategy?: 'memory' | 'redis' | 'database' | 'hybrid';
  pattern?: string;
}

/**
 * Query optimization options interface
 */
export interface IQueryOptimizationOptions {
  useCache?: boolean;
  cacheTTL?: number;
  batchSize?: number;
  forceRefresh?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableExplain?: boolean;
  logSlowQueries?: boolean;
  slowQueryThreshold?: number;
  enableQueryCache?: boolean;
  maxCacheSize?: number;
}

/**
 * Performance monitor props interface
 */
export interface IPerformanceMonitorProps {
  componentName: string;
  threshold?: number;
  onPerformanceIssue?: (metrics: IPerformanceMetrics) => void;
  enabled?: boolean;
  showDetails?: boolean;
  className?: string;
}

/**
 * Optimized game log card props interface
 */
export interface IGameLogCardProps {
  gameLog: IGameLog;
  showComments?: boolean;
  showReactions?: boolean;
  onComment?: (gameLogId: string, content: string) => void;
  onReaction?: (gameLogId: string, emoji: string) => void;
  onDelete?: (gameLog: IGameLog) => void;
  onEdit?: (gameLog: IGameLog) => void;
  className?: string;
  isOwner?: boolean;
  showUserInfo?: boolean;
  compact?: boolean;
  showActions?: boolean;
}

/**
 * Popular team interface
 */
export interface IPopularTeam {
  id: string;
  name: string;
  code: string;
  logo?: string;
  city: string;
  gameLogCount?: number;
  commentCount?: number;
  reactionCount?: number;
  popularityScore?: number;
  engagement?: {
    total: number;
    public: number;
    private: number;
  };
}

/**
 * Popular teams data interface
 */
export interface IPopularTeamsData {
  teams: IPopularTeam[];
  totalCount: number;
  lastUpdated: string;
  cacheKey: string;
  mostPopular: IPopularTeam[];
}

/**
 * Popular player interface
 */
export interface IPopularPlayer {
  id: string;
  name: string;
  position: string;
  team: {
    id: string;
    name: string;
    code: string;
    logo?: string;
  };
  gameLogCount?: number;
  commentCount?: number;
  reactionCount?: number;
  popularityScore?: number;
  engagement?: {
    total: number;
    public: number;
    private: number;
  };
}

/**
 * Popular players data interface
 */
export interface IPopularPlayersData {
  players: IPopularPlayer[];
  totalCount: number;
  lastUpdated: string;
  cacheKey: string;
  mostPopular: IPopularPlayer[];
}

/**
 * Active fan interface
 */
export interface IActiveFan {
  id: string;
  username: string;
  imageUrl?: string;
  gameLogCount: number;
  commentCount: number;
  reactionCount: number;
  receivedEngagement: number;
  activityScore: number;
  engagement: {
    created: number;
    received: number;
    public: number;
    private: number;
  };
}

/**
 * Active fans data interface
 */
export interface IActiveFansData {
  fans: IActiveFan[];
  totalCount: number;
  lastUpdated: string;
  cacheKey: string;
  mostActive: IActiveFan[];
}

/**
 * Trending content interface
 */
export interface ITrendingContent {
  id: string;
  type: ContentType;
  content: string;
  author: string;
  engagementScore: number;
  timestamp: string;
}

/**
 * Trending content data interface
 */
export interface ITrendingContentData {
  content: ITrendingContent[];
  totalCount: number;
  lastUpdated: string;
  cacheKey: string;
}

/**
 * Content preview data interface
 */
export interface IContentPreviewData {
  mostActiveGameLog: any;
  latestFinishedGame: any;
}

export interface DataLoaderContext {
  userLoader: any; // Will be properly typed when used
  commentCountLoader: any;
  reactionCountLoader: any;
  publicCommentCountLoader: any;
  publicReactionCountLoader: any;
  gameLoader: any;
  teamLoader: any;
  playerLoader: any;
}

// GraphQL Context Type
export interface GraphQLContext {
  user?: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  userId?: string;
  dataLoaders: DataLoaderContext;
  req: any;
  res: any;
}

export interface IOptimizedQueryResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<unknown>;
  fetchMore: (options: FetchMoreQueryOptions<unknown, unknown>) => Promise<unknown>;
  networkStatus: number;
  called: boolean;
}
