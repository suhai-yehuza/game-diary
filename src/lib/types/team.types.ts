import type { ApolloError } from '@apollo/client';

import type { ISortDirection } from './common.types';
import type { Team, ITeamStats } from './generated/graphql';

// Core Team Types
export interface ITeamSummary {
  id: string;
  code: string;
  logo: string;
  name: string;
  nickname: string;
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

export interface IApiTeam {
  id: string | number;
  name: string;
  nickname?: string | null;
  code?: string | null;
  city: string;
  logo?: string | null;
  allStar?: boolean;
  nbaFranchise?: boolean;
  leagues?: Record<string, unknown>;
}

export interface ICustomTeam extends Team {
  isFavorite?: boolean;
}

export interface ITeamFields {
  teamId: string;
  team?: ICustomTeam;
}

export interface ITeamWithSeasonStats extends ICustomTeam {
  stats: ITeamStats;
  seasonStats: ITeamStat[];
  isFavorite?: boolean;
}

export interface ITeamStat {
  id: string;
  season: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  winPercentage: number;
  homeWins: number;
  homeLosses: number;
  awayWins: number;
  awayLosses: number;
  team: ICustomTeam;
}

// Team Filter Types
export interface ICustomTeamFilters {
  search?: string;
  conference?: string;
  division?: string;
  sortBy?: string;
  sortDirection?: ISortDirection;
}

// Team Statistics Types
export interface IDBTeamStatistics {
  id: string;
  teamId: string;
  season: string;
  games_played: number;
  wins: number;
  losses: number;
  points_per_game: number;
  field_goal_percentage: number;
  three_point_percentage: number;
  free_throw_percentage: number;
  rebounds_per_game: number;
  assists_per_game: number;
  steals_per_game: number;
  blocks_per_game: number;
  turnovers_per_game: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDBTeamStandings {
  team: ICustomTeam;
  wins: number;
  losses: number;
  winPercentage: number;
  gamesBehind: number;
  lastTen: string;
  streak: string;
  division: string;
  conference: string;
}

export interface IDBWinLossRecord {
  home: number;
  away: number;
  total: number;
  percentage: string;
  lastTen: string;
}

export interface ITeamStatisticsResponseData {
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  statistics: {
    games: number;
    fastBreakPoints: number;
    pointsInPaint: number;
    biggestLead: number;
    secondChancePoints: number;
    pointsOffTurnovers: number;
    longestRun: number;
    points: number;
    fgm: number;
    fga: number;
    fgp: string;
    ftm: number;
    fta: number;
    ftp: string;
    tpm: number;
    tpa: number;
    tpp: string;
    offReb: number;
    defReb: number;
    totReb: number;
    assists: number;
    pFouls: number;
    steals: number;
    turnovers: number;
    blocks: number;
    plusMinus: number;
  }[];
}

export interface IStandingResponseData {
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  conference: {
    name: string;
    rank: number;
    win: number;
    loss: number;
  };
  division: {
    name: string;
    rank: number;
    win: number;
    loss: number;
    gamesBehind: string;
  };
  win: {
    home: number;
    away: number;
    total: number;
    percentage: string;
    lastTen: number;
  };
  loss: {
    home: number;
    away: number;
    total: number;
    percentage: string;
    lastTen: number;
  };
  streak: number;
  winStreak: boolean;
}

export interface ITeamDisplayStats {
  games: number;
  fastBreakPoints?: number;
  pointsInPaint?: number;
  biggestLead?: number;
  secondChancePoints?: number;
  pointsOffTurnovers?: number;
  longestRun?: number;
  fgm?: number;
  fga?: number;
  fgp?: string;
  ftm?: number;
  fta?: number;
  ftp?: string;
  tpm?: number;
  tpa?: number;
  tpp?: string;
  offReb?: number;
  defReb?: number;
  totReb?: number;
  assists?: number;
  pFouls?: number;
  steals?: number;
  turnovers?: number;
  blocks?: number;
  plusMinus?: number;
  min?: number;
  points?: number;
}

export interface IHeadToHeadData {
  teamH2H?: {
    wins: number;
    losses: number;
    winPercentage: string;
    lastTenGames: string[];
  };
}

export interface ITeamStatsData {
  teamGameStats?: {
    team?: {
      logo?: string;
      nickname?: string;
    };
    points: number;
    field_goals_made: number;
    field_goals_attempted: number;
    field_goal_percentage: number;
    three_pointers_made: number;
    three_pointers_attempted: number;
    three_pointer_percentage: number;
    free_throws_made: number;
    free_throws_attempted: number;
    free_throw_percentage: number;
    offensive_rebounds: number;
    defensive_rebounds: number;
    total_rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    personal_fouls: number;
  };
}

// Team Component Props
export interface ITeamDisplayProps {
  team: ITeamSummary | null;
  score?: number;
  opponentScore?: number;
  isHome: boolean;
  imageErrors?: Record<string, boolean>;
  onImageError?: (id: string) => void;
  gameId?: string;
}

export interface IHeadToHeadProps {
  h2hData: IHeadToHeadData;
  homeTeam: { nickname: string; logo: string | null };
  awayTeam: { nickname: string; logo: string | null };
  loading: boolean;
  error: ApolloError | undefined;
}

export interface ITeamStatsProps {
  teamStats: ITeamStatsData;
  team: { nickname: string; logo: string | null };
  isHome: boolean;
  loading: boolean;
  error: ApolloError | undefined;
}
