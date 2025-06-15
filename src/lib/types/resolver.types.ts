import type { ISortDirection } from './common.types';
import type { IDatabaseClient } from './database.types';

// Resolver Context Types
export interface IResolverContext {
  db: IDatabaseClient;
  user?: {
    id: string;
    email: string;
  };
}

// Filter Types
export interface IFilterArgs {
  search?: string;
  sortBy?: string;
  sortDirection?: ISortDirection;
  [key: string]: unknown;
}

export interface IPaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface IUserFilters extends IFilterArgs {
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

export interface IUserSearchFilters extends IFilterArgs {
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

export interface IPlayerFilters extends IFilterArgs {
  team?: string;
  teamId?: string;
  position?: string;
  active?: boolean;
  status?: string;
}

export interface ITeamFilters extends IFilterArgs {
  conference?: string;
  division?: string;
  search?: string;
  city?: string;
  code?: string;
}
