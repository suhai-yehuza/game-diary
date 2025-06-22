import type { ApolloError } from '@apollo/client';
import type { User } from '@clerk/nextjs/server';
import type DataLoader from 'dataloader';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { ReactNode } from 'react';

import type { Cache } from '@src/lib/cache';
import type * as schema from '@src/lib/db/schema';
import type { IExtendedGame } from '@src/lib/types';
import type { IChartData } from '@src/lib/types/chart';
import type {
  GameLog,
  Team,
  Reaction,
  Comment,
  Game,
  UserSummary,
  CreateGameLogInput,
} from '@src/lib/types/generated/graphql';

import type { IActivity } from './api.types';

export * from './component-props.types';

// Context types
export interface IContext {
  user: User | null;
  db: NeonHttpDatabase<typeof schema>;
  loaders?: {
    userLoader?: DataLoader<string, UserSummary>;
    gameLoader?: DataLoader<string, Game>;
    reactionLoader?: DataLoader<string, Reaction>;
    gameLogLoader?: DataLoader<string, GameLog>;
  };
  redis?: Cache;
}

// UI Component Types
export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
}

export interface ISelectProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: Array<{
    label: string;
    value: string | number;
  }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface ICardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export interface ILoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export interface IErrorProps {
  message: string;
  retry?: () => void;
  className?: string;
}

// Component types
export interface IReactionEdge {
  __typename: 'ReactionEdge';
  node: Reaction;
  cursor: string;
}

export interface IReactionsData {
  reactions: {
    edges: IReactionEdge[];
    totalCount: number;
  };
}

export interface IReactionsSectionProps {
  targetId: string;
  targetType: string;
  reactions?: Reaction[];
  totalReactionCount?: number;
  onReactionChange?: () => void;
  className?: string;
}

export interface ICommentWithNesting extends Omit<Comment, 'childComments'> {
  depth: number;
  childComments?: {
    edges: Array<{ node: ICommentWithNesting }>;
    totalCount: number;
  };
}

export interface ICommentItemProps {
  comment: ICommentWithNesting;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  refetchComments?: () => void;
  maxDepth?: number;
}

export interface ICommentEdge {
  node: Comment;
  __typename: string;
  cursor: string;
}

export interface ICommentConnection {
  edges: ICommentEdge[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    __typename: string;
  };
}

export interface IUserSearchSectionProps {
  className?: string;
}

export interface IUserNode {
  id: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  emailAddress: string;
  image_url?: string | null;
  createdAt: string;
  gameLogs?: { id: string }[];
  initiatedFriendships?: {
    id: string;
    status: string;
    recipient: {
      id: string;
    };
  }[];
  friendships?: {
    id: string;
    status: string;
    initiator: {
      id: string;
    };
  }[];
}

export interface ILiveGameEdge {
  node: IExtendedGame;
}

export interface ILiveGamesConnection {
  edges: ILiveGameEdge[];
}

export interface ILiveGamesData {
  liveGames: ILiveGamesConnection;
}

export interface IGameLogFormProps {
  loading: boolean;
  gamesData?: { games: { edges: { node: IExtendedGame }[] } };
  gamesLoading: boolean;
  defaultValues: Partial<CreateGameLogInput>;
  onSubmit: (data: CreateGameLogInput) => Promise<void>;
  hideGameSelect?: boolean;
}

// Navigation Types
export interface INavItem {
  href: string;
  label: string;
  subItems?: INavItem[];
  icon?: string;
  isNew?: boolean;
  badge?: string | number;
}

// Chart Types
export interface IStatsChartProps {
  data: IChartData;
  type: 'line' | 'bar' | 'radar';
  title: string;
  height?: number;
  stacked?: boolean;
}

// Activity Types
export interface IActivityTimelineProps {
  activities: IActivity[];
  gameLogs: GameLog[];
  timeFilter?: 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface IFriendActivityProps {
  friendId: string;
  activities: IActivity[];
}

// Game Log Types
export interface IGameLogProps {
  gameLogId: string;
}

export interface IGameLogPageProps {
  params: {
    id: string;
  };
}

export interface IGameLogActionsProps {
  gameLog: GameLog;
  onSuccess?: () => void;
}

export interface IGameLogsSectionProps {
  gameLogs: GameLog[];
  loading: boolean;
  isFetchingMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  onLoadMore: () => void;
  refetch?: () => void;
}

export interface IGameLogSearchSectionProps {
  userId?: string;
  initialSearchText?: string;
}

// Auth Types
export interface IAuthModalProps {
  children: ReactNode;
}

// Reaction Types
export interface IReactionDisplayProps {
  targetId: string;
  targetType: string;
}

export interface IReactionPickerProps {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
}

export interface IExtendedReactionDisplayProps extends IReactionDisplayProps {
  reactions?: Reaction[];
  totalReactionCount?: number;
  onReactionChange?: () => void;
}

// Validation Types
export interface IGQLValidationError {
  field: string;
  message: string;
}

export interface IGameLogInput {
  gameId: string;
  content: string;
  rating?: number;
  tags?: string[];
}

export interface IGameLogFormData {
  content: string;
  rating?: number;
  tags?: string[];
}

export interface IGameStatsProps {
  game: Game;
  homeTeam: Team;
  awayTeam: Team;
  loading: boolean;
  error: ApolloError | undefined;
}

export interface IGameDisplayProps {
  game: Game;
  homeTeam: Team;
  awayTeam: Team;
  loading: boolean;
  error: ApolloError | undefined;
}

export interface IGameLogDisplayProps {
  gameLog: GameLog;
  onEdit?: (gameLog: GameLog) => void;
  onDelete?: (gameLog: GameLog) => void;
}

export interface IGameListProps {
  games: Game[];
  loading: boolean;
  error: ApolloError | undefined;
  onGameClick?: (game: Game) => void;
}

export interface ITeamListProps {
  teams: Team[];
  loading: boolean;
  error: ApolloError | undefined;
  onTeamClick?: (team: Team) => void;
}

export interface ISearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export interface IPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface IFilterProps {
  filters: Record<string, unknown>;
  onFilterChange: (filters: Record<string, unknown>) => void;
}

export interface ISortProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ILoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface IToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export interface ICheckboxProps {
  checked: boolean;
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export interface IRadioProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: Array<{ value: string | number; label: string }>;
  label?: string;
  disabled?: boolean;
}

export interface ITextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}

export interface IBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export interface IAvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  fallback?: string;
}

export interface ITooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export interface IDropdownProps {
  trigger: ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export interface ITabsProps {
  tabs: Array<{
    label: string;
    content: ReactNode;
  }>;
  activeTab?: number;
  onChange?: (index: number) => void;
}

export interface IAccordionProps {
  items: Array<{
    title: string;
    content: ReactNode;
  }>;
  defaultOpen?: number[];
}

export interface IBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export interface IPaginationItemProps {
  page: number;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export interface ITableProps {
  columns: Array<{
    key: string;
    label: string;
    render?: (value: unknown) => ReactNode;
  }>;
  data: Record<string, unknown>[];
  loading?: boolean;
  error?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
}

export interface ITableRowProps {
  row: Record<string, unknown>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: unknown) => ReactNode;
  }>;
  onClick?: () => void;
}

export interface ITableCellProps {
  value: unknown;
  render?: (value: unknown) => ReactNode;
}

export interface ITableHeaderProps {
  columns: Array<{
    key: string;
    label: string;
  }>;
  onSort?: (key: string) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ITableFooterProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export interface ITableEmptyProps {
  message?: string;
}

export interface ITableLoadingProps {
  columns: number;
  rows: number;
}

export interface ITableErrorProps {
  message: string;
  onRetry?: () => void;
}

export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}
