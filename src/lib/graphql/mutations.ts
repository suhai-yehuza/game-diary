import { gql } from '@apollo/client';

import {
  COMMENT_FRAGMENT,
  PLAYER_STATS_FRAGMENT,
  BASIC_USER_FRAGMENT,
} from '@/lib/graphql/queries';

export const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      game {
        id
        league
        season
        date
        stage
        status
        periods
        arena
        teams
        scores
        officials
        timesTied
        leadChanges
        nugget
        created_at
        updated_at
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const CREATE_GAME_LOG = gql`
  mutation CreateGameLog($input: CreateGameLogInput!) {
    createGameLog(input: $input) {
      gameLog {
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
          id
        }
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const UPDATE_GAME_LOG = gql`
  mutation UpdateGameLog($id: ID!, $input: UpdateGameLogInput!) {
    updateGameLog(id: $id, input: $input) {
      gameLog {
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
          id
        }
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const DELETE_GAME_LOG = gql`
  mutation DeleteGameLog($id: ID!) {
    deleteGameLog(id: $id) {
      success
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      comment {
        ...CommentFragment
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
    updateComment(id: $id, input: $input) {
      comment {
        ...CommentFragment
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      success
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const CREATE_REACTION = gql`
  mutation CreateReaction($input: CreateReactionInput!) {
    createReaction(input: $input) {
      reaction {
        id
        emoji
        target_id
        target_type
        user_id
        created_at
        updated_at
        user {
          ...BasicUserFragment
        }
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const DELETE_REACTION = gql`
  mutation DeleteReaction($id: ID!) {
    deleteReaction(id: $id) {
      success
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const UPDATE_FRIENDSHIP_STATUS = gql`
  mutation UpdateFriendshipStatus($input: UpdateFriendshipStatusInput!) {
    updateFriendshipStatus(input: $input) {
      friendship {
        id
        subscriberId
        userId
        status
        created_at
        updated_at
        initiator {
          id
          username
        }
        recipient {
          id
          username
        }
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      friendship {
        id
        subscriberId
        userId
        status
        created_at
        updated_at
        initiator {
          id
          username
          imageUrl
        }
        recipient {
          id
          username
          imageUrl
        }
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($friendshipId: ID!) {
    acceptFriendRequest(friendshipId: $friendshipId) {
      friendship {
        id
        subscriberId
        userId
        status
        created_at
        updated_at
        initiator {
          id
          username
          imageUrl
        }
        recipient {
          id
          username
          imageUrl
        }
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation RejectFriendRequest($friendshipId: ID!) {
    rejectFriendRequest(friendshipId: $friendshipId) {
      friendship {
        id
        subscriberId
        userId
        status
        created_at
        updated_at
        initiator {
          id
          username
          imageUrl
        }
        recipient {
          id
          username
          imageUrl
        }
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const REMOVE_FRIEND = gql`
  mutation RemoveFriend($friendshipId: ID!) {
    removeFriend(friendshipId: $friendshipId) {
      success
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const UPDATE_PLAYER = gql`
  mutation UpdatePlayer($id: ID!, $input: UpdatePlayerInput!) {
    updatePlayer(id: $id, input: $input) {
      player {
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
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const FAVORITE_PLAYER = gql`
  mutation FavoritePlayer($id: ID!) {
    favoritePlayer(id: $id) {
      player {
        id
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const UPDATE_PLAYER_STATS = gql`
  mutation UpdatePlayerStats($id: ID!, $input: UpdatePlayerStatsInput!) {
    updatePlayerStats(id: $id, input: $input) {
      playerStats {
        ...PlayerStatsFragment
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
  ${PLAYER_STATS_FRAGMENT}
`;

export const DELETE_PLAYER_STATS = gql`
  mutation DeletePlayerStats($id: ID!) {
    deletePlayerStats(id: $id) {
      success
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;

export const ADD_REACTION = gql`
  mutation AddReaction($input: CreateReactionInput!) {
    createReaction(input: $input) {
      reaction {
        id
        emoji
        created_at
        user {
          ...BasicUserFragment
        }
      }
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
  ${BASIC_USER_FRAGMENT}
`;

export const REMOVE_REACTION = gql`
  mutation DeleteReaction($id: ID!) {
    deleteReaction(id: $id) {
      success
      errors {
        ... on ValidationError {
          field
          message
        }
        ... on AuthenticationError {
          message
        }
        ... on AuthorizationError {
          message
          requiredRole
        }
        ... on RateLimitError {
          message
          retryAfter
        }
        ... on BusinessLogicError {
          message
          code
          details
        }
      }
    }
  }
`;
