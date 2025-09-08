import type { IPlayersApiResponse } from '@/types';

export const MOCK_NBA_PLAYERS: IPlayersApiResponse = {
  success: true,
  timestamp: new Date().toISOString(),
  requestId: 'mock-players-request',
  players: [],
  total: 1,
  page: 1,
  limit: 25,
  get: 'players',
  parameters: {
    league: '12',
    season: '2024',
  },
  errors: [],
  results: 10,
  response: [
    {
      id: '1',
      birth: {
        date: '1984-12-30',
        country: 'USA',
      },
      nba: {
        start: 2003,
        pro: 21,
      },
      height: '6-9',
      weight: '250',
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
    {
      id: '2',
      birth: {
        date: '1988-03-14',
        country: 'USA',
      },
      nba: {
        start: 2009,
        pro: 15,
      },
      height: '6-3',
      weight: '185',
      college: 'Davidson',
      affiliation: 'Davidson',
      leagues: {
        standard: {
          jersey: 30,
          active: true,
          pos: 'G',
        },
      },
    },
    {
      id: '3',
      birth: {
        date: '1988-09-29',
        country: 'USA',
      },
      nba: {
        start: 2007,
        pro: 17,
      },
      height: '6-10',
      weight: '240',
      college: 'Texas',
      affiliation: 'Texas',
      leagues: {
        standard: {
          jersey: 35,
          active: true,
          pos: 'F',
        },
      },
    },
    {
      id: '4',
      birth: {
        date: '1994-12-06',
        country: 'Greece',
      },
      nba: {
        start: 2013,
        pro: 11,
      },
      height: '6-11',
      weight: '242',
      college: 'None',
      affiliation: 'Filathlitikos',
      leagues: {
        standard: {
          jersey: 34,
          active: true,
          pos: 'F',
        },
      },
    },
    {
      id: '5',
      birth: {
        date: '1995-02-19',
        country: 'Serbia',
      },
      nba: {
        start: 2015,
        pro: 9,
      },
      height: '6-11',
      weight: '284',
      college: 'None',
      affiliation: 'Mega Basket',
      leagues: {
        standard: {
          jersey: 15,
          active: true,
          pos: 'C',
        },
      },
    },
    {
      id: '6',
      birth: {
        date: '1999-02-28',
        country: 'Slovenia',
      },
      nba: {
        start: 2018,
        pro: 6,
      },
      height: '6-7',
      weight: '230',
      college: 'None',
      affiliation: 'Real Madrid',
      leagues: {
        standard: {
          jersey: 77,
          active: true,
          pos: 'G',
        },
      },
    },
    {
      id: '7',
      birth: {
        date: '1994-03-16',
        country: 'Cameroon',
      },
      nba: {
        start: 2016,
        pro: 8,
      },
      height: '7-0',
      weight: '280',
      college: 'Kansas',
      affiliation: 'Kansas',
      leagues: {
        standard: {
          jersey: 21,
          active: true,
          pos: 'C',
        },
      },
    },
    {
      id: '8',
      birth: {
        date: '1998-03-03',
        country: 'USA',
      },
      nba: {
        start: 2017,
        pro: 7,
      },
      height: '6-8',
      weight: '210',
      college: 'Duke',
      affiliation: 'Duke',
      leagues: {
        standard: {
          jersey: 0,
          active: true,
          pos: 'F',
        },
      },
    },
    {
      id: '9',
      birth: {
        date: '1996-10-30',
        country: 'USA',
      },
      nba: {
        start: 2015,
        pro: 9,
      },
      height: '6-5',
      weight: '206',
      college: 'Kentucky',
      affiliation: 'Kentucky',
      leagues: {
        standard: {
          jersey: 1,
          active: true,
          pos: 'G',
        },
      },
    },
    {
      id: '10',
      birth: {
        date: '1989-09-14',
        country: 'USA',
      },
      nba: {
        start: 2011,
        pro: 13,
      },
      height: '6-7',
      weight: '230',
      college: 'Marquette',
      affiliation: 'Marquette',
      leagues: {
        standard: {
          jersey: 22,
          active: true,
          pos: 'F',
        },
      },
    },
  ],
};
