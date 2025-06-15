// From src/lib/graphql/utils.ts, lines 10-24
export interface IEdge<T> {
  cursor: string;
  node: T;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface IConnection<T> {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

export type IConnectionArgs = import('@src/lib/types/resolver.types').IPaginationArgs;

// From src/app/search/utils/game-search.ts, line 8
export type GameQueryResult = import('@apollo/client').ApolloQueryResult<{
  games: { edges: { node: import('@src/lib/types').ISearchGame }[] };
}>;

// From src/app/search/utils/game-search.ts, line 36
export interface IProcessedGameData {
  isLoading: boolean;
  hasError: boolean;
  games: import('@src/lib/types').ISearchGame[];
}

// From scripts/performance/performance-measure.ts and scripts/performance/performance-report.ts, line 18
export interface IPerformanceMetrics {
  timestamp: string;
  buildTime: number;
  bundleSize: {
    total: number;
    pages: Record<string, number>;
    chunks: Record<string, number>;
  };
  dependencies: {
    production: number;
    development: number;
    total: number;
  };
  typecheck: {
    time: number;
    errors: number;
  };
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

// From scripts/performance/performance-report.ts, line 42
export interface IPerformanceTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'degrading' | 'stable';
}

// From scripts/db/drizzle-migrate.ts, line 37
export interface IRequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string | Buffer;
  signal?: AbortSignal;
}

// From scripts/utils/manage-deps.ts, line 8
export interface IPackage {
  name: string;
  version: string;
  latest?: string;
  type?: string;
  wanted?: string;
}

// From scripts/utils/manage-deps.ts, line 16
export interface IOutdatedPackage extends IPackage {
  current: string;
  latest: string;
  type: string;
  url: string;
}

// From lib/core/logger.ts, line 7
export interface ILoggerConfig {
  level: import('@lib/core/logger').LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
  prefix?: string;
  enableFileInfo: boolean;
}

// From lib/core/logger.ts, line 22
export interface IGraphQLErrorDetails {
  message?: string;
  location?: unknown;
  path?: string | string[];
  extensions?: Record<string, unknown>;
}

// From tests/e2e/utils/auth-utils.ts, line 3
export interface IClerkMock {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddresses: Array<{ emailAddress: string }>;
    imageUrl: string;
  };
  session: {
    id: string;
    token: string;
  };
  signOut: () => Promise<void>;
  getToken: () => Promise<string>;
}

// From tests/e2e/utils/auth-utils.ts, line 15
export type IExtendedWindow = Window & {
  Clerk?: IClerkMock;
};

// From src/lib/utils/time.ts, line 2
export type DateFields = {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// From src/lib/db/schema/shared-types.ts, line 1
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// From src/lib/db/schema/shared-types.ts, line 10
export type SoftDeletableTable = {
  id: { data: string; driverData: string };
  deletedAt: { data: Date | null; driverData: Date | null };
};

// From src/lib/db/schema/base-types.ts, line 11
export type BaseTable = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// From src/lib/db/schema/base-types.ts, line 18
export type BaseTableWithColumns = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: string | number | boolean | Date | null | undefined;
};

// From src/lib/db/schema/base-types.ts, line 33
export type BaseModel = import('drizzle-orm').InferModel<
  typeof import('../db/schema/base-types').baseTable
>;

// From src/app/protected/user/user-profile-layout.tsx
export interface IUserProfileLayoutProps {
  /** The title to display at the top of the profile page */
  title: string;
  /** The content to render inside the layout */
  children: React.ReactNode;
}

// From src/app/protected/user/components/error-boundary.tsx
export interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// From src/app/protected/user/components/friends/activity-timeline.tsx
export interface IActivityItem {
  id: string;
  title: string;
  description: string;
  type: 'game_logged' | 'friend_added' | 'achievement';
  timestamp: string;
  gameTitle?: string;
  score?: string | number;
  details?: Record<string, string | number>;
  user: {
    username: string;
    avatar?: string;
  };
  achievement?: string;
}

export interface IActivityTimelineProps {
  activities: IActivityItem[];
  isLoading?: boolean;
}

// From src/app/protected/user/components/friends/friend-activity.tsx
export interface IFriendActivityProps {
  activities: IActivityItem[];
  isLoading?: boolean;
}

// From src/app/protected/user/components/game-logs/game-logs-section.tsx
export interface IGameLogsSectionProps {
  userId: string;
  currentUserId: string;
}

// From src/app/protected/user/components/game-logs/game-log-modal.tsx
export interface IGameLogModalProps {
  mode: 'create' | 'update';
  gameId: string;
  gameLog: import('@src/lib/types/game-log.types').IGameLogFormData;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// From src/app/protected/user/components/profile/user-header.tsx
export interface IUserHeaderProps {
  user: import('@src/lib/types/generated/graphql').DbUser;
  isOwnProfile: boolean;
  currentUserId: string;
  stats: {
    totalGames: number;
    totalFriends: number;
    totalHours: number;
  };
  onGameLogUpdate?: () => void;
  onFriendshipUpdate?: () => void;
}

// From src/app/protected/user/user-profile.tsx
export interface IUserProfileProps {
  targetUserId: string;
}

// From src/app/protected/user/components/friends/user-search.tsx
export interface IUserSearchProps {
  onUserSelect: (userId: string) => void;
  excludeIds?: string[];
  users?: import('@src/lib/types/social.types').IFriend[];
}

// From src/app/protected/user/components/friends/friend-profile.tsx
export interface IFriendProfileProps {
  friend: {
    id: string;
    username: string;
    avatar: string;
  };
}

// From src/app/protected/user/components/friends/friend-activity.tsx
export interface IActivity {
  id: string;
  type: 'game_logged' | 'friend_added' | 'achievement';
  user: import('@src/lib/types/social.types').IFriend;
  description: string;
  timestamp: string;
  gameTitle?: string;
  achievement?: string;
}

// From src/app/protected/user/components/game-logs/hooks/use-create-game-log.tsx
export interface IUseCreateGameLogProps {
  onSuccess?: () => void;
}

// From src/app/protected/user/components/profile/friendship-management.tsx
export interface IFriendshipManagementProps {
  currentUserId: string | null;
  targetUserId: string;
  friendship: import('@src/lib/types/generated/graphql').Friendship | null;
  onFriendshipUpdate: () => void;
}
