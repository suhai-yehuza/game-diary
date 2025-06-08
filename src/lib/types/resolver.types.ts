import type { SortDirection } from './common.types';
import type { DatabaseClient } from './database.types';

// Resolver Context Types
export interface ResolverContext {
  db: DatabaseClient;
  user?: {
    id: string;
    email: string;
  };
}

// Filter Types
export interface FilterArgs {
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  [key: string]: unknown;
}

export interface PaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface UserFilters extends FilterArgs {
  search?: string;
  status?: string;
  role?: string;
  joinedAfter?: Date;
  joinedBefore?: Date;
  isVerified?: boolean;
  hasGameLogs?: boolean;
  minGameLogs?: number;
  orderBy?: string;
}

export interface UserSearchFilters extends FilterArgs {
  query?: string;
  status?: string;
  role?: string;
  joinedAfter?: Date;
  joinedBefore?: Date;
  isVerified?: boolean;
  hasGameLogs?: boolean;
  minGameLogs?: number;
  orderBy?: string;
}

export interface PlayerFilters extends FilterArgs {
  team?: string;
  teamId?: string;
  position?: string;
  active?: boolean;
  status?: string;
}

export interface TeamFilters extends FilterArgs {
  conference?: string;
  division?: string;
  search?: string;
  city?: string;
  code?: string;
}
