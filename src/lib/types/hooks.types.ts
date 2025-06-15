/**
 * Hook Types
 * Types related to custom hooks and their return values
 */

import type { OperationVariables, ApolloQueryResult } from '@apollo/client';

import type { IGame } from './game.types';
import type { Game, DbUser, Friendship, FriendshipStatus } from './generated/graphql';

export interface IUseCreateGameLogProps {
  onSuccess?: () => void;
}

export interface IUseGameDataProps {
  initialSeason?: number;
  initialFilters?: Record<string, unknown>;
}

export interface IProcessedGames {
  live: Game[];
  scheduled: Game[];
  completed: Game[];
}

export interface IUseGameDataReturn {
  games: IGame[];
  processedGames: {
    live: IGame[];
    scheduled: IGame[];
    completed: IGame[];
  };
  loading: boolean;
  error: Error | null;
  hasShownInitialLoad: boolean;
  isFetchingMore: boolean;
  currentSeason: number;
  hasMoreSeasons: boolean;
  showUpcomingGames: boolean;
  setShowUpcomingGames: (show: boolean) => void;
  handleLoadMore: () => Promise<void>;
  canLoadMore: boolean;
}

export interface IPaginationHookOptions<T> {
  pageSize: number;
  fetchMore: (options: {
    variables: OperationVariables;
    updateQuery: (prev: unknown, options: { fetchMoreResult?: IPaginationFetchResult }) => unknown;
  }) => Promise<ApolloQueryResult<unknown>>;
  data?: { edges?: Array<{ node: T; cursor: string }> };
  hasNextPage?: boolean;
  filters: Record<string, unknown>;
}

export interface IPaginationFetchResult {
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

export interface IFilterConfig {
  [key: string]: {
    defaultValue: string | number;
    type?: 'string' | 'number' | 'boolean';
  };
}

export interface IUseSearchFiltersOptions {
  filterConfig: IFilterConfig;
  additionalFilters?: Record<string, unknown>;
}

export interface IUseUserProfileProps {
  targetUserId?: string;
}

export interface IUseUserProfileReturn {
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
