/**
 * API Response Types
 * Types for external API responses and related data structures
 */

import type { APIError } from './api.types';

export interface APITeamResponse {
  id: number;
  name: string;
  code: string;
}

export interface GameResponseData {
  id: number;
  league: string;
  season: number;
  date: {
    start: string;
    end?: string;
    duration?: string;
  };
  stage: number;
  status: {
    clock?: string;
    halftime: boolean;
    short: string;
    long: string;
  };
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  arena: {
    name: string;
    city: string;
    state?: string;
    country?: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
    visitors: {
      id: number;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
  };
  scores: {
    home: {
      win: number;
      loss: number;
      series: {
        win: number;
        loss: number;
      };
      linescore: number[];
      points: number;
    };
    visitors: {
      win: number;
      loss: number;
      series: {
        win: number;
        loss: number;
      };
      linescore: number[];
      points: number;
    };
  };
  officials: string[];
  timesTied: number;
  leadChanges: number;
  nugget?: string;
}

export interface GameApiResponse {
  response: GameResponseData[];
  data?: GameResponseData[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}

export interface PlayerApiResponse {
  response: {
    get: string;
    parameters: {
      team: string;
      season: string;
    };
    errors: string[];
    results: number;
    response: Array<{
      id: number;
      firstname: string;
      lastname: string;
      birth?: {
        date: string | null;
        country: string | null;
      };
      nba?: {
        start: number;
        pro: number;
      };
      height?: {
        feets: string | null;
        inches: string | null;
        meters: string | null;
      };
      weight?: {
        pounds: string | null;
        kilograms: string | null;
      };
      college: string | null;
      affiliation: string | null;
      leagues?: {
        standard?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
        vegas?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
        utah?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
      };
    }>;
  };
}

export type SeasonApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: number[];
};

export type TeamApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: Array<{
    id: number;
    name: string;
    nickname: string;
    code: string;
    city: string;
    logo: string;
    allStar: boolean;
    nbaFranchise: boolean;
    leagues: {
      standard?: {
        conference: string | null;
        division: string | null;
      };
    };
  }>;
};

export interface APIResponse<T = unknown> {
  response?: T[];
  data?: T[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
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
