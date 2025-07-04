// TypeScript interfaces for schema type safety
export interface IBaseTableFields {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IBaseGameFields {
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamScore?: number;
  awayTeamScore?: number;
  status: string;
}

// Base table configuration type
export type BaseTableConfig = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};

// Base game fields type
export type BaseGameFields = {
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamScore: string;
  awayTeamScore: string;
  status: string;
};
