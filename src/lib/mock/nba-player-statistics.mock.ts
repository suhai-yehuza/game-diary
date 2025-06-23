import type { INbaPlayerStatisticsApiResponse } from '@/lib/types/nba.api.types';

export const MOCK_NBA_PLAYER_STATISTICS: INbaPlayerStatisticsApiResponse = {
  get: 'players/statistics',
  parameters: {
    id: '1',
    season: '2024',
  },
  errors: [],
  results: 1,
  response: [
    {
      player: {
        id: 1,
        name: 'LeBron James',
        firstname: 'LeBron',
        lastname: 'James',
        birth: {
          date: '1984-12-30',
          country: 'USA',
        },
        nba: {
          start: 2003,
          pro: 21,
        },
        height: {
          feets: '6',
          inches: '9',
          meters: '2.06',
        },
        weight: {
          pounds: '250',
          kilograms: '113.4',
        },
        college: 'St. Vincent-St. Mary HS (OH)',
        affiliation: 'St. Vincent-St. Mary HS (OH)',
        leagues: {
          standard: {
            jersey: 23,
            active: true,
            pos: 'F',
          },
        },
      },
      statistics: [
        {
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
      ],
    },
  ],
};
