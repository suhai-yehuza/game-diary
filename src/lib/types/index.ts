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
  IGame,
  IGameTeam,
  IGameScore,
  IGameStatistics,
  IGameFilters,
  IGameDate,
  IGameStatus,
  IGameArena,
  IGamePeriods,
  IExtendedGame,
  ISearchGame,
  IGameCardProps,
  IGamesListProps,
  IGameTeamStatistics,
  IGameTeams,
  IGameScores,
  IGameWithPossibleId,
  IGameEdge,
  IGameConnection,
  IGameQueryResponse,
  IGameWithStatistics,
  IGameTeamWithStats,
  IGameTeamStatistic,
  IGameScoresLegacy,
  IGameData,
  IMappedGame,
  IGameSortInput,
  IGameField,
  IDBGameRecord,
  IGameListProps,
} from './game.types';

export type {
  // Team types
  ITeamSummary,
  ITeamData,
  IPlayerData,
  IApiTeam,
  ICustomTeam,
  ITeamWithSeasonStats,
  ITeamStat,
  IDBTeamStatistics,
  IDBTeamStandings,
  IDBWinLossRecord,
  ITeamStatisticsResponseData,
  IStandingResponseData,
  ITeamDisplayStats,
  IHeadToHeadData,
  ITeamStatsData,
  IHeadToHeadProps,
  ITeamStatsProps,
} from './team.types';

// ============================================================================
// User & Social Types
// ============================================================================
export type {
  IUserSummary,
  IFriend,
  IFriendGroup,
  IUseUserProfileProps,
  IUseUserProfileReturn,
  IFriendProfileProps,
  IFriendGroupsProps,
  IGetFriendshipsForUserResponse,
} from './user.types';

// ============================================================================
// API Types
// ============================================================================
export type {
  IAPIConfig,
  IAPIClient,
  IAPIResponse,
  IValidationError,
  IValidationResult,
  IValidationRule,
  IAPIRequestOptions,
  IRateLimitConfig,
  ICacheConfig,
  IAPIMetrics,
  IAPIParameters,
} from './api.types';

// ============================================================================
// Component Types
// ============================================================================
export type {
  INavItem,
  IStatsChartProps,
  IGameLogProps,
  IGameLogPageProps,
  IGameLogActionsProps,
  IGameLogsSectionProps,
  IGameLogSearchSectionProps,
  IInputProps,
  IAuthModalProps,
  IGQLValidationError,
  IGameLogInput,
  IGameLogFormData,
  IGameLogFormProps,
  IGameStatsProps,
  ITeamDisplayProps,
} from './component.types';

// ============================================================================
// Notification Types
// ============================================================================
export type { INotificationType, IAppNotification } from './notification.types';

// ============================================================================
// API Response Types
// ============================================================================
export type {
  IGameResponseData,
  IGameApiResponse,
  IPlayerApiResponse,
  ISeasonApiResponse,
  ITeamApiResponse,
  ITeamResponseData,
  ITeamStatisticsApiResponse,
} from './api-responses.types';

// ============================================================================
// Generated Types
// ============================================================================
export type { Team, GameLog, Classification, ITeamStats } from './generated/graphql';

// ============================================================================
// Database & Resolver Types
// ============================================================================
export type { IDBPlayer, IActivity } from './shared.types';
export type { IResolverContext } from './resolver.types';

// ============================================================================
// Hook Types
// ============================================================================
export type { IUseGameDataProps, IUseGameDataReturn, IProcessedGames } from './hooks.types';

// ============================================================================
// Pagination Types
// ============================================================================
export type { IPaginationHookOptions, IPaginationFetchResult } from './pagination.types';

// ============================================================================
// Search Types
// ============================================================================
export type { IFilterConfig, IUseSearchFiltersOptions } from './search.types';
