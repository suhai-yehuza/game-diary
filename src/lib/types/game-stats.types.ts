export interface GameTeamStats {
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  statistics: Array<{
    points: number;
    fgm: number;
    fga: number;
    fgp: string;
    tpm: number;
    tpa: number;
    tpp: string;
    ftm: number;
    fta: number;
    ftp: string;
    offReb: number;
    defReb: number;
    totReb: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    pFouls: number;
    plusMinus: string;
    fastBreakPoints: number;
    pointsInPaint: number;
    secondChancePoints: number;
    pointsOffTurnovers: number;
    biggestLead: number;
    longestRun: number;
    min: string;
  }>;
}

export interface GameStatsApiResponse {
  response: GameTeamStats[];
  data?: GameTeamStats[]; // For backward compatibility
}
