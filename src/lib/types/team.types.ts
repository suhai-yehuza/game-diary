import { APIError } from './api.types';
import type {
  Team as GraphQLTeam,
  TeamFilters as GraphQLTeamFilters,
  TeamStats,
} from './generated/graphql';

export type { GraphQLTeam as Team };

export interface ApiTeam {
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

export type ApiTeamResponse = { response: ApiTeam[] };

export interface CustomTeam extends GraphQLTeam {
  isFavorite?: boolean;
}

export interface TeamFields {
  team_id: string;
  team?: CustomTeam;
}

export interface TeamWithSeasonStats extends CustomTeam {
  stats: TeamStats;
  seasonStats: TeamStat[];
  isFavorite?: boolean;
}

export interface TeamStat {
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
  team: CustomTeam;
}

export interface TeamCounts {
  [key: string]: number;
}

export interface CustomTeamFilters extends GraphQLTeamFilters {
  search?: string;
}

export interface DBTeamStatistics {
  id: string;
  team_id: string;
  season_id: string;
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
  created_at: Date;
  updated_at: Date;
}

export interface DBTeamStandings {
  team: CustomTeam;
  wins: number;
  losses: number;
  winPercentage: number;
  gamesBehind: number;
  lastTen: string;
  streak: string;
  division: string;
  conference: string;
}

export interface DBWinLossRecord {
  home: number;
  away: number;
  total: number;
  percentage: string;
  lastTen: string;
}

export interface DBWeightInfo {
  pounds: number;
  kilograms: number;
}

export interface TeamStatistics {
  team: {
    id: number;
    name: string;
    nickname: string;
    logo: string;
  };
  statistics: Array<{
    fastBreakPoints: number;
    pointsInPaint: number;
    biggestLead: number;
    secondChancePoints: number;
    pointsOffTurnovers: number;
    longestRun: number;
    fgm: number;
    fga: number;
    fgp: number;
    ftm: number;
    fta: number;
    ftp: number;
    tpm: number;
    tpa: number;
    tpp: number;
    offReb: number;
    defReb: number;
    totReb: number;
    assists: number;
    pFouls: number;
    steals: number;
    turnovers: number;
    blocks: number;
    plusMinus: number;
    min: number;
    points: number;
  }>;
}

export interface TeamResponseData {
  id: number;
  name: string;
  nickname: string;
  code: string;
  city: string;
  logo: string;
  allStar: boolean;
  nbaFranchise: boolean;
  leagues: {
    standard?: { conference?: string; division?: string };
    vegas?: { conference?: string; division?: string };
    utah?: { conference?: string; division?: string };
    sacramento?: { conference?: string; division?: string };
  };
}

export type TeamStatisticsApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: APIError[];
  results: number;
  response: TeamStatisticsResponseData[];
  data?: TeamStatisticsResponseData[]; // For backward compatibility
};

export interface TeamStatisticsResponseData {
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

export interface StandingResponseData {
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

export interface TeamDisplayStats {
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
}
