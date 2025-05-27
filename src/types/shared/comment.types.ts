import type { User } from '@/lib/types/generated/graphql';
import type { ParentType, ReactionEmojiType } from '@/lib/types/generated/graphql';

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