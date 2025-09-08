import type { IGameStatisticsApiResponse } from '@/types';

export const MOCK_NBA_GAME_STATISTICS: IGameStatisticsApiResponse = {
  success: true,
  statistics: [],
  total: 0,
  data: {
    gameId: '1234567',
    statistics: {},
  },
  timestamp: new Date().toISOString(),
};
