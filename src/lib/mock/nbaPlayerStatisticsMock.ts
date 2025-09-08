import type { IPlayerStatisticsApiResponse } from '@/types';

export const MOCK_NBA_PLAYER_STATISTICS: IPlayerStatisticsApiResponse = {
  success: true,
  statistics: [],
  total: 0,
  data: {
    playerId: '1',
    statistics: {
      games: 25,
      points: 25.2,
      min: '34.8',
      fgm: 9.8,
      fga: 18.2,
      fgp: '53.8',
      ftm: 4.2,
      fta: 5.8,
      ftp: '72.4',
      tpm: 2.1,
      tpa: 6.1,
      tpp: '34.4',
      offReb: 1.2,
      defReb: 6.8,
      totReb: 8.0,
      assists: 7.8,
      pFouls: 1.8,
      steals: 1.4,
      turnovers: 3.2,
      blocks: 0.6,
      plusMinus: 5.2,
    },
  },
  timestamp: new Date().toISOString(),
};
