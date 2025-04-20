import { gql } from "@apollo/client";

// EXTERNAL API QUERIES
export const GET_SEASONS = gql`
  query GetSeasons {
    seasons {
      id
      name
      startDate
      endDate
      isCurrent
    }
  }
`;

export const GET_LEAGUES = gql`
  query GetLeagues {
    leagues {
      id
      name
      type
      logo
    }
  }
`;

export const GET_GAMES = gql`
  query GetGames($filters: GameFilters, $pagination: PaginationInput) {
    games(filters: $filters, pagination: $pagination) {
      edges {
        node {
          id
          league {
            id
            name
            type
            logo
          }
          season
          date {
            start
            end
            duration
          }
          stage
          status {
            clock
            halftime
            short
            long
          }
          periods {
            current
            total
            endOfPeriod
          }
          arena {
            name
            city
            state
            country
          }
          teams {
            visitors {
              id
              name
              nickname
              code
              logo
            }
            home {
              id
              name
              nickname
              code
              logo
            }
          }
          scores {
            visitors {
              win
              loss
              series {
                win
                loss
              }
              linescore
              points
            }
            home {
              win
              loss
              series {
                win
                loss
              }
              linescore
              points
            }
          }
          officials
          timesTied
          leadChanges
          nugget
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_TEAMS = gql`
  query GetTeams($filters: TeamFilters) {
    teams(filters: $filters) {
      id
      name
      nickname
      code
      city
      logo
      allStar
      nbaFranchise
      leagues {
        standard {
          conference
          division
        }
        sacramento {
          conference
          division
        }
        vegas {
          conference
          division
        }
        utah {
          conference
          division
        }
        orlando {
          conference
          division
        }
        africa {
          conference
          division
        }
      }
    }
  }
`;

export const GET_PLAYERS = gql`
  query GetPlayers($filters: PlayerFilters, $pagination: PaginationInput) {
    players(filters: $filters, pagination: $pagination) {
      edges {
        node {
          id
          firstname
          lastname
          birth {
            date
            country
          }
          nba {
            start
            pro
          }
          height {
            feets
            inches
            meters
          }
          weight {
            pounds
            kilograms
          }
          college
          affiliation
          leagues {
            standard {
              jersey
              active
              pos
            }
            sacramento {
              jersey
              active
              pos
            }
            vegas {
              jersey
              active
              pos
            }
            utah {
              jersey
              active
              pos
            }
            orlando {
              jersey
              active
              pos
            }
            africa {
              jersey
              active
              pos
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      id
      firstname
      lastname
      birth {
        date
        country
      }
      nba {
        start
        pro
      }
      height {
        feets
        inches
        meters
      }
      weight {
        pounds
        kilograms
      }
      college
      affiliation
      leagues {
        standard {
          jersey
          active
          pos
        }
        sacramento {
          jersey
          active
          pos
        }
        vegas {
          jersey
          active
          pos
        }
        utah {
          jersey
          active
          pos
        }
        orlando {
          jersey
          active
          pos
        }
        africa {
          jersey
          active
          pos
        }
      }
    }
  }
`;

export const GET_STANDINGS = gql`
  query GetStandings {
    standings {
      team {
        id
        name
        nickname
        code
        city
        logo
        allStar
        nbaFranchise
        leagues {
          standard {
            conference
            division
          }
        }
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
        gamesBehind
      }
      win {
        home
        away
        total
        percentage
        lastTen
      }
      loss {
        home
        away
        total
        percentage
        lastTen
      }
      gamesBehind
      streak
      lastTen {
        home
        away
        total
        percentage
        lastTen
      }
    }
  }
`;

export const GET_GAME_STATS = gql`
  query GetGameStats($game_id: ID!) {
    gameStats(game_id: $game_id) {
      game_id
      team
      playerId
      points
      rebounds {
        total
        offensive
        defensive
      }
      assists
      steals
      blocks
      turnovers
      fouls
      minutes
      fieldGoals {
        made
        attempted
        percentage
      }
      threePointers {
        made
        attempted
        percentage
      }
      freeThrows {
        made
        attempted
        percentage
      }
      plusMinus
    }
  }
`;

export const GET_PLAYER_GAME_STATS = gql`
  query GetPlayerGameStats($game_id: ID!, $playerId: ID!) {
    playerGameStats(game_id: $game_id, playerId: $playerId) {
      game_id
      team
      playerId
      points
      rebounds {
        total
        offensive
        defensive
      }
      assists
      steals
      blocks
      turnovers
      fouls
      minutes
      fieldGoals {
        made
        attempted
        percentage
      }
      threePointers {
        made
        attempted
        percentage
      }
      freeThrows {
        made
        attempted
        percentage
      }
      plusMinus
    }
  }
`;

export const GET_TEAM_GAME_STATS = gql`
  query GetTeamGameStats($game_id: ID!, $team: ID!) {
    teamGameStats(game_id: $game_id, team: $team) {
      game_id
      team
      playerId
      points
      rebounds {
        total
        offensive
        defensive
      }
      assists
      steals
      blocks
      turnovers
      fouls
      minutes
      fieldGoals {
        made
        attempted
        percentage
      }
      threePointers {
        made
        attempted
        percentage
      }
      freeThrows {
        made
        attempted
        percentage
      }
      plusMinus
    }
  }
`;

export const GET_TEAM_STATS = gql`
  query GetTeamStats($team: ID!, $season: Int!) {
    teamStats(team: $team, season: $season) {
      team
      season
      gamesPlayed
      pointsPerGame
      fieldGoalPercentage
      threePointPercentage
      freeThrowPercentage
      reboundsPerGame
      assistsPerGame
      stealsPerGame
      blocksPerGame
      turnoversPerGame
      foulsPerGame
      plusMinus
    }
  }
`;

export const GET_ALL_TEAM_STATS = gql`
  query GetAllTeamStats($season: Int!) {
    allTeamStats(season: $season) {
      team
      season
      gamesPlayed
      pointsPerGame
      fieldGoalPercentage
      threePointPercentage
      freeThrowPercentage
      reboundsPerGame
      assistsPerGame
      stealsPerGame
      blocksPerGame
      turnoversPerGame
      foulsPerGame
      plusMinus
    }
  }
`;

export const GET_PLAYER_STATS = gql`
  query GetPlayerStats($playerId: ID!, $season: Int!) {
    playerStats(playerId: $playerId, season: $season) {
      playerId
      season
      gamesPlayed
      pointsPerGame
      fieldGoalPercentage
      threePointPercentage
      freeThrowPercentage
      reboundsPerGame
      assistsPerGame
      stealsPerGame
      blocksPerGame
      turnoversPerGame
      foulsPerGame
      plusMinus
      minutesPerGame
      doubleDoubles
      tripleDoubles
    }
  }
`;

export const GET_ALL_PLAYER_STATS = gql`
  query GetAllPlayerStats($season: Int!) {
    allPlayerStats(season: $season) {
      playerId
      season
      gamesPlayed
      pointsPerGame
      fieldGoalPercentage
      threePointPercentage
      freeThrowPercentage
      reboundsPerGame
      assistsPerGame
      stealsPerGame
      blocksPerGame
      turnoversPerGame
      foulsPerGame
      plusMinus
      minutesPerGame
      doubleDoubles
      tripleDoubles
    }
  }
`;

export const GET_PLAYER_STATS_BY_TEAM = gql`
  query GetPlayerStatsByTeam($team: ID!, $season: Int!) {
    playerStatsByTeam(team: $team, season: $season) {
      playerId
      season
      gamesPlayed
      pointsPerGame
      fieldGoalPercentage
      threePointPercentage
      freeThrowPercentage
      reboundsPerGame
      assistsPerGame
      stealsPerGame
      blocksPerGame
      turnoversPerGame
      foulsPerGame
      plusMinus
      minutesPerGame
      doubleDoubles
      tripleDoubles
    }
  }
`;

export const GET_TOP_PLAYERS = gql`
  query GetTopPlayers($stat: String!, $season: Int!, $limit: Int) {
    topPlayers(stat: $stat, season: $season, limit: $limit) {
      playerId
      season
      gamesPlayed
      pointsPerGame
      fieldGoalPercentage
      threePointPercentage
      freeThrowPercentage
      reboundsPerGame
      assistsPerGame
      stealsPerGame
      blocksPerGame
      turnoversPerGame
      foulsPerGame
      plusMinus
      minutesPerGame
      doubleDoubles
      tripleDoubles
    }
  }
`;

// INTERNAL API Queries
export const GET_USERS = gql`
  query GetUsers($pagination: PaginationInput) {
    users(pagination: $pagination) {
      edges {
        node {
          id
          username
          first_name
          last_name
          email_address
          image_url
          created_at
          updated_at
          inbound_friendship_ids
          outbound_friendship_ids
          banned
          timestamp
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_USER = gql`
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
      inbound_friendship_ids
      outbound_friendship_ids
      banned
      timestamp
    }
  }
`;

// FRIENDSHIPS
export const GET_FRIENDSHIPS = gql`
  query GetFriendships($pagination: PaginationInput) {
    friendships(pagination: $pagination) {
      edges {
        node {
          id
          status
          timestamp
          initiator {
            id
            username
            first_name
            last_name
            image_url
          }
          responder {
            id
            username
            first_name
            last_name
            image_url
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_FRIENDSHIP = gql`
  query GetFriendship($id: ID!) {
    friendship(id: $id) {
      id
      subscriber_id
      user_id
      status
      timestamp
    }
  }
`;

export const GET_FRIENDSHIPS_FOR_USER = gql`
  query GetFriendshipsForUser($userId: ID!) {
    user(id: $userId) {
      id
      friendships {
        id
        subscriber_id
        user_id
        status
        timestamp
      }
    }
  }
`;

// GAME LOGS
export const GET_GAME_LOGS = gql`
  query GetGameLogs($pagination: PaginationInput) {
    game_logs(pagination: $pagination) {
      edges {
        node {
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
            image_url
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_GAME_LOG = gql`
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
        image_url
      }
    }
  }
`;

export const GET_GAME_LOGS_FOR_USER = gql`
  query GetUserGameLogs($userId: ID!) {
    user(id: $userId) {
      id
      gameLogs {
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

// COMMENTS
export const GET_COMMENTS = gql`
  query GetAllComments {
    comments {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

export const GET_DIRECT_CHILD_COMMENTS = gql`
  query GetDirectChildComments($parent_id: ID!) {
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

export const GET_COMMENTS_FOR_GAME_LOG = gql`
  query GetCommentsForGameLog($gameLogId: String!) {
    comments(game_log_id: $gameLogId) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

export const GET_COMMENTS_FOR_USER = gql`
  query GetUserComments($userId: String!) {
    comments(user_id: $userId) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

export const GET_TOP_LEVEL_COMMENTS_FOR_GAME_LOG = gql`
  query GetTopLevelCommentsForGameLog($gameLogId: String!) {
    comments(game_log_id: $gameLogId, parent_id: null) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

export const GET_COMMENT = gql`
  query GetComment($id: String!) {
    comment(id: $id) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

// REACTIONS
export const GET_REACTIONS = gql`
  query GetReactions($target_id: ID!) {
    reactions(target_id: $target_id) {
      id
      user_id
      target_type
      target_id
      emoji
      created_at
      updated_at
    }
  }
`;

export const GET_REACTIONS_FOR_USER = gql`
  query GetReactionsForUser($user_id: String!) {
    user(id: $user_id) {
      id
      reactions {
        id
        target_type
        target_id
        emoji
        created_at
        updated_at
      }
    }
  }
`;

export const GET_GAME_RATING = gql`
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

export const GET_GAME_RATINGS = gql`
  query GetGameRatings($pagination: PaginationInput) {
    game_ratings(pagination: $pagination) {
      edges {
        node {
          id
          game_id
          average_rating
          total_ratings
          created_at
          updated_at
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
