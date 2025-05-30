/**
 * Consolidated types from various type files
 * This file combines and deduplicates types from:
 * - pagination.types
 * - game-utility.types
 * - api-request.types
 * - monitoring.types
 * - component.types
 * - api-response.types
 * - query-mutation.types
 * - hook.types
 * - team-statistics.types
 * - season.types
 * - component-props.types
 */

import type { FetchResult, DocumentNode } from '@apollo/client';
import { ApolloCache } from '@apollo/client';
import { ChartData } from 'chart.js';

// Component Props Types
import type { Activity } from './activity.types';
import type { Friend, FriendGroup } from './friend.types';
import type { SearchGame, GameFilters } from './game.types';
import type { GameLog, Game, Reaction } from './generated/graphql';

// API Response Types
export interface PlayerApiResponse {
  response: {
    get: string;
    parameters: {
      team: string;
      season: string;
    };
    errors: string[];
    results: number;
    response: Array<{
      id: number;
      firstname: string;
      lastname: string;
      birth?: {
        date: string | null;
        country: string | null;
      };
      nba?: {
        start: number;
        pro: number;
      };
      height?: {
        feets: string | null;
        inches: string | null;
        meters: string | null;
      };
      weight?: {
        pounds: string | null;
        kilograms: string | null;
      };
      college: string | null;
      affiliation: string | null;
      leagues?: {
        standard?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
        vegas?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
        utah?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
      };
    }>;
  };
}

export type SeasonApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: number[];
};

export type TeamApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: Array<{
    id: number;
    name: string;
    nickname: string;
    code: string;
    city: string;
    logo: string;
    allStar: boolean;
    nbaFranchise: boolean;
    leagues: {
      standard?: {
        conference: string | null;
        division: string | null;
      };
    };
  }>;
};

export interface PlayerStatistics {
  player: {
    id: number;
    firstName: string;
    lastName: string;
  };
  team?: { id: number | string };
  min?: string | number;
  points?: number;
  totReb?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  pFouls?: number;
  fgm?: number;
  fga?: number;
  tpm?: number;
  tpa?: number;
  ftm?: number;
  fta?: number;
  plusMinus?: number;
}

// Team Statistics Types
export type TeamStatistics = {
  team: {
    id: number | string;
    name?: string;
    [key: string]: unknown;
  };
  statistics: Array<{
    fastBreakPoints?: number;
    pointsInPaint?: number;
    biggestLead?: number;
    secondChancePoints?: number;
    pointsOffTurnovers?: number;
    longestRun?: number;
    fgm?: number;
    fga?: number;
    fgp?: number;
    ftm?: number;
    fta?: number;
    ftp?: number;
    tpm?: number;
    tpa?: number;
    tpp?: number;
    offReb?: number;
    defReb?: number;
    totReb?: number;
    assists?: number;
    pFouls?: number;
    steals?: number;
    turnovers?: number;
    blocks?: number;
    plusMinus?: number;
    min?: string;
    points?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

// Season Types
export type DBSeason = {
  id: number;
  year: number;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isPlayoffs: boolean;
};

export type GameCardProps = {
  game: SearchGame;
  className?: string;
  index?: number;
  imageErrors?: Set<string>;
  onImageError?: (gameId: string) => void;
};

export type GamesListProps = {
  games: Game[];
  loading?: boolean;
  initialFilters?: GameFilters;
  onGameSelect?: (game: Game) => void;
};

export type FriendProfileProps = {
  friend?: Friend;
  friendId?: string;
  onClose?: () => void;
};

export type FriendGroupsProps = {
  groups: FriendGroup[];
  friends?: Friend[];
  onGroupUpdate?: (group: FriendGroup) => void;
};

export type FriendRequestButtonProps = {
  targetUserId: string;
  className?: string;
};

export type GetFriendshipsForUserResponse = {
  friendships: import('./generated/graphql').Friendship[];
};

export type ActivityTimelineProps = {
  activities: Activity[];
  gameLogs: GameLog[];
  timeFilter?: import('./activity.types').TimeFilter;
};

export type FriendActivityProps = {
  friendId: string;
  activities: Activity[];
};

export type TeamCounts = { [key: string]: number };

export type ExtendedGame = Game & { extended?: boolean };

export type NavItem = {
  href: string;
  label: string;
  subItems?: NavItem[];
  icon?: string;
  isNew?: boolean;
  badge?: string | number;
};

// Hook Types
export interface UseMutationWithOptimisticUpdateOptions<TData, TVariables> {
  mutation: DocumentNode;
  optimisticResponse?: (variables: TVariables) => TData;
  onCompleted?: (data: TData) => void;
  onError?: (error: Error) => void;
  update?: (cache: ApolloCache<TData>, data: FetchResult<TData>) => void;
  validate?: (variables: TVariables) => GQLValidationError[];
  onSuccess?: (data: TData) => void;
}

export interface GQLValidationError {
  field: string;
  message: string;
}

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  enabled?: boolean;
  threshold?: number;
  maxPullDistance?: number;
}

export interface UseSwipeActionsOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  actions?: {
    left?: () => void;
    right?: () => void;
  };
  maxSwipeDistance?: number;
}

// API Request Types
export type ExtendedNextApiRequest = import('next').NextApiRequest & {
  user?: {
    id: string;
    email: string;
  };
  selectedFields?: string[];
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
};

// Pagination Types
export interface PaginationInput {
  page: number;
  limit: number;
}

// Game Utility Types
export interface PlayerFilters {
  team?: string;
  position?: string;
  status?: string;
}

export interface TeamSortInput {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Component Types
export interface CreateGameLogModalProps {
  gameId?: string;
  onSuccess?: () => void;
}

export interface UpdateGameLogModalProps {
  gameLog: {
    id: string;
    watchedSetting: string;
    watchedDate?: string;
    watchedLocation?: string;
    rating?: number;
    notes?: string;
    tags?: string[];
    classification: string;
  };
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export type StatsChartProps = {
  data: ChartData;
  type: 'line' | 'bar' | 'radar';
  title: string;
  height?: number;
  stacked?: boolean;
};

export type ReactionDisplayProps = {
  targetId: string;
  targetType: string;
};

export type ReactionPickerProps = {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
};

export interface MonitoringMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  queryPerformance: {
    [key: string]: {
      count: number;
      totalTime: number;
      avgTime: number;
    };
  };
  apiCalls: {
    [key: string]: number;
  };
  cacheMetrics: {
    hits: number;
    misses: number;
    size: number;
  };
  apiMetrics: {
    [key: string]: {
      count: number;
      success: number;
      failure: number;
      avgResponseTime: number;
    };
  };
  errors: {
    [key: string]: number;
  };
}
