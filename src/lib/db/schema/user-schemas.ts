import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  unique,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';

// Note: Constants are not imported here to avoid circular dependencies
// Using string literals instead
import { baseTableConfig } from '@/lib/db/schema/base-schemas';

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

    // Admin status for user preservation during cleanup operations
    isAdmin: boolean('isAdmin').notNull().default(false),

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
    status: varchar('status', { length: 50 }).notNull().default('PENDING'),
    // Canonical ID for bidirectional uniqueness (will be added via migration)
    canonical_id: varchar('canonical_id', { length: 512 }),
    ...baseTableConfig,
  },
  table => ({
    // Bidirectional uniqueness constraint using canonical ID
    canonicalUnique: unique().on(table.canonical_id),
    statusCheck: sql`CHECK (status IN ('ACCEPTED','BLOCKED','PENDING','REJECTED'))`,
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
    parent_type: varchar('parent_type', { length: 50 }).notNull().$type<string>(),
    content: text('content').notNull(),
    childComments: jsonb('childComments').array().default([]), // Store as JSONB for better performance
    depth: integer('depth').notNull().default(0), // Track comment nesting depth (0-10)
    ...baseTableConfig,
  },
  _table => ({
    parentTypeCheck: sql`CHECK (parent_type IN ('GAME_LOG','COMMENT','REACTION'))`,
    depthCheck: sql`CHECK (depth >= 0 AND depth <= 10)`, // Enforce max depth of 10
  })
);

// Reaction Emojis table - Source of truth for allowed emojis
export const reactionEmojis = pgTable('reaction_emojis', {
  emoji: varchar('emoji', { length: 10 }).primaryKey().notNull(),
});

// Reactions table - extending base table configuration
export const reactions = pgTable(
  'reactions',
  {
    user_id: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    target_type: varchar('target_type', { length: 50 }).notNull().$type<string>(),
    target_id: varchar('target_id', { length: 255 }).notNull(),
    emoji: varchar('emoji', { length: 10 })
      .notNull()
      .references(() => reactionEmojis.emoji),
    ...baseTableConfig,
  },
  _table => ({
    uniqueReaction: unique().on(_table.user_id, _table.target_type, _table.target_id, _table.emoji),
    targetTypeCheck: sql`CHECK (target_type IN ('GAME_LOG','COMMENT','REACTION'))`,
  })
);

// Utility: map DB user (snake_case) to app user
export function mapDbUserToUser(user: Record<string, unknown> | null | undefined) {
  if (!user) return user;
  return user;
}
