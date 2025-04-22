export interface Season {
  id: string;
  name: string;
  year: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  conference: string;
  division: string;
  wins: number;
  losses: number;
  winPercentage: number;
  streak: string;
  lastTen: string;
  homeRecord: string;
  awayRecord: string;
  logo: string;
}

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  jerseyNumber: string;
  position: string;
  team: {
    id: string;
    name: string;
    abbreviation: string;
  };
  stats: {
    pointsPerGame: number;
    reboundsPerGame: number;
    assistsPerGame: number;
    fieldGoalPercentage: number;
    threePointPercentage: number;
  };
}

export interface Game {
  id: string;
  status: string;
  period?: number;
  time?: string;
  scores: {
    home: number;
    away: number;
  };
  homeTeam: {
    id: string;
    name: string;
    wins: number;
    losses: number;
  };
  awayTeam: {
    id: string;
    name: string;
    wins: number;
    losses: number;
  };
  venue: {
    name: string;
    city: string;
    state: string;
  };
}
