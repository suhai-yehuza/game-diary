import type { Comment, User, ParentType, ReactionEmojiType } from '@/lib/types/generated/graphql';

export type { Comment };

export type EditingComment = { id: string; content: string };

export interface CommentsSectionProps {
  parent_id: string;
  parent_type: string;
}

export interface CommentWithUser {
  id: string;
  user_id: string;
  parent_id: string | null;
  parent_type: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  user: User | null;
}

export interface ReactionWithUser {
  id: string;
  emoji: ReactionEmojiType;
  created_at: Date;
  updated_at: Date;
  target_id: string;
  target_type: ParentType;
  user_id: string | null;
  user: User | null;
}
