import type * as React from 'react';
import type { ReactNode } from 'react';
import type { ApolloError } from '@apollo/client';
import type DataLoader from 'dataloader';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { User } from '@clerk/nextjs/server';
import type { RedisClient } from './cache.types';
import type * as schema from '@src/lib/db/schema';
import type { ChartData } from '@src/lib/types/chart';
import type { ExtendedGame } from '@src/lib/types/consolidated.types';
import type {
  Reaction,
  Comment,
  CreateGameLogInput,
  UserSummary,
  Game,
  GameLog,
  Team,
} from '@src/lib/types/generated/graphql';

import type { Activity } from './api.types';

export * from './component-props.types';

// Context types
export interface Context {
  user: User | null;
  db: NeonHttpDatabase<typeof schema>;
  loaders?: {
    userLoader?: DataLoader<string, UserSummary>;
    gameLoader?: DataLoader<string, Game>;
    reactionLoader?: DataLoader<string, Reaction>;
    gameLogLoader?: DataLoader<string, GameLog>;
  };
  redis?: RedisClient;
}

// UI Component Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
}

export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export interface SelectProps {
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

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export interface ErrorProps {
  message: string;
  retry?: () => void;
  className?: string;
}

// Component types
export interface ReactionEdge {
  __typename: 'ReactionEdge';
  node: Reaction;
  cursor: string;
}

export interface ReactionsData {
  reactions: {
    edges: ReactionEdge[];
    totalCount: number;
  };
}

export interface ReactionsSectionProps {
  targetId: string;
  targetType: string;
  reactions?: Reaction[];
  totalReactionCount?: number;
  onReactionChange?: () => void;
  className?: string;
}

export interface CommentWithNesting extends Omit<Comment, 'childComments'> {
  depth: number;
  childComments?: {
    edges: Array<{ node: CommentWithNesting }>;
    totalCount: number;
  };
}

export interface CommentItemProps {
  comment: CommentWithNesting;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  refetchComments?: () => void;
  maxDepth?: number;
}

export interface CommentEdge {
  node: Comment;
  __typename: string;
  cursor: string;
}

export interface CommentConnection {
  edges: CommentEdge[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    __typename: string;
  };
}

export interface UserSearchSectionProps {
  className?: string;
}

export interface UserNode {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddress: string;
  imageUrl?: string | null;
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

export type UserEdge = { cursor: string; node: UserNode };

export interface LiveGameEdge {
  node: ExtendedGame;
}

export interface LiveGamesConnection {
  edges: LiveGameEdge[];
}

export interface LiveGamesData {
  liveGames: LiveGamesConnection;
}

export interface GameLogFormProps {
  loading: boolean;
  gamesData?: { games: { edges: { node: ExtendedGame }[] } };
  gamesLoading: boolean;
  defaultValues: Partial<CreateGameLogInput>;
  onSubmit: (data: CreateGameLogInput) => Promise<void>;
  hideGameSelect?: boolean;
}

// Navigation Types
export type NavItem = {
  href: string;
  label: string;
  subItems?: NavItem[];
  icon?: string;
  isNew?: boolean;
  badge?: string | number;
};

// Chart Types
export type StatsChartProps = {
  data: ChartData;
  type: 'line' | 'bar' | 'radar';
  title: string;
  height?: number;
  stacked?: boolean;
};

// Activity Types
export type ActivityTimelineProps = {
  activities: Activity[];
  gameLogs: GameLog[];
  timeFilter?: 'day' | 'week' | 'month' | 'year' | 'all';
};

export type FriendActivityProps = {
  friendId: string;
  activities: Activity[];
};

// Game Log Types
export interface GameLogProps {
  gameLogId: string;
}

export interface GameLogPageProps {
  params: {
    id: string;
  };
}

export interface GameLogActionsProps {
  gameLog: GameLog;
  onSuccess?: () => void;
}

export interface GameLogsSectionProps {
  gameLogs: GameLog[];
  loading: boolean;
  isFetchingMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  onLoadMore: () => void;
  refetch?: () => void;
}

export interface GameLogSearchSectionProps {
  userId?: string;
  initialSearchText?: string;
}

// Input Types
export interface InputFieldProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
}

// Auth Types
export interface AuthModalProps {
  children: ReactNode;
}

// Reaction Types
export interface ReactionDisplayProps {
  targetId: string;
  targetType: string;
}

export interface ReactionPickerProps {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
}

export interface ExtendedReactionDisplayProps extends ReactionDisplayProps {
  reactions?: Reaction[];
  totalReactionCount?: number;
  onReactionChange?: () => void;
}

// Validation Types
export interface GQLValidationError {
  field: string;
  message: string;
}

export interface GameLogInput {
  gameId: string;
  content: string;
  rating?: number;
  tags?: string[];
}

export interface GameLogFormData {
  content: string;
  rating?: number;
  tags?: string[];
}

export interface GameStatsProps {
  game: Game;
  homeTeam: Team;
  awayTeam: Team;
  loading: boolean;
  error: ApolloError | undefined;
}

export interface GameDisplayProps {
  game: Game;
  homeTeam: Team;
  awayTeam: Team;
  loading: boolean;
  error: ApolloError | undefined;
}

export interface GameLogDisplayProps {
  gameLog: GameLog;
  onEdit?: (gameLog: GameLog) => void;
  onDelete?: (gameLog: GameLog) => void;
}

// export interface GameLogFormProps {
//   gameId: string;
//   initialData?: GameLog;
//   onSubmit: (data: CreateGameLogInput) => Promise<void>;
//   onCancel: () => void;
// }

export interface GameListProps {
  games: Game[];
  loading: boolean;
  error: ApolloError | undefined;
  onGameClick?: (game: Game) => void;
}

export interface TeamListProps {
  teams: Team[];
  loading: boolean;
  error: ApolloError | undefined;
  onTeamClick?: (team: Team) => void;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface FilterProps {
  filters: Record<string, unknown>;
  onFilterChange: (filters: Record<string, unknown>) => void;
}

export interface SortProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

// export interface ButtonProps {
//   children: ReactNode;
//   onClick?: () => void;
//   variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
//   size?: 'default' | 'sm' | 'lg' | 'icon';
//   disabled?: boolean;
//   loading?: boolean;
//   type?: 'button' | 'submit' | 'reset';
// }

// export interface InputProps
//   extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
//   value?: string | number;
//   onChange?: (value: string) => void;
//   type?: 'number' | 'search' | 'email' | 'password' | 'text';
//   placeholder?: string;
//   label?: string;
//   error?: string;
//   disabled?: boolean;
//   required?: boolean;
// }

// export interface SelectProps {
//   value?: string | number;
//   onChange?: (value: string | number) => void;
//   options: Array<{ value: string | number; label: string }>;
//   placeholder?: string;
//   label?: string;
//   error?: string;
//   disabled?: boolean;
//   required?: boolean;
// }

export interface CheckboxProps {
  checked: boolean;
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export interface RadioProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: Array<{ value: string | number; label: string }>;
  label?: string;
  disabled?: boolean;
}

export interface TextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}

// export interface CardProps {
//   title?: string;
//   children: ReactNode;
//   footer?: ReactNode;
//   onClick?: () => void;
// }

export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  fallback?: string;
}

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export interface DropdownProps {
  trigger: ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export interface TabsProps {
  tabs: Array<{
    label: string;
    content: ReactNode;
  }>;
  activeTab?: number;
  onChange?: (index: number) => void;
}

export interface AccordionProps {
  items: Array<{
    title: string;
    content: ReactNode;
  }>;
  defaultOpen?: number[];
}

export interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export interface PaginationItemProps {
  page: number;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export interface TableProps {
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

export interface TableRowProps {
  row: Record<string, unknown>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: unknown) => ReactNode;
  }>;
  onClick?: () => void;
}

export interface TableCellProps {
  value: unknown;
  render?: (value: unknown) => ReactNode;
}

export interface TableHeaderProps {
  columns: Array<{
    key: string;
    label: string;
  }>;
  onSort?: (key: string) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TableFooterProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export interface TableEmptyProps {
  message?: string;
}

export interface TableLoadingProps {
  columns: number;
  rows: number;
}

export interface TableErrorProps {
  message: string;
  onRetry?: () => void;
}
