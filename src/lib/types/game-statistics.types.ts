/**
 * Game Statistics Types
 * Types related to game statistics, player stats, and team stats
 */

export interface GamePlayerStats {
  id: string;
  playerId: string;
  name: string;
  teamId: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  minutesPlayed: number;
  plusMinus: number;
  fieldGoals: {
    made: number;
    attempted: number;
  };
  threePointers: {
    made: number;
    attempted: number;
  };
  freeThrows: {
    made: number;
    attempted: number;
  };
}

export type GameTeamStatistics = {
  team: {
    id: number | string;
    name?: string;
    [key: string]: unknown;
  };
  statistics: GameStatistics[];
};

export interface GameStatistics {
  playerId: string;
  teamId: string;
  minutes: string;
  minutesPlayed: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  plusMinus: number;
  fieldGoals: {
    made: number;
    attempted: number;
    percentage: string;
  };
  threePointers: {
    made: number;
    attempted: number;
    percentage: string;
  };
  freeThrows: {
    made: number;
    attempted: number;
    percentage: string;
  };
}

export interface GameTeamStatistic {
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

export interface PlayerStatistics {
  player: {
    id: number;
    firstName: string;
    lastName: string;
  };
  team?: { id: number | string };
  min?: string | number;
  points?: number;
  totReb?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  pFouls?: number;
  fgm?: number;
  fga?: number;
  tpm?: number;
  tpa?: number;
  ftm?: number;
  fta?: number;
  plusMinus?: number;
}
