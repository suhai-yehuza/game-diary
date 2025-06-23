/**
 * External API Types
 * TypeScript interfaces for NBA API endpoints based on api-sports.io documentation
 * Documentation: https://api-sports.io/documentation/nba/v2
 */

// ========================================
// BASE API RESPONSE STRUCTURE
// ========================================

export interface INbaBaseApiResponse<T = unknown> {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: T[];
}

// ========================================
// SEASONS ENDPOINT TYPES
// ========================================

export interface INbaSeasonResponse {
  season: number;
}

export type INbaSeasonsApiResponse = INbaBaseApiResponse<INbaSeasonResponse>;

// ========================================
// LEAGUES ENDPOINT TYPES
// ========================================

export interface INbaLeagueResponse {
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

export type INbaLeaguesApiResponse = INbaBaseApiResponse<INbaLeagueResponse>;

// ========================================
// GAMES ENDPOINT TYPES
// ========================================

export interface INbaGameResponse {
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

export type INbaGamesApiResponse = INbaBaseApiResponse<INbaGameResponse>;

// ========================================
// GAME STATISTICS ENDPOINT TYPES
// ========================================

export interface INbaGameStatisticsResponse {
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

export type INbaGameStatisticsApiResponse = INbaBaseApiResponse<INbaGameStatisticsResponse>;

// ========================================
// TEAMS ENDPOINT TYPES
// ========================================

export interface INbaTeamResponse {
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

export type INbaTeamsApiResponse = INbaBaseApiResponse<INbaTeamResponse>;

// ========================================
// TEAM STATISTICS ENDPOINT TYPES
// ========================================

export interface INbaTeamStatisticsResponse {
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

export type INbaTeamStatisticsApiResponse = INbaBaseApiResponse<INbaTeamStatisticsResponse>;

// ========================================
// PLAYERS ENDPOINT TYPES
// ========================================

export interface INbaPlayerResponse {
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

export type INbaPlayersApiResponse = INbaBaseApiResponse<INbaPlayerResponse>;

// ========================================
// PLAYER STATISTICS ENDPOINT TYPES
// ========================================

export interface INbaPlayerStatisticsResponse {
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

export type INbaPlayerStatisticsApiResponse = INbaBaseApiResponse<INbaPlayerStatisticsResponse>;

// ========================================
// STANDINGS ENDPOINT TYPES
// ========================================

export interface INbaStandingResponse {
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

export type INbaStandingsApiResponse = INbaBaseApiResponse<INbaStandingResponse>;

// ========================================
// API PARAMETER TYPES
// ========================================

export type InbaSeasonsParams = Record<string, never>;

export type InbaLeaguesParams = Record<string, never>;

export interface INbaGamesParams {
  id?: string;
  date?: string;
  league?: string;
  season?: string;
  team?: string;
  h2h?: string;
  live?: string;
}

export interface INbaGameStatisticsParams {
  id: string; // Required
}

export interface INbaTeamsParams {
  id?: string;
  name?: string;
  code?: string;
  league?: string;
  conference?: string;
  division?: string;
  search?: string;
}

export interface INbaTeamStatisticsParams {
  id: string; // Required
  season: string; // Required
  stage?: string;
}

export interface INbaPlayersParams {
  id?: string;
  name?: string;
  team?: string;
  season?: string;
  country?: string;
  search?: string;
}

export interface INbaPlayerStatisticsParams {
  id?: string;
  game?: string;
  team?: string;
  season?: string;
}

export interface INbaStandingsParams {
  league: string; // Required
  season: string; // Required
  team?: string;
  conference?: string;
  division?: string;
}

// ========================================
// NAVIGATION ITEM TYPE
// ========================================

export interface INbaApiNavItem {
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
  [NBA_API_ENDPOINTS.SEASONS]: INbaSeasonsApiResponse;
  [NBA_API_ENDPOINTS.LEAGUES]: INbaLeaguesApiResponse;
  [NBA_API_ENDPOINTS.GAMES]: INbaGamesApiResponse;
  [NBA_API_ENDPOINTS.GAME_STATISTICS]: INbaGameStatisticsApiResponse;
  [NBA_API_ENDPOINTS.TEAMS]: INbaTeamsApiResponse;
  [NBA_API_ENDPOINTS.TEAM_STATISTICS]: INbaTeamStatisticsApiResponse;
  [NBA_API_ENDPOINTS.PLAYERS]: INbaPlayersApiResponse;
  [NBA_API_ENDPOINTS.PLAYER_STATISTICS]: INbaPlayerStatisticsApiResponse;
  [NBA_API_ENDPOINTS.STANDINGS]: INbaStandingsApiResponse;
};

export type ParamsMap = {
  [NBA_API_ENDPOINTS.SEASONS]: InbaSeasonsParams;
  [NBA_API_ENDPOINTS.LEAGUES]: InbaLeaguesParams;
  [NBA_API_ENDPOINTS.GAMES]: INbaGamesParams;
  [NBA_API_ENDPOINTS.GAME_STATISTICS]: INbaGameStatisticsParams;
  [NBA_API_ENDPOINTS.TEAMS]: INbaTeamsParams;
  [NBA_API_ENDPOINTS.TEAM_STATISTICS]: INbaTeamStatisticsParams;
  [NBA_API_ENDPOINTS.PLAYERS]: INbaPlayersParams;
  [NBA_API_ENDPOINTS.PLAYER_STATISTICS]: INbaPlayerStatisticsParams;
  [NBA_API_ENDPOINTS.STANDINGS]: INbaStandingsParams;
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
