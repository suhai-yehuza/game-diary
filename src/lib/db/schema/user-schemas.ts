import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, boolean, unique, jsonb } from 'drizzle-orm/pg-core';

import { FRIENDSHIP_STATUS } from '@/lib/types/config.types';
import { generateUUID } from '@/lib/utils/index.processing';

import { reaction_emoji_enum, reaction_target_enum } from './enums';

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  username: varchar('username', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 255 }).notNull(),
  last_name: varchar('last_name', { length: 255 }).notNull(),
  email_address: varchar('email_address', { length: 255 }).notNull().unique(),
  image_url: text('image_url').notNull(),
  inbound_friendship_ids: text('inbound_friendship_ids').array().notNull().default([]),
  outbound_friendship_ids: text('outbound_friendship_ids').array().notNull().default([]),
  banned: boolean('banned').notNull().default(false),
  created_at: timestamp({ precision: 6, withTimezone: true }).notNull(),
  updated_at: timestamp({ precision: 6, withTimezone: true }).notNull(),
  timestamp: timestamp({ precision: 6, withTimezone: true }).notNull(),
  last_sign_in_at: timestamp({ precision: 6, withTimezone: true }),
  password_enabled: boolean('password_enabled').notNull().default(false),
  two_factor_enabled: boolean('two_factor_enabled').notNull().default(false),
  email_verified: boolean('email_verified').notNull().default(false),
  email_verification_strategy: varchar('email_verification_strategy', { length: 50 }),
  external_id: varchar('external_id', { length: 255 }),
  external_accounts: jsonb('external_accounts').notNull().default('[]'),
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// Friendships table
export const friendships = pgTable(
  'friendships',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    friend_id: varchar('friend_id', { length: 255 }).references(() => users.id),
    user_id: varchar('user_id', { length: 255 }).references(() => users.id),
    status: varchar('status', { length: 50 })
      .notNull()
      .default('PENDING')
      .$type<(typeof FRIENDSHIP_STATUS)[keyof typeof FRIENDSHIP_STATUS]>(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  table => ({
    friendUserUnique: unique().on(table.friend_id, table.user_id),
    statusCheck: sql`CHECK (status IN ('${sql.join(Object.values(FRIENDSHIP_STATUS), "','")}'))`,
  })
);

// Comments table
export const comments = pgTable(
  'comments',
  {
    id: text('id').primaryKey().default(generateUUID()),
    user_id: text('user_id').references(() => users.id),
    parent_id: text('parent_id').notNull(),
    parent_type: reaction_target_enum('parent_type').notNull(),
    content: text('content').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp({ precision: 6, withTimezone: true }),
  },
  _table => ({
    commentIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parent_id, parent_type)`,
    commentUserIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_user ON comments (user_id)`,
    commentCreatedIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_created ON comments (created_at)`,
    commentDeletedIndex: sql`CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments (deleted_at)`,
  })
);

// Reactions table
export const reactions = pgTable(
  'reactions',
  {
    id: text('id').primaryKey().default(generateUUID()),
    user_id: text('user_id').references(() => users.id),
    target_type: reaction_target_enum('target_type').notNull(),
    target_id: text('target_id').notNull(),
    emoji: reaction_emoji_enum('emoji').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  _table => ({
    reactionIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions (target_id, target_type)`,
    reactionUserIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions (user_id)`,
    reactionEmojiIndex: sql`CREATE INDEX IF NOT EXISTS idx_reactions_emoji ON reactions (emoji)`,
    uniqueReaction: unique().on(_table.user_id, _table.target_type, _table.target_id, _table.emoji),
  })
);
