import type React from 'react';
import type { ReactNode } from 'react';
import type { IValidationRule } from './externalApi.types';
import type { IFilterState, IFilterOptions, IFriendship } from './hooks.types';
import type { IUserSummary, Permission, Role, UserRole, ISortDirection } from './shared.types';

// UI Component Types
// These types are used across the application for UI components

// ISortDirection moved to shared.types.ts

// ========================================
// NOTIFICATION TYPES
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

  // Legacy properties for backward compatibility
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
}

// ========================================
// CHART TYPES
// ========================================

export interface IChartData<TLabel = string> {
  labels?: TLabel[];
  datasets: IChartDataset[];
}

export interface IChartDataset {
  label?: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  [key: string]: unknown;
}

// ========================================
// BASE COMPONENT TYPES
// ========================================

export interface IBottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon?: React.ComponentType<{ className?: string }>;
  action?: () => void;
  isAction?: boolean;
}

// Base button interface that can be extended
export interface IBaseButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Specific button variants
export interface IButtonProps extends IBaseButtonProps {
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  'aria-label'?: string;
}

export interface IAdminButtonProps extends IBaseButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
}

// Base input interface that can be extended
export interface IBaseInputProps {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  required?: boolean;
}

// Specific input variants
export interface IInputProps extends IBaseInputProps {
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete?: string;
  spellCheck?: boolean;
  ref?: (input: HTMLInputElement | null) => void;
}

// ========================================
// ADMIN & API TYPES
// ========================================
export interface IApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
export type IApiResponse<T = unknown> = IApiSuccessResponse<T> | IApiErrorResponse;

export interface IBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  className?: string;
}

// Provider interfaces
export interface IClerkProviderWrapperProps {
  children: React.ReactNode;
}

export interface TableWithSearchProps {
  endpoint: string;
  columns: ColumnConfig<unknown>[];
  itemLabel: string;
  tableName: string;
}

export type ColumnConfig<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

// Pagination Types
export interface IPaginationOptions {
  query: string;
  variables: Record<string, unknown>;
  onDataReceived: (data: unknown) => void;
  onError: (error: string) => void;
}

// Sorting Types
export interface ISortConfig {
  key: string | null;
  direction: ISortDirection | null;
}

export interface IUseSortingReturn {
  sortConfig: ISortConfig;
  handleSort: (key: string, direction: ISortDirection | null) => void;
  clearSort: () => void;
  getSortParams: () => { sortKey: string | null; sortDirection: ISortDirection | null };
}

// App configuration types
export interface IAppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  features: Record<string, boolean>;
}

// App state types
export interface IAppState {
  isLoading: boolean;
  error: string | null;
  user: IUser | null;
  theme: 'light' | 'dark';
  language: string;
}

// User types
export interface IUser {
  id: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: UserRole;
  roles?: Role[];
  permissions?: Permission[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// UserRole enum moved to shared.types.ts

export interface IUserParent {
  id: string;
  email_address?: string | null;
  phone_number?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}

export interface IUserArgs {
  id?: string;
}

// Navigation types
export interface INavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: INavigationItem[];
  isActive?: boolean;
  isVisible?: boolean;
  requiresAuth?: boolean;
  requiresRole?: UserRole[];
}

export interface IBreadcrumbItem {
  label: string;
  path: string;
  isActive: boolean;
}

// Layout types
export interface ILayoutConfig {
  sidebar: {
    isCollapsed: boolean;
    width: number;
    isVisible: boolean;
  };
  header: {
    height: number;
    isVisible: boolean;
  };
  footer: {
    height: number;
    isVisible: boolean;
  };
}

// Theme types
export interface ITheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Modal types
export interface IModalConfig {
  id: string;
  title: string;
  content: React.ReactNode;
  size: 'sm' | 'md' | 'lg' | 'xl';
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isClosable?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Toast notification types
export interface IToastConfig {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isClosable?: boolean;
  position?: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Form types
export interface IFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  value: any;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: IValidationRule[];
  error?: string;
}

export interface IFormConfig {
  fields: IFormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

// Page types
export interface IPageConfig {
  title: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  noIndex?: boolean;
  layout?: string;
}

// Route types
export interface IRouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  requiresAuth?: boolean;
  requiresRole?: UserRole[];
  pageConfig?: IPageConfig;
}

// Pagination types
export interface IPaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPaginatedResponse<T = any> {
  data: T[];
  pagination: IPaginationConfig;
}

// Search types
export interface ISearchConfig {
  query: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Filter types
export interface IFilterOption {
  label: string;
  value: any;
  count?: number;
}

export interface IFilterConfig {
  defaultValue: string | number | boolean;
  name?: string;
  label?: string;
  type?: 'string' | 'number' | 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  options?: IFilterOption[];
  placeholder?: string;
}

export interface IUseSearchFiltersOptions {
  filterConfig: Record<string, IFilterConfig>;
  additionalFilters?: Record<string, string | number | boolean>;
}

// Sort types
export interface ISortOption {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}

// Loading states
export interface ILoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

// Action types
export interface IAction {
  type: string;
  payload?: any;
  meta?: any;
}

// Reducer types
export type IReducer<S = any, A extends IAction = IAction> = (state: S, action: A) => S;

// Selector types
export type ISelector<S = any, R = any> = (state: S) => R;

// Dispatch types
export type IDispatch<A extends IAction = IAction> = (action: A) => void;

// Store types
export interface IStore<S = any, A extends IAction = IAction> {
  getState: () => S;
  dispatch: IDispatch<A>;
  subscribe: (listener: () => void) => () => void;
}

// Context types
export interface IContextValue<T = any> {
  state: T;
  dispatch: (action: IAction) => void;
}

// Hook types
export interface IHookConfig<T = any> {
  initialState?: T;
  dependencies?: any[];
  onMount?: () => void | (() => void);
  onUnmount?: () => void;
  onUpdate?: (prevState: T, currentState: T) => void;
}

// Event types
export interface IAppEvent {
  type: string;
  payload?: any;
  timestamp: number;
  source?: string;
}

// Analytics types
export interface IAnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

// Performance types
export interface IPerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Feature flag types
export interface IFeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targetUsers?: string[];
  targetEnvironments?: string[];
}

// A/B test types
export interface IABTest {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    name: string;
    weight: number;
  }>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

// Localization types
export interface ILocale {
  code: string;
  name: string;
  flag?: string;
  isRTL?: boolean;
}

export interface ITranslation {
  key: string;
  value: string;
  locale: string;
}

// Accessibility types
export interface IAccessibilityConfig {
  enableHighContrast: boolean;
  enableLargeText: boolean;
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableReducedMotion: boolean;
}

// Security types
export interface ISecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableContentTypeSniffing: boolean;
  enableFrameOptions: boolean;
}

// Monitoring types
export interface IMonitoringConfig {
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableUserAnalytics: boolean;
  enableCrashReporting: boolean;
  sampleRate: number;
}

// ========================================
// UI COMPONENT TYPES
// ========================================

export interface ISelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

// ========================================
// SPORTS FILTER TYPES
// ========================================

export interface ITeamFilterState {
  searchTerm: string;
  conferenceFilter: string;
  divisionFilter: string;
  franchiseFilter: string;
  sortBy: 'name' | 'city' | 'conference' | 'division';
  sortDirection: 'asc' | 'desc';
}

export interface ITeamFilterOptions {
  conferences: string[];
  divisions: string[];
}

export interface ITeamFiltersProps {
  filters: ITeamFilterState;
  filterOptions: ITeamFilterOptions;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  totalTeams: number;
  filteredTeamsCount: number;
  onUpdateFilter: (key: keyof ITeamFilterState, value: string) => void;
  onClearFilters: () => void;
  onToggleAdvancedFilters: () => void;
  onRefresh: () => void;
}

export interface IPlayerFilterState {
  searchTerm: string;
  positionFilter: string;
  teamFilter: string;
  activeFilter: string;
  countryFilter: string;
  collegeFilter: string;
  sortBy: 'name' | 'position' | 'age' | 'team' | 'experience';
  sortDirection: 'asc' | 'desc';
}

export interface IPlayerFilterOptions {
  positions: string[];
  teams: string[];
  countries: string[];
  colleges: string[];
}

export interface IPlayerFiltersProps {
  filters: IPlayerFilterState;
  filterOptions: IPlayerFilterOptions;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  totalPlayers: number;
  filteredPlayersCount: number;
  onUpdateFilter: (key: keyof IPlayerFilterState, value: string) => void;
  onClearFilters: () => void;
  onToggleAdvancedFilters: () => void;
  onRefresh: () => void;
}

export interface IGameFiltersProps {
  filters: IFilterState;
  filterOptions: IFilterOptions;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  totalGames: number;
  filteredGamesCount: number;
  onUpdateFilter: (key: keyof IFilterState, value: string) => void;
  onClearFilters: () => void;
  onToggleAdvancedFilters: () => void;
  onRefresh: () => void;
}

// ========================================
// USER COMPONENT TYPES
// ========================================

export interface IUserSearchResultCardProps {
  user: IUserSummary;
  currentUserId: string;
  onSendRequest: (friendId: string, refetchStatus?: () => void) => Promise<void>;
  onRemoveFriend: (
    friendshipId: string,
    context?: 'cancel-request' | 'remove-friend'
  ) => Promise<void>;
  loading: boolean;
}

export interface IPendingFriendshipCardProps {
  pending: IFriendship;
  onWithdraw: (friendshipId: string, context?: 'cancel-request' | 'remove-friend') => Promise<void>;
  loading: boolean;
  onSendRequest: (friendId: string) => Promise<void>;
}
