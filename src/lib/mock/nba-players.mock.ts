import type { IPlayersApiResponse } from '@/lib/types/external.api.types';

export const MOCK_NBA_PLAYERS: IPlayersApiResponse = {
  get: 'players',
  parameters: {
    league: '12',
    season: '2024',
  },
  errors: [],
  results: 10,
  response: [
    {
      id: 1,
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
    {
      id: 2,
      firstname: 'Stephen',
      lastname: 'Curry',
      birth: {
        date: '1988-03-14',
        country: 'USA',
      },
      nba: {
        start: 2009,
        pro: 15,
      },
      height: {
        feets: '6',
        inches: '3',
        meters: '1.91',
      },
      weight: {
        pounds: '185',
        kilograms: '83.9',
      },
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
      id: 3,
      firstname: 'Kevin',
      lastname: 'Durant',
      birth: {
        date: '1988-09-29',
        country: 'USA',
      },
      nba: {
        start: 2007,
        pro: 17,
      },
      height: {
        feets: '6',
        inches: '10',
        meters: '2.08',
      },
      weight: {
        pounds: '240',
        kilograms: '108.9',
      },
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
      id: 4,
      firstname: 'Giannis',
      lastname: 'Antetokounmpo',
      birth: {
        date: '1994-12-06',
        country: 'Greece',
      },
      nba: {
        start: 2013,
        pro: 11,
      },
      height: {
        feets: '6',
        inches: '11',
        meters: '2.11',
      },
      weight: {
        pounds: '242',
        kilograms: '109.8',
      },
      college: null,
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
      id: 5,
      firstname: 'Nikola',
      lastname: 'Jokic',
      birth: {
        date: '1995-02-19',
        country: 'Serbia',
      },
      nba: {
        start: 2015,
        pro: 9,
      },
      height: {
        feets: '6',
        inches: '11',
        meters: '2.11',
      },
      weight: {
        pounds: '284',
        kilograms: '128.8',
      },
      college: null,
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
      id: 6,
      firstname: 'Luka',
      lastname: 'Doncic',
      birth: {
        date: '1999-02-28',
        country: 'Slovenia',
      },
      nba: {
        start: 2018,
        pro: 6,
      },
      height: {
        feets: '6',
        inches: '7',
        meters: '2.01',
      },
      weight: {
        pounds: '230',
        kilograms: '104.3',
      },
      college: null,
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
      id: 7,
      firstname: 'Joel',
      lastname: 'Embiid',
      birth: {
        date: '1994-03-16',
        country: 'Cameroon',
      },
      nba: {
        start: 2016,
        pro: 8,
      },
      height: {
        feets: '7',
        inches: '0',
        meters: '2.13',
      },
      weight: {
        pounds: '280',
        kilograms: '127.0',
      },
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
      id: 8,
      firstname: 'Jayson',
      lastname: 'Tatum',
      birth: {
        date: '1998-03-03',
        country: 'USA',
      },
      nba: {
        start: 2017,
        pro: 7,
      },
      height: {
        feets: '6',
        inches: '8',
        meters: '2.03',
      },
      weight: {
        pounds: '210',
        kilograms: '95.3',
      },
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
      id: 9,
      firstname: 'Devin',
      lastname: 'Booker',
      birth: {
        date: '1996-10-30',
        country: 'USA',
      },
      nba: {
        start: 2015,
        pro: 9,
      },
      height: {
        feets: '6',
        inches: '5',
        meters: '1.96',
      },
      weight: {
        pounds: '206',
        kilograms: '93.4',
      },
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
      id: 10,
      firstname: 'Jimmy',
      lastname: 'Butler',
      birth: {
        date: '1989-09-14',
        country: 'USA',
      },
      nba: {
        start: 2011,
        pro: 13,
      },
      height: {
        feets: '6',
        inches: '7',
        meters: '2.01',
      },
      weight: {
        pounds: '230',
        kilograms: '104.3',
      },
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
