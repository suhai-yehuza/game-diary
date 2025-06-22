import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, boolean, unique, jsonb } from 'drizzle-orm/pg-core';

import { FRIENDSHIP_STATUS, REACTION_EMOJIS, TARGET_TYPES } from '@src/lib/types';
import { generateUUID } from '@src/lib/utils/processing';

// Users table
export const users = pgTable('users', {
  // Core user fields
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  object: varchar('object', { length: 10 }).notNull().default('user'),
  username: varchar('username', { length: 255 }),
  first_name: varchar('first_name', { length: 255 }),
  last_name: varchar('last_name', { length: 255 }),
  image_url: text('image_url'),
  has_image: boolean('has_image').notNull().default(false),
  profile_image_url: text('profile_image_url'),

  // Email and contact fields
  emailAddress: varchar('emailAddress', { length: 255 }).notNull().unique(),
  primary_email_address_id: varchar('primary_email_address_id', { length: 255 }),
  primary_phone_number_id: varchar('primary_phone_number_id', { length: 255 }),
  primary_web3_wallet_id: varchar('primary_web3_wallet_id', { length: 255 }),

  // Authentication and security fields
  password_enabled: boolean('password_enabled').notNull().default(false),
  two_factor_enabled: boolean('two_factor_enabled').notNull().default(false),
  totp_enabled: boolean('totp_enabled').notNull().default(false),
  backup_code_enabled: boolean('backup_code_enabled').notNull().default(false),
  email_verified: boolean('email_verified').notNull().default(false),
  email_verification_strategy: varchar('email_verification_strategy', { length: 50 }),
  verification_attempts_remaining: varchar('verification_attempts_remaining', { length: 10 })
    .notNull()
    .default('100'),

  // External accounts and metadata
  external_id: varchar('external_id', { length: 255 }),
  external_accounts: jsonb('external_accounts').notNull().default('[]'),
  public_metadata: jsonb('public_metadata').notNull().default('{}'),
  private_metadata: jsonb('private_metadata').notNull().default('{}'),
  unsafe_metadata: jsonb('unsafe_metadata').notNull().default('{}'),

  // Status and flags
  banned: boolean('banned').notNull().default(false),
  locked: boolean('locked').notNull().default(false),
  lockout_expires_in_seconds: varchar('lockout_expires_in_seconds', { length: 20 }),
  delete_self_enabled: boolean('delete_self_enabled').notNull().default(true),
  create_organization_enabled: boolean('create_organization_enabled').notNull().default(true),

  // Timestamps
  last_sign_in_at: timestamp({ precision: 6, withTimezone: true }),
  last_active_at: timestamp({ precision: 6, withTimezone: true }),
  mfa_enabled_at: timestamp({ precision: 6, withTimezone: true }),
  mfa_disabled_at: timestamp({ precision: 6, withTimezone: true }),
  legal_accepted_at: timestamp({ precision: 6, withTimezone: true }),
  created_at: timestamp({ precision: 6, withTimezone: true }),
  updated_at: timestamp({ precision: 6, withTimezone: true }),

  // Friendship arrays
  inboundFriendshipIds: text('inboundFriendshipIds').array().notNull().default([]),
  outboundFriendshipIds: text('outboundFriendshipIds').array().notNull().default([]),

  // Database-specific fields
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  deletedAt: timestamp({ precision: 6, withTimezone: true }),
});

// Friendships table
export const friendships = pgTable(
  'friendships',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    friendId: varchar('friendId', { length: 255 }).references(() => users.id),
    userId: varchar('userId', { length: 255 }).references(() => users.id),
    status: varchar('status', { length: 50 })
      .notNull()
      .default(FRIENDSHIP_STATUS.PENDING)
      .$type<(typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS]>(),
    createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deletedAt', { withTimezone: true }).default(sql`null`),
  },
  table => ({
    friendUserUnique: unique().on(table.friendId, table.userId),
    statusCheck: sql`CHECK (status IN ('${sql.join(Object.values(FRIENDSHIP_STATUS), "','")}'))`,
  })
);

// Comments table
export const comments = pgTable(
  'comments',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    userId: varchar('userId', { length: 255 }).references(() => users.id),
    parentId: varchar('parentId', { length: 255 }).notNull(),
    parentType: varchar('parentType', { length: 50 })
      .notNull()
      .$type<(typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]>(),
    content: text('content').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    deletedAt: timestamp('deletedAt').default(sql`null`),
  },
  _table => ({
    commentIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parentId, parentType)`,
    commentUserIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_user ON comments (userId)`,
    commentCreatedIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_created ON comments (createdAt)`,
    commentDeletedIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments (deletedAt)`,
    parentTypeCheck: sql`CHECK (parentType IN ('${sql.join(Object.values(TARGET_TYPES), "','")}'))`,
  })
);

// Reactions table
export const reactions = pgTable(
  'reactions',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    userId: varchar('userId', { length: 255 }).references(() => users.id),
    targetType: varchar('targetType', { length: 50 })
      .notNull()
      .$type<(typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]>(),
    targetId: varchar('targetId', { length: 255 }).notNull(),
    emoji: varchar('emoji', { length: 10 })
      .notNull()
      .$type<(typeof REACTION_EMOJIS)[keyof typeof REACTION_EMOJIS]>(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    deletedAt: timestamp('deletedAt').default(sql`null`),
  },
  _table => ({
    reactionIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions (targetId, targetType)`,
    reactionUserIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions (userId)`,
    reactionEmojiIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_emoji ON reactions (emoji)`,
    uniqueReaction: unique().on(_table.userId, _table.targetType, _table.targetId, _table.emoji),
    targetTypeCheck: sql`CHECK (targetType IN ('${sql.join(Object.values(TARGET_TYPES), "','")}'))`,
    emojiCheck: sql`CHECK (emoji IN ('${sql.join(Object.values(REACTION_EMOJIS), "','")}'))`,
  })
);
