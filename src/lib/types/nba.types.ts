// NBA-related type definitions moved from src/app/sports/nba/games/[id]/page.tsx

export interface IHeadToHeadData {
  teamHeadToHead: {
    wins: number;
    losses: number;
    winPercentage: string;
    lastTenGames: string[];
  };
}

export interface ITeamGameStats {
  teamGameStats: {
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
    total_rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    personal_fouls: number;
  };
}
