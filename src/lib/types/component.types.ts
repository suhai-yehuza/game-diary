import type { BaseContext } from '@apollo/server';
import type DataLoader from 'dataloader';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';
import type { ExtendedGame } from '@/lib/types/consolidated.types';
import type {
  Reaction,
  Comment,
  CreateGameLogInput,
  UserSummary,
  Game,
} from '@/lib/types/generated/graphql';

import type { RedisClient } from './cache.types';

export * from './component-props.types';

// Context types
export interface Context extends BaseContext {
  db: NeonHttpDatabase<typeof schema>;
  redis?: RedisClient;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    imageUrl: string;
  };
  loaders?: {
    reaction?: DataLoader<string, Reaction>;
    user?: DataLoader<string, UserSummary>;
    game?: DataLoader<string, Game>;
  };
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
