import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, boolean, unique, integer } from 'drizzle-orm/pg-core';

import { baseTableConfig } from '@/lib/db/schema/base-schemas';
import { FRIENDSHIP_STATUS, REACTION_EMOJIS, TARGET_TYPES } from '@/lib/db/schema/constants';

// Users table - minimal schema focusing on app-specific data and relationships
export const users = pgTable(
  'users',
  {
    // Use Clerk user ID as the primary key
    id: varchar('id', { length: 255 }).primaryKey(), // Clerk user ID

    // Core user fields (matching Clerk structure)
    object: varchar('object', { length: 10 }).notNull().default('user'),
    username: varchar('username', { length: 255 }),
    first_name: varchar('first_name', { length: 255 }),
    last_name: varchar('last_name', { length: 255 }),
    image_url: text('image_url'),
    has_image: boolean('has_image').notNull().default(false),
    profile_image_url: text('profile_image_url'),

    // Primary contact information (matching Clerk structure)
    primary_email_address_id: varchar('primary_email_address_id', { length: 255 }),
    primary_phone_number_id: varchar('primary_phone_number_id', { length: 255 }),

    // Convenience field for primary email address
    email_address: varchar('email_address', { length: 255 }), // email_addresses[0].email_address

    // Convenience field for primary phone number
    phone_number: text('phone_number'), // phone_numbers[0].phone_number (encrypted)

    // Clerk-specific fields
    external_id: varchar('external_id', { length: 255 }),
    last_active_at: timestamp({ precision: 6, withTimezone: true }),
    last_sign_in_at: timestamp({ precision: 6, withTimezone: true }),

    // App-specific user data (not available from Clerk)
    bio: text('bio'),
    timezone: varchar('timezone', { length: 50 }),
    preferred_language: varchar('preferred_language', { length: 10 }).default('en'),

    // Friendship arrays
    inbound_friendship_ids: varchar('inbound_friendship_ids', { length: 255 })
      .array()
      .notNull()
      .default([]),
    outbound_friendship_ids: varchar('outbound_friendship_ids', { length: 255 })
      .array()
      .notNull()
      .default([]),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp({ precision: 6, withTimezone: true }),
  },
  table => ({
    emailUnique: unique().on(table.email_address),
    // Constraint: username is required and at least one of email or phone must be provided
    userContactConstraint: sql`CHECK (
      username IS NOT NULL AND
      LENGTH(TRIM(username)) > 0 AND
      (email_address IS NOT NULL OR phone_number IS NOT NULL)
    )`,
  })
);

// Friendships table - extending base table configuration
export const friendships = pgTable(
  'friendships',
  {
    friend_id: varchar('friend_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    user_id: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    status: varchar('status', { length: 50 })
      .notNull()
      .default(FRIENDSHIP_STATUS.PENDING)
      .$type<(typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS]>(),
    ...baseTableConfig,
  },
  table => ({
    friendUserUnique: unique().on(table.friend_id, table.user_id),
    statusCheck: sql`CHECK (status IN ('${sql.join(Object.values(FRIENDSHIP_STATUS), "','")}'))`,
    // Performance indexes for friendship queries
    friendshipStatusIndex: sql`CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships (status)`,
    friendshipUserIndex: sql`CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships (user_id)`,
    friendshipFriendIndex: sql`CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships (friend_id)`,
    // Composite index for the most common query pattern
    friendshipUserFriendStatusIndex: sql`CREATE INDEX IF NOT EXISTS idx_friendships_user_friend_status ON friendships (user_id, friend_id, status)`,
    friendshipFriendUserStatusIndex: sql`CREATE INDEX IF NOT EXISTS idx_friendships_friend_user_status ON friendships (friend_id, user_id, status)`,
  })
);

// Comments table - extending base table configuration
export const comments = pgTable(
  'comments',
  {
    user_id: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    parent_id: varchar('parent_id', { length: 255 }).notNull(),
    parent_type: varchar('parent_type', { length: 50 })
      .notNull()
      .$type<(typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]>(),
    content: text('content').notNull(),
    depth: integer('depth').notNull().default(0), // Track comment nesting depth (0-10)
    ...baseTableConfig,
  },
  _table => ({
    commentIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parent_id, parent_type)`,
    commentUserIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_user ON comments (user_id)`,
    commentCreatedIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_created ON comments (created_at)`,
    commentDeletedIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments (deleted_at)`,
    commentDepthIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_depth ON comments (depth)`,
    parentTypeCheck: sql`CHECK (parent_type IN ('${sql.join(Object.values(TARGET_TYPES), "','")}'))`,
    depthCheck: sql`CHECK (depth >= 0 AND depth <= 10)`, // Enforce max depth of 10
  })
);

// Reactions table - extending base table configuration
export const reactions = pgTable(
  'reactions',
  {
    user_id: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    target_type: varchar('target_type', { length: 50 })
      .notNull()
      .$type<(typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]>(),
    target_id: varchar('target_id', { length: 255 }).notNull(),
    emoji: varchar('emoji', { length: 10 })
      .notNull()
      .$type<(typeof REACTION_EMOJIS)[keyof typeof REACTION_EMOJIS]>(),
    ...baseTableConfig,
  },
  _table => ({
    reactionIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions (target_id, target_type)`,
    reactionUserIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions (user_id)`,
    reactionEmojiIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_emoji ON reactions (emoji)`,
    reactionTargetDeletedIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_target_deleted ON reactions (target_id, target_type, deleted_at) WHERE deleted_at IS NULL`,
    uniqueReaction: unique().on(_table.user_id, _table.target_type, _table.target_id, _table.emoji),
    targetTypeCheck: sql`CHECK (target_type IN ('${sql.join(Object.values(TARGET_TYPES), "','")}'))`,
    emojiCheck: sql`CHECK (emoji IN ('${sql.join(Object.values(REACTION_EMOJIS), "','")}'))`,
  })
);

// Utility: map DB user (snake_case) to app user
export function mapDbUserToUser(user: Record<string, unknown> | null | undefined) {
  if (!user) return user;
  return user;
}
