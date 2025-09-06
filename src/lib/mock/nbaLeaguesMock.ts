import type { ILeaguesApiResponse } from '@/types';

export const MOCK_NBA_LEAGUES: ILeaguesApiResponse = {
  success: true,
  leagues: [
    {
      id: '12',
      name: 'NBA',
      season: '2024',
    },
    {
      id: '13',
      name: 'NBA Summer League',
      season: '2024',
    },
    {
      id: '14',
      name: 'NBA G League',
      season: '2024',
    },
  ],
  total: 3,
  data: {
    leagues: [
      {
        id: '12',
        name: 'NBA',
        season: '2024',
      },
      {
        id: '13',
        name: 'NBA Summer League',
        season: '2024',
      },
      {
        id: '14',
        name: 'NBA G League',
        season: '2024',
      },
    ],
  },
  timestamp: new Date().toISOString(),
};
