import { gql } from '@apollo/client';

import {
  USER_SUMMARY_FRAGMENT,
  GAME_LOG_FRAGMENT,
  GAME_FRAGMENT,
  FRIENDSHIP_FRAGMENT,
} from '@/lib/graphql/queries';

export const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      game {
        id
        date
        status
        game_type
        nba_game_id
        home_team_id
        away_team_id
        home_team_score
        away_team_score
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

export const CREATE_GAME_LOG = gql`
  mutation CreateGameLog($input: CreateGameLogInput!) {
    createGameLog(input: $input) {
      gameLog {
        ...GameLogFragment
      }
      errors {
        message
        code
        field
      }
    }
  }
  ${GAME_LOG_FRAGMENT}
  ${GAME_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
`;

export const UPDATE_GAME_LOG = gql`
  mutation UpdateGameLog($id: ID!, $input: UpdateGameLogInput!) {
    updateGameLog(id: $id, input: $input) {
      gameLog {
        ...GameLogFragment
      }
      errors {
        message
        code
        field
      }
    }
  }
  ${GAME_LOG_FRAGMENT}
  ${GAME_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
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
        updated_at
        user {
          id
          username
          first_name
          last_name
          email_address
          image_url
        }
        reactions {
          id
          emoji
          user_id
          target_id
          target_type
          created_at
          updated_at
          user {
            id
            username
            first_name
            last_name
            email_address
            image_url
          }
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

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $input: UpdateCommentInput!) {
    updateComment(id: $id, input: $input) {
      comment {
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
          email_address
          image_url
        }
        reactions {
          id
          emoji
          user_id
          target_id
          target_type
          created_at
          updated_at
          user {
            id
            username
            first_name
            last_name
            email_address
            image_url
          }
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
        updated_at
        user {
          id
          username
          first_name
          last_name
          email_address
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

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      friendship {
        ...FriendshipFragment
      }
      errors {
        message
        code
        field
      }
    }
  }
  ${FRIENDSHIP_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($friendshipId: ID!) {
    acceptFriendRequest(friendshipId: $friendshipId) {
      friendship {
        ...FriendshipFragment
      }
      errors {
        message
        code
        field
      }
    }
  }
  ${FRIENDSHIP_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
`;

export const REJECT_FRIEND_REQUEST = gql`
  mutation RejectFriendRequest($friendshipId: ID!) {
    rejectFriendRequest(friendshipId: $friendshipId) {
      friendship {
        ...FriendshipFragment
      }
      errors {
        message
        code
        field
      }
    }
  }
  ${FRIENDSHIP_FRAGMENT}
  ${USER_SUMMARY_FRAGMENT}
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
