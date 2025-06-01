import type { Comment, User, ParentType, ReactionEmojiType } from '@/lib/types/generated/graphql';

export type { Comment };

export type EditingComment = { id: string; content: string };

export interface CommentsSectionProps {
  parentId: string;
  parentType: 'game_log' | 'comment';
  initialExpanded?: boolean;
}

export interface CommentWithUser {
  id: string;
  userId: string;
  parentId: string | null;
  parentType: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: User | null;
}

export interface ReactionWithUser {
  id: string;
  emoji: ReactionEmojiType;
  createdAt: Date;
  updatedAt: Date;
  targetId: string;
  targetType: ParentType;
  userId: string | null;
  user: User | null;
}
