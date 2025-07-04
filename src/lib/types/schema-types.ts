// TypeScript interfaces for schema type safety
export interface IBaseTableFields {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IBaseGameFields {
  date: Date;
  home_team_id: string;
  away_team_id: string;
  home_team_score?: number;
  away_team_score?: number;
  status: string;
}

// Base table configuration type
export type BaseTableConfig = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

// Base game fields type
export type BaseGameFields = {
  date: string;
  home_team_id: string;
  away_team_id: string;
  home_team_score: string;
  away_team_score: string;
  status: string;
};
