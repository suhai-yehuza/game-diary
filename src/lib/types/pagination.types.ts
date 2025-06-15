import type { FetchMoreQueryOptions, FetchMoreOptions } from '@apollo/client';

export interface IPaginationHookOptions<T> {
  pageSize: number;
  fetchMore: (
    options: FetchMoreQueryOptions<unknown, unknown> & FetchMoreOptions
  ) => Promise<unknown>;
  data?: {
    edges?: Array<{
      node: T;
    }>;
  };
  hasNextPage?: boolean;
  filters?: Record<string, unknown>;
}

export interface IPaginationFetchResult {
  games?: {
    edges?: Array<{
      node: unknown;
    }>;
    pageInfo?: {
      endCursor?: string;
    };
  };
  gameLogs?: {
    edges?: Array<{
      node: unknown;
    }>;
    pageInfo?: {
      endCursor?: string;
    };
  };
}
