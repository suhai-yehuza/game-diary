import type { IActivity, ITimeFilter } from '@src/lib/types/api.types';
import type { IChartData } from '@src/lib/types/chart';
import type { GameLog, Reaction } from '@src/lib/types/generated/graphql';
import type { IFriend, IFriendGroup } from '@src/lib/types/social.types';

export interface ITeamSummary {
  id: string;
  code: string;
  logo: string;
  name: string;
  nickname: string;
}

export interface IArena {
  name?: string;
  city?: string;
  state?: string;
}

export interface ITeamDisplayProps {
  team: ITeamSummary;
  score?: number;
  opponentScore?: number;
  isHome: boolean;
  imageErrors?: Record<string, boolean>;
  onImageError?: (id: string) => void;
  gameId?: string;
}

export interface ISeasonData {
  id: string;
  year: number;
  displayYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isPlayoffs: boolean;
}

export interface ITeamData {
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

export interface IPlayerData {
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

export interface IStatsChartProps {
  data: IChartData;
  type: 'line' | 'bar' | 'radar';
  title: string;
  height?: number;
  stacked?: boolean;
}

export interface IReactionDisplayProps {
  targetId: string;
  targetType: string;
}

export interface IReactionPickerProps {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
}

export interface IFriendProfileProps {
  friend?: IFriend;
  friendId?: string;
  onClose?: () => void;
}

export interface IFriendGroupsProps {
  groups: IFriendGroup[];
  friends?: IFriend[];
  onGroupUpdate?: (group: IFriendGroup) => void;
}

export interface IFriendRequestButtonProps {
  targetUserId: string;
  className?: string;
}

export interface IActivityTimelineProps {
  activities: IActivity[];
  gameLogs: GameLog[];
  timeFilter?: ITimeFilter;
}

export interface IFriendActivityProps {
  friendId: string;
  activities: IActivity[];
}

export interface INavItem {
  href: string;
  label: string;
  subItems?: INavItem[];
  icon?: string;
  isNew?: boolean;
  badge?: string | number;
}
