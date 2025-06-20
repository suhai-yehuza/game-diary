// Game log related type definitions

import type { IAuthUser } from '@src/lib/types';
import type { GameLog, GameLogFragmentFragment } from '@src/lib/types/generated/graphql';

export interface IFilters {
  searchText?: string;
  classification?: string;
  dateRange?: {
    start: Date;
    end?: Date;
  };
  tags?: string[];
}

export interface IGameLogsSectionProps {
  userId: string;
  currentUser?: {
    id: string;
    username: string;
    imageUrl?: string;
  };
}

export interface IGameLogProps {
  gameLog: GameLog;
  showActions?: boolean;
  onEdit?: (gameLog: GameLog) => void;
  onDelete?: (gameLogId: string) => void;
  gameLogId?: string;
}

export interface IGameData {
  id: string;
  date: string | { start: string };
  season: string;
  teams: {
    visitors: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      score: number;
    };
    home: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      score: number;
    };
  };
  status: {
    long: string;
    short: string;
    clock?: string;
    halftime?: boolean;
  };
  period: number;
  time?: string;
  arena?: {
    name: string;
    city: string;
    state?: string;
    country?: string;
  };
  league: string;
}

export interface IGameEdge {
  node: IGameData;
}

export interface IExtendedGameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'update';
  gameLog?: GameLogFragmentFragment;
  onSuccess?: () => void;
}

export interface IGameLogSearchSectionProps {
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  initialFilters?: Record<string, unknown>;
  userId?: string;
  initialSearchText?: string;
}

export interface IGameLogActionsProps {
  gameLog: GameLogFragmentFragment;
  onEdit?: (gameLog: GameLogFragmentFragment) => void;
  onDelete?: (gameLogId: string) => void;
  currentUser?: IAuthUser;
  onSuccess?: (variables?: Partial<{ [key: string]: unknown }>) => Promise<{ data?: unknown }>;
}
