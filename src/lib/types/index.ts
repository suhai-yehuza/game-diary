/**
 * Centralized type exports for the Game Diary application
 *
 * This file provides a single entry point for importing types across the app.
 * Organized by category for better maintainability.
 */

// ============================================================================
// Core Domain Types
// ============================================================================
export type {
  // Game types
  Game,
  GameTeam,
  GameScore,
  GameStatistics,
  GameFilters,
  GameField,
  GameDate,
  GameStatus,
  GameArena,
  GamePeriods,
  ExtendedGame,
  SearchGame,
} from './game.types';

export type {
  // Team types
  TeamSummary,
  TeamData,
  PlayerData,
  ApiTeam,
  CustomTeam,
  TeamWithSeasonStats,
  TeamStat,
  DBTeamStatistics,
  DBTeamStandings,
  DBWinLossRecord,
  TeamStatisticsResponseData,
  StandingResponseData,
  TeamDisplayStats,
  HeadToHeadData,
  TeamStatsData,
  HeadToHeadProps,
  TeamStatsProps,
} from './team.types';

// ============================================================================
// User & Social Types
// ============================================================================
export type {
  UserSummary,
  Friend,
  FriendGroup,
  UseUserProfileProps,
  UseUserProfileReturn,
  FriendProfileProps,
  FriendGroupsProps,
  FriendRequestButtonProps,
  GetFriendshipsForUserResponse,
} from './user.types';

// ============================================================================
// API & Response Types
// ============================================================================
export type {
  APIResponse,
  APIError,
  GameApiResponse,
  GameResponseData,
  PlayerApiResponse,
  SeasonApiResponse,
  TeamApiResponse,
  Activity,
  TimeFilter,
  ExtendedNextApiRequest,
} from './api.types';

// ============================================================================
// Component Types
// ============================================================================
export type {
  NavItem,
  StatsChartProps,
  ActivityTimelineProps,
  FriendActivityProps,
  GameLogProps,
  GameLogPageProps,
  GameLogActionsProps,
  GameLogsSectionProps,
  GameLogSearchSectionProps,
  InputProps,
  AuthModalProps,
  ReactionDisplayProps,
  ReactionPickerProps,
  ExtendedReactionDisplayProps,
  GQLValidationError,
  GameLogInput,
  GameLogFormData,
  GameLogFormProps,
  GameStatsProps,
  TeamDisplayProps,
} from './component.types';

// ============================================================================
// Notification Types
// ============================================================================
export type { NotificationType, AppNotification } from './notification.types';

// ============================================================================
// Modular Type Exports (non-duplicates only)
// ============================================================================
export type {
  GamePlayerStats,
  GameTeamStatistics,
  GameTeamStatistic,
  PlayerStatistics,
} from './game-statistics.types';

export type {
  UseCreateGameLogProps,
  UseGameDataProps,
  ProcessedGames,
  UseGameDataReturn,
  PaginationHookOptions,
  PaginationFetchResult,
  FilterConfig,
  UseSearchFiltersOptions,
} from './hooks.types';

export type {
  APITeamResponse,
  TeamResponseData,
  TeamStatisticsApiResponse,
} from './api-responses.types';

// ============================================================================
// GraphQL Types
// ============================================================================
export type {
  Team,
  GameLog,
  Classification,
  TeamStats,
  TeamFilters as ResolverTeamFilters,
} from './generated/graphql';

// ============================================================================
// Database & Resolver Types
// ============================================================================
export type { DBPlayer } from './shared.types';
export type { ResolverContext } from './resolver.types';
