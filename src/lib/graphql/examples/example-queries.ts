// Sample Queries

// Remember:
// You can use any combination of filters
// You can use just one filter if needed
// The values should match the expected format (e.g., dates in YYYY-MM-DD)

// Get all seasons
export const GET_SEASONS = `
  query GetSeasons {
    seasons {
      id
      name
      start_date
      end_date
      is_current
    }
  }
`;

// Get all leagues
export const GET_LEAGUES = `
  query GetLeagues {
    leagues {
      id
      name
      type
      logo
    }
  }
`;

// Get games with filters
// where $filters is an object with the following properties:
// {
//   "filters": {
//     "season": "2023",
//     "date": "2024-04-14",
//     "team": "1"
//   }
// }

//   "filters": {
//     "conference": "East",
//     "division": "Atlantic",
//     "code": "BOS"
//   }
// }

export const GET_GAMES = `
  query GetGames($filters: GameFilters) {
    games(filters: $filters) {
      id
      season
      date {
        start
        end
        duration
      }
      status {
        clock
        halftime
        short
        long
      }
      teams {
        visitors {
          id
          name
          code
        }
        home {
          id
          name
          code
        }
      }
      scores {
        visitors {
          points
        }
        home {
          points
        }
      }
    }
  }
`;

// Get teams with filters
export const GET_TEAMS = `
  query GetTeams($filters: TeamFilters) {
    teams(filters: $filters) {
      id
      name
      nickname
      code
      city
      logo
      leagues {
        standard {
          conference
          division
        }
      }
    }
  }
`;

// Get players with filters
export const GET_PLAYERS = `
  query GetPlayers($filters: PlayerFilters) {
    players(filters: $filters) {
      id
      first_name
      last_name
      birth {
        date
        country
      }
      height {
        feets
        inches
      }
      weight {
        pounds
      }
      leagues {
        standard {
          jersey
          active
          pos
        }
      }
    }
  }
`;

// Get standings
export const GET_STANDINGS = `
  query GetStandings {
    standings {
      team {
        name
        code
      }
      conference {
        name
        rank
        win
        loss
      }
      division {
        name
        rank
        win
        loss
      }
      win {
        total
        percentage
      }
      loss {
        total
      }
      games_behind
      streak
    }
  }
`;

// Get game statistics
export const GET_GAME_STATS = `
  query GetGameStats($game_id: ID!) {
    game_stats(game_id: $game_id) {
      game_id
      team
      player_id
      points
      rebounds {
        total
        offensive
        defensive
      }
      assists
      steals
      blocks
    }
  }
`;

// Get player statistics
export const GET_PLAYER_STATS = `
  query GetPlayerStats($player_id: ID!, $season: Int!) {
    player_stats(player_id: $player_id, season: $season) {
      points_per_game
      rebounds_per_game
      assists_per_game
      field_goal_percentage
      three_point_percentage
      free_throw_percentage
    }
  }
`;

// Get game rating
export const GET_GAME_RATING = `
  query GetGameRating($game_id: String!) {
    game_rating(game_id: $game_id) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

// Get multiple game ratings
export const GET_GAME_RATINGS = `
  query GetGameRatings($game_ids: [String!]!) {
    game_ratings(game_ids: $game_ids) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

// Get game logs
export const GET_GAME_LOGS_QUERY = `
  query GetGameLogs {
    game_logs {
      id
      user_id
      game_id
      watched_setting
      watched_date
      watched_location
      rating_for_game
      rating_stars
      watched_count
      created_at
      updated_at
      user {
        id
        username
        first_name
        last_name
        email_address
        image_url
      }
      game {
        id
        game_id
        average_rating
        total_ratings
      }
      comments {
        id
        content
        created_at
        updated_at
      }
    }
  }
`;

// Get game log by ID
export const GET_GAME_LOG = `
  query GetGameLog($id: ID!) {
    game_log(id: $id) {
      id
      user_id
      game_id
      watched_setting
      watched_date
      watched_location
      rating_for_game
      rating_stars
      watched_count
      created_at
      updated_at
      user {
        id
        username
        first_name
        last_name
      }
    }
  }
`;

// Get comments for a game log
export const GET_COMMENTS = gql`
  query GetComments($parent_id: ID!) {
    comments(parent_id: $parent_id) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

// Get comment by ID
export const GET_COMMENT = `
  query GetComment($id: ID!) {
    comment(id: $id) {
      id
      user_id
      game_log_id
      parent_comment_id
      content
      created_at
      updated_at
      user {
        id
        username
        first_name
        last_name
      }
      game_log {
        id
        game_id
        rating_for_game
      }
    }
  }
`;

// Get user by ID
export const GET_USER_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      first_name
      last_name
      email_address
      image_url
      created_at
      updated_at
      banned
      inbound_friendship_ids
      outbound_friendship_ids
      initiated_friendships {
        id
        status
        timestamp
        responder {
          username
          image_url
        }
      }
      received_friendships {
        id
        status
        timestamp
        initiator {
          username
          image_url
        }
      }
      game_logs {
        id
        game_id
        watched_setting
        watched_date
        watched_location
        rating_for_game
        rating_stars
        watched_count
        created_at
        updated_at
      }
    }
  }
`;

// Get user's initiated friendships
export const GET_INITIATED_FRIENDSHIPS_QUERY = `
  query GetInitiatedFriendships($user_id: ID!) {
    user(id: $user_id) {
      initiated_friendships {
        id
        status
        timestamp
        responder {
          username
          image_url
        }
      }
    }
  }
`;

// Get user's received friendships
export const GET_RECEIVED_FRIENDSHIPS_QUERY = `
  query GetReceivedFriendships($user_id: ID!) {
    user(id: $user_id) {
      received_friendships {
        id
        status
        timestamp
        initiator {
          username
          image_url
        }
      }
    }
  }
`;

// Get user's game logs
export const GET_USER_GAME_LOGS_QUERY = `
  query GetUserGameLogs($user_id: ID!) {
    user(id: $user_id) {
      game_logs {
        id
        game_id
        watched_setting
        watched_date
        watched_location
        rating_for_game
        rating_stars
        watched_count
        created_at
        updated_at
      }
    }
  }
`;

// Get all users
export const GET_ALL_USERS = `
  query GetAllUsers {
    users {
      id
      username
      first_name
      last_name
      email_address
      image_url
      created_at
      updated_at
      banned
      inbound_friendship_ids
      outbound_friendship_ids
    }
  }
`;

// Get all friendships
export const GET_ALL_FRIENDSHIPS = `
  query GetAllFriendships {
    friendships {
      id
      status
      subscriber_id
      user_id
      timestamp
    }
  }
`;

// Get all game logs
export const GET_ALL_GAME_LOGS_QUERY = `
  query GetAllGameLogs {
    game_logs {
      id
      user_id
      game_id
      watched_setting
      watched_date
      watched_location
      rating_for_game
      rating_stars
      watched_count
      created_at
      updated_at
      user {
        id
        username
        first_name
        last_name
        email_address
        image_url
      }
      game {
        id
        game_id
        average_rating
        total_ratings
      }
      comments {
        id
        content
        created_at
        updated_at
      }
    }
  }
`;
