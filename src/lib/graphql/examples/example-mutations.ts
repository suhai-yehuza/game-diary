import { gql } from "@apollo/client";

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

// Create a new game rating
export const CREATE_GAME_RATING = gql`
  mutation CreateGameRating($input: CreateGameRatingInput!) {
    create_game_rating(input: $input) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

// Update an existing game rating
export const UPDATE_GAME_RATING = gql`
  mutation UpdateGameRating($input: UpdateGameRatingInput!) {
    update_game_rating(input: $input) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

// Delete a game rating
export const DELETE_GAME_RATING = gql`
  mutation DeleteGameRating($game_id: String!) {
    delete_game_rating(game_id: $game_id) {
      id
      game_id
      average_rating
      total_ratings
      created_at
      updated_at
    }
  }
`;

// Create a new game log
export const CREATE_GAME_LOG = gql`
  mutation CreateGameLog($input: CreateGameLogInput!) {
    create_game_log(input: $input) {
      id
      user_id
      game_id
      watched_setting
      watched_date
      watched_location
      rating_for_game
      watched_count
      created_at
      updated_at
      user {
        id
        username
        first_name
        last_name
        image_url
      }
      game {
        id
        game_id
        average_rating
        total_ratings
        created_at
        updated_at
      }
    }
  }
`;

// Update an existing game log
export const UPDATE_GAME_LOG = gql`
  mutation UpdateGameLog($input: UpdateGameLogInput!) {
    update_game_log(input: $input) {
      id
      user_id
      game_id
      watched_setting
      watched_date
      watched_location
      rating_for_game
      watched_count
      created_at
      updated_at
      user {
        id
        username
        first_name
        last_name
        image_url
      }
      game {
        id
        game_id
        average_rating
        total_ratings
        created_at
        updated_at
      }
    }
  }
`;

// Delete a game log
export const DELETE_GAME_LOG = gql`
  mutation DeleteGameLog($id: ID!) {
    delete_game_log(id: $id) {
      id
      user_id
      game_id
      watched_setting
      watched_date
      watched_location
      rating_for_game
      watched_count
      created_at
      updated_at
    }
  }
`;

// Create a comment
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    create_comment(input: $input) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
      user {
        id
        username
        first_name
        last_name
        image_url
      }
    }
  }
`;

// Update a comment
export const UPDATE_COMMENT = gql`
  mutation UpdateComment($input: UpdateCommentInput!) {
    update_comment(input: $input) {
      id
      user_id
      parent_id
      content
      created_at
      updated_at
      user {
        id
        username
        first_name
        last_name
        image_url
      }
    }
  }
`;

// Delete a comment
export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    delete_comment(id: $id) {
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
