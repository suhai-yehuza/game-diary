/**
 * Hook Types
 * Types related to custom hooks and their return values
 */

import type { ApolloError, ApolloQueryResult, OperationVariables } from '@apollo/client';

import type { Game, DbUser, Friendship, FriendshipStatus } from './generated/graphql';

export interface UseCreateGameLogProps {
  onSuccess?: () => void;
}

export interface UseGameDataProps {
  initialSeason?: number;
  initialFilters?: {
    season?: number;
    status?: string;
  };
}

export interface ProcessedGames {
  live: Game[];
  scheduled: Game[];
  completed: Game[];
}

export interface UseGameDataReturn {
  games: Game[];
  processedGames: ProcessedGames;
  loading: boolean;
  error: ApolloError | null;
  hasShownInitialLoad: boolean;
  isFetchingMore: boolean;
  currentSeason: number;
  hasMoreSeasons: boolean;
  showUpcomingGames: boolean;
  setShowUpcomingGames: (show: boolean) => void;
  handleLoadMore: () => Promise<void>;
  canLoadMore: boolean;
}

export interface PaginationHookOptions<T> {
  pageSize: number;
  fetchMore: (options: {
    variables: OperationVariables;
    updateQuery: (prev: unknown, options: { fetchMoreResult?: PaginationFetchResult }) => unknown;
  }) => Promise<ApolloQueryResult<unknown>>;
  data?: { edges?: Array<{ node: T; cursor: string }> };
  hasNextPage?: boolean;
  filters: Record<string, unknown>;
}

export interface PaginationFetchResult {
  games?: {
    edges: Array<{ node: unknown }>;
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
  };
  gameLogs?: {
    edges: Array<{ node: unknown }>;
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
  };
}

export interface FilterConfig {
  [key: string]: {
    defaultValue: string | number;
    type?: 'string' | 'number' | 'boolean';
  };
}

export interface UseSearchFiltersOptions {
  filterConfig: FilterConfig;
  additionalFilters?: Record<string, unknown>;
}

export interface UseUserProfileProps {
  targetUserId?: string;
}

export interface UseUserProfileReturn {
  targetUser: DbUser | null;
  dbUserId: string | null;
  currentUserDbId: string | null;
  friendshipStatus: FriendshipStatus | null | 'loading';
  currentFriendship: Friendship | null;
  isLoading: boolean;
  isOwnProfile: boolean;
  handleSendFriendRequest: () => void;
  handleAcceptFriendRequest: () => void;
  handleRemoveFriend: () => void;
  sendingRequest: boolean;
  acceptingRequest: boolean;
  removingFriend: boolean;
}
