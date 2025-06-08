import type { Activity } from '@src/lib/types/api.types';
import type { ChartData } from '@src/lib/types/chart';
import type { GameLog, Reaction } from '@src/lib/types/generated/graphql';
import type { Friend, FriendGroup } from '@src/lib/types/social.types';

export interface TeamSummary {
  id: string;
  code: string;
  logo: string;
  name: string;
  nickname: string;
}

export interface Arena {
  name?: string;
  city?: string;
  state?: string;
}

export interface TeamDisplayProps {
  team: TeamSummary | null;
  score?: number;
  isHome: boolean;
  imageErrors?: Record<string, boolean>;
  onImageError?: (id: string) => void;
  gameId?: string;
}

export interface SeasonData {
  id: string;
  year: number;
  displayYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isPlayoffs: boolean;
}

export interface TeamData {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string;
  allStar: boolean;
  nbaFranchise: boolean;
  leagues: {
    standard?: {
      conference?: string;
      division?: string;
    };
    [key: string]:
      | {
          conference?: string;
          division?: string;
        }
      | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  birth: {
    date: string;
    country: string;
  };
  nba: {
    start: number;
    pro: number;
  };
  height: {
    feets: number;
    inches: number;
    meters: number;
  };
  weight: {
    pounds: number;
    kilograms: number;
  };
  college: string;
  affiliation: string;
  leagues: {
    standard: {
      jersey: string;
      active: boolean;
      pos: string;
    };
  };
  seasons_active: Array<{
    season: number;
    teams: string[];
  }>;
}

export type StatsChartProps = {
  data: ChartData;
  type: 'line' | 'bar' | 'radar';
  title: string;
  height?: number;
  stacked?: boolean;
};

export type ReactionDisplayProps = {
  targetId: string;
  targetType: string;
};

export type ReactionPickerProps = {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
};

export type FriendProfileProps = {
  friend?: Friend;
  friendId?: string;
  onClose?: () => void;
};

export type FriendGroupsProps = {
  groups: FriendGroup[];
  friends?: Friend[];
  onGroupUpdate?: (group: FriendGroup) => void;
};

export type FriendRequestButtonProps = {
  targetUserId: string;
  className?: string;
};

export type ActivityTimelineProps = {
  activities: Activity[];
  gameLogs: GameLog[];
  timeFilter?: import('./api.types').TimeFilter;
};

export type FriendActivityProps = {
  friendId: string;
  activities: Activity[];
};

export type NavItem = {
  href: string;
  label: string;
  subItems?: NavItem[];
  icon?: string;
  isNew?: boolean;
  badge?: string | number;
};
