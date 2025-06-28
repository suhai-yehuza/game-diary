import type { ILeaguesApiResponse } from '@/lib/types/external.api.types';

export const MOCK_NBA_LEAGUES: ILeaguesApiResponse = {
  get: 'leagues',
  parameters: {},
  errors: [],
  results: 3,
  response: [
    {
      id: 12,
      name: 'NBA',
      type: 'League',
      logo: 'https://media.api-sports.io/basketball/leagues/12.png',
      country: {
        id: 5,
        name: 'USA',
        code: 'US',
        flag: 'https://media.api-sports.io/flags/us.svg',
      },
      flag: 'https://media.api-sports.io/flags/us.svg',
      season: 2024,
      round: 'Regular Season',
    },
    {
      id: 13,
      name: 'NBA Summer League',
      type: 'League',
      logo: 'https://media.api-sports.io/basketball/leagues/13.png',
      country: {
        id: 5,
        name: 'USA',
        code: 'US',
        flag: 'https://media.api-sports.io/flags/us.svg',
      },
      flag: 'https://media.api-sports.io/flags/us.svg',
      season: 2024,
      round: 'Summer League',
    },
    {
      id: 14,
      name: 'NBA G League',
      type: 'League',
      logo: 'https://media.api-sports.io/basketball/leagues/14.png',
      country: {
        id: 5,
        name: 'USA',
        code: 'US',
        flag: 'https://media.api-sports.io/flags/us.svg',
      },
      flag: 'https://media.api-sports.io/flags/us.svg',
      season: 2024,
      round: 'Regular Season',
    },
  ],
};
