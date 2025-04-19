// Sample Mutations

// Create a user
export const CREATE_USER = `
  mutation CreateUser(
    $username: String!
    $first_name: String!
    $last_name: String!
    $email_address: String!
    $image_url: String!
  ) {
    createUser(
      username: $username
      first_name: $first_name
      last_name: $last_name
      email_address: $email_address
      image_url: $image_url
    ) {
      id
      username
      first_name
      last_name
      email_address
      image_url
    }
  }
`;

// Create a friendship
export const CREATE_FRIENDSHIP = `
  mutation CreateFriendship($subscriber_id: ID!, $user_id: ID!) {
    createFriendship(
      subscriber_id: $subscriber_id
      user_id: $user_id
    ) {
      id
      status
      initiator {
        username
      }
      responder {
        username
      }
    }
  }
`;

// Update friendship status
export const UPDATE_FRIENDSHIP_STATUS = `
  mutation UpdateFriendshipStatus($id: ID!, $status: FriendshipStatus!) {
    updateFriendshipStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

// Create game rating
export const CREATE_GAME_RATING = `
  mutation CreateGameRating($gameId: String!, $rating: Int!) {
    createGameRating(gameId: $gameId, rating: $rating) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

// Update game rating
export const UPDATE_GAME_RATING = `
  mutation UpdateGameRating($id: String!, $gameId: String!, $rating: Int!) {
    updateGameRating(id: $id, gameId: $gameId, rating: $rating) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

// Delete game rating
export const DELETE_GAME_RATING = `
  mutation DeleteGameRating($id: String!) {
    deleteGameRating(id: $id)
  }
`;

// Create game log
export const CREATE_GAME_LOG = `
  mutation CreateGameLog(
    $user_id: String!
    $game_id: String!
    $watched_setting: WatchedSetting!
    $watched_date: DateTime!
    $watched_location: String!
    $rating_for_game: Int!
  ) {
    createGameLog(
      input: {
        user_id: $user_id
        game_id: $game_id
        watched_setting: $watched_setting
        watched_date: $watched_date
        watched_location: $watched_location
        rating_for_game: $rating_for_game
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

// Update game log
export const UPDATE_GAME_LOG = `
  mutation UpdateGameLog(
    $id: String!
    $watched_setting: WatchedSetting
    $watched_date: DateTime
    $watched_location: String
    $rating_for_game: Int
    $watched_count: Int
  ) {
    updateGameLog(
      id: $id
      input: {
        watched_setting: $watched_setting
        watched_date: $watched_date
        watched_location: $watched_location
        rating_for_game: $rating_for_game
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

// Delete game log
export const DELETE_GAME_LOG = `
  mutation DeleteGameLog($id: String!) {
    deleteGameLog(id: $id) {
      id
    }
  }
`;

// Create comment
export const CREATE_COMMENT = `
  mutation CreateComment(
    $user_id: String!
    $parent_id: String!
    $content: String!
  ) {
    create_comment(
      input: {
        user_id: $user_id
        parent_id: $parent_id
        content: $content
      }
    ) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
    }
  }
`;

// Update comment
export const UPDATE_COMMENT = `
  mutation UpdateComment($id: String!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      content
      updated_at
    }
  }
`;

// Delete comment
export const DELETE_COMMENT = `
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id) {
      id
    }
  }
`;

// Create reaction
export const CREATE_REACTION = `
  mutation CreateReaction(
    $user_id: String!
    $target_type: ReactionTargetType!
    $target_id: ID!
    $emoji: String!
  ) {
    createReaction(
      input: {
        user_id: $user_id
        target_type: $target_type
        target_id: $target_id
        emoji: $emoji
      }
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

// Delete reaction
export const DELETE_REACTION = `
  mutation DeleteReaction($id: String!) {
    deleteReaction(id: $id) {
      id
    }
  }
`;

// Increment watched count
export const INCREMENT_WATCHED_COUNT = `
  mutation IncrementWatchedCount($id: String!) {
    incrementWatchedCount(id: $id) {
      id
      watched_count
      updated_at
    }
  }
`;

// Delete a user
export const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

// Delete a friendship
export const DELETE_FRIENDSHIP = `
  mutation DeleteFriendship($id: ID!) {
    deleteFriendship(id: $id)
  }
`;
