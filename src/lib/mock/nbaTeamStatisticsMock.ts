import type { ITeamStatisticsApiResponse } from '@/types';

export const MOCK_NBA_TEAM_STATISTICS: ITeamStatisticsApiResponse = {
  statistics: [],
  total: 0,
  get: 'teams/statistics',
  parameters: {
    id: '584',
    season: '2024',
  },
  errors: [],
  results: 1,
  success: true,
  timestamp: new Date().toISOString(),
  requestId: 'mock-team-statistics-request-id',
  response: [
    {
      team: {
        id: 584,
        name: 'Boston Celtics',
        nickname: 'Celtics',
        code: 'BOS',
        city: 'Boston',
        logo: 'https://media.api-sports.io/basketball/teams/584.png',
        allStar: false,
        nbaFranchise: true,
        leagues: {
          standard: {
            conference: 'Eastern',
            division: 'Atlantic',
          },
        },
      },
      points: 118.5,
      rebounds: 44.0,
      assists: 26.3,
      steals: 7.5,
      blocks: 5.2,
      turnovers: 12.4,
      fieldGoalsMade: 42.8,
      fieldGoalsAttempted: 87.3,
      threePointersMade: 14.7,
      threePointersAttempted: 39.8,
      freeThrowsMade: 18.2,
      freeThrowsAttempted: 22.1,
    },
  ],
};
