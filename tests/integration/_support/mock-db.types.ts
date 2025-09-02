// Shared lightweight types for the integration test mock DBs

export type TestUser = {
  id: string;
  username: string;
  email_address: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type TestGameLog = {
  id: string;
  user_id: string;
  game_id: string;
  classification: string;
  watched_setting: string;
  watched_scope: string;
  watched_date: string;
  watched_location: string;
  rating_for_game: number;
  notes: string;
  created_at?: string;
  updated_at?: string;
};

export type TestFriendship = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'PENDING' | 'ACCEPTED';
  created_at?: string;
  updated_at?: string;
};

export type TestNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};
