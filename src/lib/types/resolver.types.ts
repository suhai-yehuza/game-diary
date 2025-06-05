import type { Context } from '@/lib/types/component.types';

// Common resolver context
export type ResolverContext = Context;

// Common pagination args used across all resolvers
export interface PaginationArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

// Common filter args pattern
export interface FilterArgs {
  filters?: {
    [key: string]: unknown;
  };
}

// User-specific filter types
export interface UserFilters {
  search?: string;
  role?: string;
}

export interface UserSearchFilters {
  hasGameLogs?: boolean | null;
  minGameLogs?: number | null;
  joinedAfter?: Date | null;
  joinedBefore?: Date | null;
  isVerified?: boolean | null;
  friendshipStatus?: string | null;
  orderBy?: string | null;
}

// Player-specific filter types
export interface PlayerFilters {
  search?: string;
  teamId?: string;
  position?: string;
  active?: boolean;
}

// Team-specific filter types
export interface TeamFilters {
  search?: string;
  conference?: string;
  division?: string;
  city?: string;
  code?: string;
}
