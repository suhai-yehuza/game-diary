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
    stage
    periods
    teams
    scores
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
    userId
    gameId
    watchedSetting
    watchedDate
    ratingForGame
    notes
    tags
    classification
    createdAt
    updatedAt
    deletedAt
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
      displayYear
      startDate
      endDate
      isCurrent
      isPlayoffs
    }
  }
`;

export const GET_EXTERNAL_GAMES = gql`
  query GetExternalGames($filters: GameFilters, $first: Int, $after: String) {
    games(filters: $filters, first: $first, after: $after) {
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
      createdAt
      updatedAt
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

export const GET_COMMENTS_WITH_FILTERS = gql`
  query GetCommentsWithFilters($parentId: ID!, $first: Int, $after: String) {
    comments(parentId: $parentId, first: $first, after: $after) {
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

export const GET_GAME_LOGS = gql`
  query GetGameLogs($first: Int, $after: String, $filters: GameLogFilters) {
    gameLogs(first: $first, after: $after, filters: $filters) {
      edges {
        cursor
        node {
          id
          userId
          gameId
          watchedSetting
          watchedDate
          watchedLocation
          ratingForGame
          watchedScope
          notes
          tags
          classification
          createdAt
          updatedAt
          deletedAt
          user {
            id
            username
            firstName
            lastName
            emailAddress
            imageUrl
          }
          game {
            id
            teams
            scores
            date {
              start
              end
              duration
            }
            arena {
              name
              city
              state
              country
            }
            status {
              clock
              halftime
              long
              short
            }
            timesTied
            leadChanges
            league
            season
          }
          comments(first: 20) {
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
          reactions(first: 20) {
            edges {
              node {
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
            totalCount
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const GET_LIVE_GAMES = gql`
  query GetLiveGames($first: Int, $after: String) {
    liveGames(first: $first, after: $after) {
      edges {
        node {
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
          stage
          periods
          scores
          officials
          timesTied
          leadChanges
          nugget
          createdAt
          updatedAt
          homeTeamId
          awayTeamId
          teams
          isCompleted
          awayTeamScore
          homeTeamScore
          gameType
          nbaGameId
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
      createdAt
      updatedAt
    }
  }
`;

export const GET_GAMES = gql`
  query GetGames($filters: GameFilters, $first: Int, $after: String) {
    games(filters: $filters, first: $first, after: $after) {
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
  query GetReactions($targetId: ID!) {
    reactions(targetId: $targetId) {
      edges {
        cursor
        node {
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

export const GET_FRIENDSHIPS = gql`
  query GetFriendships($userId: ID!) {
    friendships(userId: $userId) {
      id
      status
      createdAt
      updatedAt
      user {
        ...BasicUserFragment
      }
      friend {
        ...BasicUserFragment
      }
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const SEARCH_USERS = gql`
  query SearchUsers($first: Int, $after: String, $searchTerm: String, $filters: UserSearchFilters) {
    searchUsers(first: $first, after: $after, searchTerm: $searchTerm, filters: $filters) {
      edges {
        cursor
        node {
          id
          username
          firstName
          lastName
          emailAddress
          imageUrl
          createdAt
          gameLogs {
            id
          }
          initiatedFriendships {
            id
            status
            recipient {
              id
            }
          }
          friendships {
            id
            status
            initiator {
              id
            }
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

export const GET_GAME_LOG_BY_ID = gql`
  query GetGameLogById($id: ID!) {
    gameLogById(id: $id) {
      ...GameLogFragment
      ratingForGame
      reactions(first: 20) {
        edges {
          node {
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
        totalCount
      }
      comments(first: 20) {
        totalCount
      }
    }
  }
  ${GAME_LOG_FRAGMENT}
`;
