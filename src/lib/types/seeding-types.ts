/**
 * Seeding-related type definitions
 *
 * This file contains all type definitions used by the database seeding system.
 */

import type { IReactionEmojiValue } from './constantTypes';

// ============================================================================
// SEEDING CONFIGURATION TYPES
// ============================================================================

export interface ISeedingConfig {
  userCount: number;
  gameLogsPerUser: { min: number; max: number };
  commentsPerGameLog: { min: number; max: number };
  friendshipsPerUser: { min: number; max: number };
  reactionsPerGameLog: { min: number; max: number };
  reactionsPerComment: { min: number; max: number };
  childCommentChance: number;
}

export type ScenarioKey = 'SMALL' | 'MEDIUM' | 'LARGE' | 'CUSTOM';

export type IdGeneratorType = 'uuidv7' | 'ulid' | 'nanoid' | 'cuid2' | 'uuid';

// ============================================================================
// SEED DATA TYPES
// ============================================================================

export interface ISeedUser {
  id: string;
  object: string;
  username: string;
  first_name: string;
  last_name: string;
  image_url: string;
  has_image: boolean;
  profile_image_url: string;
  primary_email_address_id: string;
  primary_phone_number_id: string;
  email_address: string;
  external_id: string;
  bio: string;
  timezone: string;
  preferred_language: string;
  inbound_friendship_ids: string[];
  outbound_friendship_ids: string[];
}

export interface ISeedFriendship {
  id: string;
  friend_id: string;
  user_id: string;
  status: 'ACCEPTED' | 'BLOCKED' | 'PENDING' | 'REJECTED';
}

export interface ISeedGameLog {
  id: string;
  user_id: string;
  game_id: string;
  classification: string;
  watched_setting: string;
  watched_scope: string;
  watched_date: Date;
  watched_location: string;
  rating_for_game: number;
  notes: string;
  tags: string[];
}

export interface ISeedComment {
  id: string;
  user_id: string;
  parent_id: string;
  parent_type: 'GAME_LOG' | 'COMMENT';
  content: string;
  depth: number;
}

export interface ISeedReaction {
  id: string;
  user_id: string;
  target_type: 'GAME_LOG' | 'COMMENT';
  target_id: string;
  emoji: IReactionEmojiValue;
}

export interface ISeedNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  target_id: string;
  target_type: string;
  resolved: boolean;
  read: boolean;
}

// ============================================================================
// STATISTICAL DISTRIBUTION TYPES
// ============================================================================

export type DistributionType =
  | 'pareto'
  | 'normal'
  | 'exponential'
  | 'power-law'
  | 'poisson'
  | 'beta'
  | 'uniform'
  | 'custom';

export interface IDistributionConfig {
  type: DistributionType;
  parameters: {
    [key: string]: number;
  };
  customFunction?: () => number;
}

export interface IStatisticalSeedingConfig {
  // User-related distributions
  userEngagement: IDistributionConfig;
  userActivityFrequency: IDistributionConfig;
  userFriendCount: IDistributionConfig;
  userContentQuality: IDistributionConfig;
  userActivityAge: IDistributionConfig;

  // Content-related distributions
  gameRating: IDistributionConfig;
  commentCount: IDistributionConfig;
  reactionCount: IDistributionConfig;
  contentViralProbability: IDistributionConfig;

  // Time-related distributions
  activityAge: IDistributionConfig;
  responseTime: IDistributionConfig;
  sessionDuration: IDistributionConfig;

  // Game log distributions
  gameLogsPerUser: IDistributionConfig;
  gameLogClassification: IDistributionConfig;
  gameLogTags: IDistributionConfig;

  // Social distributions
  friendshipStatus: IDistributionConfig;
  notificationFrequency: IDistributionConfig;

  // Advanced settings
  enableRealisticPatterns: boolean;
  enableViralContent: boolean;
  enablePowerUsers: boolean;
  enableTimeDecay: boolean;
}

// Type alias for backward compatibility
export type StatisticalSeedingConfig = IStatisticalSeedingConfig;

// These types will be defined in the statistical-distributions file
export type DistributionPreset = string;
export type DistributionConfigPreset = string;
