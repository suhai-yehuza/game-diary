import { sql } from 'drizzle-orm';
import {
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  decimal,
  unique,
  boolean,
  serial,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE, TARGET_TYPES } from '@/lib/constants';
import { baseTableConfig } from '@/lib/db/schema/base-schemas';
import { users } from '@/lib/db/schema/user-schemas';

// Leagues table
export const leagues = pgTable('leagues', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

// Seasons table
export const seasons = pgTable('seasons', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull().unique(),
});

// Basketball Games table - extending base table configuration
export const basketball_games = pgTable('basketball_games', {
  id: varchar('id', { length: 255 }).primaryKey(), // Format: ${season}-${game.id}
  game_type: varchar('game_type', { length: 50 }).notNull().default('nba'),
  season: varchar('season', { length: 20 }),
  basketball_game_id: varchar('basketball_game_id', { length: 255 }),
  date: timestamp('date').notNull(),
  stage: integer('stage'), // Game stage (e.g., regular season, playoffs, etc.)
  teams: jsonb('teams'), // Complete teams data with home and away team information
  game_status: varchar('game_status', { length: 50 }).notNull(), // Keep for backward compatibility
  status: jsonb('status'), // New field to store complete status object
  scores: jsonb('scores'), // New field to store complete scores object with win/loss, series, linescore
  arena: jsonb('arena'), // New field to store complete arena object
  periods: jsonb('periods'), // New field to store complete periods object
  officials: text('officials').array(), // Array of official names
  times_tied: integer('times_tied'), // Number of times the game was tied
  lead_changes: integer('lead_changes'), // Number of lead changes
  nugget: text('nugget'), // Game summary/description
  average_rating: decimal('average_rating', { precision: 4, scale: 2 }).notNull().default('0.00'),
  total_ratings: integer('total_ratings').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// Basketball Teams table
export const basketball_teams = pgTable('basketball_teams', {
  id: varchar('id', { length: 255 }).primaryKey(), // External API team ID
  name: varchar('name', { length: 255 }).notNull(),
  nickname: varchar('nickname', { length: 100 }),
  code: varchar('code', { length: 10 }),
  city: varchar('city', { length: 100 }),
  logo: text('logo'),
  all_star: boolean('all_star').notNull().default(false),
  nba_franchise: boolean('nba_franchise').notNull().default(false),
  conference: varchar('conference', { length: 100 }), // Keep for backward compatibility
  leagues: jsonb('leagues'), // Store comprehensive league data as JSONB
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// Basketball Players table
export const basketball_players = pgTable('basketball_players', {
  id: varchar('id', { length: 255 }).primaryKey(), // External API player ID
  first_name: varchar('first_name', { length: 100 }).notNull().default('missing-first-name'),
  last_name: varchar('last_name', { length: 100 }).notNull().default('missing-last-name'),
  birth: jsonb('birth'), // Store as JSONB for better performance
  nba: jsonb('nba'), // Store as JSONB for better performance
  height: jsonb('height'), // Store as JSONB for better performance
  weight: jsonb('weight'), // Store as JSONB for better performance
  college: varchar('college', { length: 100 }),
  affiliation: varchar('affiliation', { length: 100 }),
  teams: jsonb('teams'), // Store as JSONB: array of { season: string, teams: [] }
  leagues: jsonb('leagues'), // Store as JSONB for better performance
  image_url: text('image_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// Game logs table - extending base table configuration
export const game_logs = pgTable(
  'game_logs',
  {
    user_id: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    game_id: varchar('game_id', { length: 255 })
      .notNull()
      .references(() => basketball_games.id, { onDelete: 'cascade' }),
    classification: varchar('classification', { length: 50 })
      .notNull()
      .default(CLASSIFICATION.PROTECTED),
    watched_setting: varchar('watched_setting', { length: 50 })
      .notNull()
      .default(WATCHED_SETTING.TV),
    watched_scope: varchar('watched_scope', { length: 50 })
      .notNull()
      .default(WATCHED_SCOPE.FULL_GAME),
    watched_date: timestamp({ precision: 6, withTimezone: true }).notNull(),
    watched_location: varchar('watched_location', { length: 255 }).default(''),
    rating_for_game: integer('rating_for_game').notNull().default(3),
    notes: text('notes').default(''),
    tags: text('tags').array().default([]),
    ...baseTableConfig,
  },
  _table => ({
    // Ensure a user can only have one game log per game
    userGameUnique: unique().on(_table.user_id, _table.game_id),
    ratingCheck: sql`CHECK (rating_for_game >= 1 AND rating_for_game <= 5)`,
  })
);

// Game ratings table - extending base table configuration
export const game_ratings = pgTable(
  'game_ratings',
  {
    game_id: varchar('game_id', { length: 255 })
      .notNull()
      .references(() => basketball_games.id, { onDelete: 'cascade' }),
    average_rating: decimal('average_rating', { precision: 4, scale: 2 }).notNull().default('0.00'),
    total_ratings: integer('total_ratings').notNull().default(0),
    ...baseTableConfig,
  },
  _table => ({
    // Add unique constraint on game_id
    uniqueGameId: unique().on(_table.game_id),
    averageRatingCheck: sql`CHECK (average_rating >= 1 AND average_rating <= 5)`,
  })
);

// Public Comments table - for NBA games, players, and teams (no authentication required)
export const publicComments = pgTable(
  'public_comments',
  {
    // Optional user_id - can be null for anonymous comments
    user_id: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'set null', // Set to null if user is deleted, keep comment
    }),
    // Anonymous user info (when user_id is null)
    anonymous_name: varchar('anonymous_name', { length: 255 }), // Display name for anonymous users
    anonymous_email: varchar('anonymous_email', { length: 255 }), // Email for anonymous users (optional)
    parent_id: varchar('parent_id', { length: 255 }).notNull(), // ID of the NBA game, player, or team
    parent_type: varchar('parent_type', { length: 50 })
      .notNull()
      .$type<(typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]>(),
    content: text('content').notNull(),
    childComments: jsonb('childComments').array().default([]), // Store as JSONB for better performance
    depth: integer('depth').notNull().default(0), // Track comment nesting depth (0-10)
    is_approved: boolean('is_approved').notNull().default(true), // Moderation flag
    ...baseTableConfig,
  },
  _table => ({
    parentTypeCheck: sql`CHECK (parent_type IN ('${sql.join(Object.values(TARGET_TYPES), "','")}'))`,
    depthCheck: sql`CHECK (depth >= 0 AND depth <= 10)`, // Enforce max depth of 10
    // Ensure either user_id or anonymous_name is provided
    userOrAnonymousCheck: sql`CHECK (
      (user_id IS NOT NULL) OR
      (anonymous_name IS NOT NULL AND LENGTH(TRIM(anonymous_name)) > 0)
    )`,
    // Indexes for common query patterns
    parentIdParentTypeIdx: index('public_comments_parent_id_parent_type_idx').on(
      _table.parent_id,
      _table.parent_type
    ),
    parentIdParentTypeCreatedAtIdx: index(
      'public_comments_parent_id_parent_type_created_at_idx'
    ).on(_table.parent_id, _table.parent_type, _table.created_at),
    userIdIdx: index('public_comments_user_id_idx').on(_table.user_id),
    anonymousNameIdx: index('public_comments_anonymous_name_idx').on(_table.anonymous_name),
    isApprovedIdx: index('public_comments_is_approved_idx').on(_table.is_approved),
    createdAtIndex: index('public_comments_created_at_idx').on(_table.created_at),
    // GIN index for content search (full-text search)
    contentGinIdx: index('public_comments_content_gin_idx').using(
      'gin',
      sql`to_tsvector('english', content)`
    ),
  })
);

// Public Reactions table - for NBA games, players, and teams (no authentication required)
export const publicReactions = pgTable(
  'public_reactions',
  {
    // Optional user_id - can be null for anonymous reactions
    user_id: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'set null', // Set to null if user is deleted, keep reaction
    }),
    // Anonymous user info (when user_id is null)
    anonymous_name: varchar('anonymous_name', { length: 255 }), // Display name for anonymous users
    anonymous_email: varchar('anonymous_email', { length: 255 }), // Email for anonymous users (optional)
    target_type: varchar('target_type', { length: 50 })
      .notNull()
      .$type<(typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]>(),
    target_id: varchar('target_id', { length: 255 }).notNull(),
    emoji: varchar('emoji', { length: 10 }).notNull(),
    is_approved: boolean('is_approved').notNull().default(true), // Moderation flag
    ...baseTableConfig,
  },
  _table => ({
    // Unique constraint: one reaction per user/anonymous per target per emoji
    uniqueReaction: unique().on(
      _table.user_id,
      _table.anonymous_name,
      _table.target_type,
      _table.target_id,
      _table.emoji
    ),
    targetTypeCheck: sql`CHECK (target_type IN ('${sql.join(Object.values(TARGET_TYPES), "','")}'))`,
    // Ensure either user_id or anonymous_name is provided
    userOrAnonymousCheck: sql`CHECK (
      (user_id IS NOT NULL) OR
      (anonymous_name IS NOT NULL AND LENGTH(TRIM(anonymous_name)) > 0)
    )`,
    // Indexes for common query patterns
    targetIdTargetTypeIdx: index('public_reactions_target_id_target_type_idx').on(
      _table.target_id,
      _table.target_type
    ),
    userIdIdx: index('public_reactions_user_id_idx').on(_table.user_id),
    anonymousNameIdx: index('public_reactions_anonymous_name_idx').on(_table.anonymous_name),
    emojiIdx: index('public_reactions_emoji_idx').on(_table.emoji),
    isApprovedIdx: index('public_reactions_is_approved_idx').on(_table.is_approved),
    createdAtIndex: index('public_reactions_created_at_idx').on(_table.created_at),
  })
);
