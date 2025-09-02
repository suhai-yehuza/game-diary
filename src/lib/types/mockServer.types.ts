// Mock server configuration types
export interface MockServerConfig {
  port: number;
  latency: {
    min: number; // Minimum latency in milliseconds
    max: number; // Maximum latency in milliseconds
  };
  errorRate: number; // Error rate as a decimal (0.0 to 1.0)
  enableLogging: boolean;
}

// Database operation types
export type DatabaseOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export interface DatabaseQuery {
  operation: DatabaseOperation;
  table: string;
  data?: unknown;
  where?: unknown;
  limit?: number;
  offset?: number;
}

// External API types
export interface ExternalAPIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: unknown;
  headers?: Record<string, string>;
}

export interface ExternalAPIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
  latency: number;
}

// Mock data types
export interface MockUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  isAdmin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockGameLog {
  id: string;
  user_id: string;
  game_id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface MockFriendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface MockComment {
  id: string;
  user_id: string;
  game_log_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MockReaction {
  id: string;
  user_id: string;
  game_log_id: string;
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  created_at: string;
}

export interface MockGameRating {
  id: string;
  user_id: string;
  game_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface MockNotification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'comment' | 'reaction' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// NBA Season types
export interface MockNBASeason {
  id: number;
  year: number;
}

// NBA Game types
export interface MockNBAGame {
  id: string;
  game_type: string;
  season: string;
  nba_game_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team_score: number;
  away_team_score: number;
  status: 'scheduled' | 'live' | 'finished';
  date: string;
  average_rating: string;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

export interface MockNBATeam {
  id: string;
  name: string;
  city: string;
  conference: string;
  division: string;
  logo_url?: string;
}

export interface MockNBAPlayer {
  id: string;
  name: string;
  team_id: string;
  position: string;
  jersey_number: number;
  height: string;
  weight: number;
  birth_date: string;
}

// Mock database schema
export interface MockDatabaseSchema {
  users: MockUser[];
  game_logs: MockGameLog[];
  friendships: MockFriendship[];
  comments: MockComment[];
  reactions: MockReaction[];
  game_ratings: MockGameRating[];
  notifications: MockNotification[];
  seasons: MockNBASeason[];
  nba_games: MockNBAGame[];
  teams: MockNBATeam[];
  nba_players: MockNBAPlayer[];
}

// Mock server response types
export interface MockServerResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  latency: number;
  mock: boolean;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  config: MockServerConfig;
  uptime: number;
}

// Statistics response
export interface StatsResponse {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  config: MockServerConfig;
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageLatency: number;
  };
}
