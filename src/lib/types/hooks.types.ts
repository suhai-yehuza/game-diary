// Types file: hooks.types.ts
import type { IGamesApiResponse } from '@/lib/types/externalApi.types';

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
  initiator?: IUserSummary;
  recipient?: IUserSummary;
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

export interface IUserSummary {
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

export interface ISearchUsersResponse {
  searchUsers: {
    edges: Array<{
      node: IUserSummary;
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
    success: boolean;
    friendshipId?: string;
    message?: string;
  };
}

export interface IAcceptFriendRequestResponse {
  acceptFriendRequest: {
    success: boolean;
    friendshipId?: string;
    message?: string;
  };
}

export interface IRejectFriendRequestResponse {
  rejectFriendRequest: {
    success: boolean;
    friendshipId?: string;
    message?: string;
  };
}

export interface IRemoveFriendResponse {
  removeFriend: {
    success: boolean;
    friendshipId?: string;
    message?: string;
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
  import('@/lib/types/generated/graphql').GameLog,
  'comments' | 'reactions'
>;
