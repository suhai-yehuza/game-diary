import { gql } from '@apollo/client';

export const GAME_FRAGMENT = gql`
  fragment GameFragment on Game {
    id
    date
    status
    game_type
    nba_game_id
    home_team_id
    away_team_id
    home_team {
      id
      name
      nickname
      code
      city
      logo
      all_star
      nba_franchise
      conference
      created_at
      updated_at
    }
    away_team {
      id
      name
      nickname
      code
      city
      logo
      all_star
      nba_franchise
      conference
      created_at
      updated_at
    }
    home_team_score
    away_team_score
    average_rating
    total_ratings
    created_at
    updated_at
  }
`;

export const BASIC_USER_FRAGMENT = gql`
  fragment BasicUserFragment on DBUser {
    id
    username
    first_name
    last_name
    email_address
    phone_number
    image_url
    object
    has_image
    profile_image_url
    primary_email_address_id
    primary_phone_number_id
    external_id
    last_active_at
    last_sign_in_at
    bio
    timezone
    preferred_language
    comments {
      id
      parent_id
      parent_type
      content
    }
    reactions {
      id
      emoji
      target_id
      target_type
    }
    gameLogs {
      id
    }
    initiatedFriendships {
      id
      status
    }
    created_at
    updated_at
    deleted_at
  }
`;

export const USER_SUMMARY_FRAGMENT = gql`
  fragment UserSummaryFragment on UserSummary {
    id
    username
    first_name
    last_name
    email_address
    image_url
  }
`;

export const REACTION_FRAGMENT = gql`
  fragment ReactionFragment on Reaction {
    id
    emoji
    user_id
    target_id
    target_type
    created_at
    updated_at
    user {
      ...UserSummaryFragment
    }
  }
`;

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
      ...UserSummaryFragment
    }
    totalChildCommentCount
    totalReactionCount
    reactions {
      ...ReactionFragment
    }
  }
`;

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
    deleted_at
    totalCommentCount
    totalReactionCount
    user {
      ...UserSummaryFragment
    }
    game {
      ...GameFragment
    }
  }
`;

export const FRIENDSHIP_FRAGMENT = gql`
  fragment FriendshipFragment on Friendship {
    id
    status
    created_at
    updated_at
    initiator {
      ...UserSummaryFragment
    }
    recipient {
      ...UserSummaryFragment
    }
  }
`;

// Queries
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
  ${GAME_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
  ${COMMENT_FRAGMENT}
  ${REACTION_FRAGMENT}
`;

export const GET_GAME_LOG = gql`
  query GetGameLog($id: ID!) {
    gameLog(id: $id) {
      ...GameLogFragment
    }
  }
  ${GAME_LOG_FRAGMENT}
  ${GAME_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
  ${COMMENT_FRAGMENT}
  ${REACTION_FRAGMENT}
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
  ${USER_SUMMARY_FRAGMENT}
  ${REACTION_FRAGMENT}
`;

export const GET_REACTIONS = gql`
  query GetReactions($targetId: ID!, $targetType: ParentType!) {
    reactions(targetId: $targetId, targetType: $targetType) {
      ...ReactionFragment
    }
  }
  ${REACTION_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
`;

// Admin Search Queries
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
          phone_number
          image_url
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
  ${GAME_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
  ${COMMENT_FRAGMENT}
  ${REACTION_FRAGMENT}
`;

// New friendship queries
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
  ${USER_SUMMARY_FRAGMENT}
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
  ${USER_SUMMARY_FRAGMENT}
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

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(notificationId: $notificationId) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;
