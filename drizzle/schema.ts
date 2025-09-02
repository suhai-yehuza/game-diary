import { sql } from 'drizzle-orm';
import {
  pgTable,
  index,
  unique,
  serial,
  varchar,
  timestamp,
  integer,
  text,
  boolean,
  jsonb,
  foreignKey,
  numeric,
} from 'drizzle-orm/pg-core';

export const migrationVersions = pgTable(
  'migration_versions',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    checksum: varchar({ length: 64 }).notNull(),
    executedAt: timestamp('executed_at', { withTimezone: true, mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    executionTimeMs: integer('execution_time_ms'),
    status: varchar({ length: 20 }).default('success').notNull(),
    errorMessage: text('error_message'),
    rollbackScript: text('rollback_script'),
    rollbackExecuted: boolean('rollback_executed').default(false),
    verification: jsonb(),
  },
  table => [
    index('idx_migration_versions_name').using(
      'btree',
      table.name.asc().nullsLast().op('text_ops')
    ),
    unique('migration_versions_name_key').on(table.name),
  ]
);

export const friendships = pgTable(
  'friendships',
  {
    friendId: varchar('friend_id', { length: 255 }),
    userId: varchar('user_id', { length: 255 }),
    status: varchar({ length: 50 }).default('PENDING').notNull(),
    id: varchar({ length: 255 }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    foreignKey({
      columns: [table.friendId],
      foreignColumns: [users.id],
      name: 'friendships_friend_id_users_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'friendships_user_id_users_id_fk',
    }).onDelete('cascade'),
    unique('friendships_friend_id_user_id_unique').on(table.friendId, table.userId),
  ]
);

export const comments = pgTable(
  'comments',
  {
    userId: varchar('user_id', { length: 255 }),
    parentId: varchar('parent_id', { length: 255 }).notNull(),
    parentType: varchar('parent_type', { length: 50 }).notNull(),
    content: text().notNull(),
    depth: integer().default(0).notNull(),
    id: varchar({ length: 255 }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'comments_user_id_users_id_fk',
    }).onDelete('cascade'),
  ]
);

export const gameLogs = pgTable(
  'game_logs',
  {
    userId: varchar('user_id', { length: 255 }),
    gameId: varchar('game_id', { length: 255 }).notNull(),
    classification: varchar({ length: 50 }).default('PROTECTED').notNull(),
    watchedSetting: varchar('watched_setting', { length: 50 }).default('TV').notNull(),
    watchedScope: varchar('watched_scope', { length: 50 }).default('FULL_GAME').notNull(),
    watchedDate: timestamp('watched_date', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    watchedLocation: varchar('watched_location', { length: 255 }).default(''),
    ratingForGame: integer('rating_for_game').notNull(),
    notes: text().default(''),
    tags: text().array().default(['']),
    id: varchar({ length: 255 }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    index('idx_game_logs_classification_created').using(
      'btree',
      table.classification.asc().nullsLast().op('text_ops'),
      table.createdAt.asc().nullsLast().op('text_ops')
    ),
    index('idx_game_logs_deleted_at').using(
      'btree',
      table.deletedAt.asc().nullsLast().op('timestamptz_ops')
    ),
    index('idx_game_logs_game_id').using('btree', table.gameId.asc().nullsLast().op('text_ops')),
    index('idx_game_logs_user_classification_created').using(
      'btree',
      table.userId.asc().nullsLast().op('timestamp_ops'),
      table.classification.asc().nullsLast().op('text_ops'),
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_game_logs_user_created').using(
      'btree',
      table.userId.asc().nullsLast().op('timestamp_ops'),
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'game_logs_user_id_users_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.gameId],
      foreignColumns: [nbaGames.id],
      name: 'game_logs_game_id_nba_games_id_fk',
    }).onDelete('cascade'),
    unique('game_logs_user_id_game_id_unique').on(table.userId, table.gameId),
  ]
);

export const notifications = pgTable(
  'notifications',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 255 }),
    type: varchar({ length: 50 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    message: text().notNull(),
    targetId: varchar('target_id', { length: 255 }),
    targetType: varchar('target_type', { length: 50 }),
    resolved: boolean().default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    read: boolean().default(false),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'notifications_user_id_users_id_fk',
    }).onDelete('cascade'),
  ]
);

export const leagues = pgTable(
  'leagues',
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
  },
  table => [unique('leagues_name_unique').on(table.name)]
);

export const gameRatings = pgTable(
  'game_ratings',
  {
    gameId: varchar('game_id', { length: 255 }).notNull(),
    averageRating: numeric('average_rating', { precision: 4, scale: 2 }).default('0.00').notNull(),
    totalRatings: integer('total_ratings').default(0).notNull(),
    id: varchar({ length: 255 }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    foreignKey({
      columns: [table.gameId],
      foreignColumns: [nbaGames.id],
      name: 'game_ratings_game_id_nba_games_id_fk',
    }).onDelete('cascade'),
    unique('game_ratings_game_id_unique').on(table.gameId),
  ]
);

export const nbaPlayers = pgTable('nba_players', {
  id: varchar({ length: 20 }).primaryKey().notNull(),
  firstName: varchar('first_name', { length: 100 }).default('missing-first-name').notNull(),
  lastName: varchar('last_name', { length: 100 }).default('missing-last-name').notNull(),
  birth: text(),
  nba: text(),
  height: text(),
  weight: text(),
  college: varchar({ length: 100 }),
  affiliation: varchar({ length: 100 }),
  teams: text(),
  leagues: text(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
});

export const reactions = pgTable(
  'reactions',
  {
    userId: varchar('user_id', { length: 255 }),
    targetType: varchar('target_type', { length: 50 }).notNull(),
    targetId: varchar('target_id', { length: 255 }).notNull(),
    emoji: varchar({ length: 10 }).notNull(),
    id: varchar({ length: 255 }).primaryKey().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'reactions_user_id_users_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.emoji],
      foreignColumns: [reactionEmojis.emoji],
      name: 'reactions_emoji_reaction_emojis_emoji_fk',
    }),
    unique('reactions_user_id_target_type_target_id_emoji_unique').on(
      table.userId,
      table.targetType,
      table.targetId,
      table.emoji
    ),
  ]
);

export const reactionEmojis = pgTable('reaction_emojis', {
  emoji: varchar({ length: 10 }).primaryKey().notNull(),
});

export const seasons = pgTable(
  'seasons',
  {
    id: serial().primaryKey().notNull(),
    year: integer().notNull(),
  },
  table => [unique('seasons_year_unique').on(table.year)]
);

export const nbaGames = pgTable('nba_games', {
  id: varchar({ length: 50 }).primaryKey().notNull(),
  gameType: varchar('game_type', { length: 50 }).default('nba').notNull(),
  season: varchar({ length: 20 }),
  nbaGameId: varchar('nba_game_id', { length: 255 }),
  date: timestamp({ mode: 'string' }).notNull(),
  stage: integer(),
  homeTeamId: varchar('home_team_id', { length: 255 }).notNull(),
  awayTeamId: varchar('away_team_id', { length: 255 }).notNull(),
  homeTeamScore: integer('home_team_score'),
  awayTeamScore: integer('away_team_score'),
  status: varchar({ length: 50 }).notNull(),
  statusData: jsonb('status_data'),
  scores: jsonb(),
  arena: jsonb(),
  periods: jsonb(),
  officials: text().array(),
  timesTied: integer('times_tied'),
  leadChanges: integer('lead_changes'),
  nugget: text(),
  averageRating: numeric('average_rating', { precision: 4, scale: 2 }).default('0.00').notNull(),
  totalRatings: integer('total_ratings').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
});

export const teams = pgTable('teams', {
  id: varchar({ length: 20 }).primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  nickname: varchar({ length: 100 }),
  code: varchar({ length: 10 }),
  city: varchar({ length: 100 }),
  logo: text(),
  allStar: boolean('all_star').default(false).notNull(),
  nbaFranchise: boolean('nba_franchise').default(false).notNull(),
  conference: varchar({ length: 100 }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
});

export const users = pgTable(
  'users',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    object: varchar({ length: 10 }).default('user').notNull(),
    username: varchar({ length: 255 }),
    firstName: varchar('first_name', { length: 255 }),
    lastName: varchar('last_name', { length: 255 }),
    imageUrl: text('image_url'),
    hasImage: boolean('has_image').default(false).notNull(),
    profileImageUrl: text('profile_image_url'),
    primaryEmailAddressId: varchar('primary_email_address_id', { length: 255 }),
    primaryPhoneNumberId: varchar('primary_phone_number_id', { length: 255 }),
    emailAddress: varchar('email_address', { length: 255 }),
    phoneNumber: text('phone_number'),
    externalId: varchar('external_id', { length: 255 }),
    lastActiveAt: timestamp('last_active_at', { precision: 6, withTimezone: true, mode: 'string' }),
    lastSignInAt: timestamp('last_sign_in_at', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    }),
    bio: text(),
    timezone: varchar({ length: 50 }),
    preferredLanguage: varchar('preferred_language', { length: 10 }).default('en'),
    inboundFriendshipIds: varchar('inbound_friendship_ids', { length: 255 })
      .array()
      .default([''])
      .notNull(),
    outboundFriendshipIds: varchar('outbound_friendship_ids', { length: 255 })
      .array()
      .default([''])
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [unique('users_email_address_unique').on(table.emailAddress)]
);
