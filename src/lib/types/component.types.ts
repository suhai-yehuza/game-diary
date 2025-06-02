import type { ExtendedGame } from '@/lib/types/game.types';
import type { Reaction, Comment, CreateGameLogInput } from '@/lib/types/generated/graphql';

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
