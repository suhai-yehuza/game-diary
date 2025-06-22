import { gql } from '@apollo/client';

import { COMMENT_FRAGMENT, USER_SUMMARY_FRAGMENT } from '@src/lib/graphql/queries';

export const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
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
        periods {
          current
          total
          endOfPeriod
        }
        arena {
          name
          city
          state
          country
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
        id
        user {
          id
          username
          first_name
          last_name
          image_url
        }
        game {
          id
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
        watchedSetting
        watchedDate
        ratingForGame
        notes
        tags
        classification
        createdAt
        updatedAt
      }
      errors {
        message
        code
        field
      }
    }
  }
`;

export const UPDATE_GAME_LOG = gql`
  mutation UpdateGameLog($id: ID!, $input: CreateGameLogInput!) {
    updateGameLog(id: $id, input: $input) {
      gameLog {
        id
        user {
          id
          username
          first_name
          last_name
          image_url
        }
        game {
          id
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

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      comment {
        ...CommentFragment
      }
      errors {
        message
        code
        field
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $input: CreateCommentInput!) {
    updateComment(id: $id, input: $input) {
      comment {
        ...CommentFragment
      }
      errors {
        message
        code
        field
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
        message
        code
        field
      }
    }
  }
  ${USER_SUMMARY_FRAGMENT}
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
      errors {
        message
        code
        field
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
        message
        code
        field
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
        message
        code
        field
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
        message
        code
        field
      }
    }
  }
`;
