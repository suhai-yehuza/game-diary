import { sql } from 'drizzle-orm';
import {
  pgTable,
  index,
  foreignKey,
  unique,
  check,
  varchar,
  timestamp,
  text,
  integer,
  serial,
  boolean,
  pgPolicy,
  numeric,
  jsonb,
  pgView,
} from 'drizzle-orm/pg-core';

export const friendships = pgTable(
  'friendships',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 255 }),
    friendId: varchar('friend_id', { length: 255 }),
    status: varchar({ length: 50 }).default('PENDING').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    index('idx_friendships_friend_id').using(
      'btree',
      table.friendId.asc().nullsLast().op('text_ops')
    ),
    index('idx_friendships_friend_user_status').using(
      'btree',
      table.friendId.asc().nullsLast().op('text_ops'),
      table.userId.asc().nullsLast().op('text_ops'),
      table.status.asc().nullsLast().op('text_ops')
    ),
    index('idx_friendships_status').using('btree', table.status.asc().nullsLast().op('text_ops')),
    index('idx_friendships_user_friend_status').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
      table.friendId.asc().nullsLast().op('text_ops'),
      table.status.asc().nullsLast().op('text_ops')
    ),
    index('idx_friendships_user_id').using('btree', table.userId.asc().nullsLast().op('text_ops')),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'friendships_user_id_users_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.friendId],
      foreignColumns: [users.id],
      name: 'friendships_friend_id_users_id_fk',
    }).onDelete('cascade'),
    unique('friendships_friend_id_user_id_unique').on(table.userId, table.friendId),
    check('friendships_status_uppercase_check', sql`(status)::text = upper((status)::text)`),
  ]
);

export const comments = pgTable(
  'comments',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 255 }),
    parentId: varchar('parent_id', { length: 255 }).notNull(),
    parentType: varchar('parent_type', { length: 50 }).notNull(),
    content: text().notNull(),
    depth: integer().default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    index('idx_comments_created_at').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_comments_deleted_at').using(
      'btree',
      table.deletedAt.asc().nullsLast().op('timestamptz_ops')
    ),
    index('idx_comments_depth').using('btree', table.depth.asc().nullsLast().op('int4_ops')),
    index('idx_comments_parent').using(
      'btree',
      table.parentId.asc().nullsLast().op('text_ops'),
      table.parentType.asc().nullsLast().op('text_ops')
    ),
    index('idx_comments_user').using('btree', table.userId.asc().nullsLast().op('text_ops')),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'comments_user_id_users_id_fk',
    }).onDelete('cascade'),
    check('comments_depth_check', sql`(depth >= 0) AND (depth <= 5)`),
    check(
      'comments_parent_type_check',
      sql`(parent_type)::text = ANY ((ARRAY['GAME_LOG'::character varying, 'COMMENT'::character varying])::text[])`
    ),
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

export const seasons = pgTable(
  'seasons',
  {
    id: serial().primaryKey().notNull(),
    year: integer().notNull(),
  },
  table => [unique('seasons_year_unique').on(table.year)]
);

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
    read: boolean().default(false),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
  },
  table => [
    index('idx_notifications_created_at').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_notifications_target').using(
      'btree',
      table.targetId.asc().nullsLast().op('text_ops'),
      table.targetType.asc().nullsLast().op('text_ops')
    ),
    index('idx_notifications_user_resolved').using(
      'btree',
      table.userId.asc().nullsLast().op('bool_ops'),
      table.resolved.asc().nullsLast().op('bool_ops')
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'notifications_user_id_users_id_fk',
    }).onDelete('cascade'),
  ]
);

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
  table => [
    index('idx_users_created_at').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_users_deleted_at').using(
      'btree',
      table.deletedAt.asc().nullsLast().op('timestamptz_ops')
    ),
    index('idx_users_email').using('btree', table.emailAddress.asc().nullsLast().op('text_ops')),
    index('idx_users_username').using('btree', table.username.asc().nullsLast().op('text_ops')),
    unique('users_email_address_unique').on(table.emailAddress),
    unique('users_phone_number_unique').on(table.phoneNumber),
    pgPolicy('users_select_own_data', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`(((id)::text = get_current_user_id()) OR ((get_current_user_id() IS NOT NULL) AND ((email_address IS NULL) OR ((id)::text = get_current_user_id())) AND ((phone_number IS NULL) OR ((id)::text = get_current_user_id()))))`,
    }),
    pgPolicy('users_update_own_data', { as: 'permissive', for: 'update', to: ['public'] }),
    pgPolicy('users_insert_own_data', { as: 'permissive', for: 'insert', to: ['public'] }),
    pgPolicy('users_delete_own_data', { as: 'permissive', for: 'delete', to: ['public'] }),
    check(
      'users_contact_constraint',
      sql`(username IS NOT NULL) AND (length(TRIM(BOTH FROM username)) > 0) AND ((email_address IS NOT NULL) OR (phone_number IS NOT NULL))`
    ),
  ]
);

export const gameRatings = pgTable(
  'game_ratings',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    gameId: varchar('game_id', { length: 255 }).notNull(),
    averageRating: numeric('average_rating', { precision: 4, scale: 2 }).default('0.00').notNull(),
    totalRatings: integer('total_ratings').default(0).notNull(),
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
    check(
      'game_ratings_average_rating_check',
      sql`(average_rating >= (1)::numeric) AND (average_rating <= (5)::numeric)`
    ),
  ]
);

export const nbaGames = pgTable('nba_games', {
  id: varchar({ length: 20 }).primaryKey().notNull(),
  gameType: varchar('game_type', { length: 50 }).default('nba').notNull(),
  nbaGameId: varchar('nba_game_id', { length: 255 }),
  date: timestamp({ mode: 'string' }).notNull(),
  homeTeamId: varchar('home_team_id', { length: 255 }).notNull(),
  awayTeamId: varchar('away_team_id', { length: 255 }).notNull(),
  homeTeamScore: integer('home_team_score'),
  awayTeamScore: integer('away_team_score'),
  status: varchar({ length: 50 }).notNull(),
  averageRating: numeric('average_rating', { precision: 4, scale: 2 }).default('0.00').notNull(),
  totalRatings: integer('total_ratings').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
});

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
    category: varchar({ length: 50 }).notNull(),
    action: varchar({ length: 50 }).notNull(),
    severity: varchar({ length: 20 }).notNull(),
    userId: varchar('user_id', { length: 255 }),
    sessionId: varchar('session_id', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    resourceType: varchar('resource_type', { length: 50 }),
    resourceId: varchar('resource_id', { length: 255 }),
    tableName: varchar('table_name', { length: 100 }),
    columnName: varchar('column_name', { length: 100 }),
    requestId: varchar('request_id', { length: 255 }),
    endpoint: varchar({ length: 500 }),
    method: varchar({ length: 10 }),
    description: text(),
    details: jsonb(),
    metadata: jsonb(),
    success: boolean().default(true).notNull(),
    errorMessage: text('error_message'),
    errorCode: varchar('error_code', { length: 50 }),
    durationMs: integer('duration_ms'),
    complianceTags: varchar('compliance_tags', { length: 500 }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  table => [
    index('audit_logs_action_idx').using('btree', table.action.asc().nullsLast().op('text_ops')),
    index('audit_logs_category_idx').using(
      'btree',
      table.category.asc().nullsLast().op('text_ops')
    ),
    index('audit_logs_resource_id_idx').using(
      'btree',
      table.resourceId.asc().nullsLast().op('text_ops')
    ),
    index('audit_logs_resource_type_idx').using(
      'btree',
      table.resourceType.asc().nullsLast().op('text_ops')
    ),
    index('audit_logs_severity_idx').using(
      'btree',
      table.severity.asc().nullsLast().op('text_ops')
    ),
    index('audit_logs_success_idx').using('btree', table.success.asc().nullsLast().op('bool_ops')),
    index('audit_logs_timestamp_idx').using(
      'btree',
      table.timestamp.asc().nullsLast().op('timestamp_ops')
    ),
    index('audit_logs_user_id_idx').using('btree', table.userId.asc().nullsLast().op('text_ops')),
  ]
);

export const keyRotationLogs = pgTable(
  'key_rotation_logs',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    keyId: varchar('key_id', { length: 255 }).notNull(),
    keyVersion: varchar('key_version', { length: 100 }).notNull(),
    environment: varchar({ length: 50 }).notNull(),
    rotationType: varchar('rotation_type', { length: 50 }).notNull(),
    previousKeyId: varchar('previous_key_id', { length: 255 }),
    newKeyId: varchar('new_key_id', { length: 255 }),
    rotatedBy: varchar('rotated_by', { length: 255 }).notNull(),
    rotationReason: text('rotation_reason'),
    affectedRecordsCount: integer('affected_records_count'),
    reEncryptionRequired: boolean('re_encryption_required').default(false),
    reEncryptionCompleted: boolean('re_encryption_completed').default(false),
    rotationStartedAt: timestamp('rotation_started_at', { mode: 'string' }).notNull(),
    rotationCompletedAt: timestamp('rotation_completed_at', { mode: 'string' }),
    reEncryptionStartedAt: timestamp('re_encryption_started_at', { mode: 'string' }),
    reEncryptionCompletedAt: timestamp('re_encryption_completed_at', { mode: 'string' }),
    status: varchar({ length: 50 }).default('in_progress').notNull(),
    details: jsonb(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  table => [
    index('key_rotation_logs_environment_idx').using(
      'btree',
      table.environment.asc().nullsLast().op('text_ops')
    ),
    index('key_rotation_logs_key_id_idx').using(
      'btree',
      table.keyId.asc().nullsLast().op('text_ops')
    ),
    index('key_rotation_logs_rotated_by_idx').using(
      'btree',
      table.rotatedBy.asc().nullsLast().op('text_ops')
    ),
    index('key_rotation_logs_status_idx').using(
      'btree',
      table.status.asc().nullsLast().op('text_ops')
    ),
  ]
);

export const rlsAccessLogs = pgTable(
  'rls_access_logs',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    requestingUserId: varchar('requesting_user_id', { length: 255 }).notNull(),
    targetUserId: varchar('target_user_id', { length: 255 }).notNull(),
    tableName: varchar('table_name', { length: 100 }).notNull(),
    operation: varchar({ length: 20 }).notNull(),
    rlsContextSet: boolean('rls_context_set').notNull(),
    rlsPolicyApplied: varchar('rls_policy_applied', { length: 100 }),
    accessGranted: boolean('access_granted').notNull(),
    rowsAffected: integer('rows_affected'),
    sensitiveFieldsAccessed: varchar('sensitive_fields_accessed', { length: 500 }),
    requestId: varchar('request_id', { length: 255 }),
    endpoint: varchar({ length: 500 }),
    queryHash: varchar('query_hash', { length: 64 }),
    queryDurationMs: integer('query_duration_ms'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    details: jsonb(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  table => [
    index('rls_access_logs_access_granted_idx').using(
      'btree',
      table.accessGranted.asc().nullsLast().op('bool_ops')
    ),
    index('rls_access_logs_created_at_idx').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('rls_access_logs_operation_idx').using(
      'btree',
      table.operation.asc().nullsLast().op('text_ops')
    ),
    index('rls_access_logs_requesting_user_id_idx').using(
      'btree',
      table.requestingUserId.asc().nullsLast().op('text_ops')
    ),
    index('rls_access_logs_table_name_idx').using(
      'btree',
      table.tableName.asc().nullsLast().op('text_ops')
    ),
    index('rls_access_logs_target_user_id_idx').using(
      'btree',
      table.targetUserId.asc().nullsLast().op('text_ops')
    ),
  ]
);

export const gameLogs = pgTable(
  'game_logs',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
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
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    index('idx_game_logs_classification').using(
      'btree',
      table.classification.asc().nullsLast().op('text_ops')
    ),
    index('idx_game_logs_created_at').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('idx_game_logs_game_id').using('btree', table.gameId.asc().nullsLast().op('text_ops')),
    index('idx_game_logs_rating').using(
      'btree',
      table.ratingForGame.asc().nullsLast().op('int4_ops')
    ),
    index('idx_game_logs_user_id').using('btree', table.userId.asc().nullsLast().op('text_ops')),
    index('idx_game_logs_watched_date').using(
      'btree',
      table.watchedDate.asc().nullsLast().op('timestamptz_ops')
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
    check('game_logs_rating_check', sql`(rating_for_game >= 1) AND (rating_for_game <= 5)`),
    check(
      'game_logs_watched_setting_check',
      sql`(watched_setting)::text = ANY ((ARRAY['TV'::character varying, 'ARENA'::character varying, 'PHONE'::character varying, 'LAPTOP'::character varying, 'BAR'::character varying, 'HOME'::character varying, 'OTHER'::character varying])::text[])`
    ),
    check(
      'game_logs_watched_scope_check',
      sql`(watched_scope)::text = ANY ((ARRAY['FULL_GAME'::character varying, 'HALF_GAME'::character varying, 'HIGHLIGHTS'::character varying, 'PRE_GAME'::character varying, 'POST_GAME'::character varying, 'SHORTS'::character varying, 'OTHER'::character varying])::text[])`
    ),
  ]
);

export const reactions = pgTable(
  'reactions',
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 255 }),
    targetType: varchar('target_type', { length: 50 }).notNull(),
    targetId: varchar('target_id', { length: 255 }).notNull(),
    emoji: varchar({ length: 10 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { precision: 6, withTimezone: true, mode: 'string' }),
  },
  table => [
    index('idx_reactions_emoji').using('btree', table.emoji.asc().nullsLast().op('text_ops')),
    index('idx_reactions_target').using(
      'btree',
      table.targetId.asc().nullsLast().op('text_ops'),
      table.targetType.asc().nullsLast().op('text_ops')
    ),
    index('idx_reactions_target_deleted')
      .using(
        'btree',
        table.targetId.asc().nullsLast().op('text_ops'),
        table.targetType.asc().nullsLast().op('timestamptz_ops'),
        table.deletedAt.asc().nullsLast().op('timestamptz_ops')
      )
      .where(sql`(deleted_at IS NULL)`),
    index('idx_reactions_user').using('btree', table.userId.asc().nullsLast().op('text_ops')),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'reactions_user_id_users_id_fk',
    }).onDelete('cascade'),
    unique('reactions_user_id_target_type_target_id_emoji_unique').on(
      table.userId,
      table.targetType,
      table.targetId,
      table.emoji
    ),
  ]
);

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
  },
  table => [
    index('idx_migration_versions_name').using(
      'btree',
      table.name.asc().nullsLast().op('text_ops')
    ),
    unique('migration_versions_name_key').on(table.name),
  ]
);
export const publicUserProfiles = pgView('public_user_profiles', {
  id: varchar({ length: 255 }),
  username: varchar({ length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  imageUrl: text('image_url'),
  hasImage: boolean('has_image'),
  profileImageUrl: text('profile_image_url'),
  bio: text(),
  timezone: varchar({ length: 50 }),
  preferredLanguage: varchar('preferred_language', { length: 10 }),
  createdAt: timestamp('created_at', { mode: 'string' }),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
}).as(
  sql`SELECT id, username, first_name, last_name, image_url, has_image, profile_image_url, bio, timezone, preferred_language, created_at, updated_at FROM users WHERE deleted_at IS NULL`
);
