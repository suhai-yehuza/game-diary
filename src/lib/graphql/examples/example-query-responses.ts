import { CommentResponse } from '@/lib/types/gamelog.types';

// Example Query Responses
export const GET_SEASONS_RESPONSE = {
  seasons: [
    {
      id: '2023-24',
      name: '2023-24 Season',
      startDate: '2023-10-24',
      endDate: '2024-04-14',
      isCurrent: true,
    },
    {
      id: '2022-23',
      name: '2022-23 Season',
      startDate: '2022-10-18',
      endDate: '2023-04-10',
      isCurrent: false,
    },
  ],
};

export const GET_LEAGUES_RESPONSE = {
  leagues: [
    {
      id: 'standard',
      name: 'NBA',
      type: 'standard',
      logo: 'https://cdn.nba.com/logos/nba/nba-logoman-75-word_white.svg',
    },
    {
      id: 'summerleague',
      name: 'NBA Summer League',
      type: 'summerleague',
      logo: 'https://cdn.nba.com/logos/nba/summer-league-logo.svg',
    },
  ],
};

export const GET_GAMES_RESPONSE = {
  games: [
    {
      id: '123456',
      league: {
        id: 'standard',
        name: 'NBA',
        type: 'standard',
        logo: 'https://cdn.nba.com/logos/nba/nba-logoman-75-word_white.svg',
      },
      season: 2023,
      date: {
        start: '2024-04-14T19:30:00Z',
        end: '2024-04-14T22:00:00Z',
        duration: '2:30',
      },
      stage: 1,
      status: {
        clock: 'Q4 00:00',
        halftime: false,
        short: 4,
        long: 'Final',
      },
      periods: {
        current: 4,
        total: 4,
        endOfPeriod: true,
      },
      arena: {
        name: 'TD Garden',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
      },
      teams: {
        visitors: {
          id: 1610612748,
          name: 'Miami Heat',
          nickname: 'Heat',
          code: 'MIA',
          logo: 'https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg',
        },
        home: {
          id: 1610612738,
          name: 'Boston Celtics',
          nickname: 'Celtics',
          code: 'BOS',
          logo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg',
        },
      },
      scores: {
        visitors: {
          win: 45,
          loss: 35,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: ['25', '30', '28', '22'],
          points: 105,
        },
        home: {
          win: 62,
          loss: 18,
          series: {
            win: 0,
            loss: 0,
          },
          linescore: ['30', '28', '32', '19'],
          points: 109,
        },
      },
      officials: ['Tony Brothers', 'James Capers', 'Sean Wright'],
      timesTied: 8,
      leadChanges: 12,
      nugget: 'Celtics clinch #1 seed in Eastern Conference',
    },
  ],
};

export const GET_TEAMS_RESPONSE = {
  teams: [
    {
      id: '1610612738',
      name: 'Boston Celtics',
      nickname: 'Celtics',
      code: 'BOS',
      city: 'Boston',
      logo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg',
      allStar: false,
      nbaFranchise: true,
      leagues: {
        standard: {
          conference: 'East',
          division: 'Atlantic',
        },
        sacramento: {
          conference: 'East',
          division: 'Atlantic',
        },
        vegas: {
          conference: 'East',
          division: 'Atlantic',
        },
        utah: {
          conference: 'East',
          division: 'Atlantic',
        },
        orlando: {
          conference: 'East',
          division: 'Atlantic',
        },
        africa: {
          conference: 'East',
          division: 'Atlantic',
        },
      },
    },
  ],
};

export const GET_PLAYERS_RESPONSE = {
  players: [
    {
      id: '2544',
      first_name: 'LeBron',
      last_name: 'James',
      birth: {
        date: '1984-12-30',
        country: 'US',
      },
      nba: {
        start: 2003,
        pro: 2003,
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
      affiliation: 'USA',
      leagues: {
        standard: {
          jersey: 23,
          active: true,
          pos: 'F',
        },
        sacramento: {
          jersey: 23,
          active: true,
          pos: 'F',
        },
        vegas: {
          jersey: 23,
          active: true,
          pos: 'F',
        },
        utah: {
          jersey: 23,
          active: true,
          pos: 'F',
        },
        orlando: {
          jersey: 23,
          active: true,
          pos: 'F',
        },
        africa: {
          jersey: 23,
          active: true,
          pos: 'F',
        },
      },
    },
  ],
};

export const GET_STANDINGS_RESPONSE = {
  standings: [
    {
      team: {
        id: '1610612738',
        name: 'Boston Celtics',
        nickname: 'Celtics',
        code: 'BOS',
        city: 'Boston',
        logo: 'https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg',
        allStar: false,
        nbaFranchise: true,
        leagues: {
          standard: {
            conference: 'East',
            division: 'Atlantic',
          },
        },
      },
      conference: {
        name: 'East',
        rank: 1,
        win: 62,
        loss: 18,
      },
      division: {
        name: 'Atlantic',
        rank: 1,
        win: 62,
        loss: 18,
        gamesBehind: '0.0',
      },
      win: {
        home: 32,
        away: 30,
        total: 62,
        percentage: '.775',
        lastTen: 8,
      },
      loss: {
        home: 8,
        away: 10,
        total: 18,
        percentage: '.225',
        lastTen: 2,
      },
      gamesBehind: '0.0',
      streak: 2,
      lastTen: {
        home: 8,
        away: 2,
        total: 10,
        percentage: '.800',
        lastTen: 8,
      },
    },
  ],
};

export const GET_GAME_STATS_RESPONSE = {
  gameStats: [
    {
      game_id: 123456,
      team: 1610612738,
      playerId: 2544,
      points: 25,
      rebounds: {
        total: 10,
        offensive: 3,
        defensive: 7,
      },
      assists: 8,
      steals: 2,
      blocks: 1,
      turnovers: 3,
      fouls: 2,
      minutes: '36:45',
      fieldGoals: {
        made: 10,
        attempted: 20,
        percentage: '50.0',
      },
      threePointers: {
        made: 3,
        attempted: 7,
        percentage: '42.9',
      },
      freeThrows: {
        made: 2,
        attempted: 3,
        percentage: '66.7',
      },
      plusMinus: 15,
    },
  ],
};

export const GET_PLAYER_STATS_RESPONSE = {
  playerStats: {
    playerId: 2544,
    season: 2023,
    gamesPlayed: 71,
    pointsPerGame: 25.7,
    fieldGoalPercentage: '54.0',
    threePointPercentage: '41.0',
    freeThrowPercentage: '75.0',
    reboundsPerGame: 7.3,
    assistsPerGame: 8.3,
    stealsPerGame: 1.2,
    blocksPerGame: 0.5,
    turnoversPerGame: 3.5,
    foulsPerGame: 1.8,
    plusMinus: 7.2,
    minutesPerGame: '34.7',
    doubleDoubles: 22,
    tripleDoubles: 4,
  },
};

export const GET_TEAM_STATS_RESPONSE = {
  teamStats: {
    team: 1610612738,
    season: 2023,
    gamesPlayed: 80,
    pointsPerGame: 120.6,
    fieldGoalPercentage: '48.7',
    threePointPercentage: '38.8',
    freeThrowPercentage: '80.2',
    reboundsPerGame: 46.2,
    assistsPerGame: 26.8,
    stealsPerGame: 7.4,
    blocksPerGame: 5.8,
    turnoversPerGame: 12.3,
    foulsPerGame: 19.2,
    plusMinus: 11.4,
  },
};

export const GET_GAME_RATING_RESPONSE = {
  gameRating: {
    id: 'rating123',
    game_id: 'game123',
    average_rating: '4.5',
    total_ratings: 100,
    created_at: '2024-04-14T19:30:00Z',
    updated_at: '2024-04-14T19:30:00Z',
  },
};

export const GET_GAME_LOGS_RESPONSE = {
  game_logs: [
    {
      id: 'game-log-1',
      user_id: 'user-1',
      game_id: 'game-1',
      watched_setting: 'tv',
      watched_date: '2024-04-14T19:30:00Z',
      watched_location: 'Home',
      rating_for_game: 4.5,
      rating_stars: '4.5',
      watched_count: 1,
      created_at: '2024-04-14T19:30:00Z',
      updated_at: '2024-04-14T19:30:00Z',
    },
  ],
};

export const exampleQueryResponses = {
  // Response for getGameRating query
  getGameRating: {
    id: '1',
    game_id: 'game123',
    average_rating: 4.5,
    total_ratings: 100,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
  },

  // Response for getGameRatings query
  getGameRatings: {
    edges: [
      {
        node: {
          id: '1',
          game_id: 'game123',
          average_rating: 4.5,
          total_ratings: 100,
          created_at: '2024-03-20T10:00:00Z',
          updated_at: '2024-03-20T10:00:00Z',
        },
        cursor: '1',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '1',
      endCursor: '1',
    },
    totalCount: 1,
  },

  // Response for getGameLog query
  getGameLog: {
    id: '1',
    user_id: 'user123',
    game_id: 'game123',
    watched_setting: 'SOLO',
    watched_date: '2024-03-20T10:00:00Z',
    watched_location: 'Home',
    rating_for_game: 5,
    watched_count: 1,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
    user: {
      __typename: 'User',
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/johndoe.jpg',
    },
    game: {
      id: '1',
      game_id: 'game123',
      average_rating: 4.5,
      total_ratings: 100,
      created_at: '2024-03-20T10:00:00Z',
      updated_at: '2024-03-20T10:00:00Z',
    },
    comments: {
      edges: [
        {
          node: {
            id: '1',
            content: 'Great game!',
            created_at: '2024-03-20T10:00:00Z',
            updated_at: '2024-03-20T10:00:00Z',
            user: {
              __typename: 'User',
              id: 'user123',
              username: 'johndoe',
              first_name: 'John',
              last_name: 'Doe',
              image_url: 'https://example.com/johndoe.jpg',
            },
          },
          cursor: '1',
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '1',
        endCursor: '1',
      },
      totalCount: 1,
    },
  },

  // Response for getGameLogs query
  getGameLogs: {
    edges: [
      {
        node: {
          id: '1',
          user_id: 'user123',
          game_id: 'game123',
          watched_setting: 'SOLO',
          watched_date: '2024-03-20T10:00:00Z',
          watched_location: 'Home',
          rating_for_game: 5,
          watched_count: 1,
          created_at: '2024-03-20T10:00:00Z',
          updated_at: '2024-03-20T10:00:00Z',
          user: {
            __typename: 'User',
            id: 'user123',
            username: 'johndoe',
            first_name: 'John',
            last_name: 'Doe',
            image_url: 'https://example.com/johndoe.jpg',
          },
          game: {
            id: '1',
            game_id: 'game123',
            average_rating: 4.5,
            total_ratings: 100,
            created_at: '2024-03-20T10:00:00Z',
            updated_at: '2024-03-20T10:00:00Z',
          },
        },
        cursor: '1',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '1',
      endCursor: '1',
    },
    totalCount: 1,
  },

  // Response for getUser query
  getUser: {
    __typename: 'User',
    id: 'user123',
    username: 'johndoe',
    first_name: 'John',
    last_name: 'Doe',
    image_url: 'https://example.com/johndoe.jpg',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
    game_logs: {
      edges: [
        {
          node: {
            id: '1',
            game_id: 'game123',
            watched_setting: 'SOLO',
            watched_date: '2024-03-20T10:00:00Z',
            watched_location: 'Home',
            rating_for_game: 5,
            watched_count: 1,
            created_at: '2024-03-20T10:00:00Z',
            updated_at: '2024-03-20T10:00:00Z',
          },
          cursor: '1',
        },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '1',
        endCursor: '1',
      },
      totalCount: 1,
    },
  },
};

export const GET_GAME_LOG_RESPONSE = {
  game_log: {
    id: 'game-log-1',
    user_id: 'user-1',
    game_id: 'game-1',
    watched_setting: 'tv',
    watched_date: '2024-04-14T19:30:00Z',
    watched_location: 'Home',
    rating_for_game: 4.5,
    rating_stars: '4.5',
    watched_count: 1,
    created_at: '2024-04-14T19:30:00Z',
    updated_at: '2024-04-14T19:30:00Z',
    user: {
      __typename: 'User',
      id: 'user-1',
      username: 'celticsfan',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/avatar.jpg',
    },
    game: {
      id: 'game-1',
      game_id: '123456',
      average_rating: '4.5',
      total_ratings: 100,
    },
    comments: [
      {
        id: 'comment-1',
        user_id: 'user-1',
        parent_id: 'game-log-1',
        content: 'Great game! The Celtics played really well.',
        created_at: '2024-04-14T20:30:00Z',
        updated_at: '2024-04-14T20:30:00Z',
        user: {
          __typename: 'User',
          id: 'user-1',
          username: 'celticsfan',
          first_name: 'John',
          last_name: 'Doe',
          image_url: 'https://example.com/avatar.jpg',
        },
      },
    ],
  },
};

export const GET_COMMENT_RESPONSE = {
  comment: {
    id: 'comment-1',
    user_id: 'user-1',
    parent_id: 'game-log-1',
    content: 'Great game! The Celtics played really well.',
    created_at: '2024-04-14T20:30:00Z',
    updated_at: '2024-04-14T20:30:00Z',
    user: {
      __typename: 'User',
      id: 'user-1',
      username: 'celticsfan',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/avatar.jpg',
    },
  },
};

export const GET_USER_RESPONSE = {
  user: {
    __typename: 'User',
    id: 'user-1',
    username: 'celticsfan',
    first_name: 'John',
    last_name: 'Doe',
    email_address: 'john.doe@example.com',
    image_url: 'https://example.com/avatar.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    banned: false,
    inbound_friendship_ids: [],
    outbound_friendship_ids: [],
    initiated_friendships: [
      {
        id: 'friendship-1',
        status: 'connected',
        timestamp: '2024-01-01T00:00:00Z',
        recipient: {
          username: 'heatfan',
          image_url: 'https://example.com/avatar2.jpg',
        },
      },
    ],
    received_friendships: [
      {
        id: 'friendship-2',
        status: 'connected',
        timestamp: '2024-01-01T00:00:00Z',
        initiator: {
          username: 'lakersfan',
          image_url: 'https://example.com/avatar3.jpg',
        },
      },
    ],
    game_logs: [
      {
        id: 'game-log-1',
        game_id: 'game-1',
        watched_setting: 'tv',
        watched_date: '2024-04-14T19:30:00Z',
        watched_location: 'Home',
        rating_for_game: 4.5,
        rating_stars: '4.5',
        watched_count: 1,
        created_at: '2024-04-14T19:30:00Z',
        updated_at: '2024-04-14T19:30:00Z',
      },
    ],
  },
};

export const GET_FRIENDSHIPS_RESPONSE = {
  friendship: {
    id: 'friendship123',
    subscriber_id: 'user123',
    user_id: 'user456',
    status: 'accepted',
    timestamp: '2024-01-02T00:00:00Z',
    initiator: {
      __typename: 'User',
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john.doe@example.com',
      image_url: 'https://example.com/johndoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
    recipient: {
      __typename: 'User',
      id: 'user456',
      username: 'janedoe',
      first_name: 'Jane',
      last_name: 'Doe',
      email_address: 'jane.doe@example.com',
      image_url: 'https://example.com/janedoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
  },
};

export const exampleCommentResponse: CommentResponse = {
  id: '123',
  content: 'This is a comment',
  created_at: '2024-03-20T12:00:00Z',
  updated_at: '2024-03-20T12:00:00Z',
  user: {
    id: '456',
    username: 'commenter1',
    photo_url: 'https://example.com/avatar1.jpg',
  },
  reactions: [],
};

export const exampleCommentsResponse: CommentResponse[] = [
  {
    id: '123',
    content: 'This is a comment',
    created_at: '2024-03-20T12:00:00Z',
    updated_at: '2024-03-20T12:00:00Z',
    user: {
      id: '456',
      username: 'commenter1',
      photo_url: 'https://example.com/avatar1.jpg',
    },
    reactions: [],
  },
  {
    id: '124',
    content: 'This is another comment',
    created_at: '2024-03-20T12:01:00Z',
    updated_at: '2024-03-20T12:01:00Z',
    user: {
      id: '457',
      username: 'commenter2',
      photo_url: 'https://example.com/avatar2.jpg',
    },
    reactions: [],
  },
];

export const exampleCreateCommentResponse: CommentResponse = {
  id: '123',
  content: 'This is a new comment',
  created_at: '2024-03-20T12:00:00Z',
  updated_at: '2024-03-20T12:00:00Z',
  user: {
    id: '456',
    username: 'commenter1',
    photo_url: 'https://example.com/avatar1.jpg',
  },
  reactions: [],
};

export const exampleUpdateCommentResponse: CommentResponse = {
  id: '123',
  content: 'This is an updated comment',
  created_at: '2024-03-20T12:00:00Z',
  updated_at: '2024-03-20T12:00:00Z',
  user: {
    id: '456',
    username: 'commenter1',
    photo_url: 'https://example.com/avatar1.jpg',
  },
  reactions: [],
};

export const exampleDeleteCommentResponse: { id: string } = {
  id: '123',
};

export const GET_COMMENTS_RESPONSE = {
  comments: [
    {
      id: 'comment-1',
      user_id: 'user-1',
      parent_id: 'game-log-1',
      content: 'Great game! The Celtics played really well.',
      created_at: '2024-04-14T20:30:00Z',
      updated_at: '2024-04-14T20:30:00Z',
      user: {
        __typename: 'User',
        id: 'user-1',
        username: 'celticsfan',
        first_name: 'John',
        last_name: 'Doe',
        image_url: 'https://example.com/avatar.jpg',
      },
    },
  ],
};

export const GET_USER_GAME_LOGS_RESPONSE = {
  user: {
    game_logs: [
      {
        id: 'game-log-1',
        game_id: 'game-1',
        watched_setting: 'tv',
        watched_date: '2024-04-14T19:30:00Z',
        watched_location: 'Home',
        rating_for_game: 4.5,
        rating_stars: '4.5',
        watched_count: 1,
        created_at: '2024-04-14T19:30:00Z',
        updated_at: '2024-04-14T19:30:00Z',
        comments: [
          {
            id: 'comment-1',
            user_id: 'user-1',
            parent_id: 'game-log-1',
            content: 'Great game! The Celtics played really well.',
            created_at: '2024-04-14T20:30:00Z',
            updated_at: '2024-04-14T20:30:00Z',
            user: {
              __typename: 'User',
              id: 'user-1',
              username: 'celticsfan',
              first_name: 'John',
              last_name: 'Doe',
              image_url: 'https://example.com/avatar.jpg',
            },
          },
        ],
      },
    ],
  },
};

export const GET_ALL_USERS_RESPONSE = {
  users: [
    {
      __typename: 'User',
      id: 'user-1',
      username: 'celticsfan',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john.doe@example.com',
      image_url: 'https://example.com/avatar.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
  ],
};

export const GET_ALL_FRIENDSHIPS_RESPONSE = {
  friendships: [
    {
      id: 'friendship-1',
      status: 'connected',
      subscriber_id: 'user-1',
      user_id: 'user-2',
      timestamp: '2024-01-01T00:00:00Z',
    },
  ],
};

export const GET_ALL_GAME_LOGS_RESPONSE = {
  game_logs: [
    {
      id: 'game-log-1',
      user_id: 'user-1',
      game_id: 'game-1',
      watched_setting: 'tv',
      watched_date: '2024-04-14T19:30:00Z',
      watched_location: 'Home',
      rating_for_game: 4.5,
      rating_stars: '4.5',
      watched_count: 1,
      created_at: '2024-04-14T19:30:00Z',
      updated_at: '2024-04-14T19:30:00Z',
      user: {
        __typename: 'User',
        id: 'user-1',
        username: 'celticsfan',
        first_name: 'John',
        last_name: 'Doe',
        image_url: 'https://example.com/avatar.jpg',
      },
      game: {
        id: 'game-1',
        game_id: '123456',
        average_rating: '4.5',
        total_ratings: 100,
      },
      comments: [
        {
          id: 'comment-1',
          user_id: 'user-1',
          parent_id: 'game-log-1',
          content: 'Great game! The Celtics played really well.',
          created_at: '2024-04-14T20:30:00Z',
          updated_at: '2024-04-14T20:30:00Z',
          user: {
            __typename: 'User',
            id: 'user-1',
            username: 'celticsfan',
            first_name: 'John',
            last_name: 'Doe',
            image_url: 'https://example.com/avatar.jpg',
          },
        },
      ],
    },
  ],
};
