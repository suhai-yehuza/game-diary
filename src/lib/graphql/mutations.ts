import { gql } from '@apollo/client';

export const CREATE_FRIENDSHIP = gql`
  mutation CreateFriendship($subscriber_id: ID!, $user_id: ID!) {
    createFriendship(input: { subscriber_id: $subscriber_id, user_id: $user_id, status: PENDING }) {
      id
      subscriber_id
      user_id
      status
      timestamp
    }
  }
`;

export const UPDATE_FRIENDSHIP_STATUS = gql`
  mutation UpdateFriendshipStatus($id: ID!, $status: FriendshipStatus!) {
    updateFriendshipStatus(id: $id, status: $status) {
      id
      subscriber_id
      user_id
      status
      timestamp
    }
  }
`;

export const CREATE_GAME_LOG = gql`
  mutation CreateGameLog(
    $user_id: String!
    $game_id: String!
    $watched_setting: WatchedSetting!
    $watched_date: DateTime!
    $watched_location: String!
    $rating_for_game: Int!
    $rating_stars: String!
  ) {
    createGameLog(
      input: {
        user_id: $user_id
        game_id: $game_id
        watched_setting: $watched_setting
        watched_date: $watched_date
        watched_location: $watched_location
        rating_for_game: $rating_for_game
        rating_stars: $rating_stars
      }
    ) {
      id
      user_id
      game_id
      watched_setting
      watched_date
      watched_location
      rating_for_game
      rating_stars
      watched_count
      created_at
      updated_at
    }
  }
`;

export const UPDATE_GAME_LOG = gql`
  mutation UpdateGameLog(
    $id: String!
    $watched_setting: WatchedSetting
    $watched_date: DateTime
    $watched_location: String
    $rating_for_game: Int
    $rating_stars: String
    $watched_count: Int
  ) {
    updateGameLog(
      id: $id
      input: {
        watched_setting: $watched_setting
        watched_date: $watched_date
        watched_location: $watched_location
        rating_for_game: $rating_for_game
        rating_stars: $rating_stars
        watched_count: $watched_count
      }
    ) {
      id
      user_id
      game_id
      watched_setting
      watched_date
      watched_location
      rating_for_game
      rating_stars
      watched_count
      created_at
      updated_at
    }
  }
`;

export const DELETE_GAME_LOG = gql`
  mutation DeleteGameLog($id: String!) {
    deleteGameLog(id: $id) {
      id
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($user_id: String!, $parent_id: String!, $content: String!) {
    createComment(user_id: $user_id, parent_id: $parent_id, content: $content) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: String!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id)
  }
`;

export const CREATE_REACTION = gql`
  mutation CreateReaction(
    $user_id: ID!
    $target_type: ReactionTargetType!
    $target_id: ID!
    $emoji: String!
  ) {
    createReaction(
      input: { user_id: $user_id, target_type: $target_type, target_id: $target_id, emoji: $emoji }
    ) {
      id
      user_id
      target_type
      target_id
      emoji
      created_at
      updated_at
    }
  }
`;

export const DELETE_REACTION = gql`
  mutation DeleteReaction($id: String!) {
    deleteReaction(id: $id) {
      id
    }
  }
`;

export const INCREMENT_WATCHED_COUNT = gql`
  mutation IncrementWatchedCount($id: String!) {
    incrementWatchedCount(id: $id) {
      id
      watched_count
      updated_at
    }
  }
`;

export const CREATE_GAME_RATING = gql`
  mutation CreateGameRating($gameId: String!, $rating: Int!) {
    create_game_rating(gameId: $gameId, rating: $rating) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

export const UPDATE_GAME_RATING = gql`
  mutation UpdateGameRating($id: String!, $gameId: String!, $rating: Int!) {
    update_game_rating(id: $id, gameId: $gameId, rating: $rating) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

export const DELETE_GAME_RATING = gql`
  mutation DeleteGameRating($id: String!) {
    delete_game_rating(id: $id)
  }
`;
