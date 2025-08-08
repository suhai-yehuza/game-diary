/**
 * Comment Types
 * TypeScript interfaces for comment functionality
 */

import type { Comment as GqlComment, ParentType } from './generated/graphql';

// Base Comment interface
export interface IComment {
  id: string;
  content: string;
  user_id: string;
  parent_id: string;
  parent_type: ParentType;
  depth: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  totalChildCommentCount?: number;
  totalReactionCount?: number;
  user: {
    id: string;
    username: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    user: {
      id: string;
      username: string;
      first_name?: string | null;
      last_name?: string | null;
      image_url?: string | null;
    };
  }>;
  childComments?: IComment[];
}

// Comment options for hooks
export interface ICommentsOptions {
  filters?: {
    parentId?: string;
    parentType?: ParentType;
    userId?: string;
    search?: string;
  };
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
}

// Comment response from GraphQL
export interface ICommentsResponse {
  comments: {
    edges: Array<{
      cursor: string;
      node: IComment;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
    totalCount: number;
  };
}

// Comment creation input
export interface ICreateCommentInput {
  content: string;
  parentId: string;
  parentType: ParentType;
}

// Comment update input
export interface IUpdateCommentInput {
  content: string;
}

// Comment mutation response
export interface ICommentMutationResponse {
  comment?: IComment | null;
  success?: boolean;
  errors: Array<{
    message: string;
    code: string;
    field?: string;
  }>;
}

// Comment component props
export interface ICommentProps {
  comment: IComment;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  showReplies?: boolean;
  maxDepth?: number;
}

export interface ICommentListProps {
  comments: IComment[];
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  loading?: boolean;
  showLoadMore?: boolean;
}

export interface ICommentFormProps {
  parentId: string;
  parentType: ParentType;
  onSuccess?: (comment: IComment) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  commentId?: string;
  initialContent?: string;
}

export interface ICommentEditFormProps {
  comment: IComment;
  onSuccess?: (comment: IComment) => void;
  onCancel?: () => void;
}

// Comment state for UI
export interface ICommentState {
  isEditing: boolean;
  isReplying: boolean;
  isDeleting: boolean;
  showReplies: boolean;
  expanded: boolean;
}
