/**
 * External API Types
 * TypeScript interfaces for NBA API endpoints based on api-sports.io documentation
 * Documentation: https://api-sports.io/documentation/nba/v2
 */

// ========================================
// BASE API RESPONSE STRUCTURE
// ========================================

export interface IBaseApiResponse<T = unknown> {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: T[];
}

// ========================================
// SEASONS ENDPOINT TYPES
// ========================================

export interface ISeasonResponse {
  season: number;
}

export type ISeasonsApiResponse = IBaseApiResponse<ISeasonResponse>;

// ========================================
// LEAGUES ENDPOINT TYPES
// ========================================

export interface ILeagueResponse {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };
  flag: string;
  season: number;
  round: string;
}

export type ILeaguesApiResponse = IBaseApiResponse<ILeagueResponse>;

// ========================================
// GAMES ENDPOINT TYPES
// ========================================

export interface IGameResponse {
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

export type IGamesApiResponse = IBaseApiResponse<IGameResponse>;

// ========================================
// GAME STATISTICS ENDPOINT TYPES
// ========================================

export interface IGameStatisticsResponse {
  game: {
    id: number;
    date: string;
    time: string;
    timestamp: number;
    timezone: string;
    stage: number;
    week: string;
    status: {
      long: string;
      short: string;
      timer?: string;
    };
  };
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

export type IGameStatisticsApiResponse = IBaseApiResponse<IGameStatisticsResponse>;

// ========================================
// TEAMS ENDPOINT TYPES
// ========================================

export interface ITeamResponse {
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
    vegas?: {
      conference: string | null;
      division: string | null;
    };
    utah?: {
      conference: string | null;
      division: string | null;
    };
    sacramento?: {
      conference: string | null;
      division: string | null;
    };
  };
}

export type ITeamsApiResponse = IBaseApiResponse<ITeamResponse>;

// ========================================
// TEAM STATISTICS ENDPOINT TYPES
// ========================================

export interface ITeamStatisticsResponse {
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

export type ITeamStatisticsApiResponse = IBaseApiResponse<ITeamStatisticsResponse>;

// ========================================
// PLAYERS ENDPOINT TYPES
// ========================================

export interface IPlayerResponse {
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
    sacramento?: {
      jersey: number | null;
      active: boolean;
      pos: string;
    };
  };
}

export type IPlayersApiResponse = IBaseApiResponse<IPlayerResponse>;

// ========================================
// PLAYER STATISTICS ENDPOINT TYPES
// ========================================

export interface IPlayerStatisticsResponse {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    birth: {
      date: string | null;
      country: string | null;
    };
    nba: {
      start: number;
      pro: number;
    };
    height: {
      feets: string | null;
      inches: string | null;
      meters: string | null;
    };
    weight: {
      pounds: string | null;
      kilograms: string | null;
    };
    college: string | null;
    affiliation: string | null;
    leagues: {
      standard: {
        jersey: number | null;
        active: boolean;
        pos: string;
      };
    };
  };
  statistics: {
    games: number;
    points: number;
    min: string;
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

export type IPlayerStatisticsApiResponse = IBaseApiResponse<IPlayerStatisticsResponse>;

// ========================================
// STANDINGS ENDPOINT TYPES
// ========================================

export interface IStandingResponse {
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

export type IStandingsApiResponse = IBaseApiResponse<IStandingResponse>;

// ========================================
// API PARAMETER TYPES
// ========================================

export type ISeasonsParams = Record<string, never>;

export type ILeaguesParams = Record<string, never>;

export interface IGamesParams {
  id?: string;
  date?: string;
  league?: string;
  season?: string;
  team?: string;
  h2h?: string;
  live?: string;
}

export interface IGameStatisticsParams {
  id: string; // Required
}

export interface ITeamsParams {
  id?: string;
  name?: string;
  code?: string;
  league?: string;
  conference?: string;
  division?: string;
  search?: string;
}

export interface ITeamStatisticsParams {
  id: string; // Required
  season: string; // Required
  stage?: string;
}

export interface IPlayersParams {
  id?: string;
  name?: string;
  team?: string;
  season?: string;
  country?: string;
  search?: string;
}

export interface IPlayerStatisticsParams {
  id?: string;
  game?: string;
  team?: string;
  season?: string;
}

export interface IStandingsParams {
  league: string; // Required
  season: string; // Required
  team?: string;
  conference?: string;
  division?: string;
}

// ========================================
// NAVIGATION ITEM TYPE
// ========================================

export interface IApiNavItem {
  key: 'seasons' | 'leagues' | 'games' | 'teams' | 'players' | 'standings';
  label: string;
  url: string;
  endpoint: string;
}

// ========================================
// API ENDPOINT CONFIGURATION
// ========================================

export const NBA_API_ENDPOINTS = {
  SEASONS: '/seasons',
  LEAGUES: '/leagues',
  GAMES: '/games',
  GAME_STATISTICS: '/games/statistics',
  TEAMS: '/teams',
  TEAM_STATISTICS: '/teams/statistics',
  PLAYERS: '/players',
  PLAYER_STATISTICS: '/players/statistics',
  STANDINGS: '/standings',
} as const;

export type NBAEndpoint = (typeof NBA_API_ENDPOINTS)[keyof typeof NBA_API_ENDPOINTS];

// ========================================
// RESPONSE TYPE MAPPING
// ========================================

export type ApiResponseMap = {
  [NBA_API_ENDPOINTS.SEASONS]: ISeasonsApiResponse;
  [NBA_API_ENDPOINTS.LEAGUES]: ILeaguesApiResponse;
  [NBA_API_ENDPOINTS.GAMES]: IGamesApiResponse;
  [NBA_API_ENDPOINTS.GAME_STATISTICS]: IGameStatisticsApiResponse;
  [NBA_API_ENDPOINTS.TEAMS]: ITeamsApiResponse;
  [NBA_API_ENDPOINTS.TEAM_STATISTICS]: ITeamStatisticsApiResponse;
  [NBA_API_ENDPOINTS.PLAYERS]: IPlayersApiResponse;
  [NBA_API_ENDPOINTS.PLAYER_STATISTICS]: IPlayerStatisticsApiResponse;
  [NBA_API_ENDPOINTS.STANDINGS]: IStandingsApiResponse;
};

export type ParamsMap = {
  [NBA_API_ENDPOINTS.SEASONS]: ISeasonsParams;
  [NBA_API_ENDPOINTS.LEAGUES]: ILeaguesParams;
  [NBA_API_ENDPOINTS.GAMES]: IGamesParams;
  [NBA_API_ENDPOINTS.GAME_STATISTICS]: IGameStatisticsParams;
  [NBA_API_ENDPOINTS.TEAMS]: ITeamsParams;
  [NBA_API_ENDPOINTS.TEAM_STATISTICS]: ITeamStatisticsParams;
  [NBA_API_ENDPOINTS.PLAYERS]: IPlayersParams;
  [NBA_API_ENDPOINTS.PLAYER_STATISTICS]: IPlayerStatisticsParams;
  [NBA_API_ENDPOINTS.STANDINGS]: IStandingsParams;
};

// ========================================
// UTILITY TYPES
// ========================================

export type NBAEndpointKey = keyof typeof NBA_API_ENDPOINTS;

export type RequiredParams<T> = {
  [K in keyof T]: T[K] extends string ? T[K] : never;
}[keyof T];

export type OptionalParams<T> = {
  [K in keyof T]: T[K] extends string | undefined ? T[K] : never;
}[keyof T];
