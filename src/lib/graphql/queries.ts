import { gql } from '@apollo/client';

export const GAME_FRAGMENT = gql`
  fragment GameFragment on Game {
    id
    date
    status
    arena
    league
    season
    stage
    periods
    teams
    scores
    officials
    timesTied
    leadChanges
    nugget
    created_at
    updated_at
  }
`;

export const PLAYER_FRAGMENT = gql`
  fragment PlayerFragment on Player {
    id
    first_name
    last_name
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
    }
    seasons_active {
      season
      teams
    }
  }
`;

export const PLAYER_STATS_FRAGMENT = gql`
  fragment PlayerStatsFragment on PlayerStats {
    player {
      ...PlayerFragment
    }
    team {
      id
      name
      nickname
      code
      logo
    }
    game {
      ...GameFragment
    }
    season
    points
    pos
    min
    fgm
    fga
    fgp
    ftm
    fta
    ftp
    tpm
    tpa
    tpp
    offReb
    defReb
    totReb
    assists
    pFouls
    steals
    turnovers
    blocks
    plusMinus
    comment
  }
  ${PLAYER_FRAGMENT}
  ${GAME_FRAGMENT}
`;

export const BASIC_USER_FRAGMENT = gql`
  fragment BasicUserFragment on User {
    id
    username
    emailAddress
    imageUrl
  }
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    user {
      ...BasicUserFragment
    }
    userId
    parent_id
    parent_type
    content
    created_at
    updated_at
    deleted_at
    reactions {
      id
      emoji
      user {
        ...BasicUserFragment
      }
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const GAME_LOG_FRAGMENT = gql`
  fragment GameLogFragment on GameLog {
    id
    userId
    gameId
    watchedSetting
    watchedDate
    rating
    notes
    tags
    classification
    created_at
    updated_at
    deleted_at
    game {
      ...GameFragment
    }
  }
  ${GAME_FRAGMENT}
`;

export const GET_GAME_BY_ID = gql`
  query GetGameById($id: ID!) {
    game(id: $id) {
      ...GameFragment
    }
  }
  ${GAME_FRAGMENT}
`;

// EXTERNAL API QUERIES
export const GET_SEASONS = gql`
  query GetSeasons {
    seasons {
      id
      year
      display_year
      start_date
      end_date
      is_current
      is_playoffs
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

export const GET_EXTERNAL_GAMES = gql`
  query GetExternalGames($filters: GameFilters, $pagination: PaginationInput) {
    games(filters: $filters, pagination: $pagination) {
      items {
        ...GameFragment
      }
      total
      hasMore
      nextCursor
    }
  }
  ${GAME_FRAGMENT}
`;

export const GET_TEAMS = gql`
  query GetTeams($filters: TeamFilters, $pagination: PaginationInput) {
    teams(filters: $filters, pagination: $pagination) {
      id
      name
      nickname
      code
      city
      logo
      conference
      division
      allStar
      nbaFranchise
      leagues
      created_at
      updated_at
    }
  }
`;

export const GET_PLAYERS = gql`
  query GetPlayers($filters: PlayerFilters, $pagination: PaginationInput) {
    players(filters: $filters, pagination: $pagination) {
      items {
        ...PlayerFragment
      }
      total
      hasMore
      nextCursor
    }
  }
  ${PLAYER_FRAGMENT}
`;

export const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      ...PlayerFragment
    }
  }
  ${PLAYER_FRAGMENT}
`;

export const GET_GAME_LOG_WITH_REACTIONS = gql`
  query GetGameLogWithReactions($gameId: ID!, $userId: ID!) {
    gameLog(gameId: $gameId, userId: $userId) {
      ...GameLogFragment
      rating
    }
  }
  ${GAME_LOG_FRAGMENT}
`;

export const GET_COMMENTS_WITH_FILTERS = gql`
  query GetCommentsWithFilters($parent_id: ID!) {
    comments(parent_id: $parent_id) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;

// INTERNAL API Queries
export const GET_USERS = gql`
  query GetUsers($pagination: PaginationInput) {
    users(pagination: $pagination) {
      items {
        ...BasicUserFragment
      }
      total
      hasMore
      nextCursor
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...BasicUserFragment
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const GET_FRIENDSHIPS = gql`
  query GetFriendships($userId: ID!) {
    friendships(userId: $userId) {
      id
      username
      emailAddress
      imageUrl
    }
  }
`;

export const GET_FRIENDSHIP = gql`
  query GetFriendship($id: ID!) {
    friendship(id: $id) {
      id
      subscriberId
      userId
      status
      created_at
      updated_at
      initiator {
        ...BasicUserFragment
      }
      recipient {
        ...BasicUserFragment
      }
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const GET_GAME_LOGS = gql`
  query GetGameLogs($filters: GameLogFilters, $pagination: PaginationInput) {
    gameLogs(filters: $filters, pagination: $pagination) {
      items {
        ... on GameLog {
          ...GameLogFragment
          user {
            ...BasicUserFragment
          }
          comments {
            ...CommentFragment
          }
          reactions {
            id
            emoji
            user {
              ...BasicUserFragment
            }
          }
        }
        # Add other inline fragments for other types if needed
      }
      total
      hasMore
    }
  }
  ${GAME_LOG_FRAGMENT}
  ${BASIC_USER_FRAGMENT}
  ${COMMENT_FRAGMENT}
`;

export const GET_GAME_LOG = gql`
  query GetGameLog($userId: ID!, $gameId: ID!) {
    gameLog(userId: $userId, gameId: $gameId) {
      ...GameLogFragment
      user {
        ...BasicUserFragment
      }
      comments {
        ...CommentFragment
      }
      reactions {
        id
        emoji
        user {
          ...BasicUserFragment
        }
      }
    }
  }
  ${GAME_LOG_FRAGMENT}
  ${BASIC_USER_FRAGMENT}
  ${COMMENT_FRAGMENT}
`;

export const GET_COMMENTS = gql`
  query GetComments($parent_id: ID!) {
    comments(parent_id: $parent_id) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const GET_LIVE_GAMES = gql`
  query GetLiveGames {
    liveGames {
      ...GameFragment
    }
  }
  ${GAME_FRAGMENT}
`;

export const GET_TEAM_STATS = gql`
  query GetTeamStats($teamId: ID!, $sort: GameTeamSortInput, $pagination: PaginationInput) {
    teamStats(teamId: $teamId, sort: $sort, pagination: $pagination) {
      id
      teamId
      season
      gamesPlayed
      wins
      losses
      pointsFor
      pointsAgainst
      fieldGoalsMade
      fieldGoalsAttempted
      threePointersMade
      threePointersAttempted
      freeThrowsMade
      freeThrowsAttempted
      offensiveRebounds
      defensiveRebounds
      assists
      steals
      blocks
      turnovers
      fouls
      created_at
      updated_at
    }
  }
`;

// INTERNAL API QUERIES
export const GET_INTERNAL_GAMES = gql`
  query GetInternalGames($filters: GameFilters, $pagination: PaginationInput) {
    games(filters: $filters, pagination: $pagination) {
      items {
        ...GameFragment
      }
      total
      hasMore
    }
  }
  ${GAME_FRAGMENT}
`;

export const GET_GAMES = gql`
  query GetGames($filters: GameFilters, $pagination: PaginationInput) {
    games(filters: $filters, pagination: $pagination) {
      items {
        ...GameFragment
      }
      total
      hasMore
      nextCursor
    }
  }
  ${GAME_FRAGMENT}
`;

export const GET_REACTIONS = gql`
  query GetReactions($targetId: ID!) {
    reactions(targetId: $targetId) {
      id
      emoji
      user_id
      target_type
      target_id
      created_at
      updated_at
      user {
        ...BasicUserFragment
      }
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const TEAM_FRAGMENT = gql`
  fragment TeamFragment on Team {
    id
    name
    nickname
    code
    logo
  }
`;
