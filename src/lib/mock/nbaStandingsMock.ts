import type { IStandingsApiResponse } from '@/types';

export const MOCK_NBA_STANDINGS: IStandingsApiResponse = {
  success: true,
  standings: [],
  total: 0,
  data: {
    standings: [
      {
        teamId: '584',
        wins: 20,
        losses: 7,
        winPercentage: 0.741,
      },
      {
        teamId: '589',
        wins: 18,
        losses: 9,
        winPercentage: 0.667,
      },
      {
        teamId: '588',
        wins: 18,
        losses: 9,
        winPercentage: 0.667,
      },
      {
        teamId: '587',
        wins: 16,
        losses: 11,
        winPercentage: 0.593,
      },
      {
        teamId: '583',
        wins: 15,
        losses: 12,
        winPercentage: 0.556,
      },
    ],
  },
  timestamp: new Date().toISOString(),
};
