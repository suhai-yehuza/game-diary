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
  fragment PlayerStatsFragment on PlayerStats {
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
  }
`;

export const BASIC_USER_FRAGMENT = gql`
  fragment BasicUserFragment on DBUser {
    id
    username
    firstName
    lastName
    emailAddress
    imageUrl
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
    firstName
    lastName
    emailAddress
    imageUrl
  }
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    user {
      ...UserSummaryFragment
    }
    userId
    parentId
    parentType
    content
    createdAt
    updatedAt
    deletedAt
    reactions {
      id
      emoji
      user {
        ...UserSummaryFragment
      }
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;

export const GAME_LOG_FRAGMENT = gql`
  fragment GameLogFragment on GameLog {
    id
    user {
      ...UserSummaryFragment
    }
    game {
      ...GameFragment
    }
    watchedSetting
    watchedDate
    ratingForGame
    notes
    tags
    classification
    createdAt
    updatedAt
  }
  ${USER_SUMMARY_FRAGMENT}
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
          createdAt
          updatedAt
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
  query GetPlayers($filters: PlayerFilters, $pagination: PaginationInput) {
    players(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          ...PlayerFragment
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
  ${PLAYER_FRAGMENT}
`;

export const GET_COMMENTS_WITH_FILTERS = gql`
  query GetCommentsWithFilters($filters: CommentFilters) {
    comments(filters: $filters) {
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
            imageUrl
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
              imageUrl
            }
          }
          childComments(first: 10) {
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
                  imageUrl
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
                    imageUrl
                  }
                }
                childComments(first: 10) {
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
                        imageUrl
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
                          imageUrl
                        }
                      }
                      childComments(first: 10) {
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
                              imageUrl
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
                                imageUrl
                              }
                            }
                          }
                        }
                        totalCount
                      }
                    }
                  }
                  totalCount
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
      id
      team {
        id
        name
        nickname
        code
        logo
      }
      season
      gamesPlayed
      wins
      losses
      conferenceStanding {
        name
        rank
        win
        loss
      }
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
      points
      fgm
      fga
      fgp
      ftm
      fta
      ftp
      tpm
      tpa
      tpp
      longestRun
      defReb
      totReb
      assists
      pFouls
      steals
      turnovers
      blocks
      plusMinus
      createdAt
      updatedAt
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
          imageUrl
        }
      }
      comments(first: $commentsFirst, after: $commentsAfter) {
        edges {
          cursor
          node {
            id
            content
            user {
              id
              username
              imageUrl
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
      teamId
      opponentId
      wins
      losses
      winPercentage
      lastTenGames
    }
  }
`;

export const GET_TEAM_GAME_STATS = gql`
  query GetTeamGameStats($gameId: ID!, $teamId: String!) {
    teamGameStats(gameId: $gameId, teamId: $teamId) {
      id
      team {
        id
        name
        nickname
        code
        logo
      }
      season
      gamesPlayed
      wins
      losses
      points
      fgm
      fga
      fgp
      tpm
      tpa
      tpp
      ftm
      fta
      ftp
      defReb
      totReb
      assists
      steals
      blocks
      turnovers
      pFouls
      createdAt
      updatedAt
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
