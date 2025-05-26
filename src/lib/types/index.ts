/**
 * This is the primary exports file for all types in the application.
 * Only this file should be imported by other modules in the application.
 * This ensures type consistency and prevents import conflicts.
 */
// Export types from generated files
export type {
  GameLog,
  GameLogFilters,
  GameLogStats,
  ValidationError as GQLValidationError,
  Game,
  GameDate,
  GameFilters as GQLGameFilters,
  GamePeriods,
  GameStats as GQLGameStats,
  GameStatus,
  Player,
  PlayerFilters as GQLPlayerFilters,
  PlayerGameStats,
  PlayerStats,
  Team,
  TeamFilters as GQLTeamFilters,
  TeamGameStats,
  TeamStats,
  User,
  UserBase,
  UserSummary,
  Comment,
  CommentFilters,
  Reaction,
  ReactionEmojiType,
  Friendship,
  FriendshipStatus,
  Season,
  SeasonActive,
  League,
  LeagueDetails,
  LeaguesInfo,
  PaginatedResponse as GQLPaginatedResponse,
  PaginationInput as GQLPaginationInput,
  SortDirection as GQLSortDirection,
  ErrorResult,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  NotFoundError,
  RateLimitError,
  Resolvers,
  MutationcreateGameLogArgs,
  MutationupdateGameLogArgs,
  MutationdeleteGameLogArgs,
  MutationcreateCommentArgs,
  MutationupdateCommentArgs,
  MutationdeleteCommentArgs,
  QuerygamesArgs,
  QueryteamsArgs,
  QueryplayersArgs,
  QueryusersArgs,
  Maybe,
  BirthInfo,
  Classification,
  ParentType,
} from './generated/graphql';

// Export types from generated types
export type {
  DBUser,
  DbGame,
  DBGameLog,
  DBComment,
  DBReaction,
  StarRatingProps,
} from './generated/types';

// Export game types
export type {
  APITeamResponse,
  GameStatistics,
  GamePlayerStats,
  CustomTeamStats,
  GameRatingWithUser,
  GameWithStats,
  GameWithStatistics,
  GameWithDetails,
  GameLogWithReactions,
  GameTeamWithStats,
  PlayerWithOptionalPhoto,
  SearchGame,
  GameQueryResult,
  ProcessedGameData,
  GameSortInput,
  SeasonData,
  TeamData,
  PlayerData,
  GameField,
  GameStatsProps,
  ComponentGameStats,
  GameApiResponse,
  GameResponseData,
  TransformedGame,
  GameTeams,
  GameScores,
  GameTeamSortInput,
  GamePlayerSortInput,
  ExtendedGame,
} from './game.types';

// Export API types
export type {
  APIConfig,
  RapidAPIConfig,
  APIResponse,
  APIError,
  ValidationResult as APIValidationResult,
  ValidationRule as APIValidationRule,
  APIRequestOptions,
  APIClient,
  RateLimitConfig as APIRateLimitConfig,
  CacheConfig,
  APIMetrics,
  APIParameters,
  SeasonApiResponse as APISeasonResponse,
} from './api.types';

// Export config types
export type {
  ButtonProps,
  InputProps,
  SelectProps,
  ModalProps,
  CardProps,
  LoadingProps,
  ErrorProps,
  DistributionFunction,
  RangeConfig,
  BatchSizeConfig,
  DatabaseSeedingConfig,
  RateLimitConfig,
  ClassificationWeights,
  DistributionFunctions,
} from './config.types';

// Export constants from config.types.ts
export {
  REACTION_EMOJIS,
  FRIENDSHIP_STATUS,
  WATCHED_SETTINGS,
  GAME_STATUS_VALUES,
  CLASSIFICATIONS,
  CONFERENCES,
  DIVISIONS,
  PARENT_TYPES,
  PERMISSIONS,
  RESOURCES,
  SORT_DIRECTION,
  TARGET_TYPES,
  LEAGUES,
  USER_ROLES,
  CACHE_TTL,
  CACHE_KEYS,
  validDivisions,
  validConferences,
  validPositions,
} from './config.types';

// Export type values from config.types.ts
export type {
  ReactionEmojiValue,
  FriendshipStatusValue,
  WatchedSettingValue,
  WatchedSettingType,
  UserRoleType,
  ClassificationType,
  ConferenceType,
  DivisionType,
  GameStatusType,
  PermissionType,
  ResourceType,
  SortDirectionType,
  TargetTypeValue,
  ConferenceValue,
  DivisionValue,
  SortDirectionValue,
  ClassificationValue,
  FriendshipStatusType,
  PermissionValue,
  ResourceValue,
} from './config.types';

// Export consolidated types
export type {
  DBSeason,
  ExtendedNextApiRequest,
  MonitoringMetrics,
  UseMutationWithOptimisticUpdateOptions,
  UsePullToRefreshOptions,
  UseSwipeActionsOptions,
  TeamSortInput as ConsolidatedTeamSortInput,
  GameCardProps,
  GamesListProps,
  ActivityTimelineProps,
  CreateGameLogModalProps,
  NavItem,
  UpdateGameLogModalProps,
  FriendRequestButtonProps,
  GetFriendshipsForUserResponse,
} from './consolidated.types';

// Export shared types
export type {
  SortDirection,
  Status,
  ErrorType,
  Route,
  BaseProps,
  WithId,
  WithTimestamps,
  LoadingState,
  ApiResponse,
  PaginatedResponse,
  DateRange,
  SearchParams,
  Nullable,
  Optional,
  DeepPartial,
  WithRequired,
  WithOptional,
  BaseEvent,
  ErrorEvent,
  Config,
  ValidatableValue,
  BaseUser,
  BaseFriendship,
  BaseGame,
  BaseGameLog,
  BaseComment,
  BaseReaction,
  DBPlayer,
  APIConfigOptions,
  LeagueType,
  APIGame,
  GameLogResponse,
  RawTeamStatistics,
  StandingApiResponse,
  Standing,
  LeaguesApiResponse,
} from './shared.types';

// Export constants from shared.types.ts
export { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, DEFAULT_SORT_DIRECTION } from './shared.types';

// Export activity types
export type {
  Activity,
  ActivityType,
  TargetType,
  TimelineItem,
  TimeFilter,
  ActivityFeed,
  ActivityStats,
  FriendActivityProps,
} from './activity.types';

// Export user types
export type {
  ExternalUserAccount,
  ClerkUserData,
  ClerkDeletedUserData,
  DbCustomUser,
  UserFields,
  UserSearchProps,
  UserProfileProps,
  FriendProfileProps,
  UsersTableProps,
  UserPageProps,
} from './user.types';

// Export team types
export type {
  ApiTeam,
  ApiTeamResponse,
  CustomTeam,
  TeamFields,
  TeamWithSeasonStats,
  TeamStat,
  TeamCounts,
  CustomTeamFilters,
  DBTeamStatistics,
  DBTeamStandings,
  DBWinLossRecord,
  DBWeightInfo,
  TeamStatistics,
  TeamResponseData,
  TeamStatisticsApiResponse,
  TeamStatisticsResponseData,
  StandingResponseData,
  TeamDisplayStats,
} from './team.types';

// Export comment types
export type { EditingComment, CommentsSectionProps } from './comment.types';

// Export friend types
export type { Friend, FriendGroup, FriendGroupsProps } from './friend.types';

// Export gamelog types
export type {
  GameLogFormData,
  GameLogFormProps,
  GameLogViewProps,
  GameLogInput,
  CustomGameLog,
  CommentResponse,
} from './gamelog.types';

// Export notification types
export type {
  NotificationType,
  AppNotification,
  NotificationContextType,
} from './notification.types';

// Export redis types
export type { RedisClient, RedisClientType } from './redis.types';

// Export GraphQL types
export type {
  SendFriendRequestInput,
  GameRating,
  GameRecord,
  GameLogRecord,
  CommentRecord,
  ReactionRecord,
  DataLoaders,
  Context,
  CreateCommentInput,
} from './graphql.types';

// Export route types
export type { RouteContext } from './route.types';

// Export validation types
export { teamSchema } from './validation.types';
export type { TeamInput } from './validation.types';

// Export reaction types
export type { ReactionPickerProps } from './reaction.types';

// Export database types
export type {
  EnvConfig,
  JsonValue,
  DatabaseConfig,
  BaseDatabaseClient,
  DatabaseClient,
  DatabaseConnection,
  DatabasePool,
  DatabaseConnectionOptions,
  DatabasePoolConfig,
  QueryOptions,
  QueryResult,
  QueryParams,
  DatabaseQueryOptions,
  DatabaseError,
  DatabaseResult,
  DatabaseErrorResult,
  DatabaseResponse,
  DatabaseTransaction,
  DatabaseTransactionOptions,
  DatabaseMigration,
  DatabaseMigrationOptions,
  DatabaseBackup,
  DatabaseRestore,
  DatabaseBackupOptions,
  DatabaseRestoreOptions,
  DatabaseRow,
  DatabaseQueryResult,
  DatabaseSingleResult,
  RedisConfig,
  SeederConfig,
  SeederResult,
  Migration,
  MigrationResult,
  PaginatedQueryOptions,
  PaginatedQueryResult,
  Transaction,
  Index,
  Constraint,
  Loaders,
} from './db.types';

// Export schema from db.types.ts
export { envSchema } from './db.types';

// Export enum values and their types from enum-values.ts
export {
  GAME_STATUS,
  GAME_TYPE,
  USER_ROLE,
  NOTIFICATION_TYPE,
  REACTION_TYPE,
  type GameStatusValue,
  type GameTypeValue,
  type UserRoleValue,
  type NotificationTypeValue,
  type ReactionTypeValue,
} from '@/lib/db/schema/enum-values';

// Form Types
export type { FormFieldContextValue, FormItemContextValue } from './form.types';

// Toast Types
export type { ToastProps, ToastActionElement, ToasterToast, State, Action } from './toast.types';

// Auth Types
export type { AuthContextType } from './auth.types';

// Pagination Types
export type { PaginationInput, InputMaybe } from './generated/graphql';
