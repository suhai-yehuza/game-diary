// Types file: hooks.types.ts
import type { IGamesApiResponse } from './externalApi.types';

// Async state types
export interface IAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface IUseAsyncStateReturn<T> {
  state: IAsyncState<T>;
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  execute: (asyncFn: () => Promise<T>) => Promise<T | undefined>;
}

export interface IPaginatedState<T> extends IAsyncState<T[]> {
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface IUsePaginatedStateReturn<T> {
  state: IPaginatedState<T>;
  setData: (data: T[], pageInfo?: IPaginatedState<T>['pageInfo'], totalCount?: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  appendData: (newData: T[], pageInfo?: IPaginatedState<T>['pageInfo']) => void;
  execute: (
    asyncFn: () => Promise<{
      data: T[];
      pageInfo: IPaginatedState<T>['pageInfo'];
      totalCount: number;
    }>
  ) => Promise<T[] | undefined>;
}

// Error handler types
export interface IErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
  retry?: () => void;
}

export interface ISuccessState {
  isSuccess: boolean;
  message?: string;
  data?: any;
}

export interface IUseErrorHandlerReturn {
  error: IErrorState;
  setError: (error: Error | string) => void;
  clearError: () => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>;
  handleSyncError: <T>(syncFn: () => T) => T | undefined;
}

// Types for use-live-games hook
export interface IUseLiveGamesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialData?: IGamesApiResponse;
}

// Types for use-search hook
export interface IUseSearchOptions {
  debounceMs?: number;
  searchPath?: string;
  adminSearchPath?: string;
}

// Types for friendship hooks
export interface IFriendship {
  id: string;
  initiator?: IUserSummaryBasic;
  recipient?: IUserSummaryBasic;
  status: string;
  created_at: string;
}

export interface IFriendshipFilters {
  status?: string;
  userId?: string;
  friendId?: string;
  isInitiator?: boolean;
  isRecipient?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  orderBy?: string;
}

export interface IFriendshipStatus {
  status: string;
  friendshipId?: string;
  isInitiator: boolean;
}

export interface IUserSummaryBasic {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

export interface IUserSearchFilters {
  role?: string;
  isActive?: boolean;
}

// GraphQL response types for friendship hooks
export interface IUserFriendshipsResponse {
  userFriendships: {
    edges: Array<{
      node: IFriendship;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string;
    };
    totalCount: number;
  };
}

export interface IFriendshipRequestsResponse {
  friendshipRequests: {
    edges: Array<{
      node: IFriendship;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string;
    };
    totalCount: number;
  };
}

export interface IFriendshipStatusResponse {
  friendshipStatus: {
    status: string;
    friendshipId?: string;
    isInitiator: boolean;
  };
}

export interface IGraphQLSearchUsersResponse {
  searchUsers: {
    edges: Array<{
      node: IUserSummaryBasic;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string;
    };
    totalCount: number;
  };
}

// GraphQL mutation response types
export interface ISendFriendRequestResponse {
  sendFriendRequest: {
    errors: Array<{ message: string; code: string; field?: string }>;
    friendship?: {
      id: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface IAcceptFriendRequestResponse {
  acceptFriendRequest: {
    errors: Array<{ message: string; code: string; field?: string }>;
    friendship?: {
      id: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface IRejectFriendRequestResponse {
  rejectFriendRequest: {
    errors: Array<{ message: string; code: string; field?: string }>;
    friendship?: {
      id: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface IRemoveFriendResponse {
  removeFriend: {
    success: boolean;
    errors: Array<{ message: string; code: string; field?: string }>;
  };
}

// Game Logs Types
export interface IFriendsGameLogsShape {
  edges: Array<{ node: unknown }>;
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
}

// Type for game logs without comments and reactions
export type GqlGameLogNoComments = Omit<
  import('./generated/graphql').GameLog,
  'comments' | 'reactions'
>;

// Hook option interfaces
export interface ITopGameLogsOptions {
  limit?: number;
  skip?: boolean;
}

export interface IUseNBATeamsOptions {
  limit?: number;
  skip?: boolean;
  forceRealData?: boolean;
}

export interface IUseNBAPlayersOptions {
  limit?: number;
  skip?: boolean;
  forceRealData?: boolean;
  teamId?: string;
  season?: string;
}

// ========================================
// FRIENDSHIP COMPONENT TYPES
// ========================================

export interface IFriendshipCardProps {
  friendship: IFriendship;
  currentUserId: string;
  onRemove: (friendshipId: string) => Promise<void>;
  loading: boolean;
}

export interface IFriendRequestCardProps {
  request: IFriendship;
  onAccept: (friendshipId: string) => Promise<void>;
  onReject: (friendshipId: string) => Promise<void>;
  loading: boolean;
}

export interface ILatestGamesOptions {
  limit?: number;
  skip?: boolean;
  userId?: string;
  forceRealData?: boolean;
  seasons?: string[];
}

export interface IFilterState {
  searchTerm: string;
  statusFilter: string;
  seasonFilter: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';
  customStartDate: string;
  customEndDate: string;
  arenaFilter: string;
  teamFilter: string;
  sortBy: 'date' | 'status' | 'arena' | 'team';
  sortDirection: 'asc' | 'desc';
}

export interface IFilterOptions {
  arenas: string[];
  teams: string[];
  seasons: number[];
  statuses: string[];
}

export interface IEnhancedPlayerFilterState {
  searchTerm: string;
  positionFilter: string;
  teamFilter: string;
  activeFilter: string;
  collegeFilter: string;
  countryFilter: string;
  sortBy: 'name' | 'position' | 'team' | 'age' | 'experience';
  sortDirection: 'asc' | 'desc';
}

export interface IEnhancedPlayerFilterOptions {
  positions: string[];
  teams: string[];
  colleges: string[];
  countries: string[];
}
