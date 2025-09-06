import { gql } from '@apollo/client';

// Optimized fragments with only essential fields
// JSONB fields contain comprehensive data:
// - teams JSONB contains all team data (home/away teams)
// - scores JSONB contains comprehensive scoring data
// - status JSONB contains detailed status information
// - arena JSONB contains complete arena data
export const GAME_FRAGMENT = gql`
  fragment GameFragment on Game {
    id
    date
    status
    game_type
    basketball_game_id
    teams
    scores
    arena
    periods
    average_rating
    total_ratings
    created_at
    updated_at
  }
`;

// Lightweight user fragment for basic info
export const BASIC_USER_FRAGMENT = gql`
  fragment BasicUserFragment on DBUser {
    id
    username
    first_name
    last_name
    email_address
    image_url
    last_active_at
    created_at
  }
`;

// Optimized user summary fragment
export const USER_SUMMARY_FRAGMENT = gql`
  fragment UserSummaryFragment on UserSummary {
    id
    username
    first_name
    last_name
    email_address
    image_url
    isAdmin
  }
`;

// Lightweight reaction fragment
export const REACTION_FRAGMENT = gql`
  fragment ReactionFragment on Reaction {
    id
    emoji
    user_id
    target_id
    target_type
    created_at
    user {
      id
      username
      first_name
      last_name
    }
  }
`;

// Optimized comment fragment
export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on Comment {
    id
    user_id
    parent_id
    parent_type
    content
    depth
    created_at
    updated_at
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    totalChildCommentCount
    totalReactionCount
  }
`;

// Optimized game log fragment
export const GAME_LOG_FRAGMENT = gql`
  fragment GameLogFragment on GameLog {
    id
    game_id
    rating_for_game
    notes
    tags
    watched_date
    watched_setting
    watched_location
    watched_scope
    classification
    created_at
    updated_at
    totalCommentCount
    totalReactionCount
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    game {
      id
      date
      status
      teams
      scores
    }
  }
`;

// Lightweight friendship fragment
export const FRIENDSHIP_FRAGMENT = gql`
  fragment FriendshipFragment on Friendship {
    id
    status
    created_at
    initiator {
      id
      username
      first_name
      last_name
      image_url
    }
    recipient {
      id
      username
      first_name
      last_name
      image_url
    }
  }
`;

// Optimized NBA Player fragment using JSONB fields
// Leverages comprehensive JSONB data structure for optimal performance
export const NBA_PLAYER_FRAGMENT = gql`
  fragment NBAPlayerFragment on NBAPlayer {
    id
    first_name
    last_name
    birth
    nba
    height
    weight
    college
    affiliation
    teams
    leagues
    image_url
    created_at
    updated_at
  }
`;

// Optimized Team fragment using JSONB fields
// Leverages comprehensive JSONB data structure for optimal performance
export const TEAM_FRAGMENT = gql`
  fragment TeamFragment on Team {
    id
    name
    nickname
    code
    city
    logo
    all_star
    nba_franchise
    conference
    leagues
    created_at
    updated_at
  }
`;

// Optimized queries with better field selection
export const GET_GAMES = gql`
  query GetGames($filters: GameFilters, $pagination: PaginationInput) {
    games(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...GameFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${GAME_FRAGMENT}
`;

// NBA Player queries
export const GET_NBA_PLAYERS = gql`
  query GetNBAPlayers($filters: NBAPlayerFilters, $pagination: PaginationInput) {
    nbaPlayers(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...NBAPlayerFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${NBA_PLAYER_FRAGMENT}
`;

export const GET_NBA_PLAYER = gql`
  query GetNBAPlayer($id: ID!) {
    nbaPlayer(id: $id) {
      ...NBAPlayerFragment
    }
  }
  ${NBA_PLAYER_FRAGMENT}
`;

// Team queries
export const GET_TEAMS = gql`
  query GetTeams($filters: TeamFilters, $pagination: PaginationInput) {
    basketball_teams(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...TeamFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${TEAM_FRAGMENT}
`;

export const GET_TEAM = gql`
  query GetTeam($id: ID!) {
    team(id: $id) {
      ...TeamFragment
    }
  }
  ${TEAM_FRAGMENT}
`;

export const GET_GAME = gql`
  query GetGame($id: ID!) {
    game(id: $id) {
      ...GameFragment
    }
  }
  ${GAME_FRAGMENT}
`;

export const GET_LIVE_GAMES = gql`
  query GetLiveGames($first: Int, $after: String) {
    liveGames(first: $first, after: $after) {
      edges {
        node {
          ...GameFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${GAME_FRAGMENT}
`;

// Optimized game logs query with separate fragments for different use cases
export const GET_GAME_LOGS = gql`
  query GetGameLogs($filters: GameLogFilters, $pagination: PaginationInput) {
    gameLogs(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...GameLogFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${GAME_LOG_FRAGMENT}
`;

export const GET_GAME_LOG = gql`
  query GetGameLog($id: ID!) {
    gameLog(id: $id) {
      ...GameLogFragment
    }
  }
  ${GAME_LOG_FRAGMENT}
`;

// Lightweight user queries
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

// Optimized search query
export const SEARCH_USERS = gql`
  query SearchUsers(
    $searchTerm: String
    $searchField: String
    $filters: UserSearchFilters
    $pagination: PaginationInput
  ) {
    searchUsers(
      searchTerm: $searchTerm
      searchField: $searchField
      filters: $filters
      pagination: $pagination
    ) {
      edges {
        node {
          ...UserSummaryFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${USER_SUMMARY_FRAGMENT}
`;

// Optimized comments query
export const GET_COMMENTS = gql`
  query GetComments($filters: CommentFilters, $pagination: PaginationInput) {
    comments(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...CommentFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${COMMENT_FRAGMENT}
`;

// Lightweight reactions query
export const GET_REACTIONS = gql`
  query GetReactions($targetId: ID!, $targetType: ParentType!) {
    reactions(targetId: $targetId, targetType: $targetType) {
      ...ReactionFragment
    }
  }
  ${REACTION_FRAGMENT}
`;

// Admin queries with minimal fields
export const SEARCH_USERS_ADMIN = gql`
  query SearchUsersAdmin($first: Int, $after: String, $searchTerm: String, $searchField: String) {
    searchUsers(first: $first, after: $after, searchTerm: $searchTerm, searchField: $searchField) {
      edges {
        node {
          id
          username
          first_name
          last_name
          email_address
          isAdmin
          created_at
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

export const SEARCH_GAME_LOGS_ADMIN = gql`
  query SearchGameLogsAdmin(
    $first: Int
    $after: String
    $searchTerm: String
    $searchField: String
  ) {
    searchGameLogs(
      first: $first
      after: $after
      searchTerm: $searchTerm
      searchField: $searchField
    ) {
      edges {
        node {
          id
          game_id
          classification
          rating_for_game
          watched_setting
          watched_location
          watched_scope
          watched_date
          created_at
          user {
            id
            username
            first_name
            last_name
            isAdmin
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

export const GET_FRIENDS_GAME_LOGS = gql`
  query GetFriendsGameLogs($pagination: PaginationInput) {
    friendsGameLogs(pagination: $pagination) {
      edges {
        node {
          ...GameLogFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${GAME_LOG_FRAGMENT}
`;

// Lightweight game log fragment for table display
export const GAME_LOG_TABLE_FRAGMENT = gql`
  fragment GameLogTableFragment on GameLog {
    id
    notes
    rating_for_game
    classification
    totalCommentCount
    totalReactionCount
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    game {
      teams
      date
    }
  }
`;

// Optimized query for friends game logs in table format
export const GET_FRIENDS_GAME_LOGS_TABLE = gql`
  query GetFriendsGameLogsTable($pagination: PaginationInput) {
    friendsGameLogs(pagination: $pagination) {
      edges {
        node {
          ...GameLogTableFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
  ${GAME_LOG_TABLE_FRAGMENT}
`;

// Optimized query for game logs in table format
export const GET_GAME_LOGS_TABLE = gql`
  query GetGameLogsTable($filters: GameLogFilters, $pagination: PaginationInput) {
    gameLogs(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...GameLogTableFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
  ${GAME_LOG_TABLE_FRAGMENT}
`;

// Optimized friendship queries
export const GET_USER_FRIENDSHIPS = gql`
  query GetUserFriendships($filters: FriendshipFilters, $pagination: PaginationInput) {
    userFriendships(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...FriendshipFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${FRIENDSHIP_FRAGMENT}
`;

export const GET_FRIENDSHIP_REQUESTS = gql`
  query GetFriendshipRequests($pagination: PaginationInput) {
    friendshipRequests(pagination: $pagination) {
      edges {
        node {
          ...FriendshipFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
  ${FRIENDSHIP_FRAGMENT}
`;

export const GET_FRIENDSHIP_STATUS = gql`
  query GetFriendshipStatus($userId: ID!) {
    friendshipStatus(userId: $userId) {
      status
      friendshipId
      isInitiator
    }
  }
`;

// Lightweight notification fragment
export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFragment on Notification {
    id
    user_id
    type
    title
    message
    target_id
    target_type
    resolved
    read
    created_at
  }
`;

// Public Comment Fragment (for NBA games, players, teams - no authentication required)
export const PUBLIC_COMMENT_FRAGMENT = gql`
  fragment PublicCommentFragment on PublicComment {
    id
    content
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    user_id
    anonymous_name
    anonymous_email
    parent_id
    parent_type
    depth
    is_approved
    created_at
    updated_at
    deleted_at
    totalChildCommentCount
    totalReactionCount
  }
`;

// Public Reaction Fragment (for NBA games, players, teams - no authentication required)
export const PUBLIC_REACTION_FRAGMENT = gql`
  fragment PublicReactionFragment on PublicReaction {
    id
    emoji
    user {
      id
      username
      first_name
      last_name
      image_url
    }
    user_id
    anonymous_name
    anonymous_email
    target_id
    target_type
    is_approved
    created_at
    updated_at
    deleted_at
  }
`;

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($filters: NotificationFilters, $pagination: PaginationInput) {
    userNotifications(filters: $filters, pagination: $pagination) {
      edges {
        cursor
        node {
          ...NotificationFragment
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
  ${NOTIFICATION_FRAGMENT}
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount {
    unreadNotificationsCount
  }
`;

// Public Comment Queries (no authentication required)
export const GET_PUBLIC_COMMENTS = gql`
  query GetPublicComments($filters: PublicCommentFilters, $pagination: PaginationInput) {
    publicComments(filters: $filters, pagination: $pagination) {
      edges {
        node {
          ...PublicCommentFragment
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
  ${PUBLIC_COMMENT_FRAGMENT}
`;

// Public Reaction Queries (no authentication required)
export const GET_PUBLIC_REACTIONS = gql`
  query GetPublicReactions($targetId: ID!, $targetType: ParentType!) {
    publicReactions(targetId: $targetId, targetType: $targetType) {
      ...PublicReactionFragment
    }
  }
  ${PUBLIC_REACTION_FRAGMENT}
`;
