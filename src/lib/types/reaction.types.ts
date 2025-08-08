import type { ParentType } from '@/lib/types/generated/graphql';
import type { REACTION_EMOJIS } from '@/lib/types/constant.types';

export interface IReaction {
  id: string;
  emoji: string;
  user_id: string;
  target_id: string;
  target_type: ParentType;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email_address?: string | null;
    phone_number?: string | null;
    image_url?: string | null;
  };
}

export interface IReactionGroup {
  emoji: string;
  count: number;
  hasUserReacted: boolean;
  reactionIds: string[];
}

export interface IReactionOptions {
  targetId: string;
  targetType: ParentType;
}

export interface IReactionResponse {
  reaction: IReaction | null;
  errors: Array<{ message: string; code?: string; field?: string }>;
}

export interface IDeleteReactionResponse {
  success: boolean;
  errors: Array<{ message: string; code?: string; field?: string }>;
}

// Component props interfaces
export interface IReactionPickerProps {
  targetId: string;
  targetType: ParentType;
  onReactionAdded?: (reaction: IReaction) => void;
  onReactionRemoved?: (reactionId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export interface IReactionDisplayProps {
  targetId: string;
  targetType: ParentType;
  onReactionClick?: (emoji: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showUserNames?: boolean;
  maxReactions?: number;
}

export interface IReactionButtonProps {
  emoji: string;
  count: number;
  hasReacted: boolean;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export interface IReactionState {
  reactions: IReaction[];
  loading: boolean;
  error: string | null;
  groupedReactions: IReactionGroup[];
  userReactions: Set<string>; // Set of emoji strings that the current user has reacted with
}

export type ReactionEmoji = (typeof REACTION_EMOJIS)[keyof typeof REACTION_EMOJIS];

// Reaction count props for showing count without fetching reactions
export interface IReactionCountProps {
  count?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
