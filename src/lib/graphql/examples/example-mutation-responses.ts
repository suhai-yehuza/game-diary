// Example Mutation Responses

// CreateUser response
export const CREATE_USER_RESPONSE = {
  create_user: {
    id: 'user123',
    username: 'johndoe',
    first_name: 'John',
    last_name: 'Doe',
    email_address: 'john.doe@example.com',
    image_url: 'https://example.com/johndoe.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    banned: false,
    inbound_friendship_ids: [],
    outbound_friendship_ids: [],
    initiated_friendships: [],
    received_friendships: [],
    game_logs: [],
  },
};

// UpdateUser response
export const UPDATE_USER_RESPONSE = {
  update_user: {
    id: 'user123',
    username: 'johndoe',
    first_name: 'John',
    last_name: 'Doe',
    email_address: 'john.doe@example.com',
    image_url: 'https://example.com/johndoe.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    banned: false,
    inbound_friendship_ids: [],
    outbound_friendship_ids: [],
    initiated_friendships: [],
    received_friendships: [],
    game_logs: [],
  },
};

// DeleteUser response
export const DELETE_USER_RESPONSE = {
  delete_user: true,
};

// CreateFriendship response
export const CREATE_FRIENDSHIP_RESPONSE = {
  create_friendship: {
    id: 'friendship123',
    initiator_id: 'user123',
    responder_id: 'user456',
    status: 'pending',
    timestamp: '2024-01-02T00:00:00Z',
    initiator: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john.doe@example.com',
      image_url: 'https://example.com/johndoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
      initiated_friendships: [],
      received_friendships: [],
      game_logs: [],
    },
    responder: {
      id: 'user456',
      username: 'janedoe',
      first_name: 'Jane',
      last_name: 'Doe',
      email_address: 'jane.doe@example.com',
      image_url: 'https://example.com/janedoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
      initiated_friendships: [],
      received_friendships: [],
      game_logs: [],
    },
  },
};

// UpdateFriendshipStatus response
export const UPDATE_FRIENDSHIP_STATUS_RESPONSE = {
  updateFriendshipStatus: {
    id: 'friendship123',
    subscriber_id: 'user123',
    user_id: 'user456',
    status: 'accepted',
    timestamp: '2024-01-02T00:00:00Z',
    initiator: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john.doe@example.com',
      image_url: 'https://example.com/johndoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
    responder: {
      id: 'user456',
      username: 'janedoe',
      first_name: 'Jane',
      last_name: 'Doe',
      email_address: 'jane.doe@example.com',
      image_url: 'https://example.com/janedoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
  },
};

// DeleteFriendship response
export const DELETE_FRIENDSHIP_RESPONSE = {
  deleteFriendship: true,
};

// CreateGameRating response
export const CREATE_GAME_RATING_RESPONSE = {
  createGameRating: {
    id: 'rating123',
    game_id: 'game123',
    average_rating: '4.5',
    total_ratings: 1,
    created_at: '2024-04-14T19:30:00Z',
    updated_at: '2024-04-14T19:30:00Z',
  },
};

// UpdateGameRating response
export const UPDATE_GAME_RATING_RESPONSE = {
  updateGameRating: {
    id: 'rating123',
    game_id: 'game123',
    average_rating: '4.8',
    total_ratings: 1,
    created_at: '2024-04-14T19:30:00Z',
    updated_at: '2024-04-14T19:35:00Z',
  },
};

// DeleteGameRating response
export const DELETE_GAME_RATING_RESPONSE = {
  deleteGameRating: true,
};

// CreateGameLog response
export const CREATE_GAME_LOG_RESPONSE = {
  createGameLog: {
    id: 'log123',
    userId: 'user123',
    game_id: 'game123',
    watched_setting: 'arena',
    watched_date: '2024-04-14T19:30:00Z',
    watched_location: 'TD Garden',
    rating_for_game: 5,
    watched_count: 1,
    created_at: '2024-04-14T19:30:00Z',
    updated_at: '2024-04-14T19:30:00Z',
    user: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john.doe@example.com',
      image_url: 'https://example.com/johndoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
  },
};

// UpdateGameLog response
export const UPDATE_GAME_LOG_RESPONSE = {
  updateGameLog: {
    id: 'log123',
    userId: 'user123',
    game_id: 'game123',
    watched_setting: 'tv',
    watched_date: '2024-04-14T19:30:00Z',
    watched_location: 'Home',
    rating_for_game: 4,
    watched_count: 1,
    created_at: '2024-04-14T19:30:00Z',
    updated_at: '2024-04-14T19:30:00Z',
    user: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john.doe@example.com',
      image_url: 'https://example.com/johndoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
  },
};

// DeleteGameLog response
export const DELETE_GAME_LOG_RESPONSE = {
  deleteGameLog: {
    id: 'log123',
  },
};

// CreateComment response
export const CREATE_COMMENT_RESPONSE = {
  createComment: {
    id: 'comment123',
    userId: 'user123',
    gameLogId: 'log123',
    content: 'Great game! The Celtics played amazing defense.',
    created_at: '2024-04-14T22:30:00Z',
    updated_at: '2024-04-14T22:30:00Z',
    user: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john.doe@example.com',
      image_url: 'https://example.com/johndoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
    gameLog: {
      id: 'log123',
      userId: 'user123',
      game_id: 'game123',
      watched_setting: 'arena',
      watched_date: '2024-04-14T19:30:00Z',
      watched_location: 'TD Garden',
      rating_for_game: 5,
      watched_count: 1,
      created_at: '2024-04-14T19:30:00Z',
      updated_at: '2024-04-14T19:30:00Z',
    },
  },
};

// UpdateComment response
export const UPDATE_COMMENT_RESPONSE = {
  updateComment: {
    id: 'comment123',
    userId: 'user123',
    gameLogId: 'log123',
    content: 'Updated comment: The Celtics played amazing defense!',
    created_at: '2024-04-14T22:30:00Z',
    updated_at: '2024-04-14T22:35:00Z',
    user: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john.doe@example.com',
      image_url: 'https://example.com/johndoe.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      banned: false,
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    },
    gameLog: {
      id: 'log123',
      userId: 'user123',
      game_id: 'game123',
      watched_setting: 'arena',
      watched_date: '2024-04-14T19:30:00Z',
      watched_location: 'TD Garden',
      rating_for_game: 5,
      watched_count: 1,
      created_at: '2024-04-14T19:30:00Z',
      updated_at: '2024-04-14T19:30:00Z',
    },
  },
};

// DeleteComment response
export const DELETE_COMMENT_RESPONSE = {
  deleteComment: true,
};

// CreateReaction response
export const CREATE_REACTION_RESPONSE = {
  createReaction: {
    id: 'reaction123',
    user_id: 'user123',
    target_type: 'comment',
    target_id: 'comment123',
    emoji: '👍',
    created_at: '2024-04-14T22:40:00Z',
    updated_at: '2024-04-14T22:40:00Z',
  },
};

// DeleteReaction response
export const DELETE_REACTION_RESPONSE = {
  deleteReaction: {
    id: 'reaction123',
  },
};

// IncrementWatchedCount response
export const INCREMENT_WATCHED_COUNT_RESPONSE = {
  incrementWatchedCount: {
    id: 'log123',
    watched_count: 2,
    updated_at: '2024-04-14T20:00:00Z',
  },
};

// Example Mutation Responses
export const exampleMutationResponses = {
  // Response for createGameRating mutation
  createGameRating: {
    id: '1',
    game_id: 'game123',
    average_rating: 4.5,
    total_ratings: 100,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
  },

  // Response for updateGameRating mutation
  updateGameRating: {
    id: '1',
    game_id: 'game123',
    average_rating: 4.8,
    total_ratings: 120,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
  },

  // Response for deleteGameRating mutation
  deleteGameRating: {
    id: '1',
    game_id: 'game123',
    average_rating: 4.5,
    total_ratings: 100,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
  },

  // Response for createGameLog mutation
  createGameLog: {
    id: '1',
    user_id: 'user123',
    game_id: 'game123',
    watched_setting: 'SOLO',
    watched_date: '2024-03-20T10:00:00Z',
    watched_location: 'Home',
    rating_for_game: 5,
    watched_count: 1,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
    user: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/johndoe.jpg',
    },
    game: {
      id: '1',
      game_id: 'game123',
      average_rating: 4.5,
      total_ratings: 100,
      created_at: '2024-03-20T10:00:00Z',
      updated_at: '2024-03-20T10:00:00Z',
    },
  },

  // Response for updateGameLog mutation
  updateGameLog: {
    id: '1',
    user_id: 'user123',
    game_id: 'game123',
    watched_setting: 'GROUP',
    watched_date: '2024-03-20T10:00:00Z',
    watched_location: 'Cinema',
    rating_for_game: 4,
    watched_count: 2,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
    user: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/johndoe.jpg',
    },
    game: {
      id: '1',
      game_id: 'game123',
      average_rating: 4.5,
      total_ratings: 100,
      created_at: '2024-03-20T10:00:00Z',
      updated_at: '2024-03-20T10:00:00Z',
    },
  },

  // Response for deleteGameLog mutation
  deleteGameLog: {
    id: '1',
    user_id: 'user123',
    game_id: 'game123',
    watched_setting: 'SOLO',
    watched_date: '2024-03-20T10:00:00Z',
    watched_location: 'Home',
    rating_for_game: 5,
    watched_count: 1,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
  },

  // Response for createComment mutation
  createComment: {
    id: '1',
    user_id: 'user123',
    parent_id: 'game_log_1',
    content: 'Great game!',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
    user: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/johndoe.jpg',
    },
  },

  // Response for updateComment mutation
  updateComment: {
    id: '1',
    user_id: 'user123',
    parent_id: 'game_log_1',
    content: 'Amazing game!',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T11:00:00Z',
    user: {
      id: 'user123',
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      image_url: 'https://example.com/johndoe.jpg',
    },
  },

  // Response for deleteComment mutation
  deleteComment: {
    id: '1',
  },
};
