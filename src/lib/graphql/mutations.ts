import { gql } from '@apollo/client';

import { COMMENT_FRAGMENT, USER_SUMMARY_FRAGMENT } from '@/lib/graphql/queries';

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
        createdAt
        updatedAt
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
        ratingForGame
        notes
        tags
        classification
        createdAt
        updatedAt
        deletedAt
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
        ratingForGame
        notes
        tags
        classification
        createdAt
        updatedAt
        deletedAt
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
        targetId
        targetType
        userId
        createdAt
        updatedAt
        user {
          ...UserSummaryFragment
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
  ${USER_SUMMARY_FRAGMENT}
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      friendship {
        id
        subscriberId
        userId
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
  ${USER_SUMMARY_FRAGMENT}
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($friendshipId: ID!) {
    acceptFriendRequest(friendshipId: $friendshipId) {
      friendship {
        id
        subscriberId
        userId
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
  ${USER_SUMMARY_FRAGMENT}
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation RejectFriendRequest($friendshipId: ID!) {
    rejectFriendRequest(friendshipId: $friendshipId) {
      friendship {
        id
        subscriberId
        userId
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
  ${USER_SUMMARY_FRAGMENT}
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

export const UPDATE_FRIENDSHIP_STATUS = gql`
  mutation UpdateFriendshipStatus($input: UpdateFriendshipStatusInput!) {
    updateFriendshipStatus(input: $input) {
      friendship {
        id
        subscriberId
        userId
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
  ${USER_SUMMARY_FRAGMENT}
`;
