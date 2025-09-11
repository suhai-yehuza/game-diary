import { gql } from '@apollo/client';

// Optimized game creation mutation
export const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      game {
        id
        date
        status
        game_id
        teams
        scores
        created_at
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

// Optimized game log creation with minimal fields
export const CREATE_GAME_LOG = gql`
  mutation CreateGameLog($input: CreateGameLogInput!) {
    createGameLog(input: $input) {
      gameLog {
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
        user {
          id
          username
        }
        game {
          id
          date
          teams
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

// Optimized game log update
export const UPDATE_GAME_LOG = gql`
  mutation UpdateGameLog($id: ID!, $input: UpdateGameLogInput!) {
    updateGameLog(id: $id, input: $input) {
      gameLog {
        id
        rating_for_game
        notes
        tags
        watched_date
        watched_setting
        watched_location
        watched_scope
        classification
        updated_at
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const DELETE_GAME_LOG = gql`
  mutation DeleteGameLog($id: ID!) {
    deleteGameLog(id: $id) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;

// Optimized comment creation with minimal fields
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      comment {
        id
        user_id
        parent_id
        parent_type
        content
        depth
        created_at
        user {
          id
          username
          first_name
          last_name
          image_url
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

// Optimized comment update
export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
    updateComment(id: $id, input: $input) {
      comment {
        id
        content
        updated_at
        user {
          id
          username
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;

// Optimized reaction creation
export const CREATE_REACTION = gql`
  mutation CreateReaction($input: CreateReactionInput!) {
    createReaction(input: $input) {
      reaction {
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
      errors {
        message
        code
        field
      }
    }
  }
`;

export const DELETE_REACTION = gql`
  mutation DeleteReaction($id: ID!) {
    deleteReaction(id: $id) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;

// Optimized friendship mutations
export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      friendship {
        id
        status
        created_at
        initiator {
          id
          username
          first_name
          last_name
        }
        recipient {
          id
          username
          first_name
          last_name
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($friendshipId: ID!) {
    acceptFriendRequest(friendshipId: $friendshipId) {
      friendship {
        id
        status
        created_at
        initiator {
          id
          username
          first_name
          last_name
        }
        recipient {
          id
          username
          first_name
          last_name
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation RejectFriendRequest($friendshipId: ID!) {
    rejectFriendRequest(friendshipId: $friendshipId) {
      friendship {
        id
        status
        created_at
        initiator {
          id
          username
          first_name
          last_name
        }
        recipient {
          id
          username
          first_name
          last_name
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const REMOVE_FRIEND = gql`
  mutation RemoveFriend($friendshipId: ID!) {
    removeFriend(friendshipId: $friendshipId) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;

// Notification mutations
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

// Public Comment Mutations (no authentication required)
export const CREATE_PUBLIC_COMMENT = gql`
  mutation CreatePublicComment($input: CreatePublicCommentInput!) {
    createPublicComment(input: $input) {
      comment {
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
        totalChildCommentCount
        totalReactionCount
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const UPDATE_PUBLIC_COMMENT = gql`
  mutation UpdatePublicComment($id: ID!, $input: UpdatePublicCommentInput!) {
    updatePublicComment(id: $id, input: $input) {
      comment {
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
        totalChildCommentCount
        totalReactionCount
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const DELETE_PUBLIC_COMMENT = gql`
  mutation DeletePublicComment($id: ID!) {
    deletePublicComment(id: $id) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;

// Public Reaction Mutations (no authentication required)
export const CREATE_PUBLIC_REACTION = gql`
  mutation CreatePublicReaction($input: CreatePublicReactionInput!) {
    createPublicReaction(input: $input) {
      reaction {
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
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const DELETE_PUBLIC_REACTION = gql`
  mutation DeletePublicReaction($id: ID!) {
    deletePublicReaction(id: $id) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;
