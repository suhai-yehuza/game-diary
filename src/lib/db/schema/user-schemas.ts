import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, boolean, unique, jsonb } from 'drizzle-orm/pg-core';

import { FRIENDSHIP_STATUS, REACTION_EMOJIS, TARGET_TYPES } from '@/lib/types/config.types';
import { generateUUID } from '@/lib/utils/index.processing';

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  username: varchar('username', { length: 255 }).notNull(),
  firstName: varchar('firstName', { length: 255 }).notNull(),
  lastName: varchar('lastName', { length: 255 }).notNull(),
  emailAddress: varchar('emailAddress', { length: 255 }).notNull().unique(),
  imageUrl: text('imageUrl').notNull(),
  inboundFriendshipIds: text('inboundFriendshipIds').array().notNull().default([]),
  outboundFriendshipIds: text('outboundFriendshipIds').array().notNull().default([]),
  banned: boolean('banned').notNull().default(false),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  timestamp: timestamp({ precision: 6, withTimezone: true }).notNull(),
  last_sign_in_at: timestamp({ precision: 6, withTimezone: true }),
  password_enabled: boolean('password_enabled').notNull().default(false),
  two_factor_enabled: boolean('two_factor_enabled').notNull().default(false),
  email_verified: boolean('email_verified').notNull().default(false),
  email_verification_strategy: varchar('email_verification_strategy', { length: 50 }),
  external_id: varchar('external_id', { length: 255 }),
  external_accounts: jsonb('external_accounts').notNull().default('[]'),
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
