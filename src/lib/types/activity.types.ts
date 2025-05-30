/**
 * Activity-related types including comments, reactions, and timeline types
 */

import type {
  Comment as GeneratedComment,
  Reaction as GeneratedReaction,
  TargetType as GeneratedTargetType,
} from './generated/graphql';

// Re-export TargetType from generated types
export type TargetType = GeneratedTargetType;

// Activity Types
export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  targetId: string;
  targetType: GeneratedTargetType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityType =
  | 'game_log_created'
  | 'game_log_updated'
  | 'friend_added'
  | 'friend_removed'
  | 'profile_updated'
  | 'reaction_added'
  | 'comment_added'
  | 'all'
  | 'replay'
  | 'favorite'
  | 'note'
  | 'watch';

// Comment Types
export interface DbComment extends GeneratedComment {
  replies?: Comment[];
  parentId: string;
}

// Reaction Types
export interface DbReaction extends GeneratedReaction {
  target?: {
    id: string;
    type: GeneratedTargetType;
    title?: string;
  };
  metadata?: Record<string, unknown>;
}

// Timeline Types
export interface TimelineItem {
  id: string;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  target: {
    id: string;
    type: GeneratedTargetType;
    title?: string;
    description?: string;
    image?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

// Activity Feed Types
export interface ActivityFeed {
  items: TimelineItem[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

// Activity Stats Types
export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByTargetType: Record<GeneratedTargetType, number>;
  recentActivityCount: number;
  lastActivityDate?: Date;
}

export type ActivityTimelineProps = {
  gameLogs: Array<{
    id: string;
    createdAt: string;
    rating?: number;
    watchedSetting: string;
    notes?: string;
    game: {
      season: string;
      teams: {
        visitors: { name: string };
        home: { name: string };
      };
    };
  }>;
};

export interface FriendActivityProps {
  friendId: string;
}
