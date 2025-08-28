/**
 * Game Log Types
 * Centralized type definitions for game log functionality
 */

import { z } from 'zod';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from './constant.types';

// Base Game Log interface
export interface IGameLog {
  id: string;
  game_id: string;
  game?: {
    id: string;
    date: string;
    status: string;
    game_type: string;
    nba_game_id?: string;
    home_team_id: string;
    away_team_id: string;
    home_team: {
      id: string;
      name: string;
      nickname?: string;
      code?: string;
      city?: string;
      logo?: string;
      all_star: boolean;
      nba_franchise: boolean;
      conference?: string;
      created_at: string;
      updated_at: string;
    };
    away_team: {
      id: string;
      name: string;
      nickname?: string;
      code?: string;
      city?: string;
      logo?: string;
      all_star: boolean;
      nba_franchise: boolean;
      conference?: string;
      created_at: string;
      updated_at: string;
    };
    home_team_score?: number;
    away_team_score?: number;
    average_rating?: number;
    total_ratings?: number;
    created_at: string;
    updated_at: string;
  };
  rating_for_game: number;
  notes?: string;
  tags?: string[];
  watched_date?: string;
  watched_setting?: string;
  watched_location?: string;
  watched_scope?: string;
  classification: string;
  created_at: string;
  updated_at: string;
  totalCommentCount?: number;
  totalReactionCount?: number;
  user: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

// Game Logs Filters interface
export interface IGameLogsFilters {
  userId?: string;
  classification?: string;
  gameId?: string;
  minRating?: number;
  maxRating?: number;
  watchedSetting?: string;
  hasNotes?: boolean;
}

// Game Logs Options interface
export interface IGameLogsOptions {
  filters?: IGameLogsFilters;
  pagination?: {
    first?: number;
    after?: string;
  };
  skip?: boolean; // Skip the query execution
}

// Game Logs Response interface
export interface IGameLogsResponse {
  gameLogs: {
    edges: Array<{
      cursor: string;
      node: IGameLog;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount: number;
  };
}

// Friends Game Logs Response interface
export interface IFriendsGameLogsResponse {
  friendsGameLogs: {
    edges: Array<{
      cursor: string;
      node: IGameLog;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    totalCount: number;
  };
}

// Modal Props interfaces
export interface ICreateGameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedGame?: {
    id: string;
    name: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
  };
}

export interface IEditGameLogModalProps {
  gameLog: IGameLog;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface IDeleteGameLogModalProps {
  gameLog: IGameLog;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Form schemas and types
export const createGameLogSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  rating_for_game: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  watched_date: z.string().optional(),
  watched_setting: z.string().optional(),
  watched_location: z.string().optional(),
  watched_scope: z.string().optional(),
  classification: z.enum([CLASSIFICATION.PRIVATE, CLASSIFICATION.PROTECTED, CLASSIFICATION.PUBLIC]),
});

export const updateGameLogSchema = z.object({
  rating_for_game: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  watched_date: z.string().optional(),
  watched_setting: z.string().optional(),
  watched_location: z.string().optional(),
  watched_scope: z.string().optional(),
  classification: z.enum([CLASSIFICATION.PRIVATE, CLASSIFICATION.PROTECTED, CLASSIFICATION.PUBLIC]),
});

export type CreateGameLogFormData = z.infer<typeof createGameLogSchema>;
export type UpdateGameLogFormData = z.infer<typeof updateGameLogSchema>;

// Mutation response types
export interface ICreateGameLogResponse {
  createGameLog: {
    gameLog: IGameLog;
    errors: any[];
  };
}

export interface IUpdateGameLogResponse {
  updateGameLog: {
    gameLog: IGameLog;
    errors: any[];
  };
}

export interface IDeleteGameLogResponse {
  deleteGameLog: {
    success: boolean;
    errors: any[];
  };
}

// Component Props interfaces
export interface IGameLogsSortProps {
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  onSort: (key: string, direction: 'asc' | 'desc' | null) => void;
  displayedCount?: number;
  totalCount?: number;
  classification?: string;
}
