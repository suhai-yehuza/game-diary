import type { ITeamStatisticsApiResponse } from '@/lib/types/externalApiTypes';

export const MOCK_NBA_TEAM_STATISTICS: ITeamStatisticsApiResponse = {
  get: 'teams/statistics',
  parameters: {
    id: '584',
    season: '2024',
  },
  errors: [],
  results: 1,
  response: [
    {
      team: {
        id: 584,
        name: 'Boston Celtics',
        nickname: 'Celtics',
        code: 'BOS',
        logo: 'https://media.api-sports.io/basketball/teams/584.png',
      },
      statistics: [
        {
          games: 27,
          fastBreakPoints: 15.2,
          pointsInPaint: 42.8,
          biggestLead: 12.5,
          secondChancePoints: 11.3,
          pointsOffTurnovers: 18.7,
          longestRun: 9.2,
          points: 118.5,
          fgm: 42.8,
          fga: 87.3,
          fgp: '49.0',
          ftm: 18.2,
          fta: 22.1,
          ftp: '82.4',
          tpm: 14.7,
          tpa: 39.8,
          tpp: '36.9',
          offReb: 10.8,
          defReb: 33.2,
          totReb: 44.0,
          assists: 26.3,
          pFouls: 19.8,
          steals: 7.5,
          turnovers: 12.4,
          blocks: 5.2,
          plusMinus: 8.7,
        },
      ],
    },
  ],
};
