/**
 * Consolidated Component Types
 * All component-related type definitions
 */

import type { ReactNode, FormEvent, HTMLAttributes, PropsWithChildren } from 'react';

// Import from specific files to avoid circular dependencies
import type { IBaseButtonProps, IBaseInputProps } from './ui.types';
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
  colorClass?: string;
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

export interface IErrorDisplayProps {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
  variant?: 'default' | 'danger' | 'warning';
  className?: string;
  showRetry?: boolean;
}

export interface ILoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export interface IEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'info' | 'warning';
  className?: string;
}

// ========================================
// ADMIN COMPONENT TYPES
// ========================================

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
// PAGE COMPONENT TYPES
// ========================================

export interface ISignUpPageProps {
  params: {
    'sign-up': string[];
  };
}
