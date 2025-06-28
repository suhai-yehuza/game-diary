import type { IGamesApiResponse } from '@/lib/types/externalApiTypes';

// Constants for common basketball scores
const BASKETBALL_SCORES = {
  QUARTER_1: {
    KNICKS: 28,
    CELTICS: 30,
    WARRIORS: 25,
    LAKERS: 22,
    HEAT: 32,
    SIXERS: 35,
  },
  QUARTER_2: {
    KNICKS: 32,
    CELTICS: 35,
    WARRIORS: 28,
    LAKERS: 30,
    HEAT: 28,
    SIXERS: 30,
  },
  QUARTER_3: {
    WARRIORS: 30,
    LAKERS: 32,
  },
} as const;

export const MOCK_LIVE_GAMES: IGamesApiResponse = {
  get: 'games',
  parameters: {
    league: '12',
    season: '2023-24',
    date: '2024-12-23',
  },
  errors: [],
  results: 3,
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
        clock: '5:30',
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
          id: 583,
          name: 'Boston Celtics',
          nickname: 'Celtics',
          code: 'BOS',
          logo: 'https://media.api-sports.io/basketball/teams/583.png',
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
        start: '2024-12-23T20:00:00.000Z',
        end: '2024-12-23T22:45:00.000Z',
        duration: '2:45',
      },
      stage: 2,
      status: {
        clock: '2:15',
        halftime: false,
        short: 'Q4',
        long: '4th Quarter',
      },
      periods: {
        current: 4,
        total: 4,
        endOfPeriod: false,
      },
      arena: {
        name: 'Chase Center',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
      },
      teams: {
        home: {
          id: 583,
          name: 'Golden State Warriors',
          nickname: 'Warriors',
          code: 'GSW',
          logo: 'https://media.api-sports.io/basketball/teams/583.png',
        },
        visitors: {
          id: 583,
          name: 'Los Angeles Lakers',
          nickname: 'Lakers',
          code: 'LAL',
          logo: 'https://media.api-sports.io/basketball/teams/583.png',
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
            0,
          ],
          points: 83,
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
            0,
          ],
          points: 84,
        },
      },
      officials: ['Bob Wilson', 'Sarah Brown', 'Tom Davis'],
      timesTied: 5,
      leadChanges: 12,
      nugget: 'Lakers lead by 1 in a nail-biter finish',
    },
    {
      id: 1234569,
      league: 'NBA',
      season: 2024,
      date: {
        start: '2024-12-23T18:30:00.000Z',
        end: '2024-12-23T21:15:00.000Z',
        duration: '2:45',
      },
      stage: 2,
      status: {
        clock: undefined,
        halftime: true,
        short: 'HT',
        long: 'Halftime',
      },
      periods: {
        current: 2,
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
          id: 583,
          name: 'Miami Heat',
          nickname: 'Heat',
          code: 'MIA',
          logo: 'https://media.api-sports.io/basketball/teams/583.png',
        },
        visitors: {
          id: 583,
          name: 'Philadelphia 76ers',
          nickname: '76ers',
          code: 'PHI',
          logo: 'https://media.api-sports.io/basketball/teams/583.png',
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
          linescore: [BASKETBALL_SCORES.QUARTER_1.HEAT, BASKETBALL_SCORES.QUARTER_2.HEAT, 0, 0],
          points: 60,
        },
        visitors: {
          win: 18,
          loss: 9,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: [BASKETBALL_SCORES.QUARTER_1.SIXERS, BASKETBALL_SCORES.QUARTER_2.SIXERS, 0, 0],
          points: 65,
        },
      },
      officials: ['Mark Thompson', 'Lisa Garcia', 'David Lee'],
      timesTied: 2,
      leadChanges: 4,
      nugget: '76ers lead by 5 at halftime',
    },
  ],
};
