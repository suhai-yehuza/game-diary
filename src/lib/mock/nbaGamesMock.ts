import type { IGamesApiResponse } from '@/lib/types/externalApiTypes';

// Constants for basketball scores
const BASKETBALL_SCORES = {
  QUARTER_1: {
    KNICKS: 28,
    CELTICS: 30,
    WARRIORS: 25,
    LAKERS: 22,
    HEAT: 32,
    SIXERS: 35,
    SUNS: 28,
  },
  QUARTER_2: {
    KNICKS: 32,
    CELTICS: 35,
    WARRIORS: 28,
    LAKERS: 30,
    HEAT: 28,
    SIXERS: 30,
    SUNS: 30,
  },
  QUARTER_3: {
    WARRIORS: 30,
    LAKERS: 32,
    HEAT: 25,
    SIXERS: 28,
    SUNS: 25,
  },
  QUARTER_4: {
    WARRIORS: 25,
    LAKERS: 28,
    HEAT: 30,
    SIXERS: 25,
    SUNS: 35,
  },
} as const;

export const MOCK_NBA_GAMES: IGamesApiResponse = {
  get: 'games',
  parameters: {
    season: '2024',
    league: '12',
  },
  errors: [],
  results: 5,
  response: [
    {
      id: 1234567,
      league: 'NBA',
      season: 2024,
      date: {
        start: '2024-12-23T19:30:00.000Z',
        end: '2024-12-23T22:15:00.000Z',
        duration: '2:45',
      },
      stage: 2,
      status: {
        clock: '8:32',
        halftime: false,
        short: 'Q3',
        long: '3rd Quarter',
      },
      periods: {
        current: 3,
        total: 4,
        endOfPeriod: false,
      },
      arena: {
        name: 'Madison Square Garden',
        city: 'New York',
        state: 'NY',
        country: 'USA',
      },
      teams: {
        home: {
          id: 583,
          name: 'New York Knicks',
          nickname: 'Knicks',
          code: 'NYK',
          logo: 'https://media.api-sports.io/basketball/teams/583.png',
        },
        visitors: {
          id: 584,
          name: 'Boston Celtics',
          nickname: 'Celtics',
          code: 'BOS',
          logo: 'https://media.api-sports.io/basketball/teams/584.png',
        },
      },
      scores: {
        home: {
          win: 15,
          loss: 12,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [BASKETBALL_SCORES.QUARTER_1.KNICKS, BASKETBALL_SCORES.QUARTER_2.KNICKS, 0, 0],
          points: 60,
        },
        visitors: {
          win: 20,
          loss: 7,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [
            BASKETBALL_SCORES.QUARTER_1.CELTICS,
            BASKETBALL_SCORES.QUARTER_2.CELTICS,
            0,
            0,
          ],
          points: 65,
        },
      },
      officials: ['John Smith', 'Jane Doe', 'Mike Johnson'],
      timesTied: 3,
      leadChanges: 7,
      nugget: 'Celtics lead by 5 in a high-scoring affair',
    },
    {
      id: 1234568,
      league: 'NBA',
      season: 2024,
      date: {
        start: '2024-12-22T20:00:00.000Z',
        end: '2024-12-22T22:45:00.000Z',
        duration: '2:45',
      },
      stage: 2,
      status: {
        clock: undefined,
        halftime: false,
        short: 'FT',
        long: 'Match Finished',
      },
      periods: {
        current: 4,
        total: 4,
        endOfPeriod: true,
      },
      arena: {
        name: 'Chase Center',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
      },
      teams: {
        home: {
          id: 585,
          name: 'Golden State Warriors',
          nickname: 'Warriors',
          code: 'GSW',
          logo: 'https://media.api-sports.io/basketball/teams/585.png',
        },
        visitors: {
          id: 586,
          name: 'Los Angeles Lakers',
          nickname: 'Lakers',
          code: 'LAL',
          logo: 'https://media.api-sports.io/basketball/teams/586.png',
        },
      },
      scores: {
        home: {
          win: 12,
          loss: 15,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [
            BASKETBALL_SCORES.QUARTER_1.WARRIORS,
            BASKETBALL_SCORES.QUARTER_2.WARRIORS,
            BASKETBALL_SCORES.QUARTER_3.WARRIORS,
            BASKETBALL_SCORES.QUARTER_4.WARRIORS,
          ],
          points: 108,
        },
        visitors: {
          win: 14,
          loss: 13,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [
            BASKETBALL_SCORES.QUARTER_1.LAKERS,
            BASKETBALL_SCORES.QUARTER_2.LAKERS,
            BASKETBALL_SCORES.QUARTER_3.LAKERS,
            BASKETBALL_SCORES.QUARTER_4.LAKERS,
          ],
          points: 112,
        },
      },
      officials: ['Bob Wilson', 'Sarah Brown', 'Tom Davis'],
      timesTied: 5,
      leadChanges: 12,
      nugget: 'Lakers win by 4 in overtime thriller',
    },
    {
      id: 1234569,
      league: 'NBA',
      season: 2024,
      date: {
        start: '2024-12-21T18:30:00.000Z',
        end: '2024-12-21T21:15:00.000Z',
        duration: '2:45',
      },
      stage: 2,
      status: {
        clock: undefined,
        halftime: false,
        short: 'FT',
        long: 'Match Finished',
      },
      periods: {
        current: 4,
        total: 4,
        endOfPeriod: true,
      },
      arena: {
        name: 'American Airlines Arena',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
      },
      teams: {
        home: {
          id: 587,
          name: 'Miami Heat',
          nickname: 'Heat',
          code: 'MIA',
          logo: 'https://media.api-sports.io/basketball/teams/587.png',
        },
        visitors: {
          id: 588,
          name: 'Philadelphia 76ers',
          nickname: '76ers',
          code: 'PHI',
          logo: 'https://media.api-sports.io/basketball/teams/588.png',
        },
      },
      scores: {
        home: {
          win: 16,
          loss: 11,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [
            BASKETBALL_SCORES.QUARTER_1.HEAT,
            BASKETBALL_SCORES.QUARTER_2.HEAT,
            BASKETBALL_SCORES.QUARTER_3.HEAT,
            BASKETBALL_SCORES.QUARTER_4.HEAT,
          ],
          points: 115,
        },
        visitors: {
          win: 18,
          loss: 9,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [
            BASKETBALL_SCORES.QUARTER_1.SIXERS,
            BASKETBALL_SCORES.QUARTER_2.SIXERS,
            BASKETBALL_SCORES.QUARTER_3.SIXERS,
            BASKETBALL_SCORES.QUARTER_4.SIXERS,
          ],
          points: 118,
        },
      },
      officials: ['Mark Thompson', 'Lisa Garcia', 'David Lee'],
      timesTied: 2,
      leadChanges: 4,
      nugget: '76ers win by 3 in close contest',
    },
    {
      id: 1234570,
      league: 'NBA',
      season: 2024,
      date: {
        start: '2024-12-24T19:00:00.000Z',
        end: '2024-12-24T21:45:00.000Z',
        duration: '2:45',
      },
      stage: 2,
      status: {
        clock: undefined,
        halftime: false,
        short: 'NS',
        long: 'Not Started',
      },
      periods: {
        current: 0,
        total: 4,
        endOfPeriod: false,
      },
      arena: {
        name: 'TD Garden',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
      },
      teams: {
        home: {
          id: 584,
          name: 'Boston Celtics',
          nickname: 'Celtics',
          code: 'BOS',
          logo: 'https://media.api-sports.io/basketball/teams/584.png',
        },
        visitors: {
          id: 589,
          name: 'Milwaukee Bucks',
          nickname: 'Bucks',
          code: 'MIL',
          logo: 'https://media.api-sports.io/basketball/teams/589.png',
        },
      },
      scores: {
        home: {
          win: 20,
          loss: 7,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [0, 0, 0, 0],
          points: 0,
        },
        visitors: {
          win: 18,
          loss: 9,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [0, 0, 0, 0],
          points: 0,
        },
      },
      officials: ['Alex Johnson', 'Maria Rodriguez', 'Chris Williams'],
      timesTied: 0,
      leadChanges: 0,
      nugget: 'Eastern Conference showdown',
    },
    {
      id: 1234571,
      league: 'NBA',
      season: 2024,
      date: {
        start: '2024-12-20T20:30:00.000Z',
        end: '2024-12-20T23:15:00.000Z',
        duration: '2:45',
      },
      stage: 2,
      status: {
        clock: undefined,
        halftime: false,
        short: 'FT',
        long: 'Match Finished',
      },
      periods: {
        current: 4,
        total: 4,
        endOfPeriod: true,
      },
      arena: {
        name: 'Crypto.com Arena',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
      },
      teams: {
        home: {
          id: 586,
          name: 'Los Angeles Lakers',
          nickname: 'Lakers',
          code: 'LAL',
          logo: 'https://media.api-sports.io/basketball/teams/586.png',
        },
        visitors: {
          id: 590,
          name: 'Phoenix Suns',
          nickname: 'Suns',
          code: 'PHX',
          logo: 'https://media.api-sports.io/basketball/teams/590.png',
        },
      },
      scores: {
        home: {
          win: 14,
          loss: 13,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [
            BASKETBALL_SCORES.QUARTER_1.LAKERS,
            BASKETBALL_SCORES.QUARTER_2.LAKERS,
            BASKETBALL_SCORES.QUARTER_3.LAKERS,
            BASKETBALL_SCORES.QUARTER_4.LAKERS,
          ],
          points: 115,
        },
        visitors: {
          win: 16,
          loss: 11,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [
            BASKETBALL_SCORES.QUARTER_1.SUNS,
            BASKETBALL_SCORES.QUARTER_2.SUNS,
            BASKETBALL_SCORES.QUARTER_3.SUNS,
            BASKETBALL_SCORES.QUARTER_4.SUNS,
          ],
          points: 118,
        },
      },
      officials: ['James Wilson', 'Emily Davis', 'Michael Brown'],
      timesTied: 8,
      leadChanges: 15,
      nugget: 'Suns win in overtime thriller',
    },
  ],
};
