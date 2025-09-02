/**
 * Consolidated Component Types
 * All component-related type definitions
 */

import type { ReactNode, HTMLAttributes, PropsWithChildren } from 'react';

// Import from specific files to avoid circular dependencies
import type { ISearchResponse, ISearchResult } from './search.types';

// ========================================
// CARD COMPONENT TYPES
// ========================================

export type ICardProps = HTMLAttributes<HTMLDivElement>;
export type ICardHeaderProps = HTMLAttributes<HTMLDivElement>;
export type ICardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type ICardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type ICardContentProps = HTMLAttributes<HTMLDivElement>;
export type ICardFooterProps = HTMLAttributes<HTMLDivElement>;

// ========================================
// THEME & NAVIGATION TYPES
// ========================================

export interface IThemeToggleProps {
  className?: string;
}

export interface IComponentProps {
  className?: string;
}

export type NavItemProps = PropsWithChildren<{
  href: string;
  isActive: boolean;
  className?: string;
}>;

export interface INavItemExtendedProps extends NavItemProps {
  onClick?: () => void;
  isStacked?: boolean;
  closeMenu?: () => void;
}

// ========================================
// AUTHENTICATION BUTTON TYPES
// ========================================

export interface ISignUpButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface ISignInButtonProps extends HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

// ========================================
// PROVIDER TYPES
// ========================================

export interface IClientProvidersProps {
  children: ReactNode;
}

export interface ISignInModalTriggerProps {
  autoTrigger?: boolean;
}

// ========================================
// LAYOUT COMPONENT TYPES
// ========================================

export interface INavigationLinksProps {
  isActive: (path: string) => boolean;
  _isMenuExpanded: boolean;
  _setIsMenuExpanded: (expanded: boolean) => void;
  closeMenu?: () => void;
  isStacked?: boolean;
}

export interface IHeaderRightSectionProps {
  isMenuExpanded: boolean;
}

export interface ILogoProps {
  isMenuExpanded: boolean;
}

export interface IMobileMenuButtonProps {
  onToggle: () => void;
}

// ========================================
// COMMON COMPONENT TYPES
// ========================================

export interface ILoadingSpinnerProps {
  ariaLabel?: string;
  color?: 'primary' | 'secondary' | 'muted' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export interface IErrorDisplayProps {
  error: string | Error | null | undefined;
  title?: string;
  onRetry?: () => void;
  variant?: 'default' | 'danger' | 'warning';
  className?: string;
  showRetry?: boolean;
}

export interface IEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'info' | 'warning';
  className?: string;
  iconSize?: number;
}

// ========================================
// ADMIN COMPONENT TYPES
// ========================================

export interface IDbRefreshButtonSimpleProps {
  onProgressChange?: (progress: {
    isRefreshing: boolean;
    progress: IDbRefreshProgress;
    status: 'idle' | 'success' | 'error';
    message: string;
    onTerminate: () => void;
  }) => void;
}

export interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

export interface IPaginationInfoProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  itemLabel: string;
}

export interface IPaginationControlsProps {
  totalCount: number;
  currentPage: number;
  pageInfo: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  loading: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

export interface ITableSearchProps {
  searchTerm: string;
  searchField: string;
  searchFields: { value: string; label: string }[];
  onSearchChange: (term: string, field: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export interface IColumnConfig<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface ITableWithSearchProps<T extends { id: string | number }> {
  tableName: string;
  columns: IColumnConfig<T>[];
  itemLabel: string;
  data?: T[];
  onSearch?: (query: string) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  searchPlaceholder?: string;
  className?: string;
  isLoading?: boolean;
}

export type ClassificationType = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

// ========================================
// SEARCH COMPONENT TYPES
// ========================================

export interface ISearchResultsProps {
  results: ISearchResponse;
  query: string;
}

export type ResultType = 'all' | 'users' | 'games' | 'gameLogs' | 'teams' | 'players';

export interface IGameSearchResultProps {
  game: ISearchResult;
  onClick?: (game: ISearchResult) => void;
  className?: string;
}

export interface IGameLogSearchResultProps {
  gameLog: ISearchResult;
}

export interface IPlayerSearchResultProps {
  player: ISearchResult;
  onClick?: (player: ISearchResult) => void;
  className?: string;
}

export interface ITeamSearchResultProps {
  team: ISearchResult;
  onClick?: (team: ISearchResult) => void;
  className?: string;
}

export interface IUserSearchResultProps {
  user: ISearchResult;
  onClick?: (user: ISearchResult) => void;
  className?: string;
}

export interface ISearchEmptyStateProps {
  hasQuery: boolean;
}

export interface IGameSearchProps {
  onGameSelect: (gameId: string, gameName: string) => void;
  onClose: () => void;
}

export interface IGameLogsSearchProps {
  onSearchChange: (searchTerm: string, searchField: string) => void;
  onClear: () => void;
  searchTerm: string;
  searchField: string;
}

// ========================================
// UI COMPONENT TYPES
// ========================================

export interface ITabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface ITabsListProps {
  className?: string;
  children: React.ReactNode;
}

export interface ITabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export interface ITabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface ISortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDirection: SortDirection;
  onSort: (sortKey: string, direction: SortDirection) => void;
  className?: string;
  disabled?: boolean;
}

// ========================================
// GAME LOG COMPONENT TYPES
// ========================================

export interface IGameLogModalProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gameLog?: {
    id?: string;
    rating_for_game?: number;
    tags?: string[];
    notes?: string;
    classification?: string;
    watched_setting?: string;
    watched_scope?: string;
    watched_date?: string;
    watched_location?: string;
  }; // Required for edit mode
  preSelectedGame?: {
    id: string;
    name: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
  };
}

export interface IGameLogSearchResult {
  id: number;
  name: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  arena: string;
  season: number;
  status: string;
}

// ========================================
// GAME LOGS COMPONENT TYPES
// ========================================

export interface IGameLogCardProps {
  log: import('./gameLog.types').IGameLog;
  showActions?: boolean;
  idx?: number;
  onEdit?: (log: import('./gameLog.types').IGameLog) => void;
  onDelete?: (log: import('./gameLog.types').IGameLog) => void;
}

export interface IGameLogsFiltersProps {
  searchTerm: string;
  searchField: string;
  sortConfig: { field: string; direction: 'asc' | 'desc' } | null;
  displayedCount: number;
  totalCount: number;
  classification: string;
  onSearchChange: (term: string, field: string) => void;
  onSearchClear: () => void;
  onSort: (key: string, direction: 'asc' | 'desc' | null) => void;
}

export interface IGameLogsContentProps {
  tabValue: string;
  logs: import('./gameLog.types').IGameLog[];
  loading: boolean;
  loadingMore?: boolean;
  hasNextPage: boolean;
  totalCount: number;
  showActions?: boolean;
  onLoadMore: () => void;
  onEdit?: (log: import('./gameLog.types').IGameLog) => void;
  onDelete?: (log: import('./gameLog.types').IGameLog) => void;
  filteredAndSortedLogs: import('./gameLog.types').IGameLog[];
}

// ========================================
// COMMENTS COMPONENT TYPES
// ========================================

export interface ICommentRepliesProps {
  commentId: string;
  maxDepth?: number;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export interface INestedCommentProps {
  comment: import('./comment.types').IComment;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  maxDepth?: number;
}

export interface IGameLogCommentsProps {
  gameLog: import('./gameLog.types').IGameLog;
  showComments?: boolean;
  onToggleComments?: (expanded: boolean) => void;
}

// ========================================
// LAYOUT COMPONENT TYPES
// ========================================

export interface IMobileMenuSheetProps {
  isActive: (path: string) => boolean;
}

// ========================================
// GAME LOGS COMPONENT TYPES (UPDATED)
// ========================================

export interface IGameLogsHeaderProps {
  onCreateClick: () => void;
}

export interface IGameLogsPaginationProps {
  hasNextPage: boolean;
  loading: boolean;
  onLoadMore: () => void;
  loadMoreText?: string;
}

export interface IGameLogsTabsProps {
  selectedTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export interface IRatingStarsProps {
  rating: number;
}

export interface IClassificationIconProps {
  classification: string;
}

// ========================================
// COMPONENT SPECIFIC TYPES (MOVED FROM APP DIRECTORY)
// ========================================

// MemoizedReactionButton
export interface IMemoizedReactionButtonProps {
  group: import('./reaction.types').IReactionGroup;
  onClick: (emoji: string) => void;
  loading: boolean;
  sizeClasses: string;
  showCount: boolean;
}

// Sports Components
export interface ITeamCardProps {
  team: import('./externalApi.types').ITeamResponse;
}

export interface IPlayerCardProps {
  player: import('./externalApi.types').IPlayerResponse;
}

export interface IGameCardProps {
  game: import('./externalApi.types').IGameResponse;
}

// Enhanced Auth Guard
export interface IEnhancedAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallbackUrl?: string;
  showRetryButton?: boolean;
}

// Sports Tabs
export interface ITab {
  id: string;
  label: string;
  content: React.ReactNode;
  href?: string; // Optional link for the tab
}

export interface ISportsTabsProps {
  tabs: ITab[];
  defaultTab?: string;
  className?: string;
  showLiveGamesTab?: boolean;
}

// Sports Pagination
export interface ISportsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Sports Empty State
export interface ISportsEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

// Search Suggestions
export interface ISearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  category?: 'user' | 'game' | 'team' | 'player';
  icon?: React.ReactNode;
}

export interface ISearchSuggestionsProps {
  query: string;
  onSuggestionSelect: (suggestion: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

// Search Performance Monitor
export interface ISearchMetrics {
  totalSearches: number;
  averageSearchTime: number;
  zeroResultSearches: number;
  mostPopularQueries: Array<{ query: string; count: number }>;
  searchSuccessRate: number;
}

export interface ISearchPerformanceMonitorProps {
  query: string;
  resultsCount: number;
  searchTime: number;
  onMetricsUpdate?: (metrics: ISearchMetrics) => void;
}

// Search Analytics
export interface ISearchAnalyticsProps {
  query: string;
  resultsCount: number;
  searchTime: number;
  category?: string;
  filters?: Record<string, unknown>;
  children?: React.ReactNode;
}

export interface ISearchEvent {
  query: string;
  resultsCount: number;
  searchTime: number;
  category?: string;
  filters?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

// NBA News
export interface INBANewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
}

export interface INBANewsProps {
  limit?: number;
}

// Performance Monitor
export interface IClientPerformanceMetrics {
  queryCount: number;
  averageQueryTime: number;
  slowQueries: number;
  totalLoadTime: number;
}

// Cache component types removed

// ========================================
// DB REFRESH COMPONENT TYPES
// ========================================

export interface IDbRefreshJob {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'ready' | 'error';
  count?: number;
  progress?: number;
  total?: number;
}

export interface IDbRefreshProgress {
  currentStep: string;
  stepNumber: number;
  totalSteps: number;
  progress: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  message: string;
  details: string;
  startTime?: Date;
  estimatedTimeRemaining?: string;
}

export interface IDbRefreshProgressTrackerProps {
  isVisible: boolean;
  onComplete?: () => void;
  progress?: IDbRefreshProgress;
  onTerminate?: () => void;
  isTerminating?: boolean;
}
