import { gql } from '@apollo/client';

export const GAME_FRAGMENT = gql`
  fragment GameFragment on Game {
    id
    date {
      start
      end
      duration
    }
    status {
      clock
      halftime
      long
      short
    }
    arena {
      name
      city
      state
      country
    }
    league
    season
    periods {
      current
      total
      endOfPeriod
    }
    teams {
      home {
        id
        name
        nickname
        code
        logo
      }
      visitors {
        id
        name
        nickname
        code
        logo
      }
    }
    scores {
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
    }
    officials
    timesTied
    leadChanges
    nugget
    createdAt
    updatedAt
  }
`;

export const PLAYER_FRAGMENT = gql`
  fragment PlayerFragment on Player {
    id
    firstName
    lastName
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
  fragment PlayerStatsFragment on IPlayerStats {
    playerId
    gameId
    points
    assists
    rebounds
    steals
    blocks
    turnovers
    fouls
    minutes
    fieldGoalsMade
    fieldGoalsAttempted
    threePointersMade
    threePointersAttempted
    freeThrowsMade
    freeThrowsAttempted
    createdAt
    updatedAt
    deletedAt
  }
`;

export const BASIC_USER_FRAGMENT = gql`
  fragment BasicUserFragment on DBUser {
    id
    username
    first_name
    last_name
    emailAddress
    image_url
    comments {
      id
      parentId
      parentType
      content
    }
    reactions {
      id
      emoji
      targetId
      targetType
    }
    gameLogs {
      id
    }
    initiatedFriendships {
      id
      status
    }
    createdAt
    updatedAt
    deletedAt
  }
`;

export const USER_SUMMARY_FRAGMENT = gql`
  fragment UserSummaryFragment on UserSummary {
    id
    username
    first_name
    last_name
    emailAddress
    image_url
  }
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    userId
    parentId
    parentType
    content
    createdAt
    updatedAt
    user {
      ...UserSummaryFragment
    }
    reactions {
      id
      emoji
      user {
        ...UserSummaryFragment
      }
    }
    childComments {
      totalCount
      edges {
        node {
          id
          userId
          parentId
          parentType
          content
          createdAt
          updatedAt
          user {
            ...UserSummaryFragment
          }
          reactions {
            id
            emoji
            user {
              ...UserSummaryFragment
            }
          }
        }
      }
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;

export const GAME_LOG_FRAGMENT = gql`
  fragment GameLogFragment on GameLog {
    id
    classification
    watchedSetting
    watchedScope
    watchedDate
    watchedLocation
    ratingForGame
    notes
    tags
    createdAt
    updatedAt
    user {
      ...UserSummaryFragment
    }
    game {
      id
      league
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
        home {
          id
          name
          nickname
          code
          logo
        }
        visitors {
          id
          name
          nickname
          code
          logo
        }
      }
      scores {
        home {
          win
          loss
          linescore
          points
          series {
            win
            loss
          }
        }
        visitors {
          win
          loss
          linescore
          points
          series {
            win
            loss
          }
        }
      }
    }
  }
  ${USER_SUMMARY_FRAGMENT}
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

export const GET_EXTERNAL_GAMES = gql`
  query GetExternalGames($filters: GameFilters, $pagination: PaginationInput) {
    games(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          ...GameFragment
        }
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
  ${GAME_FRAGMENT}
`;

export const GET_TEAMS = gql`
  query GetTeams($filters: TeamFilters) {
    teams(filters: $filters) {
      edges {
        cursor
        node {
          id
          name
          nickname
          code
          city
          logo
          conference
          division
        }
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

export const GET_PLAYERS = gql`
  query GetPlayers($filters: IPlayerFilters, $pagination: PaginationInput) {
    players(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          ...PlayerFragment
        }
      }
      totalCount
    }
  }
  ${PLAYER_FRAGMENT}
`;

export const GET_COMMENTS_WITH_FILTERS = gql`
  query GetCommentsWithFilters($filters: CommentFilters, $pagination: PaginationInput) {
    comments(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          id
          userId
          parentId
          parentType
          content
          createdAt
          updatedAt
          deletedAt
          depth
          user {
            id
            username
            emailAddress
            image_url
          }
          reactions {
            id
            emoji
            userId
            targetId
            targetType
            createdAt
            updatedAt
            user {
              id
              username
              emailAddress
              image_url
            }
          }
          childComments {
            edges {
              node {
                id
                userId
                parentId
                parentType
                content
                createdAt
                updatedAt
                deletedAt
                depth
                user {
                  id
                  username
                  emailAddress
                  image_url
                }
                reactions {
                  id
                  emoji
                  userId
                  targetId
                  targetType
                  createdAt
                  updatedAt
                  user {
                    id
                    username
                    emailAddress
                    image_url
                  }
                }
              }
            }
            totalCount
          }
        }
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

export const GET_USERS = gql`
  query GetUsers($filters: UserFilters, $pagination: PaginationInput) {
    users(filters: $filters, pagination: $pagination) {
      ...UserSummaryFragment
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserSummaryFragment
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;

export const GET_GAME_LOGS = gql`
  query GetGameLogs($filters: GameLogFilters, $pagination: PaginationInput) {
    gameLogs(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          ...GameLogFragment
        }
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
  ${GAME_LOG_FRAGMENT}
`;

export const GET_LIVE_GAMES = gql`
  query GetLiveGames($first: Int, $after: String) {
    liveGames(first: $first, after: $after) {
      edges {
        cursor
        node {
          ...GameFragment
        }
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
  ${GAME_FRAGMENT}
`;

export const GET_TEAM_STATS = gql`
  query GetTeamStats($teamId: ID!, $season: Int!) {
    teamStats(teamId: $teamId, season: $season) {
      games
      points
      fgp
      tpp
      ftp
      totReb
      assists
      steals
      blocks
      turnovers
      pFouls
      plusMinus
      fastBreakPoints
      pointsInPaint
      biggestLead
      secondChancePoints
      pointsOffTurnovers
      longestRun
      assistsPerGame
      blocksPerGame
      pointsPerGame
      reboundsPerGame
      stealsPerGame
      turnoversPerGame
    }
  }
`;

export const GET_GAMES = gql`
  query GetGames($filters: GameFilters, $pagination: PaginationInput) {
    games(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          ...GameFragment
        }
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
  ${GAME_FRAGMENT}
`;

export const GET_REACTIONS = gql`
  query GetReactions($targetId: ID!, $targetType: ParentType!) {
    reactions(targetId: $targetId, targetType: $targetType) {
      id
      emoji
      userId
      targetId
      targetType
      createdAt
      updatedAt
      user {
        ...UserSummaryFragment
      }
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;

export const SEARCH_USERS = gql`
  query SearchUsers($first: Int, $after: String, $searchTerm: String, $filters: UserSearchFilters) {
    searchUsers(first: $first, after: $after, searchTerm: $searchTerm, filters: $filters) {
      edges {
        cursor
        node {
          ...UserSummaryFragment
        }
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
  ${USER_SUMMARY_FRAGMENT}
`;

export const GET_GAME_LOG = gql`
  query GetGameLog($id: ID!, $commentsFirst: Int, $commentsAfter: String) {
    gameLog(id: $id) {
      ...GameLogFragment
      reactions {
        id
        emoji
        userId
        targetId
        targetType
        createdAt
        updatedAt
        user {
          id
          username
          emailAddress
          image_url
        }
      }
      comments {
        edges {
          cursor
          node {
            id
            content
            user {
              id
              username
              image_url
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
    }
  }
  ${GAME_LOG_FRAGMENT}
`;

export const GET_USER_GAME_LOGS = gql`
  query GetUserGameLogs($filters: GameLogFilters, $pagination: PaginationInput) {
    gameLogs(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...GameLogFragment
        }
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
  ${GAME_LOG_FRAGMENT}
`;

export const GET_USER_FRIENDSHIPS = gql`
  query GetUserFriendships($userId: ID!) {
    user(id: $userId) {
      ...UserSummaryFragment
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;

export const GET_TEAM_H2H = gql`
  query GetTeamH2H($teamId: ID!, $opponentId: ID!) {
    teamH2H(teamId: $teamId, opponentId: $opponentId) {
      wins
      losses
      lastTenGames
    }
  }
`;

export const GET_TEAM_GAME_STATS = gql`
  query GetTeamGameStats($gameId: ID!, $teamId: String!) {
    teamGameStats(gameId: $gameId, teamId: $teamId) {
      games
      points
      fgp
      tpp
      ftp
      totReb
      assists
      steals
      blocks
      turnovers
      pFouls
      plusMinus
      fastBreakPoints
      pointsInPaint
      biggestLead
      secondChancePoints
      pointsOffTurnovers
      longestRun
      assistsPerGame
      blocksPerGame
      pointsPerGame
      reboundsPerGame
      stealsPerGame
      turnoversPerGame
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      ...UserSummaryFragment
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;

export const FRIENDSHIP_FRAGMENT = gql`
  fragment FriendshipFragment on Friendship {
    id
    status
    createdAt
    updatedAt
    initiator {
      ...UserSummaryFragment
    }
    recipient {
      ...UserSummaryFragment
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;
